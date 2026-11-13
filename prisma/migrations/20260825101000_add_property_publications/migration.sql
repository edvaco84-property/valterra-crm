-- CreateEnum
CREATE TYPE "public"."PublicationChannel" AS ENUM ('WEBSITE', 'INMUEBLES24');

-- CreateEnum
CREATE TYPE "public"."PublicationStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'PAUSED', 'ERROR');

-- CreateTable
CREATE TABLE "public"."PropertyPublication" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "channel" "public"."PublicationChannel" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "externalId" TEXT,
    "externalUrl" TEXT,
    "syncNotes" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPublication_propertyId_channel_key" ON "public"."PropertyPublication"("propertyId", "channel");

-- CreateIndex
CREATE INDEX "PropertyPublication_channel_isEnabled_status_idx" ON "public"."PropertyPublication"("channel", "isEnabled", "status");

-- AddForeignKey
ALTER TABLE "public"."PropertyPublication" ADD CONSTRAINT "PropertyPublication_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed current website publications from legacy boolean
INSERT INTO "public"."PropertyPublication" ("id", "propertyId", "channel", "isEnabled", "status", "createdAt", "updatedAt")
SELECT
  concat('seed-', md5(random()::text || clock_timestamp()::text || "id")),
  "id",
  'WEBSITE'::"public"."PublicationChannel",
  "published",
  CASE
    WHEN "published" THEN 'PUBLISHED'::"public"."PublicationStatus"
    ELSE 'DRAFT'::"public"."PublicationStatus"
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "public"."Property";
