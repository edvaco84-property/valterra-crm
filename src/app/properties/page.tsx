import Link from "next/link";
import { MobilePanel } from "@/components/mobile/mobile-panel";
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
      <div className="flex flex-col gap-4 rounded-[30px] border border-white/10 bg-white/8 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/90">Propiedades</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Inventario premium</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-300">Aquí decides cuáles se quedan internas, cuáles salen a la web y cuáles apartas para portales pagados sin subir todo el inventario como si sobrara el dinero.</p>
        </div>
        {hasPermission(user.role, permissions.manageProperties) ? (
          <>
            <div className="hidden md:block">
              <Link href="/properties/new" className="inline-flex items-center justify-center rounded-2xl bg-[#1a1817] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(26,24,23,0.22)] transition hover:bg-[#26211f]">
                Nueva propiedad
              </Link>
            </div>
            <div className="md:hidden">
              <MobilePanel title="Acciones" description="Muestra sólo las acciones que sí vas a usar." buttonLabel="Acciones">
                <div className="rounded-[28px] border border-white/60 bg-white/82 p-4 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl">
                  <Link href="/properties/new" className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#1a1817] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(26,24,23,0.22)] transition hover:bg-[#26211f]">
                    Nueva propiedad
                  </Link>
                </div>
              </MobilePanel>
            </div>
          </>
        ) : null}
      </div>
      <PropertiesGrid properties={properties} />
    </PageShell>
  );
}
