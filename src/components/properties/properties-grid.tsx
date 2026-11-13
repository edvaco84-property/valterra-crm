import Link from "next/link";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type PropertyItem = {
  id: string;
  title: string;
  market: string;
  zone: string;
  development?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  unitCode: string | null;
  unitType: string | null;
  floorLabel: string | null;
  propertyType: string;
  operationType: string;
  price: number;
  currency: string;
  status: string;
  featured: boolean;
  published: boolean;
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  publications?: Array<{
    channel: "WEBSITE" | "INMUEBLES24" | "FACEBOOK" | "INSTAGRAM";
    isEnabled: boolean;
    status: "DRAFT" | "READY" | "PUBLISHED" | "PAUSED" | "ERROR";
  }>;
};

export function PropertiesGrid({ properties }: { properties: PropertyItem[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {properties.map((property) => {
        const inmuebles24Publication = property.publications?.find((publication) => publication.channel === "INMUEBLES24");
        const facebookPublication = property.publications?.find((publication) => publication.channel === "FACEBOOK");
        const instagramPublication = property.publications?.find((publication) => publication.channel === "INSTAGRAM");
        const getStatusLabel = (status: "DRAFT" | "READY" | "PUBLISHED" | "PAUSED" | "ERROR") =>
          status === "READY" ? "Lista" : status === "PUBLISHED" ? "Publicada" : status === "PAUSED" ? "Pausada" : status === "ERROR" ? "Error" : "Borrador";

        return (
          <Card key={property.id} className="bg-white/88">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{property.market}</p>
                <h3 className="mt-2 text-lg font-semibold leading-tight text-zinc-950 sm:text-xl">{property.title}</h3>
                {property.development ? (
                  <p className="mt-2 text-sm text-zinc-500">
                    {property.development.title}
                    {property.unitCode ? ` · ${property.unitCode}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
                {property.featured ? <Badge tone="brand">Destacada</Badge> : null}
                <Badge tone={property.published ? "success" : "neutral"}>{property.published ? "Publicada" : "Interna"}</Badge>
                {inmuebles24Publication?.isEnabled ? (
                  <Badge tone={inmuebles24Publication.status === "PUBLISHED" ? "success" : "warning"}>
                    I24 · {getStatusLabel(inmuebles24Publication.status)}
                  </Badge>
                ) : null}
                {facebookPublication?.isEnabled ? (
                  <Badge tone={facebookPublication.status === "PUBLISHED" ? "success" : facebookPublication.status === "ERROR" ? "danger" : "warning"}>
                    FB · {getStatusLabel(facebookPublication.status)}
                  </Badge>
                ) : null}
                {instagramPublication?.isEnabled ? (
                  <Badge tone={instagramPublication.status === "PUBLISHED" ? "success" : instagramPublication.status === "ERROR" ? "danger" : "warning"}>
                    IG · {getStatusLabel(instagramPublication.status)}
                  </Badge>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {property.zone} · {property.propertyType} · {property.operationType}
              {property.unitType ? ` · ${property.unitType}` : ""}
              {property.floorLabel ? ` · ${property.floorLabel}` : ""}
            </p>
            <p className="mt-5 text-2xl font-semibold text-zinc-950">{formatCurrency(property.price, property.currency)}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-600">
              {property.areaM2 ? <span>{property.areaM2} m²</span> : null}
              {property.bedrooms ? <span>{property.bedrooms} rec</span> : null}
              {property.bathrooms ? <span>{property.bathrooms} baños</span> : null}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
              <span className="text-zinc-500">Estado</span>
              <Badge tone={property.status === "Negociación" ? "warning" : "success"}>{property.status}</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link href={`/properties/${property.id}/edit`} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white/85 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950 sm:w-auto">
                Editar
              </Link>
              <div className="sm:w-auto">
                <PropertyDeleteButton propertyId={property.id} />
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
