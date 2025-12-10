/*
  Warnings:

  - Added the required column `district` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` ADD COLUMN `district` VARCHAR(191) NOT NULL;
