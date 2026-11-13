import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sharedDevelopmentImages = [
  "/uploads/properties/yaax/Render 1.JPEG",
  "/uploads/properties/yaax/Perspectiva.PNG",
  "/uploads/properties/yaax/Perspectiva 1.PNG",
];

const imageSetsByUnitType = {
  Studio: [
    "/uploads/properties/yaax/Studio.jpg",
  ],
  Loft: [
    "/uploads/properties/yaax/Loft.JPEG",
    "/uploads/properties/yaax/YAAX_Departamento 4.PNG",
  ],
  "2 recámaras": [
    "/uploads/properties/yaax/2 Bedrooms.JPEG",
    "/uploads/properties/yaax/YAAX_Departamento 2.PNG",
  ],
  "3 rec lock-off": [
    "/uploads/properties/yaax/3 Bedrooms.JPEG",
    "/uploads/properties/yaax/YAAX_Departamento 3.PNG",
  ],
  Penthouse: [
    "/uploads/properties/yaax/Pent House.JPEG",
    "/uploads/properties/yaax/5 Pent House.PNG",
  ],
};

function unique(values) {
  return [...new Set(values)];
}

function buildAltText(property, url) {
  const filename = decodeURIComponent(url.split("/").pop() ?? "").replace(/\.[^.]+$/, "");
  const descriptor = filename
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `${property.title} - ${descriptor}`;
}

async function main() {
  const properties = await prisma.property.findMany({
    where: {
      development: {
        slug: "yaax-tulum-condos",
      },
    },
    select: {
      id: true,
      title: true,
      unitType: true,
    },
    orderBy: [
      { unitCode: "asc" },
      { title: "asc" },
    ],
  });

  if (!properties.length) {
    throw new Error("No se encontraron propiedades de Yaax Tulum Condos.");
  }

  for (const property of properties) {
    const typeImages = imageSetsByUnitType[property.unitType] ?? [];
    const imageUrls = unique([...typeImages, ...sharedDevelopmentImages]);

    if (!imageUrls.length) {
      console.warn(`Saltando ${property.title}: no hay imágenes configuradas para ${property.unitType ?? "sin tipología"}.`);
      continue;
    }

    await prisma.$transaction([
      prisma.propertyImage.deleteMany({
        where: {
          propertyId: property.id,
        },
      }),
      prisma.property.update({
        where: {
          id: property.id,
        },
        data: {
          imageUrl: imageUrls[0],
        },
      }),
      prisma.propertyImage.createMany({
        data: imageUrls.map((url, index) => ({
          propertyId: property.id,
          url,
          alt: buildAltText(property, url),
          sortOrder: index,
          isPrimary: index === 0,
        })),
      }),
    ]);

    console.log(`Actualizada ${property.title}: ${imageUrls.length} imágenes`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
