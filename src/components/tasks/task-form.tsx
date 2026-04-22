"use client";

import { useActionState } from "react";
import { createTaskAction } from "@/app/actions/tasks";

const initialState = { error: "", success: "" };

type Option = { id: string; name: string };

export function TaskForm({ leads, assignees }: { leads: Option[]; assignees: Option[] }) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-zinc-950">Nueva tarea</h3>
        <p className="text-sm text-zinc-500">Crea seguimiento operativo sin depender de memoria heroica.</p>
      </div>
      <Field label="Título" name="title" required />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Fecha límite" name="dueAt" type="datetime-local" required />
        <Select label="Responsable" name="assigneeId" options={assignees} />
        <Select label="Lead relacionado" name="leadId" options={[{ id: "", name: "Sin lead" }, ...leads]} />
        <Select label="Estatus" name="status" options={[{ id: "PENDING", name: "Pendiente" }, { id: "IN_PROGRESS", name: "En progreso" }, { id: "DONE", name: "Hecha" }, { id: "OVERDUE", name: "Vencida" }]} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="description">Descripción</label>
        <textarea id="description" name="description" rows={3} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-5 py-3 font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear tarea"}
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
