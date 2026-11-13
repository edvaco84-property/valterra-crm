import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedInternalLink } from "@/components/marketing/tracked-link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Yaax Tulum Condos | Departamentos en preventa en Tulum",
  description:
    "Departamentos en preventa en Región 11, Tulum. Yaax Tulum Condos ofrece studios, unidades de 2 recámaras y penthouses desde MXN 2.49M con contacto directo por WhatsApp o formulario.",
  alternates: {
    canonical: "/desarrollos/yaax-tulum-condos",
  },
  openGraph: {
    title: "Yaax Tulum Condos | Departamentos en preventa en Tulum",
    description:
      "Studios, departamentos de 2 recámaras y penthouses en preventa en Región 11, Tulum, con precio de entrada, tipologías y contacto comercial directo.",
    url: "/desarrollos/yaax-tulum-condos",
    images: [
      {
        url: "/uploads/properties/yaax/Render 1.JPEG",
        alt: "Yaax Tulum Condos en Tulum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaax Tulum Condos | Departamentos en preventa en Tulum",
    description:
      "Studios, departamentos de 2 recámaras y penthouses en preventa en Región 11, Tulum, con contacto comercial directo.",
    images: ["/uploads/properties/yaax/Render 1.JPEG"],
  },
};

const whatsappHref =
  "https://wa.me/529984635201?text=Hola,%20quiero%20disponibilidad,%20precios%20y%20plan%20de%20pago%20de%20Yaax%20Tulum%20Condos.";

const galleryImages = [
  "/uploads/properties/yaax/Render 1.JPEG",
  "/uploads/properties/yaax/Perspectiva.PNG",
  "/uploads/properties/yaax/Perspectiva 1.PNG",
  "/uploads/properties/yaax/PHOTO-2025-02-06-17-36-31.JPEG",
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
    question: "¿Desde cuánto cuesta un departamento en preventa en Yaax Tulum Condos?",
    answer:
      "El inventario publicado arranca desde el precio base mostrado en esta página. El monto exacto y las promociones vigentes se confirman al pedir disponibilidad actualizada.",
  },
  {
    question: "¿Qué tipos de departamentos hay en Yaax Tulum Condos?",
    answer:
      "Yaax concentra studios, unidades de 2 recámaras y penthouses para quien quiere comparar ticket de entrada, metraje y perfil de uso dentro del mismo desarrollo.",
  },
  {
    question: "¿Yaax está en Región 11, Tulum?",
    answer:
      "Sí. Yaax Tulum Condos se comercializa dentro de Región 11, una ubicación que suele atraer búsquedas por preventa, segunda residencia y compra patrimonial en Tulum.",
  },
  {
    question: "¿Cómo se pide inventario y plan de pago de Yaax?",
    answer:
      "Se puede pedir por WhatsApp o formulario para recibir disponibilidad vigente, precio actualizado y siguiente paso comercial sin depender de un brochure desactualizado.",
  },
];

function formatRange(min: number, max: number, formatter: (value: number) => string) {
  return min === max ? formatter(min) : `${formatter(min)} - ${formatter(max)}`;
}

