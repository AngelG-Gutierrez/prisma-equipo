/*
  Warnings:

  - Added the required column `birthDate` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `birthDate` DATETIME(3) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'Paciente';
