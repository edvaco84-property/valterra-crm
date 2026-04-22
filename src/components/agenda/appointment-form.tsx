"use client";

import { useActionState } from "react";
import { createAppointmentAction } from "@/app/actions/appointments";

const initialState = { error: "", success: "" };

type Option = { id: string; name: string };

export function AppointmentForm({ leads, advisors }: { leads: Option[]; advisors: Option[] }) {
  const [state, formAction, pending] = useActionState(createAppointmentAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-zinc-950">Nueva cita</h3>
        <p className="text-sm text-zinc-500">Agenda llamadas, visitas o reuniones sin improvisar de más.</p>
      </div>
      <Field label="Título" name="title" required />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Fecha y hora" name="scheduledAt" type="datetime-local" required />
        <Select label="Tipo" name="type" options={[{ id: "CALL", name: "Llamada" }, { id: "MEETING", name: "Reunión" }, { id: "VISIT", name: "Visita" }]} />
        <Select label="Asesor" name="advisorId" options={advisors} />
        <Select label="Lead relacionado" name="leadId" options={[{ id: "", name: "Sin lead" }, ...leads]} />
        <Select label="Estatus" name="status" options={[{ id: "SCHEDULED", name: "Agendada" }, { id: "COMPLETED", name: "Completada" }, { id: "CANCELED", name: "Cancelada" }]} />
        <Field label="Ubicación" name="location" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="result">Resultado / notas</label>
        <textarea id="result" name="result" rows={3} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-5 py-3 font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear cita"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: { id: string; name: string }[] }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <select id={name} name={name} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
        {options.map((option) => (
          <option key={`${name}-${option.id}-${option.name}`} value={option.id}>{option.name}</option>
        ))}
      </select>
    </div>
  );
}
