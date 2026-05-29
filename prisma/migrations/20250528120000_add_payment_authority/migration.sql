-- AlterTable
ALTER TABLE "orders" ADD COLUMN "paymentAuthority" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentAuthority_key" ON "orders"("paymentAuthority");
