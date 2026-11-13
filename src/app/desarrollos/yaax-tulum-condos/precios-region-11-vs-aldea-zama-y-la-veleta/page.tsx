import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedAnchor, TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Preventa en Tulum: Región 11 vs Aldea Zama vs La Veleta | Yaax",
  description:
    "Guía para comparar preventa en Tulum por precio de entrada, ubicación y perfil de compra. Revisa cómo se posiciona Yaax Tulum Condos en Región 11 frente a búsquedas como Aldea Zama y La Veleta.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta",
  },
  openGraph: {
    title: "Preventa en Tulum: Región 11 vs Aldea Zama vs La Veleta | Yaax",
    description:
      "Comparativa comercial para compradores que evalúan preventa en Tulum por entrada, ubicación y siguiente paso comercial.",
    url: "/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta",
    images: [
      {
        url: "/uploads/properties/yaax/Render 1.JPEG",
        alt: "Yaax Tulum Condos en Región 11, Tulum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preventa en Tulum: Región 11 vs Aldea Zama vs La Veleta | Yaax",
    description:
      "Comparativa comercial para compradores que evalúan preventa en Tulum por entrada, ubicación y perfil de uso.",
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
  "/uploads/properties/yaax/Pent House.JPEG",
];

const comparisonCards = [
  {
    zone: "Región 11",
    fit: "Para quien quiere una entrada de preventa más clara, narrativa residencial y una ruta comercial concreta.",
    caution: "Hay que confirmar inventario real, etapa comercial y qué tan visible está el precio base.",
  },
  {
    zone: "Aldea Zama",
    fit: "Para quien prioriza una zona muy reconocida y acepta un entorno con mucha oferta para comparar.",
    caution: "El comprador suele necesitar más filtro porque abundan opciones y no todas aterrizan igual en ticket o producto.",
  },
  {
    zone: "La Veleta",
    fit: "Para quien busca variedad de producto y tolera más dispersión en ubicación, narrativa y consistencia comercial.",
    caution: "La comparación requiere revisar con más cuidado acceso, densidad de oferta y claridad del desarrollo.",
  },
];

const buyingQuestions = [
  "¿Cuánto quieres poner de entrada y cuánto margen tienes si cambia el inventario?",
  "¿Estás comprando para inversión, segunda residencia o una mezcla de ambas?",
  "¿Prefieres una ubicación con búsqueda más conocida o una entrada comercial más controlada?",
];

const faqItems = [
  {
    question: "¿Qué conviene comparar primero entre Región 11, Aldea Zama y La Veleta?",
    answer:
      "Conviene empezar por ticket de entrada, tipo de producto, claridad del inventario y el siguiente paso comercial real. Una zona bonita sin precio publicable ni seguimiento útil hace perder tiempo.",
  },
  {
    question: "¿Yaax Tulum Condos está en Región 11?",
    answer:
      "Sí. Yaax se comercializa en Región 11 y esta guía lo usa como referencia para compradores que comparan ubicación con intención real de compra, no solo por curiosidad.",
  },
  {
    question: "¿Desde cuánto se puede entrar a Yaax dentro de esta comparativa?",
    answer:
      "El precio base se toma del inventario publicado de Yaax. La disponibilidad, promociones y plan de pago se confirman al momento de pedir información actualizada.",
  },
  {
    question: "¿Cómo pido precios y disponibilidad después de comparar zonas?",
    answer:
      "Se puede pedir por WhatsApp o formulario para recibir inventario vigente, rango de precios y una recomendación comercial según presupuesto y uso esperado.",
  },
];

export default async function YaaxZoneComparisonPage() {
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
    "Hola, quiero comparar precios y disponibilidad de Yaax Tulum Condos en Región 11 frente a otras zonas de Tulum.",
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              item.question === "¿Desde cuánto se puede entrar a Yaax dentro de esta comparativa?"
                ? priceMin
                  ? `Hoy el inventario publicado de Yaax inicia desde ${formatCurrency(priceMin, "MXN")}. La disponibilidad, promociones y plan de pago se confirman al momento de pedir información actualizada.`
                  : item.answer
                : item.answer,
          },
        })),
      },
      {
        "@type": "OfferCatalog",
        name: "Yaax Tulum Condos en Región 11",
        description:
          "Inventario publicado de Yaax Tulum Condos usado como referencia comercial dentro de una comparativa de preventa en Tulum.",
        itemListElement: unitTypeCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${card.unitType} en Yaax Tulum Condos`,
            description: `${card.propertyCount} unidades publicadas para comparar dentro de Yaax.`,
            priceCurrency: "MXN",
            url: card.propertyHref,
          },
        })),
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">Preventa Tulum · Comparativa de zonas</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Región 11 vs Aldea Zama vs La Veleta: cómo comparar preventa en Tulum sin comprar puro humo.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#eadfce]/88">
              Quien busca precio de entrada en Tulum normalmente acaba comparando ubicación, narrativa y claridad comercial al
              mismo tiempo. Esta página usa a Yaax Tulum Condos en Región 11 como referencia concreta para bajar la comparación
              a inventario publicado, tipologías y siguiente paso real.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Yaax desde</p>
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
                eventName="yaax_zone_compare_whatsapp_click"
                label="hero"
                page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir comparativa y precios
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Recibir inventario
              </a>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/region-11-tulum"
                eventName="yaax_zone_compare_internal_navigation"
                label="region-11"
                page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver Región 11
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
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Qué se está comparando</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">La zona importa, pero lo que cierra la venta es la claridad comercial.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              Región 11, Aldea Zama y La Veleta aparecen una y otra vez en búsquedas de preventa. La diferencia práctica no es
              solo el nombre de la zona, sino cuánto te ayuda cada opción a entender ticket de entrada, tipo de producto y
              siguiente paso para avanzar sin perder semanas.
            </p>

            <div className="mt-6 space-y-3">
              {buyingQuestions.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#dccab4] bg-white/70 px-4 py-3 text-sm text-[#3b2a1e]">
                  <CheckCircle2 className="h-4 w-4 text-[#9d7a56]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {comparisonCards.map((item) => (
              <article key={item.zone} className="rounded-[1.5rem] border border-[#d8c6b1] bg-white/75 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c6846]">{item.zone}</p>
                <h3 className="mt-3 font-serif text-3xl text-[#241811]">Qué suele atraer</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">{item.fit}</p>
                <div className="mt-5 rounded-[1.2rem] border border-dashed border-[#cfb89d] bg-[#f7efe2] p-4 text-sm leading-7 text-[#5f4835]">
                  <p className="font-medium text-[#241811]">Qué revisar antes de decidir</p>
                  <p className="mt-2">{item.caution}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Referencia útil</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">Cómo entra Yaax en una comparación seria de precio y ubicación.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Aquí no maquillamos el análisis con tickets inventados para otras zonas. Mostramos inventario real de Yaax para que
              el lead tenga un punto de partida concreto antes de pedir comparativa personalizada.
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
                    eventName="yaax_zone_compare_whatsapp_click"
                    label={card.unitType.toLowerCase()}
                    page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                  >
                    Pedir comparativa
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
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Ruta comercial</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Después de comparar zonas, el lead necesita una página más específica.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Si la prioridad es ubicación, conviene abrir la landing de Región 11. Si la prioridad ya es inventario, conviene
              pasar a la landing general o a la Fase 1 para acelerar la decisión.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#d8c6b1] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c6846]">Siguientes páginas</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[#5f4835]">
              <div className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Región 11 responde la comparación por zona con más foco en ubicación y contexto de compra.</p>
              </div>
              <div className="flex gap-3">
                <Building2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>La landing general aterriza tipologías, metrajes y precio de entrada del proyecto completo.</p>
              </div>
              <div className="flex gap-3">
                <PhoneCall className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Fase 1 sirve mejor cuando el lead ya está pidiendo inventario inicial y plan de pago.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/region-11-tulum"
                eventName="yaax_zone_compare_internal_navigation"
                label="region-11-bottom"
                page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
              >
                Ver landing Región 11
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos"
                eventName="yaax_zone_compare_internal_navigation"
                label="landing-general"
                page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Ver landing general
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_zone_compare_internal_navigation"
                label="fase-1"
                page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Ver Fase 1
              </TrackedInternalLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Preguntas frecuentes</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">FAQ para quien compara preventa por zona y precio.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Esta capa ayuda a capturar búsquedas más directas y a resolver objeciones antes de que el lead se vaya a otro tab.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[1.6rem] border border-[#d8c6b1] bg-[#fffaf4] p-6">
                <h3 className="font-serif text-2xl text-[#241811]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">
                  {item.question === "¿Desde cuánto se puede entrar a Yaax dentro de esta comparativa?" && priceMin
                    ? `Hoy el inventario publicado de Yaax inicia desde ${formatCurrency(priceMin, "MXN")}. La disponibilidad, promociones y plan de pago se confirman al momento de pedir información actualizada.`
                    : item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-[#221710] text-[#f8efe2]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d0b188]">Captura de lead</p>
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide una comparativa útil con precios y disponibilidad de Yaax.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              El objetivo no es mandarte un brochure genérico. Es responder con inventario vigente, punto de entrada y la ruta
              comercial que haga más sentido para tu presupuesto.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_zone_compare_whatsapp_click"
                label="contacto"
                page="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
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
            interest="Quiero comparar precios y disponibilidad de Yaax Tulum Condos frente a otras zonas de Tulum"
            submitLabel="Recibir comparativa"
            preferredContactLabel="Canal para recibir la comparativa"
            preferredContactPlaceholder="WhatsApp, llamada o email para enviar precios y disponibilidad"
            messageLabel="Cuéntanos qué zona, tipología o rango quieres comparar"
            messagePlaceholder="Ejemplo: quiero comparar Región 11 vs Aldea Zamá para 2 recámaras, presupuesto y plan de pago vigente."
            formIntro="Comparte zona de referencia, presupuesto y tipología para responder con una comparativa más útil de precio, inventario activo y siguiente paso comercial."
            analyticsPage="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
          />
        </div>
      </section>
    </main>
  );
}
