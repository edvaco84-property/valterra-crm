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
      <div className="rounded-[30px] border border-white/10 bg-white/8 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/90">Leads</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Gestión de oportunidades</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Consulta, filtra y prioriza oportunidades con contexto comercial y próxima acción.</p>
      </div>
      <LeadsFilters query={params.q} market={params.market} status={params.status} assignedToId={params.assignedToId} />
      <LeadsTable leads={leads} />
    </PageShell>
  );
}
