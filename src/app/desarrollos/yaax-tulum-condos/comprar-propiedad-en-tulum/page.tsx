import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedAnchor, TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Comprar propiedad en Tulum | Yaax Tulum Condos",
  description:
    "Comprar propiedad en Tulum con entrada desde MXN 2.49M. Yaax Tulum Condos reúne studios, departamentos de 2 recámaras y penthouses en Región 11 con ruta directa a precios e inventario.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum",
  },
  openGraph: {
    title: "Comprar propiedad en Tulum | Yaax Tulum Condos",
    description:
      "Landing para compradores que buscan propiedad en Tulum con precio de entrada, tipologías y contacto directo para pedir disponibilidad actualizada.",
    url: "/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum",
    images: [
      {
        url: "/uploads/properties/yaax/Render 1.JPEG",
        alt: "Comprar propiedad en Tulum con Yaax Tulum Condos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comprar propiedad en Tulum | Yaax Tulum Condos",
    description:
      "Studios, departamentos de 2 recámaras y penthouses en preventa dentro de Región 11, Tulum, con contacto comercial directo.",
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

const buyingReasons = [
  {
    icon: MapPin,
    title: "Ubicación con intención real",
    copy: "Región 11 ayuda a filtrar una búsqueda de compra patrimonial o segunda residencia sin perderse en rutas demasiado genéricas.",
  },
  {
    icon: Building2,
    title: "Producto que sí se puede comparar",
    copy: "Yaax concentra studios, 2 recámaras y penthouses para responder presupuesto, metraje y perfil de compra dentro del mismo desarrollo.",
  },
  {
    icon: PhoneCall,
    title: "Siguiente paso claro",
    copy: "La página baja la búsqueda a precio de entrada, inventario publicado y contacto directo para avanzar sin depender de un brochure viejo.",
  },
];

const faqItems = [
  {
    question: "¿Desde cuánto cuesta comprar propiedad en Tulum dentro de Yaax?",
    answer:
      "El inventario publicado inicia desde el precio base mostrado en esta página. El monto exacto, promociones vigentes y forma de pago se confirman al pedir disponibilidad actualizada.",
  },
  {
    question: "¿Qué tipo de propiedades se pueden comprar en Yaax Tulum Condos?",
    answer:
      "Hoy Yaax publica studios, departamentos de 2 recámaras y penthouses para quien quiere comparar ticket de entrada, amplitud y uso final dentro del mismo proyecto.",
  },
  {
    question: "¿Yaax está en Región 11, Tulum?",
    answer:
      "Sí. Yaax Tulum Condos se comercializa en Región 11, una ubicación que suele atraer búsquedas de compra, preventa y segunda residencia en Tulum.",
  },
  {
    question: "¿Qué conviene pedir primero antes de comprar?",
    answer:
      "Lo más útil es pedir inventario vigente, precio actualizado por tipología y plan de pago para aterrizar presupuesto, timing y siguiente paso comercial.",
  },
];

export default async function BuyPropertyInTulumPage() {
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
    "Hola, quiero comprar propiedad en Tulum y necesito precios, disponibilidad y plan de pago de Yaax Tulum Condos.",
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        name: "Comprar propiedad en Tulum con Yaax Tulum Condos",
        description:
          "Inventario publicado de Yaax Tulum Condos para compradores que buscan propiedad en Tulum con precio de entrada visible y tipologías activas.",
        itemListElement: unitTypeCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${card.unitType} en Yaax Tulum Condos`,
            description: `${card.propertyCount} unidades publicadas con intención de compra en Tulum.`,
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
              item.question === "¿Desde cuánto cuesta comprar propiedad en Tulum dentro de Yaax?" && priceMin
                ? `Hoy el inventario publicado inicia desde ${formatCurrency(priceMin, "MXN")}. El monto exacto, promociones vigentes y forma de pago se confirman al pedir disponibilidad actualizada.`
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">Comprar propiedad en Tulum · Yaax</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Comprar propiedad en Tulum desde {priceMin ? formatCurrency(priceMin, "MXN") : "precio por confirmar"}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#eadfce]/88">
              Esta landing responde una búsqueda amplia de compra con intención comercial real. Yaax Tulum Condos aterriza esa
              consulta en Región 11 con inventario publicado, tipologías comparables y una ruta directa para pedir disponibilidad.
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
                eventName="yaax_buy_tulum_whatsapp_click"
                label="hero"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir precios
              </TrackedAnchor>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Recibir opciones
              </a>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_buy_tulum_internal_navigation"
                label="fase-1-hero"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver Fase 1
              </TrackedInternalLink>
            </div>
          </div>

          <aside className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {galleryImages.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className={`overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] ${
                  index === 0 ? "lg:row-span-2" : ""
                }`}
              >
                <div
                  className={`bg-cover bg-center ${index === 0 ? "h-[320px]" : "h-44"}`}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.22)), url('${imageUrl}')`,
                  }}
                />
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Por qué esta ruta</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Comprar propiedad en Tulum merece una entrada propia dentro del dominio comercial.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              La búsqueda es más amplia que studios, 2 recámaras o Región 11. Esta página funciona como puente entre intención
              alta de compra y las landings más específicas que terminan de cerrar presupuesto, tipología y timing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {buyingReasons.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-[#d8c6b1] bg-[#fffaf4] p-5 shadow-[0_18px_40px_rgba(36,24,17,0.06)]">
                <item.icon className="h-5 w-5 text-[#9d7a56]" />
                <h3 className="mt-4 font-serif text-2xl text-[#241811]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Inventario para comprar</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">Tipologías activas para bajar la compra a números reales.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Precios y disponibilidad sujetos a actualización. La idea es empezar la conversación comercial con contexto útil y no con humo aspiracional.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {unitTypeCards.map((card) => (
              <article key={card.unitType} className="overflow-hidden rounded-[1.8rem] border border-[#ccb79f] bg-[#fffaf4] shadow-[0_18px_40px_rgba(36,24,17,0.08)]">
                <div className="h-44 bg-[linear-gradient(135deg,#e9d6bf,#f8efe2)]" />
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
                  </div>

                  <p className="text-sm leading-7 text-[#5f4835]">
                    {card.unitType.toLowerCase().includes("studio")
                      ? "La entrada más accesible para quien quiere comprar en Tulum sin arrancar en el ticket más alto."
                      : card.unitType.toLowerCase().includes("pent")
                        ? "La lectura premium del proyecto para quien busca más amplitud y un producto más aspiracional."
                        : "El punto medio más sólido para segunda residencia, mayor comodidad y una compra menos comprimida."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={card.propertyHref}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#241811] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
                    >
                      Ver unidad
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <TrackedAnchor
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      eventName="yaax_buy_tulum_whatsapp_click"
                      label={card.unitType.toLowerCase()}
                      page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                    >
                      Pedir disponibilidad
                    </TrackedAnchor>
                  </div>
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
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Qué necesita un comprador serio antes de avanzar.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              No hace falta inflar promesas. Hace falta velocidad con inventario, precio actualizado, plan de pago y una mejor lectura de la tipología correcta.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Inventario activo por tipología y rango de precio.",
                "Plan de pago vigente y siguiente hito comercial.",
                "Ruta de decisión entre studio, 2 recámaras o penthouse según objetivo de compra.",
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
                <p>Si la prioridad es validar ubicación, conviene abrir la landing de Región 11 antes de bajar al detalle de inventario.</p>
              </div>
              <div className="flex gap-3">
                <Building2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Si la prioridad es comparar producto publicado, Fase 1 y las landings por tipología empujan la decisión sin salir del embudo.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/region-11-tulum"
                eventName="yaax_buy_tulum_internal_navigation"
                label="region-11"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
              >
                Ver Región 11
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                eventName="yaax_buy_tulum_internal_navigation"
                label="fase-1"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Ver Fase 1
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/studios-en-tulum"
                eventName="yaax_buy_tulum_internal_navigation"
                label="studios"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Ver studios
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/desarrollos/yaax-tulum-condos/departamentos-2-recamaras-en-tulum"
                eventName="yaax_buy_tulum_internal_navigation"
                label="2-recamaras"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
              >
                Ver 2 recámaras
              </TrackedInternalLink>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-[#221710] text-[#f8efe2]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d0b188]">Captura de lead</p>
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide precios y disponibilidad para comprar en Tulum.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              El formulario entra al CRM con contexto de Riviera Maya y con intención explícita de compra para responder más rápido y mejor.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedAnchor
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                eventName="yaax_buy_tulum_whatsapp_click"
                label="contacto"
                page="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
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
            interest="Quiero comprar propiedad en Tulum con Yaax Tulum Condos"
            submitLabel="Recibir opciones para comprar en Tulum"
            preferredContactLabel="Canal para recibir opciones"
            preferredContactPlaceholder="WhatsApp, llamada o email para compartir disponibilidad"
            messageLabel="Cuéntanos presupuesto, tipología o timing de compra"
            messagePlaceholder="Ejemplo: quiero comprar en Tulum, comparar studios vs 2 recámaras o pedir plan de pago vigente."
            formIntro="Comparte presupuesto, tipología e intención de compra para responder con inventario vigente, precios y siguiente paso comercial."
          />
        </div>
      </section>
    </main>
  );
}
