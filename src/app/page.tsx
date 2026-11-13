import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Handshake, Landmark, TrendingUp } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { PublicSiteNav } from "@/components/public/public-site-nav";
import { PremiumPropertiesCarousel } from "@/components/properties/premium-properties-carousel";
import { getPublishedProperties } from "@/lib/properties/queries";

export const metadata: Metadata = {
  title: "Valterra | Propiedades e inversión inmobiliaria con oportunidades en Tulum",
  description:
    "Valterra conecta compra, inversión y comercialización inmobiliaria en CDMX, Estado de Mexico y Riviera Maya, con catálogo público y acompañamiento comercial personalizado.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Valterra | Propiedades e inversión inmobiliaria con oportunidades en Tulum",
    description:
      "Explora propiedades publicadas y conoce la ruta comercial de Valterra para comprar, invertir o comercializar un activo inmobiliario.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valterra | Propiedades e inversión inmobiliaria con oportunidades en Tulum",
    description:
      "Catálogo público y acompañamiento comercial para compra e inversión inmobiliaria.",
  },
};

const benefits = [
  {
    title: "Selección de oportunidades",
    description: "Activos revisados por zona, perfil de compra y potencial comercial.",
    icon: TrendingUp,
  },
  {
    title: "Inventario premium",
    description: "Propiedades con mejor ubicación, presencia y posibilidad de valorización.",
    icon: Building2,
  },
  {
    title: "Lectura de mercado",
    description: "Contexto real para decidir entre residencia, inversión o comercialización.",
    icon: Landmark,
  },
  {
    title: "Seguimiento personalizado",
    description: "Acompañamiento directo desde el primer contacto hasta la negociación.",
    icon: Handshake,
  },
];

const audienceCards = [
  {
    title: "Quiero comprar o invertir",
    copy: "Explora oportunidades seleccionadas en CDMX, Estado de Mexico y Riviera Maya con criterios claros de ubicación, precio y perfil de activo.",
    href: "/propiedades",
    cta: "Ver catálogo",
  },
  {
    title: "Quiero vender o listar mi propiedad",
    copy: "Solicita acompañamiento comercial, posicionamiento del activo y una ruta más clara para captar compradores.",
    href: "#contacto",
    cta: "Solicitar valoración",
  },
  {
    title: "Soy broker",
    copy: "Entra al CRM de Valterra para dar seguimiento a leads, pipeline, tareas y agenda comercial.",
    href: "/brokers",
    cta: "Acceso brokers",
  },
];

const processSteps = [
  {
    title: "Entendemos tu objetivo",
    copy: "Compra patrimonial, inversión, residencia o comercialización de tu propiedad.",
  },
  {
    title: "Filtramos oportunidades reales",
    copy: "Seleccionamos activos con criterio de zona, precio, operación y potencial comercial.",
  },
  {
    title: "Coordinamos seguimiento y negociación",
    copy: "Acompañamos visitas, validación y conversaciones con una ejecución comercial más ordenada.",
  },
  {
    title: "Cerramos con atención personalizada",
    copy: "Cada proceso se trabaja con respuesta puntual, claridad y seguimiento uno a uno.",
  },
];

const marketCards = [
  {
    title: "CDMX",
    copy: "Activos urbanos con foco en ubicación, conectividad, demanda y valor patrimonial de largo plazo.",
    href: "/propiedades?mercado=CDMX",
    cta: "Ver oportunidades en CDMX",
  },
  {
    title: "Estado de Mexico",
    copy: "Terrenos y activos patrimoniales con lectura más precisa de entorno, acceso y potencial de resguardo o desarrollo.",
    href: "/propiedades?mercado=ESTADO_DE_MEXICO",
    cta: "Ver oportunidades en Estado de Mexico",
  },
  {
    title: "Riviera Maya",
    copy: "Oportunidades residenciales y de inversión en destinos con atractivo patrimonial, vacacional y comercial.",
    href: "/propiedades?mercado=RIVIERA_MAYA",
    cta: "Ver oportunidades en Riviera Maya",
  },
];

const trustSignals = [
  "Tres mercados estratégicos",
  "Catálogo publicado y actualizado",
  "Atención directa por WhatsApp y email",
  "Seguimiento comercial personalizado",
];

const publicNavItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#oportunidades", label: "Oportunidades" },
  { href: "#proceso", label: "Proceso" },
  { href: "#mercados", label: "Mercados" },
  { href: "/brokers", label: "Acceso brokers" },
  { href: "#contacto", label: "Contacto" },
];

