import { notFound } from "next/navigation";
import { PageShell } from "@/components/shared/page-shell";
import { PropertyForm } from "@/components/forms/property-form";
import { PropertyDeleteButton } from "@/components/properties/property-delete-button";
import { PropertyPublicationPanel } from "@/components/properties/property-publication-panel";
import { permissions, requireRole } from "@/lib/permissions";
import { getDevelopmentOptions, getPropertyById } from "@/lib/properties/queries";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(permissions.manageProperties);
  const { id } = await params;
  const [property, developments] = await Promise.all([
    getPropertyById(id),
    getDevelopmentOptions(),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <PageShell>
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Propiedades</p>
        <h1 className="text-3xl font-semibold text-zinc-950">Editar · {property.title}</h1>
        <p className="text-sm text-zinc-600">Actualiza datos, publicación web, selección para portales e imágenes de la propiedad.</p>
      </section>
      <PropertyForm property={property} developments={developments} />
      <PropertyPublicationPanel propertyId={property.id} publications={property.publications} />
      <section className="rounded-[28px] border border-rose-200/80 bg-rose-50/80 p-6 shadow-[0_18px_60px_rgba(24,24,27,0.08)]">
        <p className="text-sm font-semibold text-zinc-950">Zona delicada</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Si esta propiedad ya no sirve, puedes eliminarla del CRM. El sistema soltará su vínculo con leads relacionados para no romper la base de datos, porque bastante drama hay ya en ventas.
        </p>
        <div className="mt-4 max-w-sm">
          <PropertyDeleteButton propertyId={property.id} />
        </div>
      </section>
    </PageShell>
  );
}
