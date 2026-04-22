"use client";

import { useActionState } from "react";
import { createTeamMemberAction } from "@/app/actions/team";

const initialState = { error: "" };

export function TeamCreateForm() {
  const [state, formAction, pending] = useActionState(createTeamMemberAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Alta de broker</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Agregar integrante</h2>
      </div>
      <Field label="Nombre" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Contraseña inicial" name="password" type="password" required />
      <Select label="Rol" name="role" defaultValue="ADVISOR" options={[{ value: "ADVISOR", label: "Advisor" }, { value: "COORDINATOR", label: "Coordinator" }, { value: "ADMIN", label: "Admin" }]} />
      <Select label="Mercado" name="market" defaultValue="CDMX" options={[{ value: "CDMX", label: "CDMX" }, { value: "RIVIERA_MAYA", label: "Riviera Maya" }]} />
      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear broker"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400" />
    </div>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: Array<{ value: string; label: string }>; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
