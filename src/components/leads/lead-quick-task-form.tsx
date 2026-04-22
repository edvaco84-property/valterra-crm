"use client";

import { useActionState } from "react";
import { createTaskAction } from "@/app/actions/tasks";

const initialState = { error: "", success: "" };

type Option = { id: string; name: string };

export function LeadQuickTaskForm({ leadId, assignees, defaultAssigneeId }: { leadId: string; assignees: Option[]; defaultAssigneeId: string }) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="status" value="PENDING" />
      <div>
        <h3 className="text-base font-semibold text-zinc-950">Nueva tarea</h3>
        <p className="text-sm text-zinc-500">Crea seguimiento sin salir de la ficha del lead.</p>
      </div>
      <input name="title" placeholder="Ej. Enviar comparativo premium" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="dueAt" type="datetime-local" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400" />
        <select name="assigneeId" defaultValue={defaultAssigneeId} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400">
          {assignees.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
      </div>
      <textarea name="description" rows={3} placeholder="Detalle corto de la tarea" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear tarea"}
      </button>
    </form>
  );
}
