import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { getMarketLabel } from "@/lib/markets";
import { getPublishedPropertyById, getSimilarPublishedProperties } from "@/lib/properties/queries";
import { formatCurrency } from "@/lib/utils";

type PublicPropertyPageProps = {
  params: Promise<{ id: string }>;
};

function buildPropertyDescription(property: NonNullable<Awaited<ReturnType<typeof getPublishedPropertyById>>>) {
  const marketLabel = getMarketLabel(property.market);
  const attributeParts = [
    typeof property.bedrooms === "number" ? `${property.bedrooms} recámaras` : null,
    typeof property.bathrooms === "number" ? `${property.bathrooms} baños` : null,
    typeof property.areaM2 === "number" ? `${property.areaM2} m²` : null,
  ].filter(Boolean);

  const summaryText =
    property.summary ||
    property.description ||
    `${property.propertyType} en ${property.zone}, ${marketLabel}, publicada en el catálogo de Valterra.`;

  return [summaryText, attributeParts.length ? attributeParts.join(" · ") : null].filter(Boolean).join(" ");
}

export async function generateMetadata({ params }: PublicPropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPublishedPropertyById(id);

  if (!property) {
    return {
      title: "Propiedad no encontrada | Valterra",
      alternates: {
        canonical: `/propiedades/${id}`,
      },
    };
  }

  const propertyUrl = `/propiedades/${property.id}`;
  const marketLabel = getMarketLabel(property.market);
  const developmentLabel = property.development?.title ? `${property.development.title} | ` : "";
  const title = `${property.title} | ${property.zone}, ${marketLabel} | Valterra`;
  const description = buildPropertyDescription(property);
  const image = property.images[0]?.url || property.imageUrl || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: propertyUrl,
    },
    openGraph: {
      title,
      description,
      url: propertyUrl,
      type: "article",
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${developmentLabel}${property.title}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PublicPropertyPage({ params }: PublicPropertyPageProps) {
  const { id } = await params;
  const property = await getPublishedPropertyById(id);

  if (!property) {
    notFound();
  }

  const similarProperties = await getSimilarPublishedProperties({
    propertyId: property.id,
    developmentId: property.developmentId,
    zone: property.zone,
    market: property.market,
    operationType: property.operationType,
    limit: 3,
  });

  const propertyUrl = `https://valterra-crm.fly.dev/propiedades/${property.id}`;
  const developmentLabel = property.development?.title ?? property.title;
  const marketLabel = getMarketLabel(property.market);
  const locationQuery = [property.locationLabel, developmentLabel, property.zone, marketLabel].filter(Boolean).join(", ");
  const hasExactCoordinates = typeof property.latitude === "number" && typeof property.longitude === "number";
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(
    `Te comparto esta propiedad de Valterra:\n\n${property.title}\n${property.zone} · ${
      marketLabel
    }\n${formatCurrency(property.price, property.currency)}\n\n${propertyUrl}`,
  )}`;
  const googleMapsHref =
    property.googleMapsUrl ||
    (hasExactCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`);
  const googleMapsEmbedHref = hasExactCoordinates
    ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&z=15&output=embed`;
  const mapContextLabel = property.locationLabel || locationQuery;
  const propertyDescription = buildPropertyDescription(property);
  const galleryImages = Array.from(
    new Set(
      [property.images[0]?.url, ...property.images.map((image) => image.url), property.imageUrl].filter(
        (image): image is string => Boolean(image),
      ),
    ),
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: "https://valterra-crm.fly.dev/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Propiedades",
            item: "https://valterra-crm.fly.dev/propiedades",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: property.title,
            item: propertyUrl,
          },
        ],
      },
      {
        "@type": "Product",
        name: property.title,
        description: propertyDescription,
        category: `${property.propertyType} en ${property.zone}`,
        image: property.images.map((image) => image.url).filter(Boolean),
        url: propertyUrl,
        brand: {
          "@type": "Brand",
          name: "Valterra",
        },
        offers: {
          "@type": "Offer",
          price: property.price,
          priceCurrency: property.currency,
          availability: "https://schema.org/InStock",
          url: propertyUrl,
        },
        additionalProperty: [
          typeof property.bedrooms === "number"
            ? {
                "@type": "PropertyValue",
                name: "Recámaras",
                value: property.bedrooms,
              }
            : null,
          typeof property.bathrooms === "number"
            ? {
                "@type": "PropertyValue",
                name: "Baños",
                value: property.bathrooms,
              }
            : null,
          typeof property.areaM2 === "number"
            ? {
                "@type": "PropertyValue",
                name: "Superficie",
                value: `${property.areaM2} m²`,
              }
            : null,
          property.operationType
            ? {
                "@type": "PropertyValue",
                name: "Operación",
                value: property.operationType,
              }
            : null,
        ].filter(Boolean),
      },
    ],
  };

  return (
    <main className="bg-[#171310] text-[#f5ede2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto max-w-[1080px] px-6 py-8 sm:px-10">
        <Link href="/propiedades" className="inline-flex items-center gap-2 text-sm text-[#d6c0a0] transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <section className="mt-6 overflow-hidden border border-[#5f503d]/45 bg-[#1d1814]">
          <PropertyGallery
            images={
              galleryImages.length
                ? galleryImages
                : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"]
            }
            title={property.title}
          />

          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#b89b72]">{property.zone} · {marketLabel}</p>
              <h1 className="mt-3 font-serif text-4xl text-[#f4e7d7] sm:text-5xl">{property.title}</h1>
              <p className="mt-4 text-2xl text-[#f4e7d7]">{formatCurrency(property.price, property.currency)}</p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#e4d6c4]">
                {property.development ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.development.title}</span> : null}
                <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.propertyType}</span>
                <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.operationType}</span>
                <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.status}</span>
                {property.unitCode ? <span className="rounded-full border border-[#6b5841] px-4 py-2">Unidad {property.unitCode}</span> : null}
                {property.floorLabel ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.floorLabel}</span> : null}
                {property.bedrooms ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.bedrooms} recámaras</span> : null}
                {property.bathrooms ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.bathrooms} baños</span> : null}
                {property.areaM2 ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.areaM2} m²</span> : null}
                {property.areaM2 ? (
                  <span className="rounded-full border border-[#6b5841] px-4 py-2">
                    {formatCurrency(Math.round(property.price / property.areaM2), property.currency)} / m²
                  </span>
                ) : null}
              </div>

              <div className="mt-8 space-y-4 text-sm leading-7 text-[#dccdb8]">
                {property.summary ? <p>{property.summary}</p> : null}
                <p>{property.description || "Propiedad selecta para clientes que buscan ubicación, criterio y presencia en un mercado premium."}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappShareHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-[#25d366]/45 bg-[#163323] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#d8ffe5] transition hover:border-[#25d366] hover:text-white"
                >
                  Compartir por WhatsApp
                </a>
                <a
                  href={googleMapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8b7354] bg-[#241c15] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f0ddc1] transition hover:border-[#d3b184] hover:text-white"
                >
                  <MapPin className="h-4 w-4" />
                  Ver en Google Maps
                </a>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-[1.75rem] border border-[#5f503d]/45 bg-[#18130f]">
                <div className="border-b border-[#5f503d]/35 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#caa77c]">Ubicación aproximada</p>
                  <h2 className="mt-2 font-serif text-2xl text-[#f4e7d7]">Contexto real de la zona</h2>
                  <p className="mt-2 text-sm leading-7 text-[#dccdb8]">
                    {hasExactCoordinates ? "La ubicación exacta cargada desde el CRM" : developmentLabel} se muestra sobre Google Maps para entender mejor su entorno sin convertir la página en expediente judicial.
                  </p>
                </div>
                <iframe
                  title={`Mapa de ${developmentLabel}`}
                  src={googleMapsEmbedHref}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[320px] w-full border-0"
                />
                <div className="border-t border-[#5f503d]/35 px-5 py-4 text-sm leading-7 text-[#dccdb8]">
                  <p>{mapContextLabel}</p>
                  <p className="text-[#bfa585]">Ideal para clientes que quieren dimensionar la zona antes de escribir con preguntas existenciales sobre “qué tan cerca está todo”.</p>
                </div>
              </div>

              <p className="mb-3 mt-6 text-xs uppercase tracking-[0.18em] text-[#caa77c]">Solicita información de esta propiedad</p>
              <ContactForm propertyTitle={property.title} propertyId={property.id} />
            </div>
          </div>
        </section>

        {similarProperties.length ? (
          <section className="mt-8 rounded-[2rem] border border-[#5f503d]/45 bg-[#1b1612] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#caa77c]">También te puede interesar</p>
                <h2 className="mt-2 font-serif text-3xl text-[#f4e7d7]">Propiedades similares</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#dccdb8]">
                  Opciones cercanas en perfil, zona o desarrollo para que el cliente siga explorando sin salir rebotado al vacío digital.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {similarProperties.map((similarProperty) => {
                const similarMarketLabel = getMarketLabel(similarProperty.market);
                const similarImage =
                  similarProperty.imageUrl ||
                  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

                return (
                  <article
                    key={similarProperty.id}
                    className="overflow-hidden border border-[#5f503d]/45 bg-[#18130f] transition hover:border-[#8e7454]"
                  >
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('${similarImage}')` }} />
                    <div className="space-y-4 px-5 py-5">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#caa77c]">
                          {similarProperty.zone} · {similarMarketLabel}
                        </p>
                        <h3 className="mt-2 font-serif text-2xl text-[#f4e7d7]">{similarProperty.title}</h3>
                        <p className="mt-2 text-lg text-[#f4e7d7]">{formatCurrency(similarProperty.price, similarProperty.currency)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-[#dccdb8]">
                        {similarProperty.development ? <span className="rounded-full border border-[#6b5841] px-3 py-1.5">{similarProperty.development.title}</span> : null}
                        <span className="rounded-full border border-[#6b5841] px-3 py-1.5">{similarProperty.propertyType}</span>
                        {similarProperty.bedrooms ? <span className="rounded-full border border-[#6b5841] px-3 py-1.5">{similarProperty.bedrooms} rec</span> : null}
                        {similarProperty.areaM2 ? <span className="rounded-full border border-[#6b5841] px-3 py-1.5">{similarProperty.areaM2} m²</span> : null}
                      </div>

                      <p className="text-sm leading-7 text-[#dccdb8]">
                        {similarProperty.summary || similarProperty.description || "Otra opción sólida para seguir la conversación comercial sin perder ritmo."}
                      </p>

                      <Link
                        href={`/propiedades/${similarProperty.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f0ddc1] transition hover:text-white"
                      >
                        Ver propiedad
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
