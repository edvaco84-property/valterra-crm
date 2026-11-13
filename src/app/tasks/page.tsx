import { MobilePanel } from "@/components/mobile/mobile-panel";
import { TaskForm } from "@/components/tasks/task-form";
import { TasksList } from "@/components/tasks/tasks-list";
import { PageShell } from "@/components/shared/page-shell";
import { requireSessionUser } from "@/lib/auth/session";
import { getTasksList } from "@/lib/dashboard/queries";
import { getAdvisors, getLeadOptions } from "@/lib/leads/queries";

export default async function TasksPage() {
  const user = await requireSessionUser();
  const [tasks, advisors, leads] = await Promise.all([
    getTasksList(user),
    getAdvisors(user),
    getLeadOptions(user),
  ]);

  return (
    <PageShell>
      <div className="rounded-[30px] border border-white/10 bg-white/8 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/90">Tareas</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Seguimiento diario</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Lista operativa real para llamadas, follow-ups y pendientes críticos.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <MobilePanel title="Nueva tarea" description="Abre el formulario sólo cuando vayas a capturar algo." buttonLabel="Nueva tarea">
          <TaskForm
            assignees={advisors.map((advisor) => ({ id: advisor.id, name: advisor.name }))}
            leads={leads.map((lead) => ({ id: lead.id, name: lead.fullName }))}
          />
        </MobilePanel>
        <TasksList tasks={tasks} actor={user} />
      </section>
    </PageShell>
  );
}
