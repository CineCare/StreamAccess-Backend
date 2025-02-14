-- DropForeignKey
ALTER TABLE `MovieTagMovie` DROP FOREIGN KEY `MovieTagMovie_movieId_fkey`;

-- DropForeignKey
ALTER TABLE `MovieTagMovie` DROP FOREIGN KEY `MovieTagMovie_tagId_fkey`;

-- DropForeignKey
ALTER TABLE `Prefs` DROP FOREIGN KEY `Prefs_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Prefs` ADD CONSTRAINT `Prefs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovieTagMovie` ADD CONSTRAINT `MovieTagMovie_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovieTagMovie` ADD CONSTRAINT `MovieTagMovie_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `MovieTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
