/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tgId,ownId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Chat` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_ownId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_tgId_ownId_fkey";

-- DropIndex
DROP INDEX "Message_chatId_idx";

-- DropIndex
DROP INDEX "Message_chatId_tgId_key";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatId";

-- CreateIndex
CREATE INDEX "Chat_tgId_ownId_idx" ON "Chat"("tgId", "ownId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_tgId_ownId_key" ON "Chat"("tgId", "ownId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ownId_fkey" FOREIGN KEY ("ownId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tgId_ownId_fkey" FOREIGN KEY ("tgId", "ownId") REFERENCES "Chat"("tgId", "ownId") ON DELETE CASCADE ON UPDATE CASCADE;
