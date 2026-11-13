"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { inputClassName, primaryButtonClassName } from "@/lib/utils";

const initialState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className={inputClassName} placeholder="correo@valterra.mx" autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" className={inputClassName} placeholder="••••••••" autoComplete="current-password" />
      </div>
      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button disabled={pending} className={`${primaryButtonClassName} w-full`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
