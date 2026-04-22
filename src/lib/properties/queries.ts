import { db } from "@/lib/db";

export async function getPropertyList() {
  try {
    return await db.property.findMany({
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });
  } catch {
    return [];
  }
}

export async function getPublishedProperties(limit = 3) {
  try {
    return await db.property.findMany({
      where: {
        published: true,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getPublishedPropertyById(id: string) {
  try {
    return await db.property.findFirst({
      where: {
        id,
        published: true,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getPropertyById(id: string) {
  try {
    return await db.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  } catch {
    return null;
  }
}
