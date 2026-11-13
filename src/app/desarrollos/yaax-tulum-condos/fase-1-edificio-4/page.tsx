import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedAnchor, TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Yaax Tulum Condos | Fase 1",
  description:
    "Landing comercial de la Fase 1 de Yaax Tulum Condos con studios, 2 recamaras y penthouses desde MXN 2.49M en Region 11, Tulum.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4",
  },
  openGraph: {
    title: "Yaax Tulum Condos | Fase 1",
    description:
      "Studios, 2 recámaras y penthouses desde MXN 2.49M en la Fase 1 de Yaax Tulum Condos, Región 11, Tulum.",
    url: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4",
    images: [
      {
        url: "/uploads/properties/yaax/Render 1.JPEG",
        alt: "Yaax Tulum Condos Fase 1",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaax Tulum Condos | Fase 1",
    description:
      "Studios, 2 recámaras y penthouses desde MXN 2.49M en la Fase 1 de Yaax Tulum Condos, Región 11, Tulum.",
    images: ["/uploads/properties/yaax/Render 1.JPEG"],
  },
};

function buildWhatsappHref(message: string) {
  return `https://wa.me/529984635201?text=${encodeURIComponent(message)}`;
}

const whatsappHref = buildWhatsappHref(
  "Hola, quiero información, inventario y precios de la Fase 1 de Yaax Tulum Condos.",
);

const galleryImages = [
  "/uploads/properties/yaax/Render 1.JPEG",
  "/uploads/properties/yaax/Perspectiva 1.PNG",
  "/uploads/properties/yaax/Studio.jpg",
  "/uploads/properties/yaax/Pent House.JPEG",
];

const amenityList = [
  "Alberca",
  "Fire pit",
  "Gimnasio",
  "Área social",
  "Lockers",
  "Estacionamiento",
  "Seguridad 24/7",
  "Elevador",
];

const faqItems = [
  {
    question: "¿Desde cuánto cuesta entrar a la Fase 1 de Yaax Tulum Condos?",
    answer:
      "El inventario publicado de la Fase 1 arranca desde el precio base mostrado en esta página. El monto exacto, promociones y forma de pago vigente se confirman al pedir disponibilidad actualizada.",
  },
  {
    question: "¿Qué tipologías hay publicadas en la Fase 1?",
    answer:
      "La primera etapa comercial muestra studios, unidades de 2 recámaras y penthouses para comparar ticket de entrada, amplitud y perfil de uso dentro de la misma fase.",
  },
  {
    question: "¿La Fase 1 está en Región 11, Tulum?",
    answer:
      "Sí. La Fase 1 de Yaax se comercializa dentro de Región 11, una ubicación buscada por compradores que comparan preventa, segunda residencia e inversión patrimonial en Tulum.",
  },
  {
    question: "¿Cómo se pide inventario, precios y plan de pago actualizados?",
    answer:
      "Se puede pedir por WhatsApp o formulario para recibir disponibilidad vigente, rango actualizado y siguiente paso comercial sin depender de un brochure desactualizado.",
  },
];

function formatRange(min: number, max: number, formatter: (value: number) => string) {
  return min === max ? formatter(min) : `${formatter(min)} - ${formatter(max)}`;
}

export default async function YaaxPhaseOneBuildingFourPage() {
  const properties = await db.property.findMany({
    where: {
      published: true,
      unitCode: {
        startsWith: "B-",
      },
      development: {
        slug: "yaax-tulum-condos",
      },
    },
    include: {
      development: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ price: "asc" }, { areaM2: "asc" }, { unitCode: "asc" }],
  });

  const development = properties[0]?.development;
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
    const imageUrl = firstProperty.images[0]?.url || firstProperty.imageUrl || null;

    return {
      unitType: group.unitType,
      propertyCount: group.properties.length,
      bedrooms: firstProperty.bedrooms,
      bathrooms: firstProperty.bathrooms,
      floorLabel: firstProperty.floorLabel,
      imageUrl,
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

  const decisionCards = [
    {
      title: "Studio",
      fit: "Entrada de ticket desde MXN 2.49M para abrir inversión o uso compacto en Tulum.",
      cta: "Quiero studio",
      href: buildWhatsappHref("Hola, quiero precios y disponibilidad de studios en la Fase 1 de Yaax Tulum Condos."),
      formHref: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4?tipologia=studio#contacto",
    },
    {
      title: "2 recámaras",
      fit: "La opción más sólida de la fase inicial para uso mixto, amplitud y valor percibido.",
      cta: "Quiero 2 recámaras",
      href: buildWhatsappHref("Hola, quiero precios y disponibilidad de unidades de 2 recámaras en la Fase 1 de Yaax Tulum Condos."),
      formHref: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4?tipologia=2-recamaras#contacto",
    },
    {
      title: "3 recámaras lock-off",
      fit: "Producto familiar o patrimonial con mayor amplitud y una lectura más flexible de uso dentro de la primera etapa.",
      cta: "Quiero 3 rec lock-off",
      href: buildWhatsappHref("Hola, quiero precios y disponibilidad de unidades de 3 recámaras lock-off en la Fase 1 de Yaax Tulum Condos."),
      formHref: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4?tipologia=3-recamaras-lock-off#contacto",
    },
    {
      title: "Penthouse",
      fit: "Producto premium de la Fase 1 para quien busca una unidad más amplia dentro de la primera etapa.",
      cta: "Quiero penthouse",
      href: buildWhatsappHref("Hola, quiero precios y disponibilidad de penthouses en la Fase 1 de Yaax Tulum Condos."),
      formHref: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4?tipologia=penthouse#contacto",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        name: "Yaax Tulum Condos Fase 1",
        description:
          "Inventario inicial de la Fase 1 de Yaax Tulum Condos en Región 11, Tulum, con studios, 2 recámaras, 3 recámaras lock-off y penthouses.",
        itemListElement: unitTypeCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${card.unitType} · Yaax Tulum Condos Fase 1`,
            description: `${card.propertyCount} unidades publicadas en la Fase 1.`,
            priceCurrency: "MXN",
            url: card.propertyHref,
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              item.question === "¿Desde cuánto cuesta entrar a la Fase 1 de Yaax Tulum Condos?"
                ? priceMin
                  ? `El inventario publicado de la Fase 1 inicia desde ${formatCurrency(priceMin, "MXN")}. El monto exacto, promociones y forma de pago vigente se confirman al pedir disponibilidad actualizada.`
                  : item.answer
                : item.answer,
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
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-14">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">Yaax Tulum Condos · Fase 1</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Unidades desde {priceMin ? formatCurrency(priceMin, "MXN") : "precio por confirmar"} en Región 11, Tulum.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#eadfce]/88">
              Studios, 2 recámaras y penthouses dentro de la primera etapa comercial de Yaax. Aquí el lead entiende rápido
              qué hay, desde cuánto entra y cómo pedir inventario sin pasearse por un brochure con complejo de poema.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Desde</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{priceMin ? formatCurrency(priceMin, "MXN") : "Solicitar"}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Tipologías</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{unitTypeCards.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Metraje</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{areaValues.length ? `${areaMin}-${areaMax} m²` : "Consultar"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#dcc7ab]/85">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">Fase 1</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">Inventario inicial</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">Región 11, Tulum</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_phase1_whatsapp_click"
                label="hero"
                page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir inventario
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Pedir plan de pago
              </a>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos"
                eventName="yaax_phase1_internal_navigation"
                label="landing-general"
                page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver landing general
                <ArrowRight className="h-4 w-4" />
              </TrackedInternalLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#dcc7ab]/78">
              <span>Región 11, Tulum</span>
              <span>Fase 1</span>
              <span>{properties.length || 7} unidades publicadas</span>
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

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Decisión rápida</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">¿Qué opción puede hacer más sentido para ti?</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Si el lead se identifica rápido, pregunta más rápido. Qué milagro tan raro: claridad comercial.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {decisionCards.map((card) => (
              <article key={card.title} className="rounded-[1.8rem] border border-[#ccb79f] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c6846]">Fase 1</p>
                <h3 className="mt-2 font-serif text-3xl text-[#241811]">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5f4835]">{card.fit}</p>
                <TrackedInternalLink
                  href={card.formHref}
                  eventName="yaax_phase1_tipology_prefill"
                  label={card.title}
                  page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#241811] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
                >
                  {card.cta}
                </TrackedInternalLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Ruta por ubicación</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">La búsqueda por Región 11 también tiene una landing dedicada.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Si el lead llega primero por ubicación y luego baja al detalle comercial, conviene ofrecer una entrada específica
              para Región 11 que después conecte con esta página de Fase 1.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
              eventName="yaax_phase1_internal_navigation"
              label="comprar-propiedad"
              page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Comprar en Tulum
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/region-11-tulum"
              eventName="yaax_phase1_internal_navigation"
              label="region-11"
              page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              Ver landing Región 11
              <ArrowRight className="h-4 w-4" />
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos"
              eventName="yaax_phase1_internal_navigation"
              label="landing-general-middle"
              page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Ver landing general
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/studios-en-tulum"
              eventName="yaax_phase1_internal_navigation"
              label="studios-middle"
              page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Ver landing studios
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/departamentos-2-recamaras-en-tulum"
              eventName="yaax_phase1_internal_navigation"
              label="2-recamaras-middle"
              page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Ver landing 2 recámaras
            </TrackedInternalLink>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Qué vende esta fase</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Un anzuelo de entrada, un core vendible y un remate premium.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              La Fase 1 está pensada para abrir mercado con una escalera simple: studio para captar, 2 recámaras para
              convertir mejor y penthouse para sostener el tramo aspiracional sin aventar todo el proyecto al ruedo.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Entrada clara",
                copy: priceMin ? `Studios desde ${formatCurrency(priceMin, "MXN")} para abrir conversación comercial sin rodeos.` : "Solicita el ticket de entrada actualizado.",
              },
              {
                title: "Core comercial",
                copy: "Las 2 recámaras son el corazón de esta fase y el mejor punto medio entre uso personal, amplitud y valor percibido.",
              },
              {
                title: "Captura de lead seria",
                copy: "WhatsApp con mensaje precargado y formulario que entra al CRM como Riviera Maya con interés claro en Yaax.",
              },
              {
                title: "Expansión ordenada",
                copy: "Fase 1 valida mercado. La siguiente etapa puede abrirse con aprendizaje real, no con optimismo alucinógeno.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-[#d8c6b1] bg-white/70 p-5">
                <h3 className="font-serif text-2xl text-[#241811]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Inventario inicial</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">Tipologías de la Fase 1 para comparar sin rezarle al render.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Precios y disponibilidad sujetos a actualización. Esta página existe para levantar conversación comercial rápido,
              no para jurar sangre sobre inventario que se mueve.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {unitTypeCards.map((card) => (
              <article key={card.unitType} className="overflow-hidden rounded-[1.8rem] border border-[#ccb79f] bg-[#fffaf4] shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
                <div
                  className="h-52 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.18)), url('${card.imageUrl || "/uploads/properties/yaax/Render 1.JPEG"}')`,
                  }}
                />
                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c6846]">
                      {card.propertyCount} {card.propertyCount === 1 ? "unidad publicada" : "unidades publicadas"}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl text-[#241811]">{card.unitType}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-[#5f4835]">
                    <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">Desde {card.priceLabel}</span>
                    {card.areaLabel ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.areaLabel}</span> : null}
                    {card.bedrooms ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.bedrooms} recámaras</span> : null}
                    {card.bathrooms ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.bathrooms} baños</span> : null}
                    {card.floorLabel ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.floorLabel}</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={card.propertyHref}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#241811] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
                    >
                      Ver ejemplo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <TrackedAnchor
                      href={buildWhatsappHref(`Hola, quiero inventario, precios y disponibilidad de ${card.unitType} en la Fase 1 de Yaax Tulum Condos.`)}
                      target="_blank"
                      rel="noreferrer"
                      eventName="yaax_phase1_inventory_whatsapp_click"
                      label={card.unitType}
                      page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                    >
                      Pedir inventario
                    </TrackedAnchor>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <TrackedAnchor
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              eventName="yaax_phase1_whatsapp_click"
              label="inventory-section"
              page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              <MessageCircle className="h-4 w-4" />
              Quiero precios y disponibilidad
            </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Solicitar plan de pago
              </a>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">FAQ comercial</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Preguntas que frenan la compra antes de escribir.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              Este bloque responde las objeciones típicas de una búsqueda con intención real de compra: precio base,
              tipologías, ubicación y cómo pedir inventario activo de la Fase 1 sin perder tiempo.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[1.6rem] border border-[#d6c2aa] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.06)]">
                <h3 className="font-serif text-2xl text-[#241811]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">
                  {item.question === "¿Desde cuánto cuesta entrar a la Fase 1 de Yaax Tulum Condos?" && priceMin
                    ? `El inventario publicado de la Fase 1 inicia desde ${formatCurrency(priceMin, "MXN")}. El monto exacto, promociones y forma de pago vigente se confirman al pedir disponibilidad actualizada.`
                    : item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_phase1_whatsapp_click"
                label="faq"
                page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir inventario actualizado
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Solicitar precios y plan
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Amenidades y ubicación</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">El discurso wellness sí sirve, si no lo dejamos manejar solo.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Yaax sigue siendo un desarrollo boutique en Región 11 con narrativa residencial y de bienestar. Lo importante es
              conectarlo con algo accionable: ticket de entrada, tipología clara y siguiente paso comercial.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {amenityList.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#dccab4] bg-white/70 px-4 py-3 text-sm text-[#3b2a1e]">
                  <CheckCircle2 className="h-4 w-4 text-[#9d7a56]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d8c6b1] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c6846]">Checklist de cierre</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[#5f4835]">
              <div className="flex gap-3">
                <Building2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Presentar esta página como inventario inicial de Fase 1, no como catálogo completo del desarrollo.</p>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Usar Región 11, Tulum como ancla de ubicación y responder con mapa, brochure e inventario cuando el lead caliente.</p>
              </div>
              <div className="flex gap-3">
                <PhoneCall className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Prometer solo lo verificable: precio base, tipología, siguiente paso y confirmación puntual antes de reservar.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#cfb89d] bg-[#f7efe2] p-5 text-sm leading-7 text-[#5f4835]">
              <p className="font-medium text-[#241811]">Primera etapa comercial</p>
              <p className="mt-2">
                La Fase 1 concentra el inventario inicial de Yaax y funciona como la primera salida comercial del proyecto.
                {priceMin && priceMax
                  ? ` Hoy el rango publicado va de ${formatCurrency(priceMin, "MXN")} a ${formatCurrency(priceMax, "MXN")}.`
                  : " Solicita el rango actualizado de la Fase 1 para revisar opciones vigentes."}{" "}
                {development?.summary || "La disponibilidad y condiciones deben confirmarse al momento de atender al lead."}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_phase1_whatsapp_click"
                label="checklist"
                page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
              >
                <MessageCircle className="h-4 w-4" />
                Solicitar inventario
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Recibir precios
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-[#221710] text-[#f8efe2]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d0b188]">Captura de lead</p>
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide inventario, precios y siguiente paso de la Fase 1.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              Este formulario ya entra al CRM como lead de Riviera Maya. Nada de recibir prospectos y luego perderlos en la cueva administrativa.
            </p>

            <div className="mt-6 grid gap-3 text-sm leading-7 text-[#eadfce]/84">
              <p>Recibe una respuesta más útil si compartes esto desde el inicio:</p>
              <ul className="grid gap-2 text-[#f3e7d6]">
                <li>Presupuesto aproximado</li>
                <li>Uso: inversión, personal o mixto</li>
                <li>Horizonte de compra</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_phase1_whatsapp_click"
                label="contact-section"
                page="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
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
            interest="Quiero precios y disponibilidad de la Fase 1 de Yaax Tulum Condos"
            submitLabel="Recibir inventario y plan de Fase 1"
            preferredContactLabel="Canal para recibir inventario de Fase 1"
            preferredContactPlaceholder="WhatsApp, llamada o email para enviar disponibilidad actualizada"
            messageLabel="Cuéntanos qué tipología o rango quieres revisar en Fase 1"
            messagePlaceholder="Ejemplo: studio de entrada, 2 recámaras disponibles, penthouse o plan de pago vigente de Fase 1."
            formIntro="Comparte tipología, presupuesto y momento de compra para responder con inventario inicial, precios vigentes y condiciones comerciales reales de Fase 1."
            analyticsPage="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
          />
        </div>
      </section>
    </main>
  );
}
