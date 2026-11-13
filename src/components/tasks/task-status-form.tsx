"use client";

import { useActionState } from "react";
import { updateTaskStatusAction } from "@/app/actions/tasks";
import { primaryButtonClassName, selectClassName } from "@/lib/utils";

const initialState = { error: "", success: "" };

export function TaskStatusForm({ taskId, currentStatus }: { taskId: string; currentStatus: "PENDING" | "IN_PROGRESS" | "DONE" | "OVERDUE" }) {
  const action = updateTaskStatusAction.bind(null, taskId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <select name="status" defaultValue={currentStatus} className={`${selectClassName} min-h-11 text-sm sm:w-auto`}>
        <option value="PENDING">Pendiente</option>
        <option value="IN_PROGRESS">En progreso</option>
        <option value="DONE">Hecha</option>
        <option value="OVERDUE">Vencida</option>
      </select>
      <button disabled={pending} className={`${primaryButtonClassName} min-h-11 px-4 text-sm sm:w-auto`}>
        {pending ? "Guardando..." : "Actualizar"}
      </button>
      {state.error ? <p className="text-xs text-rose-600 sm:basis-full">{state.error}</p> : null}
    </form>
  );
}
