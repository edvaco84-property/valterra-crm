import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CalendarClock, CheckCircle2, Landmark, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedAnchor, TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Plan de pago preventa Tulum | Yaax Tulum Condos",
  description:
    "Consulta cómo evaluar un plan de pago en preventa en Tulum con inventario real, ticket de entrada y tipologías activas. Yaax Tulum Condos en Región 11 ofrece una ruta directa para pedir esquema vigente.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum",
  },
  openGraph: {
    title: "Plan de pago preventa Tulum | Yaax Tulum Condos",
    description:
      "Landing comercial para compradores que buscan plan de pago, precio de entrada e inventario real dentro de la preventa de Yaax Tulum Condos.",
    url: "/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum",
    images: [
      {
        url: "/uploads/properties/yaax/Render 1.JPEG",
        alt: "Plan de pago de Yaax Tulum Condos en Tulum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan de pago preventa Tulum | Yaax Tulum Condos",
    description:
      "Qué pedir para revisar un plan de pago en preventa en Tulum con precio base, tipologías y contacto comercial directo.",
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
  "/uploads/properties/yaax/PHOTO-2025-02-06-17-36-31.JPEG",
];

const planReviewCards = [
  {
    icon: Landmark,
    title: "Ticket antes que promesa",
    copy: "El punto de partida útil es saber desde cuánto puedes entrar hoy y qué tipologías siguen activas, no escuchar un plan de pago sin contexto.",
  },
  {
    icon: CalendarClock,
    title: "Calendario comercial vigente",
    copy: "Un esquema cambia valor cuando se conecta con apartado, etapa comercial y ritmo de pago verificable en este momento.",
  },
  {
    icon: Building2,
    title: "Producto correcto",
    copy: "No compra igual quien entra por studio, 2 recámaras o penthouse. El mensaje comercial debe aterrizarse a la unidad correcta.",
  },
];

const buyingQuestions = [
  "¿Qué tipología te interesa hoy: studio, 2 recámaras, 3 recámaras lock-off o penthouse?",
  "¿Qué rango de entrada y ritmo de pago te resulta razonable para avanzar sin tensar presupuesto?",
  "¿Buscas inversión, segunda residencia o una compra patrimonial con uso mixto?",
];

const faqItems = [
  {
    question: "¿Qué conviene pedir primero sobre un plan de pago en preventa en Tulum?",
    answer:
      "Lo más útil es pedir inventario vigente, precio actualizado por tipología, monto de apartado y calendario comercial activo. Así comparas opciones reales en vez de una promesa abstracta.",
  },
  {
    question: "¿Desde cuánto inicia Yaax Tulum Condos?",
    answer:
      "La referencia publicada parte del inventario activo mostrado en esta página. El precio final depende de la tipología disponible y de las condiciones vigentes al momento de consultar.",
  },
  {
    question: "¿Por qué importa ligar plan de pago con inventario real?",
    answer:
      "Porque un esquema comercial solo sirve cuando sabes qué unidades siguen activas, qué ticket tienen y cuál encaja con tu objetivo de compra.",
  },
  {
    question: "¿Cómo se solicita el esquema vigente de Yaax?",
    answer:
      "Puedes pedirlo por WhatsApp o formulario para recibir inventario activo, precios actualizados y el siguiente paso comercial con más claridad.",
  },
];

export default async function YaaxPaymentPlanPage() {
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
    "Hola, quiero inventario, precios actualizados y plan de pago vigente de Yaax Tulum Condos.",
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
              item.question === "¿Desde cuánto inicia Yaax Tulum Condos?" && priceMin
                ? `Hoy la referencia publicada de Yaax Tulum Condos inicia desde ${formatCurrency(priceMin, "MXN")}. El precio final depende de la tipología disponible y de las condiciones vigentes al momento de consultar.`
                : item.answer,
          },
        })),
      },
      {
        "@type": "OfferCatalog",
        name: "Tipologías de Yaax para revisar plan de pago en Tulum",
        description:
          "Inventario publicado de Yaax Tulum Condos usado para responder búsquedas de plan de pago en preventa en Tulum con precio de entrada y tipologías activas.",
        itemListElement: unitTypeCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${card.unitType} en Yaax Tulum Condos`,
            description: `${card.propertyCount} unidades publicadas para revisar ticket de entrada y esquema comercial.`,
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">Plan de pago preventa Tulum · Yaax</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Un plan de pago en preventa en Tulum sirve mejor cuando lo aterrizas a inventario real, ticket de entrada y tipología.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#eadfce]/88">
              Esta landing responde una intención transaccional clara. Yaax Tulum Condos baja esa búsqueda a precio base
              publicado, tipologías activas en Región 11 y una ruta directa para pedir esquema vigente sin quedarse en una
              conversación genérica.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Desde</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{priceMin ? formatCurrency(priceMin, "MXN") : "Solicitar"}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Rango publicado</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{priceMax ? formatCurrency(priceMax, "MXN") : "Consultar"}</p>
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
                eventName="yaax_payment_plan_whatsapp_click"
                label="hero"
                page="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir plan de pago
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Recibir esquema vigente
              </a>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_payment_plan_internal_navigation"
                label="fase-1"
                page="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver Fase 1
                <ArrowRight className="h-4 w-4" />
              </TrackedInternalLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#dcc7ab]/78">
              <span>Región 11, Tulum</span>
              <span>Inventario activo</span>
              <span>Consulta comercial más calificada</span>
            </div>
          </div>

          <aside className="relative z-10 grid gap-4 sm:grid-cols-2">
            {galleryImages.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className={`overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] ${
                  index === 0 ? "sm:col-span-2 sm:min-h-[280px]" : "min-h-[190px]"
                }`}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.2)), url('${imageUrl}')`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
            ))}
          </aside>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Qué sí revisar</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">
              Antes de apartar, conviene validar qué unidades siguen activas, cuál es el ticket real y qué condiciones están vigentes hoy.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Esta intención suele venir más abajo en el embudo. No pide inspiración; pide claridad. Por eso la página enfoca la conversación
              en inventario, precio, timing y esquema comercial verificable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {planReviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className="rounded-[1.7rem] border border-[#d8c6b1] bg-[#fffaf4] p-5 shadow-[0_16px_36px_rgba(36,24,17,0.06)]">
                  <Icon className="h-6 w-6 text-[#9d7a56]" />
                  <h3 className="mt-4 font-serif text-2xl text-[#241811]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f4835]">{card.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.98fr_1.02fr] lg:px-10">
          <div className="rounded-[2rem] border border-[#d8c6b1] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c6846]">Preguntas correctas</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">La conversación mejora cuando el lead pide el esquema con más contexto.</h2>
            <div className="mt-6 space-y-4">
              {buyingQuestions.map((question) => (
                <div key={question} className="flex gap-3 rounded-[1.4rem] border border-[#e0d0bc] bg-[#f7f1e8] px-4 py-4 text-sm leading-7 text-[#5f4835]">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#9d7a56]" />
                  <p>{question}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Tipologías para abrir la conversación</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">No todos los planes de pago sirven para el mismo comprador.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              La intención de búsqueda mejora cuando se conecta con una unidad real. Estas referencias ayudan a filtrar presupuesto,
              rango de entrada y tipo de seguimiento que más conviene.
            </p>

            <div className="mt-6 grid gap-4">
              {unitTypeCards.map((card) => (
                <article key={card.unitType} className="rounded-[1.6rem] border border-[#d8c6b1] bg-[#fffaf4] p-5 shadow-[0_12px_28px_rgba(36,24,17,0.06)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c6846]">
                        {card.propertyCount} {card.propertyCount === 1 ? "unidad publicada" : "unidades publicadas"}
                      </p>
                      <h3 className="mt-2 font-serif text-3xl text-[#241811]">{card.unitType}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[#5f4835]">
                      <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">Desde {card.priceLabel}</span>
                      {card.areaLabel ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.areaLabel}</span> : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
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
                      eventName="yaax_payment_plan_whatsapp_click"
                      label={card.unitType.toLowerCase()}
                      page="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                    >
                      Pedir esquema vigente
                    </TrackedAnchor>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f3e8d9]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Cómo usar esta intención</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">La página convierte mejor si responde con precio, inventario y siguiente paso en el primer contacto.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              El activo no promete condiciones específicas que puedan cambiar. Se enfoca en captar la búsqueda, ordenar la conversación
              y llevarla a una respuesta comercial más útil desde el CRM.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Precio de entrada visible",
                copy: priceMin
                  ? `La conversación ya parte desde ${formatCurrency(priceMin, "MXN")} en vez de arrancar ciega.`
                  : "La entrada se confirma con inventario vigente antes de proponer un esquema.",
              },
              {
                title: "Esquema con contexto",
                copy: "El CTA no pide solo “informes”; pide plan de pago, disponibilidad y precios actualizados.",
              },
              {
                title: "Ruta comercial clara",
                copy: "WhatsApp y formulario aterrizan la intención en una consulta que el equipo puede responder con más precisión.",
              },
              {
                title: "Menos humo, más filtro",
                copy: "Se evita vender urgencia artificial y se prioriza lo verificable: tipología, ticket, timing y etapa comercial.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-[#d7c2a8] bg-[#fffaf4] p-5 shadow-[0_12px_24px_rgba(36,24,17,0.06)]">
                <h3 className="font-serif text-2xl text-[#241811]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Preguntas frecuentes</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">FAQ para quien busca plan de pago en preventa en Tulum.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Este bloque responde objeciones comunes antes de pasar al contacto y ayuda a capturar tráfico más cerca de conversión.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[1.6rem] border border-[#d8c6b1] bg-[#fffaf4] p-6">
                <h3 className="font-serif text-2xl text-[#241811]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">
                  {item.question === "¿Desde cuánto inicia Yaax Tulum Condos?" && priceMin
                    ? `Hoy la referencia publicada inicia desde ${formatCurrency(priceMin, "MXN")}. El precio final depende de la tipología disponible y de las condiciones vigentes al momento de consultar.`
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
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide el esquema vigente con inventario y precios actualizados.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              El objetivo es que el lead entre al CRM con mejor contexto: presupuesto, tipología, timing y tipo de compra. Así la respuesta puede ser más útil y más cercana al cierre.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_payment_plan_whatsapp_click"
                label="contacto"
                page="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp directo
              </TrackedAnchor>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                eventName="yaax_payment_plan_internal_navigation"
                label="comprar-propiedad"
                page="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver compra en Tulum
              </TrackedInternalLink>
            </div>
          </div>

          <ContactForm
            market="RIVIERA_MAYA"
            interest="Quiero inventario, precios actualizados y plan de pago vigente de Yaax Tulum Condos"
            submitLabel="Recibir esquema vigente"
            preferredContactLabel="Canal para recibir el esquema"
            preferredContactPlaceholder="WhatsApp, llamada o email para compartir inventario y plan de pago"
            messageLabel="Cuéntanos presupuesto, tipología o timing que quieres revisar"
            messagePlaceholder="Ejemplo: quiero plan de pago vigente para studio o 2 recámaras, con entrada aproximada y disponibilidad actual."
            formIntro="Comparte presupuesto, tipología y objetivo de compra para responder con inventario activo, precios actuales y el esquema comercial vigente."
            analyticsPage="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
          />
        </div>
      </section>
    </main>
  );
}
