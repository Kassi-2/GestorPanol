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

-- CreateTable
CREATE TABLE `product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `stock` INTEGER NULL DEFAULT 0,
    `criticalStock` INTEGER NOT NULL DEFAULT 1,
    `state` BOOLEAN NOT NULL DEFAULT true,
    `fungible` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `product_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lending` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `state` ENUM('Active', 'Pending', 'Finalized', 'Inactive') NOT NULL DEFAULT 'Active',
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalizeDate` DATETIME(3) NULL,
    `eliminateDate` DATETIME(3) NULL,
    `comments` VARCHAR(191) NULL,
    `BorrowerId` INTEGER NOT NULL,
    `teacherId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LendingProduct` (
    `lendingId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,

    UNIQUE INDEX `LendingProduct_lendingId_productId_key`(`lendingId`, `productId`),
    PRIMARY KEY (`lendingId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `state` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlertLending` (
    `alertId` INTEGER NOT NULL,
    `lendingId` INTEGER NOT NULL,

    PRIMARY KEY (`alertId`, `lendingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `mail` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`mail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_id_fkey` FOREIGN KEY (`id`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_codeDegree_fkey` FOREIGN KEY (`codeDegree`) REFERENCES `Degree`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teacher` ADD CONSTRAINT `Teacher_id_fkey` FOREIGN KEY (`id`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assistant` ADD CONSTRAINT `Assistant_id_fkey` FOREIGN KEY (`id`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lending` ADD CONSTRAINT `Lending_BorrowerId_fkey` FOREIGN KEY (`BorrowerId`) REFERENCES `Borrower`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lending` ADD CONSTRAINT `Lending_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LendingProduct` ADD CONSTRAINT `LendingProduct_lendingId_fkey` FOREIGN KEY (`lendingId`) REFERENCES `Lending`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LendingProduct` ADD CONSTRAINT `LendingProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertLending` ADD CONSTRAINT `AlertLending_alertId_fkey` FOREIGN KEY (`alertId`) REFERENCES `Alert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertLending` ADD CONSTRAINT `AlertLending_lendingId_fkey` FOREIGN KEY (`lendingId`) REFERENCES `Lending`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