export default async function YaaxDevelopmentPage() {
  const properties = await db.property.findMany({
    where: {
      published: true,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        name: "Yaax Tulum Condos",
        description:
          "Departamentos en preventa en Región 11, Tulum, con studios, unidades de 2 recámaras y penthouses publicados en el catálogo de Yaax Tulum Condos.",
        itemListElement: unitTypeCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${card.unitType} en Yaax Tulum Condos`,
            description: `${card.propertyCount} unidades publicadas en Yaax Tulum Condos.`,
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
              item.question === "¿Desde cuánto cuesta un departamento en preventa en Yaax Tulum Condos?"
                ? priceMin
                  ? `El inventario publicado inicia desde ${formatCurrency(priceMin, "MXN")}. El monto exacto y las promociones vigentes se confirman al pedir disponibilidad actualizada.`
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#d0b188]">Yaax Tulum Condos · Preventa</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-[#fff7ef] sm:text-6xl">
              Departamentos en preventa en Tulum desde {priceMin ? formatCurrency(priceMin, "MXN") : "precio por confirmar"}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#eadfce]/88">
              Yaax Tulum Condos reúne studios, departamentos de 2 recámaras y penthouses en Región 11, Tulum. La página pone
              precio de entrada, tipologías y una ruta directa para pedir disponibilidad, precios y plan de pago.
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

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir disponibilidad
              </a>
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Recibir precios
              </a>
              <Link
                href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver Fase 1
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/propiedades?mercado=RIVIERA_MAYA"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#8f7351] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver más Riviera Maya
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#dcc7ab]/78">
              <span>Región 11, Tulum</span>
              <span>2 edificios</span>
              <span>3 niveles</span>
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
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Qué sí puede vender esta página</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Información clave para comprar departamento en Tulum.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              Esta versión responde primero las preguntas con intención de compra: cuánto cuesta entrar, qué tipos de unidad hay
              y cómo pedir inventario actualizado sin perder al lead en una conversación eterna.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Entrada clara",
                copy: priceMin ? `Precios desde ${formatCurrency(priceMin, "MXN")} en inventario publicado.` : "Solicita el rango actualizado de preventa.",
              },
              {
                title: "Ruta de contacto directa",
                copy: "WhatsApp con mensaje precargado y formulario que ya entra al CRM con mercado correcto.",
              },
              {
                title: "Producto visible",
                copy: "Tipologías, m2, recámaras y accesos a fichas individuales para que el lead compare.",
              },
              {
                title: "Control de expectativas",
                copy: "Se pide disponibilidad y avance actualizado sin prometer inventario como si fuera talla de tenis.",
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
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Ruta comercial nueva</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">La Fase 1 ya tiene una landing dedicada para campañas.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              La landing general sigue presentando el proyecto completo. Para campañas y captación directa, ahora existe una
              ruta enfocada en la Fase 1 con precio de entrada, inventario filtrado y CTA más agresivo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              Abrir landing Fase 1
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Pedir inventario
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Nuevas landings de adquisición</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Yaax ya cubre compra amplia y ubicación dentro del CRM.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              La búsqueda amplia de comprar propiedad en Tulum y la búsqueda por Región 11 merecen páginas propias. Ambas aterrizan
              precio base, tipologías y siguiente paso comercial sin obligar al lead a deducir contexto escondido dentro de otro bloque.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="comprar-propiedad"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              Abrir compra en Tulum
              <ArrowRight className="h-4 w-4" />
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/region-11-tulum"
              eventName="yaax_general_internal_navigation"
              label="region-11"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Abrir landing Región 11
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/precios-region-11-vs-aldea-zama-y-la-veleta"
              eventName="yaax_general_internal_navigation"
              label="zone-comparison"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Comparar zonas
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
              eventName="yaax_general_internal_navigation"
              label="plan-de-pago"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Abrir landing plan de pago
            </TrackedInternalLink>
            <Link
              href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Ver Fase 1
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Nueva landing por tipología</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Yaax ya tiene rutas propias por tipología dentro del CRM.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Los studios capturan el ticket de entrada, las 2 recámaras responden a una compra más madura, las 3 recámaras lock-off abren el
              segmento familiar o patrimonial de ticket alto y los penthouses ya tienen una ruta premium para aterrizar inventario publicado,
              metraje y CTA directo sin mandar al lead a una página genérica.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/studios-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="studios"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              Abrir landing studios
              <ArrowRight className="h-4 w-4" />
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/departamentos-2-recamaras-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="2-recamaras"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Abrir landing 2 recámaras
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/departamentos-3-recamaras-lock-off-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="3-recamaras-lock-off"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Abrir landing 3 rec lock-off
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/penthouses-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="penthouses"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Abrir landing penthouses
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="comprar-propiedad-middle"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Comprar en Tulum
            </TrackedInternalLink>
            <Link
              href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Ver Fase 1
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Nueva landing de conversión</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Yaax ya tiene una ruta propia para búsquedas de plan de pago en preventa.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Esa consulta suele llegar más cerca de la decisión. La nueva landing conecta ticket de entrada, tipologías activas e
              inventario publicado para convertir una búsqueda transaccional en un lead mejor formulado dentro del CRM.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/plan-de-pago-preventa-tulum"
              eventName="yaax_general_internal_navigation"
              label="plan-de-pago-feature"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#241811] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff5e9] transition hover:bg-[#3a291f]"
            >
              Abrir landing plan de pago
              <ArrowRight className="h-4 w-4" />
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/desarrollos/yaax-tulum-condos/comprar-propiedad-en-tulum"
              eventName="yaax_general_internal_navigation"
              label="comprar-propiedad-plan"
              page="/desarrollos/yaax-tulum-condos"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Comprar en Tulum
            </TrackedInternalLink>
            <Link
              href="/desarrollos/yaax-tulum-condos/fase-1-edificio-4"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b89470] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
            >
              Ver Fase 1
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#efe4d4]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Tipologías</p>
              <h2 className="mt-3 font-serif text-4xl text-[#241811]">Tipologías para comparar precios, metraje y recámaras.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f4835]">
              Precios y disponibilidad sujetos a actualización. Esto sirve para abrir conversación comercial, no para tatuar inventario en piedra.
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
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#b89470] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4c33] transition hover:bg-[#f6eee3]"
                    >
                      Pedir inventario
                    </a>
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
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Amenidades y contexto</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Amenidades y ubicación con contexto comercial real.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Yaax tiene un discurso claro de bienestar y lifestyle en Tulum. Lo útil aquí es conectarlo con algo vendible:
              una propuesta boutique, ubicación en Región 11 y producto residencial que puedes comparar por tipología.
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
            <p className="text-xs uppercase tracking-[0.24em] text-[#8c6846]">Checklist para vender mejor</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[#5f4835]">
              <div className="flex gap-3">
                <Building2 className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Mantener actualizado el rango de precios y la disponibilidad real antes de correr campañas frías.</p>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Usar Región 11, Tulum como ancla de ubicación y responder rápido con mapa, avance y brochure al lead que entre.</p>
              </div>
              <div className="flex gap-3">
                <PhoneCall className="mt-1 h-5 w-5 text-[#9d7a56]" />
                <p>Prometer solo lo verificable: inventario, precio base y siguiente paso comercial. Nada de “últimas unidades” si no está validado.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#cfb89d] bg-[#f7efe2] p-5 text-sm leading-7 text-[#5f4835]">
              <p className="font-medium text-[#241811]">Nota comercial sensata</p>
              <p className="mt-2">
                {development?.summary || "Desarrollo boutique de preventa en Tulum con enfoque residencial."} La disponibilidad y las condiciones
                de venta deben confirmarse al momento de atender al lead.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f3e8d9]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[0.96fr_1.04fr] lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Preventa con intención real</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">Lo que normalmente decide si un lead pasa de curioso a conversación seria.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f4835]">
              La mayoría no necesita otro bloque de lifestyle; necesita confirmar ticket de entrada, ubicación real y qué tan rápido
              puede recibir inventario vigente para evaluar compra patrimonial, segunda residencia o preventa en Tulum.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Precio de entrada visible",
                copy: priceMin
                  ? `El catálogo arranca desde ${formatCurrency(priceMin, "MXN")} para filtrar rápido si Yaax entra en presupuesto.`
                  : "El precio base se comparte al confirmar inventario vigente.",
              },
              {
                title: "Inventario sin rodeos",
                copy: "WhatsApp y formulario apuntan a disponibilidad actual, no a una promesa genérica de “más información”.",
              },
              {
                title: "Ubicación buscable",
                copy: "Región 11 funciona como ancla para búsquedas con intención comercial, no como texto perdido dentro del brochure.",
              },
              {
                title: "Plan de pago a tiempo",
                copy: "La llamada a la acción invita a pedir condiciones comerciales cuando el lead ya comparó tipologías y metraje.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-[#d7c2a8] bg-[#fffaf4] p-5 shadow-[0_12px_24px_rgba(36,24,17,0.06)]">
                <h3 className="font-serif text-2xl text-[#241811]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cab7] bg-[#f7f1e8]">
        <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#8c6846]">Preguntas frecuentes</p>
            <h2 className="mt-3 font-serif text-4xl text-[#241811]">FAQ para búsquedas de departamentos en preventa en Tulum.</h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4835]">
              Este bloque ataca objeciones típicas antes de que el lead escriba: precio base, tipologías, ubicación y cómo pedir inventario real.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[1.6rem] border border-[#d8c6b1] bg-white/80 p-6 shadow-[0_16px_36px_rgba(36,24,17,0.06)]">
                <h3 className="font-serif text-2xl text-[#241811]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5f4835]">
                  {item.question === "¿Desde cuánto cuesta un departamento en preventa en Yaax Tulum Condos?" && priceMin
                    ? `El inventario publicado inicia desde ${formatCurrency(priceMin, "MXN")}. El monto exacto y las promociones vigentes se confirman al pedir disponibilidad actualizada.`
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
            <h2 className="mt-3 font-serif text-4xl text-[#fff7ef]">Pide precios, disponibilidad y siguiente paso.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#eadfce]/84">
              Este formulario ya entra al CRM como lead de Riviera Maya. Así evitamos que el interesado termine perdido en una pila genérica de “alguien preguntó algo”.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b188] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#241811] transition hover:bg-[#dec197]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp directo
              </a>
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
            interest="Quiero precios y disponibilidad de Yaax Tulum Condos"
            submitLabel="Recibir inventario activo y precios"
            preferredContactLabel="Canal para recibir inventario"
            preferredContactPlaceholder="WhatsApp, llamada o email para enviar precios y disponibilidad"
            messageLabel="Cuéntanos presupuesto, tipología o plan de pago que quieres revisar"
            messagePlaceholder="Ejemplo: quiero inventario activo de 2 recámaras, precio vigente de studios o plan de pago de Fase 1."
            formIntro="Comparte rango de presupuesto, tipología y timing de compra para responder con inventario vigente, precios actuales y siguiente paso comercial."
          />
        </div>
      </section>
    </main>
  );
}
