"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { marketValues } from "@/lib/markets";
import { hasPermission, permissions } from "@/lib/permissions";
import { getMetaPropertyUrl, publishPropertyToFacebook, publishPropertyToInstagram } from "@/lib/social/meta";

const propertySchema = z.object({
  title: z.string().min(3, "Ponle un nombre a la propiedad."),
  market: z.enum(marketValues),
  zone: z.string().min(2, "Indica la zona."),
  locationLabel: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  developmentId: z.string().optional(),
  unitCode: z.string().optional(),
  unitType: z.string().optional(),
  floorLabel: z.string().optional(),
  propertyType: z.string().min(2, "Indica el tipo de propiedad."),
  operationType: z.string().min(2, "Indica el tipo de operación."),
  price: z.string().min(1, "Indica el precio."),
  currency: z.string().min(3, "Indica la moneda."),
  status: z.string().min(2, "Indica el estado."),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  areaM2: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  featured: z.string().optional(),
  published: z.string().optional(),
  inmuebles24Enabled: z.string().optional(),
  facebookEnabled: z.string().optional(),
  instagramEnabled: z.string().optional(),
});

function parseIntOrNull(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFloatOrNull(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePropertyForm(formData: FormData) {
  return propertySchema.safeParse({
    title: String(formData.get("title") ?? ""),
    market: String(formData.get("market") ?? ""),
    zone: String(formData.get("zone") ?? ""),
    locationLabel: String(formData.get("locationLabel") ?? ""),
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
    latitude: String(formData.get("latitude") ?? ""),
    longitude: String(formData.get("longitude") ?? ""),
    developmentId: String(formData.get("developmentId") ?? ""),
    unitCode: String(formData.get("unitCode") ?? ""),
    unitType: String(formData.get("unitType") ?? ""),
    floorLabel: String(formData.get("floorLabel") ?? ""),
    propertyType: String(formData.get("propertyType") ?? ""),
    operationType: String(formData.get("operationType") ?? ""),
    price: String(formData.get("price") ?? ""),
    currency: String(formData.get("currency") ?? "MXN"),
    status: String(formData.get("status") ?? ""),
    bedrooms: String(formData.get("bedrooms") ?? ""),
    bathrooms: String(formData.get("bathrooms") ?? ""),
    areaM2: String(formData.get("areaM2") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    featured: String(formData.get("featured") ?? ""),
    published: String(formData.get("published") ?? ""),
    inmuebles24Enabled: String(formData.get("inmuebles24Enabled") ?? ""),
    facebookEnabled: String(formData.get("facebookEnabled") ?? ""),
    instagramEnabled: String(formData.get("instagramEnabled") ?? ""),
  });
}

function mapPropertyData(data: z.infer<typeof propertySchema>) {
  return {
    title: data.title,
    market: data.market,
    zone: data.zone,
    locationLabel: data.locationLabel || null,
    googleMapsUrl: data.googleMapsUrl || null,
    latitude: parseFloatOrNull(data.latitude),
    longitude: parseFloatOrNull(data.longitude),
    developmentId: data.developmentId || null,
    unitCode: data.unitCode || null,
    unitType: data.unitType || null,
    floorLabel: data.floorLabel || null,
    propertyType: data.propertyType,
    operationType: data.operationType,
    price: Number(data.price),
    currency: data.currency || "MXN",
    status: data.status,
    bedrooms: parseIntOrNull(data.bedrooms),
    bathrooms: parseIntOrNull(data.bathrooms),
    areaM2: parseIntOrNull(data.areaM2),
    summary: data.summary || null,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    featured: data.featured === "on",
    published: data.published === "on",
  };
}

function getPublicationState(data: z.infer<typeof propertySchema>) {
  const websiteEnabled = data.published === "on";
  const inmuebles24Enabled = data.inmuebles24Enabled === "on";
  const facebookEnabled = data.facebookEnabled === "on";
  const instagramEnabled = data.instagramEnabled === "on";

  return {
    websiteEnabled,
    inmuebles24Enabled,
    facebookEnabled,
    instagramEnabled,
  };
}

async function syncPropertyPublications(
  propertyId: string,
  publicationState: ReturnType<typeof getPublicationState>,
) {
  await db.propertyPublication.upsert({
    where: {
      propertyId_channel: {
        propertyId,
        channel: "WEBSITE",
      },
    },
    create: {
      propertyId,
      channel: "WEBSITE",
      isEnabled: publicationState.websiteEnabled,
      status: publicationState.websiteEnabled ? "PUBLISHED" : "DRAFT",
    },
    update: {
      isEnabled: publicationState.websiteEnabled,
      status: publicationState.websiteEnabled ? "PUBLISHED" : "PAUSED",
    },
  });

  await db.propertyPublication.upsert({
    where: {
      propertyId_channel: {
        propertyId,
        channel: "INMUEBLES24",
      },
    },
    create: {
      propertyId,
      channel: "INMUEBLES24",
      isEnabled: publicationState.inmuebles24Enabled,
      status: publicationState.inmuebles24Enabled ? "READY" : "DRAFT",
    },
    update: {
      isEnabled: publicationState.inmuebles24Enabled,
      status: publicationState.inmuebles24Enabled ? "READY" : "PAUSED",
    },
  });

  await db.propertyPublication.upsert({
    where: {
      propertyId_channel: {
        propertyId,
        channel: "FACEBOOK",
      },
    },
    create: {
      propertyId,
      channel: "FACEBOOK",
      isEnabled: publicationState.facebookEnabled,
      status: publicationState.facebookEnabled ? "READY" : "DRAFT",
    },
    update: {
      isEnabled: publicationState.facebookEnabled,
      status: publicationState.facebookEnabled ? "READY" : "PAUSED",
    },
  });

  await db.propertyPublication.upsert({
    where: {
      propertyId_channel: {
        propertyId,
        channel: "INSTAGRAM",
      },
    },
    create: {
      propertyId,
      channel: "INSTAGRAM",
      isEnabled: publicationState.instagramEnabled,
      status: publicationState.instagramEnabled ? "READY" : "DRAFT",
    },
    update: {
      isEnabled: publicationState.instagramEnabled,
      status: publicationState.instagramEnabled ? "READY" : "PAUSED",
    },
  });
}

type PropertyActionState = { error: string };

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function sanitizeImageFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "-");
}

async function buildUploadedImages(files: File[], startOrder = 0) {
  const uploadedImages = [] as Array<{
    id: string;
    url: string;
    alt: string | null;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    content: Uint8Array;
    sortOrder: number;
    isPrimary: boolean;
  }>;

  for (const [index, file] of files.entries()) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Solo se permiten imágenes JPG, PNG o WebP.");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Cada imagen debe pesar menos de 8 MB.");
    }

    const id = randomUUID();
    const bytes = new Uint8Array(await file.arrayBuffer());
    uploadedImages.push({
      id,
      url: `/api/property-images/${id}`,
      alt: null,
      filename: `${id}-${sanitizeImageFilename(file.name)}`,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      content: bytes,
      sortOrder: startOrder + index,
      isPrimary: false,
    });
  }

  return uploadedImages;
}

