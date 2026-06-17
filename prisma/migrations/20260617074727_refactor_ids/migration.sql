/*
  Warnings:

  - You are about to drop the `_UserChats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tgId,ownId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgChatId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "_UserChats" DROP CONSTRAINT "_UserChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserChats" DROP CONSTRAINT "_UserChats_B_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "ownId" BIGINT NOT NULL,
ADD COLUMN     "tgId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "tgChatId" BIGINT NOT NULL;

-- DropTable
DROP TABLE "_UserChats";

-- CreateIndex
CREATE UNIQUE INDEX "Chat_tgId_ownId_key" ON "Chat"("tgId", "ownId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ownId_fkey" FOREIGN KEY ("ownId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tgChatId_ownId_fkey" FOREIGN KEY ("tgChatId", "ownId") REFERENCES "Chat"("tgId", "ownId") ON DELETE CASCADE ON UPDATE CASCADE;
