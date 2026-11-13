-- CreateTable
CREATE TABLE "Development" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "zone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Development_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Development_slug_key" ON "Development"("slug");

-- AlterTable
ALTER TABLE "Lead"
ADD COLUMN "developmentId" TEXT,
ADD COLUMN "propertyId" TEXT;

-- AlterTable
ALTER TABLE "Property"
ADD COLUMN "developmentId" TEXT,
ADD COLUMN "floorLabel" TEXT,
ADD COLUMN "unitCode" TEXT,
ADD COLUMN "unitType" TEXT;

-- AddForeignKey
ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property"
ADD CONSTRAINT "Property_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE SET NULL ON UPDATE CASCADE;
