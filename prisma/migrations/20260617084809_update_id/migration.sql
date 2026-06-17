/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Chat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_tgChatId_ownId_fkey";

-- DropIndex
DROP INDEX "Chat_tgId_ownId_key";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("tgId", "ownId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tgId_ownId_fkey" FOREIGN KEY ("tgId", "ownId") REFERENCES "Chat"("tgId", "ownId") ON DELETE RESTRICT ON UPDATE CASCADE;
