"use client";

import { useActionState } from "react";
import { createAppointmentAction } from "@/app/actions/appointments";

const initialState = { error: "", success: "" };

type Option = { id: string; name: string };

export function LeadQuickAppointmentForm({ leadId, advisors, defaultAdvisorId }: { leadId: string; advisors: Option[]; defaultAdvisorId: string }) {
  const [state, formAction, pending] = useActionState(createAppointmentAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="status" value="SCHEDULED" />
      <div>
        <h3 className="text-base font-semibold text-zinc-950">Nueva cita</h3>
        <p className="text-sm text-zinc-500">Agenda llamada, visita o reunión en contexto.</p>
      </div>
      <input name="title" placeholder="Ej. Llamada de seguimiento" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="scheduledAt" type="datetime-local" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400" />
        <select name="type" defaultValue="CALL" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400">
          <option value="CALL">Llamada</option>
          <option value="MEETING">Reunión</option>
          <option value="VISIT">Visita</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select name="advisorId" defaultValue={defaultAdvisorId} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400">
          {advisors.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        <input name="location" placeholder="Ubicación o enlace" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      </div>
      <textarea name="result" rows={3} placeholder="Contexto o resultado esperado" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear cita"}
      </button>
    </form>
  );
}
