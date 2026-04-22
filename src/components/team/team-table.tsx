"use client";

import { useActionState } from "react";
import { updateTeamMemberAction } from "@/app/actions/team";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COORDINATOR" | "ADVISOR";
  market: "CDMX" | "RIVIERA_MAYA";
  active: boolean;
};

const initialState = { error: "" };

export function TeamTable({ members }: { members: TeamMember[] }) {
  return (
    <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Equipo</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Usuarios del CRM</h2>
      </div>
      <div className="space-y-4">
        {members.map((member) => (
          <TeamMemberRow key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

function TeamMemberRow({ member }: { member: TeamMember }) {
  const action = updateTeamMemberAction.bind(null, member.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-[1.6rem] border border-zinc-200 bg-zinc-50/60 p-5">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg font-semibold text-zinc-950">{member.name}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${member.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-600"}`}>
              {member.active ? "Activo" : "Inactivo"}
            </span>
            <span className="rounded-full bg-[#efe3d3] px-3 py-1 text-xs font-medium text-[#7a5a36]">
              {formatRole(member.role)}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">{member.email}</p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
          <input type="checkbox" name="active" defaultChecked={member.active} className="h-4 w-4" />
          Acceso activo
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2 text-sm text-zinc-700">
          <span>Rol</span>
          <select name="role" defaultValue={member.role} className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
            <option value="ADVISOR">Advisor</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-zinc-700">
          <span>Mercado</span>
          <select name="market" defaultValue={member.market} className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
            <option value="CDMX">CDMX</option>
            <option value="RIVIERA_MAYA">Riviera Maya</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-zinc-700 md:col-span-2 xl:col-span-1">
          <span>Nueva contraseña (opcional)</span>
          <input name="password" type="password" placeholder="Solo si la quieres resetear" className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : <p className="text-sm text-zinc-400">Actualiza rol, acceso o credenciales del broker.</p>}
        <button disabled={pending} className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 disabled:opacity-60">
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function formatRole(role: TeamMember["role"]) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "COORDINATOR":
      return "Coordinator";
    default:
      return "Advisor";
  }
}
