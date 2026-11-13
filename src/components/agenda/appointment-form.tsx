"use client";

import { useActionState } from "react";
import { createAppointmentAction } from "@/app/actions/appointments";
import { inputClassName, primaryButtonClassName, selectClassName, textareaClassName } from "@/lib/utils";

const initialState = { error: "", success: "" };

type Option = { id: string; name: string };

export function AppointmentForm({ leads, advisors }: { leads: Option[]; advisors: Option[] }) {
  const [state, formAction, pending] = useActionState(createAppointmentAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-[28px] border border-white/60 bg-white/82 p-5 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl">
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
        <textarea id="result" name="result" rows={3} className={textareaClassName} />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
      <button disabled={pending} className={primaryButtonClassName}>
        {pending ? "Guardando..." : "Crear cita"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className={inputClassName} />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: { id: string; name: string }[] }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <select id={name} name={name} className={selectClassName}>
        {options.map((option) => (
          <option key={`${name}-${option.id}-${option.name}`} value={option.id}>{option.name}</option>
        ))}
      </select>
    </div>
  );
}
