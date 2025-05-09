/*
  Warnings:

  - Added the required column `profileName` to the `Prefs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Prefs` ADD COLUMN `profileName` VARCHAR(191) NOT NULL;