export async function createPropertyAction(_: PropertyActionState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.manageProperties)) {
    return { error: "No tienes permiso para crear propiedades." };
  }
  const parsed = parsePropertyForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude crear la propiedad." };
  }

  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  const publicationState = getPublicationState(parsed.data);
  let uploadedImages: Awaited<ReturnType<typeof buildUploadedImages>> = [];

  try {
    uploadedImages = await buildUploadedImages(files);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pude procesar las imágenes.",
    };
  }

  if (uploadedImages.length) {
    uploadedImages[0]!.isPrimary = true;
  }

  const property = await db.property.create({
    data: {
      ...mapPropertyData(parsed.data),
      imageUrl: uploadedImages[0]?.url ?? mapPropertyData(parsed.data).imageUrl,
      images: uploadedImages.length
        ? {
            create: uploadedImages,
          }
        : undefined,
      },
  });

  await syncPropertyPublications(property.id, publicationState);

  await logActivity({
    userId: user.id,
    action: "created",
    entityType: "property",
    entityId: property.id,
    entityLabel: property.title,
      details: `Propiedad creada en ${property.zone} por ${property.price.toLocaleString("es-MX")} ${property.currency}.${publicationState.inmuebles24Enabled ? " Inmuebles24 marcada para publicar después." : ""}`,
  });

  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/propiedades/${property.id}`);
  redirect("/properties");
}

export async function updatePropertyAction(propertyId: string, _: PropertyActionState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.manageProperties)) {
    return { error: "No tienes permiso para editar propiedades." };
  }
  const parsed = parsePropertyForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude actualizar la propiedad." };
  }

  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  const publicationState = getPublicationState(parsed.data);
  const removedImageIds = formData.getAll("removeImageIds").map((value) => String(value));
  const primaryImageId = String(formData.get("primaryImageId") ?? "");
  const imageOrderIds = formData.getAll("imageOrderIds").map((value) => String(value));
  const imageOrderValues = formData.getAll("imageOrderValues").map((value) => Number(String(value)));
  const imageOrderEntries = imageOrderIds
    .map((id, index) => ({ id, sortOrder: imageOrderValues[index] }))
    .filter((entry) => entry.id && Number.isFinite(entry.sortOrder));

  const existingImages = await db.propertyImage.findMany({
    where: { propertyId },
    orderBy: { sortOrder: "asc" },
  });

  const remainingExistingImages = existingImages.filter((image) => !removedImageIds.includes(image.id));
  const existingImageCount = remainingExistingImages.length;
  let uploadedImages: Awaited<ReturnType<typeof buildUploadedImages>> = [];

  try {
    uploadedImages = await buildUploadedImages(files, existingImageCount);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pude procesar las imágenes.",
    };
  }

  await db.$transaction(async (tx) => {
    if (removedImageIds.length) {
      await tx.propertyImage.deleteMany({
        where: {
          propertyId,
          id: {
            in: removedImageIds,
          },
        },
      });
    }

    if (imageOrderEntries.length) {
      await Promise.all(
        imageOrderEntries.map((entry) =>
          tx.propertyImage.updateMany({
            where: {
              propertyId,
              id: entry.id,
            },
            data: {
              sortOrder: entry.sortOrder,
            },
          }),
        ),
      );
    }

    if (uploadedImages.length) {
      await tx.property.update({
        where: { id: propertyId },
        data: {
          images: {
            create: uploadedImages,
          },
        },
      });
    }

    await tx.property.update({
      where: { id: propertyId },
      data: {
        ...mapPropertyData(parsed.data),
      },
    });

    await tx.propertyImage.updateMany({
      where: { propertyId },
      data: { isPrimary: false },
    });

    if (primaryImageId) {
      await tx.propertyImage.updateMany({
        where: {
          propertyId,
          id: primaryImageId,
        },
        data: { isPrimary: true },
      });
    } else {
      const firstImage = await tx.propertyImage.findFirst({
        where: { propertyId },
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      });

      if (firstImage) {
        await tx.propertyImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true },
        });
      }
    }
  });

  const primaryImage = await db.propertyImage.findFirst({
    where: { propertyId },
    orderBy: [
      { isPrimary: "desc" },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
  });

  await db.property.update({
    where: { id: propertyId },
    data: {
      imageUrl: primaryImage?.url ?? (parsed.data.imageUrl || null),
    },
  });

  await syncPropertyPublications(propertyId, publicationState);

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      published: true,
      featured: true,
    },
  });

  if (property) {
    await logActivity({
      userId: user.id,
      action: "updated",
      entityType: "property",
      entityId: property.id,
      entityLabel: property.title,
      details: `Propiedad actualizada.${property.published ? " Publicada en web." : " Interna."}${property.featured ? " Destacada en home." : ""}${publicationState.inmuebles24Enabled ? " Inmuebles24 lista para publicar." : " Inmuebles24 apagado."}`,
    });
  }

  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/propiedades/${propertyId}`);
  redirect("/properties");
}

