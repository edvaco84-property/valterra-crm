import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type PropertyItem = {
  id: string;
  title: string;
  market: string;
  zone: string;
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
};

export function PropertiesGrid({ properties }: { properties: PropertyItem[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {properties.map((property) => (
        <Card key={property.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{property.market}</p>
              <h3 className="mt-2 text-xl font-semibold text-zinc-950">{property.title}</h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              {property.featured ? <Badge tone="brand">Destacada</Badge> : null}
              <Badge tone={property.published ? "success" : "neutral"}>{property.published ? "Publicada" : "Interna"}</Badge>
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-600">{property.zone} · {property.propertyType} · {property.operationType}</p>
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
          <div className="mt-4 flex justify-end">
            <Link href={`/properties/${property.id}/edit`} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950">
              Editar
            </Link>
          </div>
        </Card>
      ))}
    </section>
  );
}
