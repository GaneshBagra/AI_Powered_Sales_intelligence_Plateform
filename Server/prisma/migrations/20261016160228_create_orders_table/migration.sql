-- CreateEnum
CREATE TYPE "duplicationStatus" AS ENUM ('REPEAT', 'NEW');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "custId" TEXT NOT NULL,
    "PO_number" TEXT NOT NULL,
    "PO_date" TIMESTAMP(3) NOT NULL,
    "ship_date" TIMESTAMP(3) NOT NULL,
    "part_number" TEXT NOT NULL,
    "part_duplication_status" "duplicationStatus" NOT NULL,
    "cat_code" TEXT NOT NULL,
    "price_per_piece" TEXT NOT NULL,
    "po_qty" INTEGER NOT NULL,
    "finish_weight" INTEGER NOT NULL,
    "box_QTY" INTEGER NOT NULL,
    "booking_qty" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_qty" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
