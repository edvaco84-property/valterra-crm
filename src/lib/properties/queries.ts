import { db } from "@/lib/db";
import type { AppMarket } from "@/lib/markets";

const previewImageInclude = {
  images: {
    orderBy: [
      { isPrimary: "desc" as const },
      { sortOrder: "asc" as const },
      { createdAt: "asc" as const },
    ],
    take: 1,
    select: {
      url: true,
    },
  },
};

const publicationsInclude = {
  publications: {
    orderBy: {
      channel: "asc" as const,
    },
    select: {
      id: true,
      channel: true,
      isEnabled: true,
      status: true,
      externalId: true,
      externalUrl: true,
      syncNotes: true,
      lastSyncedAt: true,
    },
  },
};

function withResolvedPreviewImage<T extends { imageUrl: string | null; images: Array<{ url: string }> }>(property: T) {
  return {
    ...property,
    imageUrl: property.imageUrl || property.images[0]?.url || null,
  };
}

export async function getPropertyList() {
  try {
    const properties = await db.property.findMany({
      include: {
        development: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        ...publicationsInclude,
        ...previewImageInclude,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return properties.map(withResolvedPreviewImage);
  } catch {
    return [];
  }
}

export async function getPublishedProperties(limit?: number) {
  try {
    const properties = await db.property.findMany({
      where: {
        published: true,
      },
      include: {
        development: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        ...publicationsInclude,
        ...previewImageInclude,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      ...(typeof limit === "number" ? { take: limit } : {}),
    });

    return properties.map(withResolvedPreviewImage);
  } catch {
    return [];
  }
}

export async function getPublishedPropertiesForInstagram({
  limit = 12,
  market,
  developmentSlug,
  operationType,
  requireImage = true,
}: {
  limit?: number;
  market?: AppMarket;
  developmentSlug?: string;
  operationType?: string;
  requireImage?: boolean;
}) {
  try {
    const properties = await db.property.findMany({
      where: {
        published: true,
        publications: {
          some: {
            channel: "INSTAGRAM",
            isEnabled: true,
          },
        },
        ...(market ? { market } : {}),
        ...(operationType ? { operationType } : {}),
        ...(requireImage
          ? {
              OR: [{ imageUrl: { not: null } }, { images: { some: {} } }],
            }
          : {}),
        ...(developmentSlug
          ? {
              development: {
                slug: developmentSlug,
              },
            }
          : {}),
      },
      include: {
        development: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        ...publicationsInclude,
        ...previewImageInclude,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      take: Math.min(Math.max(limit, 1), 50),
    });

    return properties.map(withResolvedPreviewImage);
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
        development: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        ...publicationsInclude,
      },
    });
  } catch {
    return null;
  }
}

export async function getSimilarPublishedProperties({
  propertyId,
  developmentId,
  zone,
  market,
  operationType,
  limit = 3,
}: {
  propertyId: string;
  developmentId?: string | null;
  zone: string;
  market: AppMarket;
  operationType: string;
  limit?: number;
}) {
  try {
    const primaryMatches = await db.property.findMany({
      where: {
        published: true,
        id: { not: propertyId },
        ...(developmentId
          ? {
              developmentId,
            }
          : {
              zone,
              market,
              operationType,
            }),
      },
      include: {
        development: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        ...publicationsInclude,
        ...previewImageInclude,
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    if (primaryMatches.length >= limit) {
      return primaryMatches.map(withResolvedPreviewImage);
    }

    const fallbackMatches = await db.property.findMany({
      where: {
        published: true,
        id: {
          notIn: [propertyId, ...primaryMatches.map((item) => item.id)],
        },
        market,
        zone,
        operationType,
      },
      include: {
        development: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        ...previewImageInclude,
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: Math.max(limit - primaryMatches.length, 0),
    });

    return [...primaryMatches, ...fallbackMatches].map(withResolvedPreviewImage);
  } catch {
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    return await db.property.findUnique({
      where: { id },
      include: {
        development: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        ...publicationsInclude,
      },
    });
  } catch {
    return null;
  }
}

export async function getDevelopmentOptions() {
  try {
    return await db.development.findMany({
      orderBy: [
        { market: "asc" },
        { title: "asc" },
      ],
      select: {
        id: true,
        title: true,
        market: true,
        zone: true,
        status: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getPropertyOptions() {
  try {
    return await db.property.findMany({
      orderBy: [
        { title: "asc" },
        { unitCode: "asc" },
      ],
      select: {
        id: true,
        title: true,
        unitCode: true,
        unitType: true,
        market: true,
        development: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}
