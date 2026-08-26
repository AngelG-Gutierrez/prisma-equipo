/*
  Warnings:

  - Made the column `reason` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Appointment` MODIFY `reason` VARCHAR(191) NOT NULL;
