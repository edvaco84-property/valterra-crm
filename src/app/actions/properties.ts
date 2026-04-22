"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { hasPermission, permissions } from "@/lib/permissions";

const propertySchema = z.object({
  title: z.string().min(3, "Ponle un nombre a la propiedad."),
  market: z.enum(["CDMX", "RIVIERA_MAYA"]),
  zone: z.string().min(2, "Indica la zona."),
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
});

function parseIntOrNull(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePropertyForm(formData: FormData) {
  return propertySchema.safeParse({
    title: String(formData.get("title") ?? ""),
    market: String(formData.get("market") ?? ""),
    zone: String(formData.get("zone") ?? ""),
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
  });
}

function mapPropertyData(data: z.infer<typeof propertySchema>) {
  return {
    title: data.title,
    market: data.market,
    zone: data.zone,
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

const initialState = { error: "" };

export async function createPropertyAction(_: typeof initialState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.manageProperties)) {
    return { error: "No tienes permiso para crear propiedades." };
  }
  const parsed = parsePropertyForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude crear la propiedad." };
  }

  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

  const uploadedImages = [] as Array<{ url: string; sortOrder: number; isPrimary: boolean }>;

  if (files.length) {
    const uploadDir = join(process.cwd(), "public", "uploads", "properties");
    await mkdir(uploadDir, { recursive: true });

    for (const [index, file] of files.entries()) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const safeName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const outputPath = join(uploadDir, safeName);
      await writeFile(outputPath, bytes);
      uploadedImages.push({
        url: `/uploads/properties/${safeName}`,
        sortOrder: index,
        isPrimary: index === 0,
      });
    }
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

  await logActivity({
    userId: user.id,
    action: "created",
    entityType: "property",
    entityId: property.id,
    entityLabel: property.title,
    details: `Propiedad creada en ${property.zone} por ${property.price.toLocaleString("es-MX")} ${property.currency}.`,
  });

  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/propiedades/${property.id}`);
  redirect("/properties");
}

export async function updatePropertyAction(propertyId: string, _: typeof initialState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.manageProperties)) {
    return { error: "No tienes permiso para editar propiedades." };
  }
  const parsed = parsePropertyForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude actualizar la propiedad." };
  }

  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  const removedImageIds = formData.getAll("removeImageIds").map((value) => String(value));
  const primaryImageId = String(formData.get("primaryImageId") ?? "");
  const imageOrderIds = formData.getAll("imageOrderIds").map((value) => String(value));
  const imageOrderValues = formData.getAll("imageOrderValues").map((value) => Number(String(value)));
  const imageOrderEntries = imageOrderIds
    .map((id, index) => ({ id, sortOrder: imageOrderValues[index] }))
    .filter((entry) => entry.id && Number.isFinite(entry.sortOrder));

  const uploadDir = join(process.cwd(), "public", "uploads", "properties");
  await mkdir(uploadDir, { recursive: true });

  const existingImages = await db.propertyImage.findMany({
    where: { propertyId },
    orderBy: { sortOrder: "asc" },
  });

  const remainingExistingImages = existingImages.filter((image) => !removedImageIds.includes(image.id));
  const existingImageCount = remainingExistingImages.length;

  const uploadedImages = [] as Array<{ url: string; sortOrder: number; isPrimary: boolean }>;

  for (const [index, file] of files.entries()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const outputPath = join(uploadDir, safeName);
    await writeFile(outputPath, bytes);
    uploadedImages.push({
      url: `/uploads/properties/${safeName}`,
      sortOrder: existingImageCount + index,
      isPrimary: false,
    });
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

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true, title: true, published: true, featured: true },
  });

  if (property) {
    await logActivity({
      userId: user.id,
      action: "updated",
      entityType: "property",
      entityId: property.id,
      entityLabel: property.title,
      details: `Propiedad actualizada.${property.published ? " Publicada en web." : " Interna."}${property.featured ? " Destacada en home." : ""}`,
    });
  }

  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/propiedades/${propertyId}`);
  redirect("/properties");
}
