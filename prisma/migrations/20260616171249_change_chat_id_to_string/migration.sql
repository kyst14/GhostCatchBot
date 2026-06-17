/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserChats` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "_UserChats" DROP CONSTRAINT "_UserChats_A_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "chatId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserChats" DROP CONSTRAINT "_UserChats_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_UserChats_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "Chat_expiresAt_idx" ON "Chat"("expiresAt");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_ownId_idx" ON "Message"("ownId");

-- CreateIndex
CREATE INDEX "Message_tgId_idx" ON "Message"("tgId");

-- CreateIndex
CREATE INDEX "Message_expiresAt_idx" ON "Message"("expiresAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserChats" ADD CONSTRAINT "_UserChats_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
