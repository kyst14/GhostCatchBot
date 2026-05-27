/*
  Warnings:

  - A unique constraint covering the columns `[connId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_connId_key" ON "User"("connId");
