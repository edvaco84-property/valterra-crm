import { redirect } from "next/navigation";
import { AgendaList } from "@/components/agenda/agenda-list";
import { AdvisorPerformance } from "@/components/dashboard/advisor-performance";
import { StaleLeadsAlert } from "@/components/dashboard/stale-leads-alert";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { LeadsTable } from "@/components/leads/leads-table";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { PropertiesGrid } from "@/components/properties/properties-grid";
import { PageShell } from "@/components/shared/page-shell";
import { TasksList } from "@/components/tasks/tasks-list";
import { getSessionUser } from "@/lib/auth/session";
import { getAdvisorPerformance, getDashboardStats, getStaleLeadAlerts, getTasksList, getAppointmentsList, getPipelineColumns } from "@/lib/dashboard/queries";
import { getLeadList } from "@/lib/leads/queries";
import { getPropertyList } from "@/lib/properties/queries";

export default async function CrmHome() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const [leads, properties, stats, tasks, appointments, pipelineColumns, advisorPerformance, staleLeadAlerts] = await Promise.all([
    getLeadList({ actor: user }),
    getPropertyList(),
    getDashboardStats(user),
    getTasksList(user),
    getAppointmentsList(user),
    getPipelineColumns(user),
    getAdvisorPerformance(user),
    getStaleLeadAlerts(user),
  ]);

  return (
    <PageShell>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Vista general</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Tablero operativo Valterra</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Un solo lugar para leads, propiedades, seguimiento y agenda. Porque operar ventas premium en WhatsApp y memoria humana es una receta preciosa para el caos.
            </p>
          </div>
          <StatsGrid stats={stats} />
          <StaleLeadsAlert leads={staleLeadAlerts} />
          <LeadsTable leads={leads} />
        </div>
        <div className="space-y-6">
          <TasksList tasks={tasks} actor={user} />
          <AgendaList appointments={appointments} actor={user} />
        </div>
      </section>
      {advisorPerformance.length ? (
        <section className="space-y-4">
          <AdvisorPerformance advisors={advisorPerformance} />
        </section>
      ) : null}
      {user.role !== "ADVISOR" ? (
        <section className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Pipeline</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Etapas comerciales</h2>
          </div>
          <PipelineBoard columns={pipelineColumns} />
        </section>
      ) : null}
      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Inventario</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Propiedades destacadas</h2>
        </div>
        <PropertiesGrid properties={properties.slice(0, 3)} />
      </section>
    </PageShell>
  );
}
