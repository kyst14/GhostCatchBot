/*
  Warnings:

  - A unique constraint covering the columns `[ownId,tgChatId,tgId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatId,tgId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Message_ownId_tgChatId_tgId_key" ON "Message"("ownId", "tgChatId", "tgId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_chatId_tgId_key" ON "Message"("chatId", "tgId");
