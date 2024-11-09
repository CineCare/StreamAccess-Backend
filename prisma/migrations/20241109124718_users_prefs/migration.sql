-- CreateTable
CREATE TABLE `Prefs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `theme` VARCHAR(191) NULL,
    `images` BOOLEAN NULL,
    `audioDescription` BOOLEAN NULL,
    `subtitles` BOOLEAN NULL,
    `highContrast` BOOLEAN NULL,
    `playRateControl` BOOLEAN NULL,
    `contentSummary` BOOLEAN NULL,
    `simplifiedExplanation` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prefs` ADD CONSTRAINT `Prefs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
