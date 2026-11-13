"use client";

import { useActionState } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { primaryButtonClassName, selectClassName } from "@/lib/utils";

const initialState = { error: "", success: "" };

export function AppointmentStatusForm({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: "SCHEDULED" | "COMPLETED" | "CANCELED" }) {
  const action = updateAppointmentStatusAction.bind(null, appointmentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <select name="status" defaultValue={currentStatus} className={`${selectClassName} min-h-11 text-sm sm:w-auto`}>
        <option value="SCHEDULED">Agendada</option>
        <option value="COMPLETED">Completada</option>
        <option value="CANCELED">Cancelada</option>
      </select>
      <button disabled={pending} className={`${primaryButtonClassName} min-h-11 px-4 text-sm sm:w-auto`}>
        {pending ? "Guardando..." : "Actualizar"}
      </button>
      {state.error ? <p className="text-xs text-rose-600 sm:basis-full">{state.error}</p> : null}
    </form>
  );
}
