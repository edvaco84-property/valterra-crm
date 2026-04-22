import { LeadsFilters } from "@/components/leads/leads-filters";
import { PageShell } from "@/components/shared/page-shell";
import { LeadsTable } from "@/components/leads/leads-table";
import { requireSessionUser } from "@/lib/auth/session";
import { getLeadList } from "@/lib/leads/queries";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; market?: string; status?: string; assignedToId?: string }>;
}) {
  const user = await requireSessionUser();
  const params = await searchParams;
  const leads = await getLeadList({
    query: params.q,
    market: params.market,
    status: params.status,
    assignedToId: params.assignedToId,
    actor: user,
  });

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Leads</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Gestión de oportunidades</h1>
        <p className="mt-2 text-sm text-zinc-600">Ahora sí, con lectura real desde Prisma en lugar de humo decorativo.</p>
      </div>
      <LeadsFilters query={params.q} market={params.market} status={params.status} assignedToId={params.assignedToId} />
      <LeadsTable leads={leads} />
    </PageShell>
  );
}
