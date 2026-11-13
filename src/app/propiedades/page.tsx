import Link from "next/link";
import type { Metadata } from "next";
import { PublicPropertiesCatalog } from "@/components/properties/public-properties-catalog";
import { getPublishedProperties } from "@/lib/properties/queries";
import { getMarketLabel } from "@/lib/markets";

export const metadata: Metadata = {
  title: "Propiedades en venta e inversión | Valterra",
  description:
    "Explora propiedades publicadas por Valterra en CDMX, Estado de Mexico y Riviera Maya. Filtra por ubicación, precio, recámaras y tipo de operación.",
  alternates: {
    canonical: "/propiedades",
  },
  openGraph: {
    title: "Propiedades en venta e inversión | Valterra",
    description:
      "Catálogo público de propiedades publicadas por Valterra con filtros por mercado, precio, ubicación y perfil de operación.",
    url: "/propiedades",
  },
  twitter: {
    card: "summary_large_image",
    title: "Propiedades en venta e inversión | Valterra",
    description:
      "Catálogo público de propiedades publicadas por Valterra en CDMX, Estado de Mexico y Riviera Maya.",
  },
};

function toInitialQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    }
  }

  return params.toString();
}

export default async function PublicPropertiesCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const properties = await getPublishedProperties();
  const resolvedSearchParams = await searchParams;
  const initialQueryString = toInitialQueryString(resolvedSearchParams);
  const siteUrl = process.env.APP_URL || "https://valterra-crm.fly.dev";
  const catalogUrl = new URL("/propiedades", siteUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Propiedades Valterra",
        description:
          "Catálogo público de propiedades en CDMX, Estado de Mexico y Riviera Maya con filtros por mercado, ubicación, precio y tipo de operación.",
        url: catalogUrl,
      },
      {
        "@type": "ItemList",
        name: "Catálogo de propiedades publicadas",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: properties.length,
        itemListElement: properties.slice(0, 24).map((property, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: new URL(`/propiedades/${property.id}`, siteUrl).toString(),
          name: property.title,
          item: {
            "@type": "Product",
            name: property.title,
            description:
              property.summary ||
              property.description ||
              `${property.propertyType} en ${property.zone}, ${getMarketLabel(property.market)}.`,
            category: `${property.propertyType} | ${property.operationType}`,
            image: property.imageUrl ? [property.imageUrl] : undefined,
            offers: {
              "@type": "Offer",
              price: property.price,
              priceCurrency: property.currency,
              availability: "https://schema.org/InStock",
              url: new URL(`/propiedades/${property.id}`, siteUrl).toString(),
            },
          },
        })),
      },
    ],
  };

  return (
    <main className="bg-[#171310] text-[#f5ede2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto max-w-[1080px] px-6 py-8 sm:px-10">
        <div className="rounded-[2rem] border border-[#5f503d]/45 bg-[#1b1612] px-6 py-8 sm:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d6c0a0]">Catálogo</p>
          <h1 className="mt-3 font-serif text-4xl text-[#f4e7d7] sm:text-5xl">Propiedades Valterra</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#dccdb8]/82">
            Una selección curada de oportunidades patrimoniales en CDMX, Estado de Mexico y Riviera Maya.
          </p>
          <div className="mt-6">
            <Link href="/" className="inline-flex items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
              Volver al sitio
            </Link>
          </div>
        </div>

        {properties.length ? (
          <PublicPropertiesCatalog initialQueryString={initialQueryString} properties={properties} />
        ) : (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#5f503d] px-6 py-12 text-center text-[#dccdb8]/80">
            Aún no hay propiedades publicadas. En cuanto el equipo libere inventario para web, aparecerá aquí automáticamente.
          </div>
        )}
      </div>
    </main>
  );
}
