"use client";

import { useActionState } from "react";
import { deleteLeadAction } from "@/app/actions/leads";

const initialState = { error: "" };

export function LeadDeleteButton({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(deleteLeadAction.bind(null, leadId), initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("¿Seguro que quieres borrar este lead? Esta acción también elimina notas, tareas y citas relacionadas.")) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-stretch gap-2"
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
      >
        {pending ? "Borrando..." : "Borrar lead"}
      </button>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
    </form>
  );
}