type SocialPublicationActionState = {
  error: string;
  success: string;
};

type SocialChannel = "FACEBOOK" | "INSTAGRAM";

function getSocialChannelLabel(channel: SocialChannel) {
  return channel === "FACEBOOK" ? "Facebook" : "Instagram";
}

export async function publishPropertyToSocialAction(
  propertyId: string,
  channel: SocialChannel,
  _: SocialPublicationActionState,
  _formData: FormData,
): Promise<SocialPublicationActionState> {
  void _;
  void _formData;

  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.manageProperties)) {
    return { error: "No tienes permiso para publicar propiedades.", success: "" };
  }

  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      development: {
        select: {
          title: true,
          slug: true,
        },
      },
      images: {
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          url: true,
        },
      },
      publications: {
        select: {
          id: true,
          channel: true,
          isEnabled: true,
          status: true,
        },
      },
    },
  });

  if (!property) {
    return { error: "No encontré esa propiedad.", success: "" };
  }

  if (!property.published) {
    return {
      error: "Primero publica la propiedad en la web; si no, el enlace del post apunta a nada. Y eso es una forma elegante de perder tiempo.",
      success: "",
    };
  }

  const publication = property.publications.find((entry) => entry.channel === channel);
  if (!publication?.isEnabled) {
    return {
      error: `Primero marca esta propiedad para ${getSocialChannelLabel(channel)} en el formulario.`,
      success: "",
    };
  }

  try {
    const result =
      channel === "FACEBOOK"
        ? await publishPropertyToFacebook(property)
        : await publishPropertyToInstagram(property);

    await db.propertyPublication.update({
      where: {
        propertyId_channel: {
          propertyId,
          channel,
        },
      },
      data: {
        status: "PUBLISHED",
        externalId: result.externalId,
        externalUrl: result.externalUrl,
        syncNotes: result.syncNotes,
        lastSyncedAt: new Date(),
      },
    });

    await logActivity({
      userId: user.id,
      action: "published",
      entityType: "property",
      entityId: property.id,
      entityLabel: property.title,
      details: `${getSocialChannelLabel(channel)} publicado.${result.externalUrl ? ` URL: ${result.externalUrl}` : ` Ficha: ${getMetaPropertyUrl(property.id)}`}`,
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${property.id}/edit`);
    revalidatePath(`/propiedades/${property.id}`);

    return {
      error: "",
      success: `${getSocialChannelLabel(channel)} publicado${result.externalUrl ? `: ${result.externalUrl}` : "."}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pude publicar en Meta.";

    await db.propertyPublication.update({
      where: {
        propertyId_channel: {
          propertyId,
          channel,
        },
      },
      data: {
        status: "ERROR",
        syncNotes: message,
        lastSyncedAt: new Date(),
      },
    });

    revalidatePath("/properties");
    revalidatePath(`/properties/${property.id}/edit`);

    return {
      error: message,
      success: "",
    };
  }
}

export async function deletePropertyAction(propertyId: string, _: { error: string }, _formData: FormData) {
  void _;
  void _formData;

  const user = await requireSessionUser();

  if (!hasPermission(user.role, permissions.manageProperties)) {
    return { error: "No tienes permiso para borrar propiedades." };
  }

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true, title: true },
  });

  if (!property) {
    return { error: "No encontré esa propiedad." };
  }

  await db.$transaction(async (tx) => {
    await tx.activityLog.deleteMany({ where: { entityType: "property", entityId: propertyId } });
    await tx.lead.updateMany({
      where: { propertyId },
      data: {
        propertyId: null,
      },
    });
    await tx.property.delete({
      where: { id: propertyId },
    });
  });

  await logActivity({
    userId: user.id,
    action: "deleted",
    entityType: "property",
    entityId: propertyId,
    entityLabel: property.title,
    details: "Propiedad eliminada del CRM.",
  });

  revalidatePath("/");
  revalidatePath("/crm");
  revalidatePath("/properties");
  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${propertyId}`);
  redirect("/properties");
}
