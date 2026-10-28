import { blindIndex, decrypt, encrypt } from '@/utils/encryption.js';
import { Prisma } from '@prisma/client';

type Id = string | number | bigint;
type Dict = Record<string, unknown>;

// Fields stored encrypted.
const ENCRYPTED_FIELDS: Partial<Record<Prisma.ModelName, readonly string[]>> = {
  User: ['messagesDeleted', 'messagesEdited', 'messagesProtected'],
  Chat: ['messagesDeleted', 'messagesEdited', 'messagesProtected'],
  Message: ['content', "ownId", 'senderName', "tgChatId"],
};

// source field -> separate column holding its blind index.
// The real IDs stay untouched, so decrypt() always gets the same key material as encrypt().
const INDEXED_FIELDS: Partial<Record<Prisma.ModelName, Readonly<Record<string, string>>>> = {
  User: { userId: 'userIdIndex', chatId: 'chatIdIndex' },
  Chat: { userId: 'userIdIndex', chatId: 'chatIdIndex' },
  Message: { ownId: 'userIdIndex', tgChatId: 'chatIdIndex' },
};

const WRITE_OPS = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
]);

// Operations whose result is a record / list of records (not count, aggregate, groupBy...).
const RECORD_OPS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'create',
  'createManyAndReturn',
  'update',
  'updateManyAndReturn',
  'upsert',
  'delete',
]);

const LOGICAL_KEYS = new Set(['AND', 'OR', 'NOT']);
const SUPPORTED_FILTER_OPS = new Set(['equals', 'in', 'notIn', 'not']);

const isDict = (v: unknown): v is Dict =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);

const isId = (v: unknown): v is Id =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint';

const toIndex = (v: Id): string => blindIndex(String(v));

/**
 * Resolves userId/chatId key material from the given sources in priority order
 * (record itself, then `where`). Supports plain values and `{ equals }`.
 * Falls back to 0 only if nothing is found.
 */
function resolveContext(...sources: unknown[]): { userId: Id; chatId: Id } {
  const pick = (key: 'userId' | 'chatId'): Id => {
    for (const source of sources) {
      if (!isDict(source)) continue;
      const value = source[key];
      if (isId(value)) return value;
      if (isDict(value) && isId(value.equals)) return value.equals;
    }
    return 0;
  };
  return { userId: pick('userId'), chatId: pick('chatId') };
}

// ---------- write path ----------

function encryptRecord(model: Prisma.ModelName, record: Dict, where: unknown): Dict {
  const out: Dict = { ...record }; // never mutate caller's object

  const fields = ENCRYPTED_FIELDS[model];
  if (fields) {
    // For updates the IDs are usually not in `data`, so we also look into `where`.
    const { userId, chatId } = resolveContext(record, where);

    for (const field of fields) {
      const value = out[field];
      if (typeof value === 'string') {
        out[field] = encrypt(value, userId, chatId);
      } else if (isDict(value) && typeof value.set === 'string') {
        // Prisma's `{ field: { set: 'value' } }` form
        out[field] = { ...value, set: encrypt(value.set, userId, chatId) };
      }
    }
  }

  const indexMap = INDEXED_FIELDS[model];
  if (indexMap) {
    for (const [source, column] of Object.entries(indexMap)) {
      const value = out[source];
      if (isId(value)) out[column] = toIndex(value);
    }
  }

  return out;
}

function transformWriteArgs(model: Prisma.ModelName, args: Dict): Dict {
  const next: Dict = { ...args };
  const where = args.where; // original where, before it is rewritten to index columns

  for (const key of ['data', 'create', 'update'] as const) {
    const target = next[key];
    if (Array.isArray(target)) {
      next[key] = target.map((item) => (isDict(item) ? encryptRecord(model, item, where) : item));
    } else if (isDict(target)) {
      next[key] = encryptRecord(model, target, where);
    }
  }

  return next;
}

// ---------- where path ----------

function mapFilterValue(model: string, field: string, value: unknown): unknown {
  if (isId(value)) return toIndex(value);
  if (Array.isArray(value)) return value.map((v) => mapFilterValue(model, field, v));

  if (isDict(value)) {
    const out: Dict = {};
    for (const [op, operand] of Object.entries(value)) {
      if (!SUPPORTED_FILTER_OPS.has(op)) {
        // contains/gt/lt... make no sense on a hash; fail loudly instead of silently returning wrong data
        throw new Error(`Operator "${op}" is not supported on indexed field ${model}.${field}`);
      }
      out[op] = mapFilterValue(model, field, operand);
    }
    return out;
  }

  return value; // null etc.
}

function transformWhere(model: Prisma.ModelName, where: unknown): unknown {
  if (Array.isArray(where)) return where.map((w) => transformWhere(model, w));
  if (!isDict(where)) return where;

  const indexMap = INDEXED_FIELDS[model] ?? {};
  const out: Dict = {};

  for (const [key, value] of Object.entries(where)) {
    if (LOGICAL_KEYS.has(key)) {
      out[key] = transformWhere(model, value); // AND / OR / NOT, nested
    } else if (key in indexMap) {
      out[indexMap[key]!] = mapFilterValue(model, key, value);
    } else {
      out[key] = value;
    }
  }

  return out;
}

// ---------- read path ----------

function decryptRecord(model: Prisma.ModelName, record: Dict): Dict {
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields) return record;

  const { userId, chatId } = resolveContext(record);
  const out: Dict = { ...record };

  for (const field of fields) {
    const value = out[field];
    if (typeof value !== 'string') continue;

    try {
      out[field] = decrypt(value, userId, chatId);
    } catch (error) {
      // Fail loudly, but say where it happened.
      throw new Error(`Failed to decrypt ${model}.${field}`, { cause: error });
    }
  }

  return out;
}

// ---------- extension ----------

export function encryptionExtension() {
  return Prisma.defineExtension({
    name: 'prisma-encryption-extension',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let next: unknown = args;

          if (isDict(next)) {
            // Order matters: writes need the original `where` for key material.
            if (WRITE_OPS.has(operation)) next = transformWriteArgs(model, next);
            if (isDict(next) && 'where' in next) {
              next = { ...next, where: transformWhere(model, next.where) };
            }
          }

          const result = await query(next as typeof args);

          if (!result || !RECORD_OPS.has(operation)) return result;

          if (Array.isArray(result)) {
            return result.map((item) => (isDict(item) ? decryptRecord(model, item) : item));
          }
          return isDict(result) ? decryptRecord(model, result) : result;
        },
      },
    },
  });
}