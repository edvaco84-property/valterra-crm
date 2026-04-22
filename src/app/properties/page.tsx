import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { PropertiesGrid } from "@/components/properties/properties-grid";
import { requireSessionUser } from "@/lib/auth/session";
import { hasPermission, permissions } from "@/lib/permissions";
import { getPropertyList } from "@/lib/properties/queries";

export default async function PropertiesPage() {
  const user = await requireSessionUser();
  const properties = await getPropertyList();

  return (
    <PageShell>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Propiedades</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Inventario premium</h1>
          <p className="mt-2 text-sm text-zinc-600">Aquí decides cuáles se quedan internas y cuáles salen publicadas a la web.</p>
        </div>
        {hasPermission(user.role, permissions.manageProperties) ? (
          <Link href="/properties/new" className="inline-flex items-center justify-center rounded-2xl bg-[#1a1817] px-5 py-3 text-sm font-medium text-white">
            Nueva propiedad
          </Link>
        ) : null}
      </div>
      <PropertiesGrid properties={properties} />
    </PageShell>
  );
}
