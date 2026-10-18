-- CreateEnum
CREATE TYPE "duplicationStatus" AS ENUM ('REPEAT', 'NEW');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "custId" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "po_date" TIMESTAMP(3) NOT NULL,
    "ship_date" TIMESTAMP(3) NOT NULL,
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

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
