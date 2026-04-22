import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { getPublishedPropertyById } from "@/lib/properties/queries";
import { formatCurrency } from "@/lib/utils";

export default async function PublicPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPublishedPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="bg-[#171310] text-[#f5ede2]">
      <div className="mx-auto max-w-[1080px] px-6 py-8 sm:px-10">
        <Link href="/#mercados" className="inline-flex items-center gap-2 text-sm text-[#d6c0a0] transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Volver a propiedades
        </Link>

        <section className="mt-6 overflow-hidden border border-[#5f503d]/45 bg-[#1d1814]">
          <div
            className="relative h-[320px] bg-cover bg-center sm:h-[420px]"
            style={{
              backgroundImage: `url('${property.images[0]?.url || property.imageUrl || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"}')`,
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.45))]" />
          </div>

          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#b89b72]">{property.zone} · {property.market === "RIVIERA_MAYA" ? "Riviera Maya" : "CDMX"}</p>
              <h1 className="mt-3 font-serif text-4xl text-[#f4e7d7] sm:text-5xl">{property.title}</h1>
              <p className="mt-4 text-2xl text-[#f4e7d7]">{formatCurrency(property.price, property.currency)}</p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#e4d6c4]">
                <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.propertyType}</span>
                <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.operationType}</span>
                <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.status}</span>
                {property.bedrooms ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.bedrooms} recámaras</span> : null}
                {property.bathrooms ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.bathrooms} baños</span> : null}
                {property.areaM2 ? <span className="rounded-full border border-[#6b5841] px-4 py-2">{property.areaM2} m²</span> : null}
              </div>

              <div className="mt-8 space-y-4 text-sm leading-7 text-[#dccdb8]">
                {property.summary ? <p>{property.summary}</p> : null}
                <p>{property.description || "Propiedad selecta para clientes que buscan ubicación, criterio y presencia en un mercado premium."}</p>
              </div>

              {property.images.length > 1 ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {property.images.map((image) => (
                    <div
                      key={image.id}
                      className="h-32 rounded-2xl border border-[#5f503d]/45 bg-cover bg-center"
                      style={{ backgroundImage: `url('${image.url}')` }}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#caa77c]">Solicita información de esta propiedad</p>
              <ContactForm propertyTitle={property.title} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
