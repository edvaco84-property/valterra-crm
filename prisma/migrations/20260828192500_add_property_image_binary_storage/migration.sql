-- AlterTable
ALTER TABLE "public"."PropertyImage"
ADD COLUMN "filename" TEXT,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "sizeBytes" INTEGER,
ADD COLUMN "content" BYTEA;
