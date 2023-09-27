/*
  Warnings:

  - You are about to drop the column `address` on the `Addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Addresses" DROP COLUMN "address",
ADD COLUMN     "address1" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT;
