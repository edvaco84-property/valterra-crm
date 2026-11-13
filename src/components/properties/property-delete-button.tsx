"use client";

import { useActionState } from "react";
import { deletePropertyAction } from "@/app/actions/properties";

const initialState = { error: "" };

export function PropertyDeleteButton({ propertyId }: { propertyId: string }) {
  const [state, formAction, pending] = useActionState(deletePropertyAction.bind(null, propertyId), initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("¿Seguro que quieres borrar esta propiedad? También se quitará su vínculo con leads y publicaciones relacionadas.")) {
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
        {pending ? "Borrando..." : "Eliminar propiedad"}
      </button>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
    </form>
  );
}
