import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = process.env.APP_URL || "https://valterra-crm.fly.dev";

const staticRoutes: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/propiedades", changeFrequency: "daily", priority: 0.9 },
  { path: "/brokers", changeFrequency: "weekly", priority: 0.65 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await db.property.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const propertyEntries: MetadataRoute.Sitemap = properties.map((property) => ({
    url: new URL(`/propiedades/${property.id}`, siteUrl).toString(),
    lastModified: property.updatedAt || property.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...propertyEntries];
}
