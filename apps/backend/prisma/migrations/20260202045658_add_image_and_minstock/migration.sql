-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 10;
