"use client";

import { useActionState } from "react";
import { createLeadNoteAction } from "@/app/actions/notes";

const initialState = { error: "", success: "" };

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(createLeadNoteAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="leadId" value={leadId} />
      <div>
        <h3 className="text-base font-semibold text-zinc-950">Nueva nota</h3>
        <p className="text-sm text-zinc-500">Guarda contexto mientras todavía está fresco y no cuando ya nadie se acuerda.</p>
      </div>
      <textarea
        name="body"
        rows={4}
        placeholder="Ej. Le interesa cerrar este mes, prioriza unidades con terraza y financiamiento."
        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
      />
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Guardar nota"}
      </button>
    </form>
  );
}
