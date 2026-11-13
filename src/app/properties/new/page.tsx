import { PropertyForm } from "@/components/forms/property-form";
import { PageShell } from "@/components/shared/page-shell";
import { permissions, requireRole } from "@/lib/permissions";
import { getDevelopmentOptions } from "@/lib/properties/queries";

export default async function NewPropertyPage() {
  await requireRole(permissions.manageProperties);
  const developments = await getDevelopmentOptions();

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Nueva propiedad</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Alta de inventario</h1>
        <p className="mt-2 text-sm text-zinc-600">Crea la propiedad y decide si va a la web, se queda interna o se aparta para portales de pago como Inmuebles24.</p>
      </div>
      <PropertyForm developments={developments} />
    </PageShell>
  );
}
