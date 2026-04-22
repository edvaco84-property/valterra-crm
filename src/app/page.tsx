import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, Handshake, Landmark, TrendingUp } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { formatCurrency } from "@/lib/utils";
import { getPublishedProperties } from "@/lib/properties/queries";

const benefits = [
  {
    title: "Plusvalía sólida",
    icon: TrendingUp,
  },
  {
    title: "Exclusividad y elegancia",
    icon: Building2,
  },
  {
    title: "Lectura estratégica",
    icon: Landmark,
  },
  {
    title: "Atención personalizada",
    icon: Handshake,
  },
];

export default async function LandingPage() {
  const publishedProperties = await getPublishedProperties(3);

  return (
    <main className="bg-[#171310] text-[#f5ede2]">
      <div className="mx-auto max-w-[1080px] bg-[#171310] shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
        <header className="border-b border-[#6b5841]/45 bg-[#1b1612] px-6 py-4 sm:px-10">
          <div className="flex flex-col gap-4 text-[11px] uppercase tracking-[0.28em] text-[#d6c0a0] sm:flex-row sm:items-center sm:justify-between">
            <a href="#inicio" className="flex items-center justify-center sm:justify-start">
              <Image src="/branding/valterra-logo.jpg" alt="Valterra" width={420} height={360} className="h-auto w-[138px] sm:w-[160px] object-contain opacity-95" priority />
            </a>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center sm:justify-end">
              <a href="#inicio" className="transition hover:text-white">Inicio</a>
              <a href="#nosotros" className="transition hover:text-white">Nosotros</a>
              <a href="#mercados" className="transition hover:text-white">Mercados</a>
              <a href="#contacto" className="transition hover:text-white">Contacto</a>
            </nav>
          </div>
        </header>

        <section id="inicio" className="relative min-h-[520px] overflow-hidden border-b border-[#6b5841]/45 px-6 py-10 sm:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,10,0.35),rgba(15,12,10,0.55)),url('https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.48)_100%)]" />

          <div className="relative z-10 flex min-h-[440px] items-center justify-center text-center">
            <div className="max-w-2xl">
              <h1 className="font-serif text-5xl leading-[1.05] text-[#f7efe3] sm:text-6xl">
                Patrimonio
                <br />
                con visión
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#f0e6d8]/88 sm:text-base">
                Conectamos a clientes exclusivos con propiedades selectas y oportunidades de inversión en mercados premium de CDMX y Riviera Maya.
              </p>
              <div className="mt-8">
                <a href="#mercados" className="inline-flex items-center justify-center bg-[#d3b184] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]">
                  Descubrir propiedades
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-b border-[#6b5841]/45 bg-[#171310] px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <h2 className="max-w-md font-serif text-4xl leading-tight text-[#f4e7d7]">
              Elegancia patrimonial
              <br />
              en bienes raíces
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#e4d6c4]/82">
              Valterra selecciona propiedades premium en CDMX y Riviera Maya para clientes exigentes que buscan patrimonio, plusvalía y exclusividad.
            </p>
            <div className="mt-7">
              <a href="#nosotros" className="inline-flex items-center justify-center bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]">
                Descubre más
              </a>
            </div>
          </div>

          <div className="min-h-[280px] bg-[url('https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center shadow-[0_12px_28px_rgba(0,0,0,0.25)]" />
        </section>

        <section className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-8 sm:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ title, icon: Icon }) => (
              <div key={title} className="flex flex-col items-center justify-center border border-[#5f503d]/45 px-4 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#8b7354] text-[#d3b184]">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm uppercase tracking-[0.16em] text-[#e6d8c3]">{title}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mercados" className="border-b border-[#6b5841]/45 bg-[#171310] px-6 py-12 sm:px-10">
          <h2 className="text-center font-serif text-4xl text-[#f4e7d7]">Propiedades Premium</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {publishedProperties.length > 0 ? (
              publishedProperties.map((property) => (
                <article key={property.id} className="border border-[#5f503d]/45 bg-[#1d1814] p-3">
                  <div
                    className="h-64 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${property.imageUrl || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"}')`,
                    }}
                  />
                  <div className="px-3 pb-4 pt-5 text-center">
                    <h3 className="font-serif text-3xl text-[#f4e7d7]">{property.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#b89b72]">{property.zone} · {property.market === "RIVIERA_MAYA" ? "Riviera Maya" : "CDMX"}</p>
                    <p className="mt-4 text-lg text-[#f4e7d7]">{formatCurrency(property.price, property.currency)}</p>
                    <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#dccdb8]/80">{property.summary || property.description || "Propiedad selecta para clientes que buscan ubicación, criterio y presencia."}</p>
                    <Link href={`/propiedades/${property.id}`} className="mt-6 inline-flex items-center justify-center gap-2 bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]">
                      Ver propiedad
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="lg:col-span-3 rounded-[1.5rem] border border-dashed border-[#5f503d] px-6 py-12 text-center text-[#dccdb8]/80">
                Aún no hay propiedades publicadas desde el CRM. En cuanto marques una como pública, aparece aquí. Magia, pero útil.
              </div>
            )}
          </div>
        </section>

        <section id="nosotros" className="grid gap-8 border-b border-[#6b5841]/45 bg-[#171310] px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.2em] text-[#c5a57c]">Quiénes somos</p>
            <h2 className="mt-3 font-serif text-4xl text-[#f4e7d7]">Una firma inmobiliaria con claridad, elegancia y criterio patrimonial.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#e4d6c4]/82">
              Combinamos atención personalizada, lectura estratégica de mercado y una selección curada de activos para construir decisiones sólidas en mercados de alto valor.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a href="#contacto" className="inline-flex items-center justify-center bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]">
                Sobre nosotros
              </a>
              <Link href="/login" className="inline-flex items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5">
                Entrar al CRM
              </Link>
            </div>
          </div>

          <div className="min-h-[320px] bg-[url('https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center shadow-[0_12px_28px_rgba(0,0,0,0.25)]" />
        </section>

        <section id="contacto" className="border-t border-[#6b5841]/45 bg-[#120f0d] px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#c5a57c]">Contacto</p>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl text-[#f4e7d7]">Déjanos tus datos y armamos una base seria de clientes, no una colección de post-its digitales.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#e4d6c4]/82">
                Cuéntanos qué buscas, en qué mercado te interesa invertir o comprar, y cómo prefieres que te contactemos.
              </p>
              <div className="mt-6 flex flex-col gap-3 text-sm text-[#eadfce]">
                <a href="mailto:hola@valterra.mx" className="transition hover:text-white">hola@valterra.mx</a>
                <a href="https://wa.me/529984635201" className="transition hover:text-white">WhatsApp directo</a>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  );
}
