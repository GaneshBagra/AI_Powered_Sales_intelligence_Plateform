-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('EXPORT', 'DOMESTIC');

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "weight_in_MT" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "finish_weight" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "total_po_value" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "customers" (
    "customer_code" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_location_country" TEXT NOT NULL,
    "customer_type" "CustomerType" NOT NULL DEFAULT 'DOMESTIC'
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");
