"use client";

import { useActionState } from "react";
import { updateTaskStatusAction } from "@/app/actions/tasks";

const initialState = { error: "", success: "" };

export function TaskStatusForm({ taskId, currentStatus }: { taskId: string; currentStatus: "PENDING" | "IN_PROGRESS" | "DONE" | "OVERDUE" }) {
  const action = updateTaskStatusAction.bind(null, taskId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select name="status" defaultValue={currentStatus} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400">
        <option value="PENDING">Pendiente</option>
        <option value="IN_PROGRESS">En progreso</option>
        <option value="DONE">Hecha</option>
        <option value="OVERDUE">Vencida</option>
      </select>
      <button disabled={pending} className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Actualizar"}
      </button>
      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
    </form>
  );
}
