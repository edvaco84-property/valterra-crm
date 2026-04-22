"use client";

import { useActionState } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";

const initialState = { error: "", success: "" };

export function AppointmentStatusForm({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: "SCHEDULED" | "COMPLETED" | "CANCELED" }) {
  const action = updateAppointmentStatusAction.bind(null, appointmentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select name="status" defaultValue={currentStatus} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400">
        <option value="SCHEDULED">Agendada</option>
        <option value="COMPLETED">Completada</option>
        <option value="CANCELED">Cancelada</option>
      </select>
      <button disabled={pending} className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Actualizar"}
      </button>
      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
    </form>
  );
}
