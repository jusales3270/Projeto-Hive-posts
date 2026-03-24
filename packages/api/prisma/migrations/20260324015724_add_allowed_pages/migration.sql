-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "allowedPages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowedPages" TEXT[] DEFAULT ARRAY[]::TEXT[];
