-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_tgId_ownId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tgChatId_ownId_fkey" FOREIGN KEY ("tgChatId", "ownId") REFERENCES "Chat"("tgId", "ownId") ON DELETE CASCADE ON UPDATE CASCADE;
