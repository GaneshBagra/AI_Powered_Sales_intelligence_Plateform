/*
  Warnings:

  - You are about to drop the column `booking_qty` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `box_qty` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `cat_code` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `finish_weight` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_number` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_qty` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `part_description` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `part_duplication_status` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `part_number` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `po_qty` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_piece` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `realisation_per_kg` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[po_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "booking_qty",
DROP COLUMN "box_qty",
DROP COLUMN "cat_code",
DROP COLUMN "finish_weight",
DROP COLUMN "invoice_number",
DROP COLUMN "invoice_qty",
DROP COLUMN "part_description",
DROP COLUMN "part_duplication_status",
DROP COLUMN "part_number",
DROP COLUMN "po_qty",
DROP COLUMN "price_per_piece",
DROP COLUMN "realisation_per_kg",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "part_number" TEXT NOT NULL,
    "part_description" TEXT NOT NULL,
    "part_duplication_status" "duplicationStatus" NOT NULL DEFAULT 'NEW',
    "price_per_piece" DECIMAL(12,2) NOT NULL,
    "po_qty" INTEGER NOT NULL,
    "cat_code" TEXT,
    "finish_weight" DECIMAL(12,3),
    "realisation_per_kg" DECIMAL(12,3),
    "box_qty" INTEGER,
    "booking_qty" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invoice_number" TEXT,
    "invoice_qty" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "items_po_number_idx" ON "items"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "orders_po_number_key" ON "orders"("po_number");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_po_number_fkey" FOREIGN KEY ("po_number") REFERENCES "orders"("po_number") ON DELETE CASCADE ON UPDATE CASCADE;
