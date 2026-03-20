-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isCarousel" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "minioKey" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "source" "ImageSource" NOT NULL DEFAULT 'NANOBANA',
    "prompt" TEXT,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostImage_postId_idx" ON "PostImage"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_postId_order_key" ON "PostImage"("postId", "order");

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
