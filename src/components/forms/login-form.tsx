"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

const initialState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" placeholder="boss@valterra.mx" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" placeholder="••••••••" />
      </div>
      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button disabled={pending} className="w-full rounded-2xl bg-[#1a1817] px-4 py-3 font-medium text-white disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
