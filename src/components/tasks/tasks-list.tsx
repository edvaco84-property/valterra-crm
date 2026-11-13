import { TaskStatusForm } from "@/components/tasks/task-status-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

const tones = {
  PENDING: "warning",
  IN_PROGRESS: "brand",
  DONE: "success",
  OVERDUE: "danger",
} as const;

type TaskItem = {
  id: string;
  title: string;
  dueAt: Date;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "OVERDUE";
  assigneeId?: string;
  automationSource?: string | null;
  assignee: {
    name: string;
  };
  lead: {
    fullName: string;
  } | null;
};

type Actor = {
  id: string;
  role: string;
};

export function TasksList({ tasks, actor }: { tasks: TaskItem[]; actor?: Actor }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">Tareas del día</h3>
          <p className="text-sm text-zinc-500">Lo que no se sigue, se enfría. Ciencia básica del desastre.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {tasks.length ? tasks.map((task) => (
          <div key={task.id} className="rounded-[24px] border border-zinc-100 bg-white/75 p-4 shadow-sm sm:p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-zinc-950">{task.title}</p>
                    {task.automationSource ? <Badge tone="brand">Automatización</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{task.assignee.name}{task.lead ? ` · ${task.lead.fullName}` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Badge tone={tones[task.status]}>{task.status}</Badge>
                  <span className="text-xs sm:text-sm text-zinc-500">{formatShortDate(task.dueAt.toISOString())}</span>
                </div>
              </div>
              {canUpdateTask(task, actor) ? <TaskStatusForm taskId={task.id} currentStatus={task.status} /> : null}
            </div>
          </div>
        )) : <p className="text-sm text-zinc-500">No hay tareas todavía.</p>}
      </div>
    </Card>
  );
}

function canUpdateTask(task: TaskItem, actor?: Actor) {
  if (!actor) return true;
  if (actor.role === "ADMIN" || actor.role === "COORDINATOR") return true;
  return task.assigneeId === actor.id;
}
