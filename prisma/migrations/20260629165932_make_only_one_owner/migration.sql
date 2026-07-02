/*
  Warnings:

  - A unique constraint covering the columns `[role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "only_one_owner" ON "User"("role") WHERE ("role" = 'OWNER');
