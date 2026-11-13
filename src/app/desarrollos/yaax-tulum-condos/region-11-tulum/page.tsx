import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, MapPin, MessageCircle, Trees, Waves } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedAnchor, TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Propiedades en Región 11 Tulum | Yaax Tulum Condos",
  description:
    "Propiedades en Región 11, Tulum con entrada desde MXN 2.49M. Explora studios, departamentos de 2 recámaras y penthouses en preventa de Yaax Tulum Condos.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos/region-11-tulum",
  },
  openGraph: {
    title: "Propiedades en Región 11 Tulum | Yaax Tulum Condos",
    description:
      "Landing de ubicación para compradores que buscan departamentos y preventa en Región 11, Tulum, con acceso directo a precios e inventario.",
    url: "/desarrollos/yaax-tulum-condos/region-11-tulum",
    images: [
      {
        url: "/uploads/properties/yaax/Render 1.JPEG",
        alt: "Yaax Tulum Condos en Región 11, Tulum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Propiedades en Región 11 Tulum | Yaax Tulum Condos",
    description:
      "Studios, departamentos de 2 recámaras y penthouses en preventa dentro de Región 11, Tulum.",
    images: ["/uploads/properties/yaax/Render 1.JPEG"],
  },
};

function buildWhatsappHref(message: string) {
  return `https://wa.me/529984635201?text=${encodeURIComponent(message)}`;
}

function formatRange(min: number, max: number, formatter: (value: number) => string) {
  return min === max ? formatter(min) : `${formatter(min)} - ${formatter(max)}`;
}

const galleryImages = [
  "/uploads/properties/yaax/Render 1.JPEG",
  "/uploads/properties/yaax/Perspectiva.PNG",
  "/uploads/properties/yaax/Studio.jpg",
  "/uploads/properties/yaax/Pent House.JPEG",
];

const valuePoints = [
  {
    icon: Trees,
    title: "Entorno residencial",
    copy: "Región 11 suele atraer búsquedas de compradores que priorizan una zona con narrativa residencial y acceso práctico dentro de Tulum.",
  },
  {
    icon: Building2,
    title: "Producto claro",
    copy: "Yaax concentra studios, 2 recámaras y penthouses en una oferta boutique que se puede comparar sin perder tiempo entre desarrollos irrelevantes.",
  },
  {
    icon: Waves,
    title: "Preventa vendible",
    copy: "La página aterriza la intención de búsqueda en precio de entrada, metraje y siguiente paso comercial, no en humo aspiracional.",
  },
];

export default async function YaaxRegionElevenPage() {
  const properties = await db.property.findMany({
    where: {
      published: true,
      development: {
        slug: "yaax-tulum-condos",
      },
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ price: "asc" }, { areaM2: "asc" }, { unitCode: "asc" }],
  });

  const priceValues = properties.map((property) => property.price);
  const areaValues = properties.map((property) => property.areaM2).filter((value): value is number => typeof value === "number");
  const priceMin = priceValues.length ? Math.min(...priceValues) : 0;
  const priceMax = priceValues.length ? Math.max(...priceValues) : 0;
  const areaMin = areaValues.length ? Math.min(...areaValues) : 0;
  const areaMax = areaValues.length ? Math.max(...areaValues) : 0;

  const unitTypeCards = Array.from(
    properties.reduce((map, property) => {
      const key = property.unitType || "Departamento";
      const current = map.get(key);
      if (!current) {
        map.set(key, {
          unitType: key,
          properties: [property],
        });
        return map;
      }

      current.properties.push(property);
      return map;
    }, new Map<string, { unitType: string; properties: typeof properties }>()),
  ).map(([, group]) => {
    const groupPrices = group.properties.map((property) => property.price);
    const groupAreas = group.properties
      .map((property) => property.areaM2)
      .filter((value): value is number => typeof value === "number");
    const firstProperty = group.properties[0];

    return {
      unitType: group.unitType,
      propertyCount: group.properties.length,
      priceLabel: formatRange(
        Math.min(...groupPrices),
        Math.max(...groupPrices),
        (value) => formatCurrency(value, firstProperty.currency),
      ),
      areaLabel: groupAreas.length
        ? formatRange(Math.min(...groupAreas), Math.max(...groupAreas), (value) => `${value} m²`)
        : null,
      propertyHref: `/propiedades/${firstProperty.id}`,
    };
  });

  const whatsappHref = buildWhatsappHref(
    "Hola, quiero precios, disponibilidad y ubicación de Yaax Tulum Condos en Región 11, Tulum.",
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué tipo de propiedades hay en Región 11 Tulum dentro de Yaax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hay studios, departamentos de 2 recámaras y penthouses publicados dentro de Yaax Tulum Condos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Desde cuánto se puede entrar a Yaax en Región 11?",
        acceptedAnswer: {
          "@type": "Answer",
          text: priceMin ? `El inventario publicado inicia desde ${formatCurrency(priceMin, "MXN")}.` : "El precio de entrada se comparte al confirmar inventario.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo se pide disponibilidad actualizada?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Se puede solicitar por WhatsApp o formulario para recibir precios, inventario y plan de pago actualizados.",
        },
      },
    ],
  };

  return (
    <main className="bg-[#f4ede3] text-[#211710]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative overflow-hidden bg-[#221710] text-[#f8efe2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,124,74,0.28),transparent_36%),linear-gradient(135deg,rgba(0,0,0,0.2),rgba(0,0,0,0.68))]" />
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-14">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">Región 11 Tulum · Yaax</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Propiedades en Región 11, Tulum con entrada desde {priceMin ? formatCurrency(priceMin, "MXN") : "precio por confirmar"}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#eadfce]/88">
              Esta landing responde una búsqueda de ubicación con intención real de compra. Yaax Tulum Condos ofrece inventario
              en preventa dentro de Región 11 con studios, 2 recámaras y penthouses para quien quiere precio base, contexto y contacto directo.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Desde</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{priceMin ? formatCurrency(priceMin, "MXN") : "Solicitar"}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Rango publicado</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">
                  {priceMax ? formatCurrency(priceMax, "MXN") : "Consultar"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Metraje</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{areaValues.length ? `${areaMin}-${areaMax} m²` : "Consultar"}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_region11_whatsapp_click"
                label="hero"
                page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir disponibilidad
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Recibir precios
              </a>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_region11_internal_navigation"
                label="fase-1"
                page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver Fase 1
                <ArrowRight className="h-4 w-4" />
              </TrackedInternalLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#dcc7ab]/78">
              <span>Región 11, Tulum</span>
              <span>{unitTypeCards.length || 3} tipologías</span>
              <span>{properties.length || 16} unidades publicadas</span>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            {galleryImages.map((image, index) => (
              <div
                key={image}
                className={`min-h-[190px] rounded-[1.6rem] border border-white/10 bg-cover bg-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] ${
                  index === 0 ? "sm:col-span-2 sm:min-h-[300px]" : ""
                }`}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.18)), url('${image}')` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Por qué esta zona</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Región 11 es una búsqueda de ubicación, no solo una mención decorativa.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              Quien busca propiedades en Región 11 normalmente quiere filtrar por ubicación antes de entrar al detalle del desarrollo.
              Esta página conecta esa intención con una oferta concreta y con un siguiente paso comercial claro.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {valuePoints.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[1.5rem] border border-[#d8c6b1] bg-white/70 p-5">
                  <Icon className="h-5 w-5 text-[#9d7a56]" />
                  <h3 className="mt-4 font-serif text-2xl text-[#241811]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f4835]">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Inventario publicado</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">Tipologías activas dentro de Yaax en Región 11.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Esta lectura sirve para abrir conversación comercial con información útil: ticket, metraje y acceso a fichas reales.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {unitTypeCards.map((card) => (
              <article key={card.unitType} className="rounded-[1.8rem] border border-[#ccb79f] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c6846]">
                  {card.propertyCount} {card.propertyCount === 1 ? "unidad publicada" : "unidades publicadas"}
                </p>
                <h3 className="mt-2 font-serif text-3xl text-[#241811]">{card.unitType}</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#5f4835]">
                  <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">Desde {card.priceLabel}</span>
                  {card.areaLabel ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.areaLabel}</span> : null}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={card.propertyHref}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#241811] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
                  >
                    Ver ejemplo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <TrackedAnchor
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    eventName="yaax_region11_whatsapp_click"
                    label={card.unitType.toLowerCase()}
                    page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                  >
                    Pedir inventario
                  </TrackedAnchor>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Siguiente paso útil</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Qué necesita un lead serio después de llegar por Región 11.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              No hace falta una épica tropical. Hace falta rapidez con mapa, precios, disponibilidad y ruta de seguimiento.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Mapa y referencia real de ubicación en Región 11.",
                "Precio base e inventario disponible al momento del contacto.",
                "Tipología sugerida según ticket y uso esperado.",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#dccab4] bg-white/70 px-4 py-3 text-sm text-[#3b2a1e]">
                  <CheckCircle2 className="h-4 w-4 text-[#9d7a56]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d8c6b1] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c6846]">Navegación relacionada</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[#5f4835]">
              <div className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Usa esta landing como entrada por ubicación y dirige al lead a la landing general o a Fase 1 según nivel de intención.</p>
              </div>
              <div className="flex gap-3">
                <Building2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>La landing general explica el proyecto completo; Fase 1 empuja inventario inicial con CTA más directo.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos"
                eventName="yaax_region11_internal_navigation"
                label="landing-general"
                page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
              >
                Ver landing general
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_region11_internal_navigation"
                label="fase-1-bottom"
                page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Ver Fase 1
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                eventName="yaax_region11_internal_navigation"
                label="zone-comparison"
                page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Comparar zonas
              </TrackedInternalLink>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-[#221710] text-[#f8efe2]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d0b188]">Captura de lead</p>
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide precios y disponibilidad en Región 11.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              El formulario entra al CRM con contexto de Riviera Maya y con una intención mucho más útil que un “hola, me interesa”.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_region11_whatsapp_click"
                label="contacto"
                page="/desarrollos/yaax-tulum-condos/region-11-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp directo
              </TrackedAnchor>
              <Link
                href="/propiedades?mercado=RIVIERA_MAYA"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver catálogo
              </Link>
            </div>
          </div>

          <ContactForm
            market="RIVIERA_MAYA"
            interest="Quiero precios y disponibilidad de Yaax Tulum Condos en Región 11"
            submitLabel="Recibir inventario y precios en Región 11"
            preferredContactLabel="Canal para recibir opciones en Región 11"
            preferredContactPlaceholder="WhatsApp, llamada o email para compartir disponibilidad"
            messageLabel="Cuéntanos presupuesto, tipología o comparación de zona"
            messagePlaceholder="Ejemplo: quiero comparar Región 11 con otras zonas, revisar 2 recámaras o pedir inventario vigente con plan de pago."
            formIntro="Comparte presupuesto, tipología y si sigues comparando zonas para responder con inventario vigente de Yaax en Región 11 y siguiente paso comercial."
          />
        </div>
      </section>
    </main>
  );
}
