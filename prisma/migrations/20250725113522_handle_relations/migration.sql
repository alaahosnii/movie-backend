/*
  Warnings:

  - You are about to drop the column `showId` on the `Image` table. All the data in the column will be lost.
  - Added the required column `mediaId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_showId_fkey`;

-- DropIndex
DROP INDEX `Image_showId_fkey` ON `Image`;

-- AlterTable
ALTER TABLE `Image` DROP COLUMN `showId`,
    ADD COLUMN `mediaId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
