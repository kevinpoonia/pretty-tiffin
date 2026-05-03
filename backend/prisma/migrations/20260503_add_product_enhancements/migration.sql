-- AlterTable: Add new columns to Product
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "hasSteel" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasEngraving" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "featuresAndSpecs" TEXT,
  ADD COLUMN IF NOT EXISTS "shippingInfo" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT,
  ADD COLUMN IF NOT EXISTS "manualReviewCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "manualAvgRating" DECIMAL(65,30);

-- AlterTable: Fix Address default country
ALTER TABLE "Address" ALTER COLUMN "country" SET DEFAULT '';

-- CreateTable: AdminReview
CREATE TABLE IF NOT EXISTS "AdminReview" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "reviewerName" TEXT NOT NULL,
  "location" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CurrencyPrice
CREATE TABLE IF NOT EXISTS "CurrencyPrice" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "price" DECIMAL(65,30) NOT NULL,
  "compareAtPrice" DECIMAL(65,30),
  CONSTRAINT "CurrencyPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdminReview_productId_idx" ON "AdminReview"("productId");
CREATE INDEX IF NOT EXISTS "CurrencyPrice_productId_idx" ON "CurrencyPrice"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "CurrencyPrice_productId_currency_key" ON "CurrencyPrice"("productId", "currency");

-- AddForeignKey: AdminReview → Product
ALTER TABLE "AdminReview"
  ADD CONSTRAINT "AdminReview_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: CurrencyPrice → Product
ALTER TABLE "CurrencyPrice"
  ADD CONSTRAINT "CurrencyPrice_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
