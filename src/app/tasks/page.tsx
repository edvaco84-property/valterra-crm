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
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Tareas</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Seguimiento diario</h1>
        <p className="mt-2 text-sm text-zinc-600">Lista operativa real para llamadas, follow-ups y pendientes críticos.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TaskForm
          assignees={advisors.map((advisor) => ({ id: advisor.id, name: advisor.name }))}
          leads={leads.map((lead) => ({ id: lead.id, name: lead.fullName }))}
        />
        <TasksList tasks={tasks} actor={user} />
      </section>
    </PageShell>
  );
}
