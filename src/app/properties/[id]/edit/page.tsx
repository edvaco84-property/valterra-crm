import { notFound } from "next/navigation";
import { PageShell } from "@/components/shared/page-shell";
import { PropertyForm } from "@/components/forms/property-form";
import { permissions, requireRole } from "@/lib/permissions";
import { getPropertyById } from "@/lib/properties/queries";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(permissions.manageProperties);
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <PageShell>
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Propiedades</p>
        <h1 className="text-3xl font-semibold text-zinc-950">Editar · {property.title}</h1>
        <p className="text-sm text-zinc-600">Actualiza datos, publicación e imágenes de la propiedad.</p>
      </section>
      <PropertyForm property={property} />
    </PageShell>
  );
}
