/*
  Warnings:

  - You are about to drop the column `type` on the `PrefType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[prefName]` on the table `PrefType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dataType` to the `PrefType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PrefType` DROP COLUMN `type`,
    ADD COLUMN `dataType` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PrefType_prefName_key` ON `PrefType`(`prefName`);
