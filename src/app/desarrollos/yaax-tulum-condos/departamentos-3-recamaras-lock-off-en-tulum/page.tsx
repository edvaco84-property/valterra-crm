import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, MapPin, MessageCircle, Trees } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedAnchor, TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Departamentos de 3 recámaras lock-off en Tulum | Yaax Tulum Condos",
  description:
    "Departamentos de 3 recámaras lock-off en Tulum dentro de Yaax Tulum Condos, en Región 11. Revisa precio publicado, metraje y una ruta directa para pedir disponibilidad y plan de pago.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum",
  },
  openGraph: {
    title: "Departamentos de 3 recámaras lock-off en Tulum | Yaax Tulum Condos",
    description:
      "Landing para búsquedas de departamentos de 3 recámaras lock-off en Tulum con inventario publicado, precio base visible y CTA directo a WhatsApp o formulario.",
    url: "/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum",
    images: [
      {
        url: "/uploads/properties/yaax/3 Bedrooms.JPEG",
        alt: "Departamento de 3 recámaras lock-off en Yaax Tulum Condos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Departamentos de 3 recámaras lock-off en Tulum | Yaax Tulum Condos",
    description:
      "Unidades lock-off de 3 recámaras en Región 11, Tulum, con precio publicado, metraje y contacto directo para recibir disponibilidad actualizada.",
    images: ["/uploads/properties/yaax/3 Bedrooms.JPEG"],
  },
};

function buildWhatsappHref(message: string) {
  return `https://wa.me/529984635201?text=${encodeURIComponent(message)}`;
}

function formatRange(min: number, max: number, formatter: (value: number) => string) {
  return min === max ? formatter(min) : `${formatter(min)} - ${formatter(max)}`;
}

const galleryImages = [
  "/uploads/properties/yaax/3 Bedrooms.JPEG",
  "/uploads/properties/yaax/Render 1.JPEG",
  "/uploads/properties/yaax/Perspectiva 1.PNG",
];

const valueCards = [
  {
    icon: Building2,
    title: "Producto de ticket alto",
    copy: "La búsqueda de 3 recámaras lock-off suele venir con intención más calificada: familia, uso mixto o compra patrimonial con más claridad de presupuesto.",
  },
  {
    icon: Trees,
    title: "Formato versátil",
    copy: "El lock-off abre conversación útil sobre flexibilidad de uso, visitas prolongadas y operación más adaptable que una tipología tradicional.",
  },
  {
    icon: MapPin,
    title: "Región 11 con contexto",
    copy: "La landing aterriza ubicación, metraje y producto real para que el lead pida disponibilidad con preguntas comerciales mejores.",
  },
];

const faqItems = [
  {
    question: "¿Desde cuánto cuestan los departamentos de 3 recámaras lock-off en Yaax Tulum Condos?",
    answer:
      "El precio base se toma del inventario publicado. La cifra exacta, promociones vigentes y forma de pago se confirman al pedir disponibilidad actualizada.",
  },
  {
    question: "¿Qué metraje tienen las unidades de 3 recámaras lock-off en Yaax?",
    answer:
      "El metraje varía por unidad. Esta página muestra el rango publicado para ayudar a comparar amplitud real antes de pedir inventario vigente.",
  },
  {
    question: "¿Qué ventaja comercial tiene una unidad lock-off en Tulum?",
    answer:
      "Normalmente interesa por su flexibilidad de uso: puede funcionar mejor para familia, estancias largas o una lectura más fina del potencial de ocupación según el perfil del comprador.",
  },
  {
    question: "¿Qué conviene pedir primero antes de apartar una unidad de 3 recámaras lock-off?",
    answer:
      "Conviene pedir inventario activo, precio vigente, metraje disponible, distribución real y plan de pago para comparar opciones antes de avanzar.",
  },
];

export default async function YaaxThreeBedroomLockOffPage() {
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

  const lockOffProperties = properties.filter((property) => {
    const unitType = (property.unitType || "").toLowerCase();
    return property.bedrooms === 3 && unitType.includes("lock");
  });
  const unitCount = lockOffProperties.length;
  const priceValues = lockOffProperties.map((property) => property.price);
  const areaValues = lockOffProperties
    .map((property) => property.areaM2)
    .filter((value): value is number => typeof value === "number");
  const priceMin = priceValues.length ? Math.min(...priceValues) : 0;
  const priceMax = priceValues.length ? Math.max(...priceValues) : 0;
  const areaMin = areaValues.length ? Math.min(...areaValues) : 0;
  const areaMax = areaValues.length ? Math.max(...areaValues) : 0;

  const whatsappHref = buildWhatsappHref(
    "Hola, quiero precios, disponibilidad y plan de pago de los departamentos de 3 recámaras lock-off de Yaax Tulum Condos.",
  );

  const unitCards = lockOffProperties.map((property) => ({
    id: property.id,
    title: property.unitCode ? `3 recámaras lock-off ${property.unitCode}` : property.unitType || "3 recámaras lock-off",
    priceLabel: formatCurrency(property.price, property.currency),
    areaLabel: property.areaM2 ? `${property.areaM2} m²` : null,
    bathrooms: property.bathrooms,
    floorLabel: property.floorLabel,
    imageUrl: property.images[0]?.url || property.imageUrl || "/uploads/properties/yaax/3 Bedrooms.JPEG",
    href: `/propiedades/${property.id}`,
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        name: "Departamentos de 3 recámaras lock-off en Yaax Tulum Condos",
        description:
          "Unidades publicadas de 3 recámaras lock-off dentro de Yaax Tulum Condos en Región 11, Tulum, usadas como referencia comercial para búsquedas con intención de compra.",
        itemListElement: unitCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: card.title,
            priceCurrency: "MXN",
            url: card.href,
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
              item.question === "¿Desde cuánto cuestan los departamentos de 3 recámaras lock-off en Yaax Tulum Condos?" && priceMin
                ? `Hoy el inventario publicado de 3 recámaras lock-off inicia desde ${formatCurrency(priceMin, "MXN")}. La cifra exacta, promociones vigentes y forma de pago se confirman al pedir disponibilidad actualizada.`
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
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-14">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">3 recámaras lock-off en Tulum · Yaax</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Departamentos de 3 recámaras lock-off en Tulum desde {priceMin ? formatCurrency(priceMin, "MXN") : "precio por confirmar"} dentro de Yaax Tulum Condos.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#eadfce]/88">
              Esta landing responde una búsqueda de ticket alto con intención más seria. Yaax aterriza esa consulta en Región 11,
              inventario publicado, metraje real y una salida directa para pedir disponibilidad, precios vigentes y plan de pago.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Desde</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{priceMin ? formatCurrency(priceMin, "MXN") : "Solicitar"}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9aa7f]">Unidades publicadas</p>
                <p className="mt-2 font-serif text-2xl text-[#fff6ea]">{unitCount || "Consultar"}</p>
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
                eventName="yaax_3rec_lockoff_whatsapp_click"
                label="hero"
                page="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir 3 rec lock-off disponibles
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Recibir precios
              </a>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_3rec_lockoff_internal_navigation"
                label="fase-1"
                page="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver Fase 1
                <ArrowRight className="h-4 w-4" />
              </TrackedInternalLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#dcc7ab]/78">
              <span>Región 11, Tulum</span>
              <span>Uso flexible</span>
              <span>{unitCount || 0} unidades publicadas</span>
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
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Por qué esta búsqueda sí convierte</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">El lead de 3 recámaras lock-off suele llegar con necesidad más definida y menos margen para copy genérico.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              Cuando alguien busca 3 recámaras lock-off en Tulum normalmente ya está filtrando por amplitud, distribución y una lectura más clara de uso final.
              Esta página conecta esa intención con inventario publicado y una salida rápida a WhatsApp o formulario.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {valueCards.map((item) => {
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
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">Unidades de 3 recámaras lock-off para comparar rápido.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Precios y disponibilidad sujetos a actualización. La idea es ayudar al lead a entrar con contexto real, no con una promesa vacía.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {unitCards.map((card) => (
              <article key={card.id} className="overflow-hidden rounded-[1.8rem] border border-[#ccb79f] bg-[#fffaf4] shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
                <div
                  className="h-52 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.18)), url('${card.imageUrl}')`,
                  }}
                />
                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#8c6846]">3 recámaras lock-off publicadas</p>
                    <h3 className="mt-2 font-serif text-3xl text-[#241811]">{card.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-[#5f4835]">
                    <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.priceLabel}</span>
                    {card.areaLabel ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.areaLabel}</span> : null}
                    {card.bathrooms ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.bathrooms} baños</span> : null}
                    {card.floorLabel ? <span className="rounded-full border border-[#d6c2aa] px-3 py-1.5">{card.floorLabel}</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={card.href}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#241811] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
                    >
                      Ver ficha
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <TrackedAnchor
                      href={buildWhatsappHref(`Hola, quiero precio, disponibilidad y plan de pago de la unidad ${card.title} en Yaax Tulum Condos.`)}
                      target="_blank"
                      rel="noreferrer"
                      eventName="yaax_3rec_lockoff_inventory_whatsapp_click"
                      label={card.title}
                      page="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                    >
                      Pedir disponibilidad
                    </TrackedAnchor>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.7rem] border border-dashed border-[#cfb89d] bg-[#f7efe2] p-6 text-sm leading-7 text-[#5f4835]">
            <p className="font-medium text-[#241811]">Lectura comercial de 3 recámaras lock-off</p>
            <p className="mt-2">
              {priceMin && priceMax
                ? `Hoy el rango publicado de 3 recámaras lock-off va de ${formatRange(priceMin, priceMax, (value) => formatCurrency(value, "MXN"))}.`
                : "Solicita el rango actualizado de 3 recámaras lock-off para validar inventario vigente."}{" "}
              Es una buena ruta para leads que ya comparan distribución, metraje amplio y una compra de ticket más alto dentro de Yaax.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Siguiente paso interno</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Si el lead sigue comparando, puede moverse entre amplitud familiar y perfil premium sin salir del embudo.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Desde aquí conviene abrir la landing de 2 recámaras para bajar ticket o la de penthouses para comparar una opción premium más vertical.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/departamentos-2-recamaras-en-tulum"
              eventName="yaax_3rec_lockoff_internal_navigation"
              label="2-recamaras"
              page="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              Comparar con 2 recámaras
              <ArrowRight className="h-4 w-4" />
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/penthouses-en-tulum"
              eventName="yaax_3rec_lockoff_internal_navigation"
              label="penthouses"
              page="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Comparar con penthouses
            </TrackedInternalLink>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">FAQ comercial</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Preguntas que frenan a un lead antes de pedir disponibilidad.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              Este bloque responde objeciones comunes de una búsqueda concreta: precio base, metraje, formato lock-off y la forma más útil de pedir inventario y plan de pago.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[1.6rem] border border-[#d6c2aa] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.06)]">
                <h3 className="font-serif text-2xl text-[#241811]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">
                  {item.question === "¿Desde cuánto cuestan los departamentos de 3 recámaras lock-off en Yaax Tulum Condos?" && priceMin
                    ? `Hoy el inventario publicado de 3 recámaras lock-off inicia desde ${formatCurrency(priceMin, "MXN")}. La cifra exacta, promociones vigentes y forma de pago se confirman al pedir disponibilidad actualizada.`
                    : item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-[2rem] border border-[#d8c6b1] bg-[#fffaf4] p-6 shadow-[0_18px_40px_rgba(36,24,17,0.08)] lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c6846]">Checklist de seguimiento</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3 rounded-[1.4rem] border border-[#e1cfbb] bg-[#f9f3ea] p-4 text-sm leading-7 text-[#5f4835]">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Responder con precio base, inventario activo, metraje y distribución antes de empujar una llamada.</p>
              </div>
              <div className="flex gap-3 rounded-[1.4rem] border border-[#e1cfbb] bg-[#f9f3ea] p-4 text-sm leading-7 text-[#5f4835]">
                <MapPin className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Usar Región 11 como ancla cuando el lead todavía compara zonas, presupuesto y producto familiar dentro de Tulum.</p>
              </div>
              <div className="flex gap-3 rounded-[1.4rem] border border-[#e1cfbb] bg-[#f9f3ea] p-4 text-sm leading-7 text-[#5f4835]">
                <Building2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Escalar a penthouse o bajar a 2 recámaras solo después de validar si el lock-off sí encaja con objetivo y ticket.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-[#221710] text-[#f8efe2]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d0b188]">Captura de lead</p>
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide 3 recámaras lock-off, precios y plan de pago actualizado.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              Este formulario ya entra al CRM como lead de Riviera Maya. La intención queda mejor encuadrada para que el seguimiento empiece con 3 recámaras lock-off y no desde una consulta genérica.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_3rec_lockoff_whatsapp_click"
                label="contact"
                page="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp directo
              </TrackedAnchor>
              <Link
                href="/propiedades?mercado=RIVIERA_MAYA"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver catálogo Riviera Maya
              </Link>
            </div>
          </div>

          <ContactForm
            market="RIVIERA_MAYA"
            interest="Quiero departamentos de 3 recámaras lock-off en Tulum de Yaax Tulum Condos"
            submitLabel="Recibir 3 rec lock-off activas y plan"
            preferredContactLabel="Canal para recibir 3 rec lock-off disponibles"
            preferredContactPlaceholder="WhatsApp, llamada o email para compartir inventario y precios"
            messageLabel="Cuéntanos presupuesto, metraje o timing para 3 rec lock-off"
            messagePlaceholder="Ejemplo: busco 3 recámaras lock-off con precio vigente, distribución clara y plan de pago para comprar este trimestre."
            formIntro="Comparte presupuesto, objetivo de compra y timing para responder con 3 recámaras lock-off activas, precio vigente y plan de pago útil desde el primer contacto."
            analyticsPage="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
          />
        </div>
      </section>
    </main>
  );
}
