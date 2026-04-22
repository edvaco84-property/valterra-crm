"use client";

import { useActionState } from "react";
import { updateLeadPipelineAction } from "@/app/actions/leads";

const initialState = { error: "", success: "" };

const stageOptions = [
  "Nuevo",
  "Perfilado",
  "Propiedad enviada",
  "Visita agendada",
  "Negociación",
  "Cierre",
  "Postventa",
] as const;

const statusOptions = [
  { value: "ACTIVE", label: "Activo" },
  { value: "REACTIVATED", label: "Reactivado" },
  { value: "WON", label: "Ganado" },
  { value: "LOST", label: "Perdido" },
] as const;

export function PipelineStageForm({
  leadId,
  stage,
  status,
}: {
  leadId: string;
  stage: string;
  status: "ACTIVE" | "REACTIVATED" | "WON" | "LOST";
}) {
  const action = updateLeadPipelineAction.bind(null, leadId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
      <select name="stage" defaultValue={stage} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400">
        {stageOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      <select name="status" defaultValue={status} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400">
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-emerald-600">{state.success}</p> : null}

      <button disabled={pending} className="w-full rounded-xl bg-[#1a1817] px-3 py-2 text-xs font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Actualizar"}
      </button>
    </form>
  );
}
