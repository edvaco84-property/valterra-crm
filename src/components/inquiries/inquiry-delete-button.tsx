"use client";

import { useActionState } from "react";
import { deleteInquiryAction } from "@/app/actions/inquiries";

const initialState = { error: "" };

export function InquiryDeleteButton({ inquiryId }: { inquiryId: string }) {
  const [state, formAction, pending] = useActionState(deleteInquiryAction.bind(null, inquiryId), initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("¿Seguro que quieres borrar este mensaje del inbox web? El lead creado en CRM se conserva.")) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-2"
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
      >
        {pending ? "Borrando..." : "Eliminar mensaje"}
      </button>
      {state.error ? <p className="max-w-56 text-right text-xs text-rose-600">{state.error}</p> : null}
    </form>
  );
}