export default async function LandingPage() {
  const publishedProperties = await getPublishedProperties();
  const siteUrl = process.env.APP_URL || "https://valterra-crm.fly.dev";
  const homeUrl = new URL("/", siteUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Valterra",
        description:
          "Sitio público de Valterra para propiedades, inversión inmobiliaria y rutas de contacto con foco en CDMX, Estado de Mexico y Riviera Maya.",
        url: homeUrl,
      },
      {
        "@type": "RealEstateAgent",
        name: "Valterra",
        url: homeUrl,
        areaServed: ["CDMX", "Estado de Mexico", "Riviera Maya", "Tulum"],
        knowsAbout: [
          "propiedades en venta",
          "inversión inmobiliaria",
          "preventa en Tulum",
          "departamentos en Tulum",
          "propiedades en Región 11 Tulum",
        ],
      },
    ],
  };

  return (
    <main className="bg-[#171310] text-[#f5ede2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PublicSiteNav items={publicNavItems} whatsappHref="https://wa.me/529984635201" />
      <div className="mx-auto max-w-[1080px] bg-[#171310] shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
        <header className="border-b border-[#6b5841]/45 bg-[#1b1612] px-4 py-3 sm:px-10 sm:py-4">
          <div className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.24em] text-[#d6c0a0] sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:tracking-[0.28em]">
            <a href="#inicio" className="flex items-center justify-center sm:justify-start">
              <Image src="/branding/valterra-logo.jpg" alt="Valterra" width={420} height={360} className="h-auto w-[92px] sm:w-[160px] object-contain opacity-95" priority />
            </a>
            <nav className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center sm:flex sm:justify-end sm:gap-x-5 sm:gap-y-3">
              <a href="#inicio" className="transition hover:text-white">Inicio</a>
              <a href="#oportunidades" className="transition hover:text-white">Oportunidades</a>
              <a href="#proceso" className="transition hover:text-white">Proceso</a>
              <a href="#mercados" className="transition hover:text-white">Mercados</a>
              <Link href="/brokers" className="transition hover:text-white">Acceso brokers</Link>
              <a href="#contacto" className="transition hover:text-white">Contacto</a>
            </nav>
          </div>
        </header>

        <section id="inicio" className="relative min-h-[480px] overflow-hidden border-b border-[#6b5841]/45 px-4 py-8 sm:min-h-[560px] sm:px-10 sm:py-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,10,0.42),rgba(15,12,10,0.62)),url('https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.52)_100%)]" />

          <div className="relative z-10 flex min-h-[400px] items-center justify-center text-center sm:min-h-[480px]">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.28em] text-[#d6c0a0]">CDMX, Estado de Mexico y Riviera Maya</p>
              <h1 className="mt-4 font-serif text-[3.25rem] leading-[0.98] text-[#f7efe3] sm:text-6xl sm:leading-[1.02]">
                Propiedades e inversión inmobiliaria
                <br />
                con criterio comercial
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#f0e6d8]/88 sm:text-base">
                Valterra asesora a compradores, inversionistas y propietarios que buscan activos bien ubicados, análisis comercial claro y acompañamiento discreto durante todo el proceso.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/propiedades" className="inline-flex min-h-12 items-center justify-center bg-[#d3b184] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]">
                  Ver propiedades
                </Link>
                <Link href="/brokers" className="inline-flex min-h-12 items-center justify-center border border-[#8b7354] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
                  Acceso brokers
                </Link>
                <a href="#contacto" className="inline-flex min-h-12 items-center justify-center border border-[#8b7354] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
                  Quiero vender o listar
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-[#e3d4bf]/78 sm:gap-x-5 sm:text-[11px] sm:tracking-[0.18em]">
                <span>Atención personalizada</span>
                <span>Oportunidades seleccionadas</span>
                <span>Seguimiento comercial real</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-12 sm:px-10">
          <div className="grid gap-5 lg:grid-cols-3">
            {audienceCards.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-[#5f503d]/45 bg-[#1b1612] p-6 sm:p-7">
                <p className="text-xs uppercase tracking-[0.22em] text-[#c5a57c]">Valterra</p>
                <h2 className="mt-3 font-serif text-3xl text-[#f4e7d7]">{item.title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#dccdb8]/82">{item.copy}</p>
                <div className="mt-6">
                  <a href={item.href} className="inline-flex items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
                    {item.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-[#6b5841]/45 bg-[#19130f] px-6 py-10 sm:px-10">
          <div className="grid gap-6 rounded-[2rem] border border-[#6f5a40]/55 bg-[linear-gradient(135deg,#261c14_0%,#171310_58%,#3a281a_100%)] p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#c5a57c]">Portal Brokers</p>
              <h2 className="mt-3 font-serif text-4xl text-[#f4e7d7]">Acceso directo al CRM comercial de Valterra.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#dccdb8]/82">
                Un punto de entrada claro para brokers con acceso a leads, pipeline, tareas, agenda y seguimiento comercial. Ya era hora de que no pareciera escondido en el clóset.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/brokers"
                  className="inline-flex min-h-12 items-center justify-center bg-[#d3b184] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]"
                >
                  Entrar al portal brokers
                </Link>
                <Link
                  href="/crm"
                  className="inline-flex min-h-12 items-center justify-center border border-[#8b7354] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5"
                >
                  Ir al CRM
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#5f503d]/50 bg-black/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c5a57c]">Leads</p>
                <p className="mt-2 text-sm leading-6 text-[#eadbc7]/84">Consulta y atiende oportunidades nuevas sin perder seguimiento.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#5f503d]/50 bg-black/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c5a57c]">Pipeline</p>
                <p className="mt-2 text-sm leading-6 text-[#eadbc7]/84">Visualiza el avance comercial y prioriza cierres reales.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#5f503d]/50 bg-black/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c5a57c]">Agenda</p>
                <p className="mt-2 text-sm leading-6 text-[#eadbc7]/84">Ordena tareas, citas y seguimiento desde un solo lugar.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#5f503d]/50 bg-black/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#c5a57c]">Acceso</p>
                <p className="mt-2 text-sm leading-6 text-[#eadbc7]/84">Si ya tienes sesión, el portal te manda directo al CRM.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-8 sm:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex flex-col border border-[#5f503d]/45 px-4 py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#8b7354] text-[#d3b184]">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm uppercase tracking-[0.16em] text-[#e6d8c3]">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[#dccdb8]/78">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="oportunidades" className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-12 sm:px-10">
          <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#c5a57c]">Inventario destacado</p>
              <h2 className="mt-3 font-serif text-4xl text-[#f4e7d7]">Oportunidades seleccionadas</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#dccdb8]/82">
                Una muestra del inventario publicado con foco en ubicación, perfil de activo y potencial comercial.
              </p>
            </div>
            <div>
              <Link href="/propiedades" className="inline-flex items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
                Ver catálogo completo
              </Link>
            </div>
          </div>
          <PremiumPropertiesCarousel properties={publishedProperties} />
        </section>

        <section id="proceso" className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-10 sm:px-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[#c5a57c]">Cómo trabajamos</p>
            <h2 className="mt-3 font-serif text-4xl text-[#f4e7d7]">Un proceso claro para decisiones inmobiliarias mejor informadas</h2>
            <p className="mt-4 text-sm leading-7 text-[#dccdb8]/82">
              Menos ruido, más criterio. Cada etapa está pensada para ordenar la decisión y mantener el seguimiento comercial bajo control.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-[1.5rem] border border-[#5f503d]/45 bg-[#1b1612] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#c5a57c]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-serif text-2xl text-[#f4e7d7]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#dccdb8]/82">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mercados" className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-12 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase tracking-[0.2em] text-[#c5a57c]">Mercados</p>
              <h2 className="mt-3 font-serif text-4xl text-[#f4e7d7]">Tres mercados estratégicos. Un mismo criterio de selección.</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#e4d6c4]/82">
                Operamos en CDMX, Estado de Mexico y Riviera Maya para acompañar decisiones de compra, inversión o comercialización con mejor contexto de mercado y oportunidades más alineadas al objetivo del cliente.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {marketCards.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-[#5f503d]/45 bg-[#1b1612] p-6">
                  <h3 className="font-serif text-3xl text-[#f4e7d7]">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#dccdb8]/82">{item.copy}</p>
                  <div className="mt-6">
                    <Link href={item.href} className="inline-flex items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
                      {item.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-10 sm:px-10">
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.24em] text-[#c5a57c]">Confianza</p>
            <h2 className="font-serif text-4xl text-[#f4e7d7]">Señales claras de una operación mejor organizada</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustSignals.map((signal) => (
              <div key={signal} className="border border-[#5f503d]/45 bg-[#1b1612] px-5 py-6 text-center text-sm uppercase tracking-[0.16em] text-[#e6d8c3]">
                {signal}
              </div>
            ))}
          </div>
        </section>

        <section id="contacto" className="border-t border-[#6b5841]/45 bg-[#120f0d] px-6 pb-28 pt-10 sm:px-10 sm:pb-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c5a57c]">Contacto</p>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl text-[#f4e7d7]">Conversemos sobre tu siguiente movimiento inmobiliario</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#e4d6c4]/82">
                Ya sea que quieras invertir, comprar o comercializar una propiedad, podemos ayudarte a ordenar el proceso y avanzar con más claridad.
              </p>
              <div className="mt-6 flex flex-col gap-3 text-sm text-[#eadfce]">
                <a href="mailto:hola@valterra.mx" className="transition hover:text-white">hola@valterra.mx</a>
                <a href="https://wa.me/529984635201" className="transition hover:text-white">Hablar por WhatsApp</a>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  );
}
