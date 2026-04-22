import { ReportsAdvisorsTable } from "@/components/reports/reports-advisors-table";
import { ReportsAutomation } from "@/components/reports/reports-automation";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportsFunnel } from "@/components/reports/reports-funnel";
import { ReportsSources } from "@/components/reports/reports-sources";
import { ReportsSummary } from "@/components/reports/reports-summary";
import { PageShell } from "@/components/shared/page-shell";
import { getReportsSnapshot } from "@/lib/dashboard/queries";
import { leadStageOptions } from "@/lib/leads/constants";
import { getAdvisors, getLeadList } from "@/lib/leads/queries";
import { permissions, requireRole } from "@/lib/permissions";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; market?: string; stage?: string; assignedToId?: string; source?: string }>;
}) {
  const user = await requireRole(permissions.viewReports);
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const [snapshot, advisors, leads] = await Promise.all([
    getReportsSnapshot(days, {
      market: params.market,
      stage: params.stage,
      assignedToId: params.assignedToId,
      source: params.source,
    }),
    getAdvisors(user),
    getLeadList({ actor: user }),
  ]);

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Reportes</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">KPIs ejecutivos por periodo</h1>
        <p className="mt-2 text-sm text-zinc-600">Lectura real de actividad comercial, conversión y carga por broker en una ventana de tiempo útil.</p>
      </div>
      <ReportsFilters
        days={days}
        market={params.market}
        stage={params.stage}
        assignedToId={params.assignedToId}
        source={params.source}
        advisorOptions={advisors.map((advisor) => ({ value: advisor.id, label: advisor.name }))}
        stageOptions={leadStageOptions.map((stage) => ({ value: stage, label: stage }))}
        sourceOptions={Array.from(new Set(leads.map((lead) => lead.source))).map((source) => ({ value: source, label: source }))}
      />
      <ReportsSummary snapshot={snapshot} />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ReportsFunnel items={snapshot.funnel} />
        <ReportsSources items={snapshot.sourceBreakdown} />
      </section>
      <ReportsAutomation snapshot={snapshot.automation} />
      <ReportsAdvisorsTable advisors={snapshot.advisors} days={days} />
    </PageShell>
  );
}
