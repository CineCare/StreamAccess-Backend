/*
  Warnings:

  - You are about to drop the column `audioDescription` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `contentSummary` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `highContrast` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `playRateControl` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `simplifiedExplanation` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `subtitles` on the `Prefs` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Prefs` table. All the data in the column will be lost.
  - Added the required column `value` to the `Prefs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Prefs` DROP COLUMN `audioDescription`,
    DROP COLUMN `contentSummary`,
    DROP COLUMN `highContrast`,
    DROP COLUMN `images`,
    DROP COLUMN `playRateControl`,
    DROP COLUMN `simplifiedExplanation`,
    DROP COLUMN `subtitles`,
    DROP COLUMN `theme`,
    ADD COLUMN `value` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `PrefType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prefName` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
