-- CreateTable
CREATE TABLE `Borrower` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `state` BOOLEAN NOT NULL DEFAULT true,
    `rut` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mail` VARCHAR(191) NULL,
    `phoneNumber` INTEGER NULL,
    `type` ENUM('Student', 'Teacher', 'Assistant') NOT NULL,

    UNIQUE INDEX `Borrower_rut_key`(`rut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL,
    `codeDegree` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Degree` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Teacher` (
    `id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assistant` (
    `id` INTEGER NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_id_fkey` FOREIGN KEY (`id`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_codeDegree_fkey` FOREIGN KEY (`codeDegree`) REFERENCES `Degree`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_id_fkey` FOREIGN KEY (`id`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assistant` ADD CONSTRAINT `Assistant_id_fkey` FOREIGN KEY (`id`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
