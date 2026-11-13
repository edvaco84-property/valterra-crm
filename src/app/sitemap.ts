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
  { path: "/desarrollos/yaax-tulum-condos", changeFrequency: "weekly", priority: 0.9 },
  { path: "/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum", changeFrequency: "weekly", priority: 0.85 },
  { path: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4", changeFrequency: "weekly", priority: 0.85 },
  { path: "/desarrollos/yaax-tulum-condos/studios-en-tulum", changeFrequency: "weekly", priority: 0.8 },
  { path: "/desarrollos/yaax-tulum-condos/departamentos-2-recamaras-en-tulum", changeFrequency: "weekly", priority: 0.8 },
  { path: "/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum", changeFrequency: "weekly", priority: 0.8 },
  { path: "/desarrollos/yaax-tulum-condos/penthouses-en-tulum", changeFrequency: "weekly", priority: 0.8 },
  { path: "/desarrollos/yaax-tulum-condos/region-11-tulum", changeFrequency: "weekly", priority: 0.8 },
  { path: "/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta", changeFrequency: "weekly", priority: 0.75 },
  { path: "/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum", changeFrequency: "weekly", priority: 0.8 },
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
