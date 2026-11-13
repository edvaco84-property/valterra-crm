"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteTeamMemberAction, updateTeamMemberAction } from "@/app/actions/team";
import { marketOptions, type AppMarket } from "@/lib/markets";
import { inputClassName, secondaryButtonClassName, selectClassName, toTelHref, toWhatsAppHref } from "@/lib/utils";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "COORDINATOR" | "ADVISOR";
  market: AppMarket;
  active: boolean;
};

const initialState = { error: "" };

export function TeamTable({ members }: { members: TeamMember[] }) {
  return (
    <div className="space-y-4 rounded-[28px] border border-white/60 bg-white/82 p-6 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl">
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
  const deleteAction = deleteTeamMemberAction.bind(null, member.id);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, initialState);
  const canDelete = member.role !== "ADMIN";
  const errorMessage = state?.error || deleteState?.error;
  const whatsappHref = toWhatsAppHref(member.phone, `Hola ${member.name}, te contacto desde Valterra.`);
  const telHref = toTelHref(member.phone);

  return (
    <div className="rounded-[1.6rem] border border-zinc-200/90 bg-white/72 p-5 shadow-sm">
      <form action={formAction}>
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
            <p className="mt-1 text-sm text-zinc-500">{member.phone || "Sin teléfono"}</p>
            {member.phone ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {whatsappHref ? (
                  <Link href={whatsappHref} target="_blank" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    WhatsApp
                  </Link>
                ) : null}
                {telHref ? (
                  <Link href={telHref} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700">
                    Llamar
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          <label className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200/90 bg-white/88 px-4 py-3 text-sm text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <input type="checkbox" name="active" defaultChecked={member.active} className="h-4 w-4" />
            Acceso activo
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 text-sm text-zinc-700">
            <span>Rol</span>
            <select name="role" defaultValue={member.role} className={selectClassName}>
              <option value="ADVISOR">Advisor</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-zinc-700">
            <span>Mercado</span>
            <select name="market" defaultValue={member.market} className={selectClassName}>
              {marketOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-zinc-700">
            <span>Teléfono</span>
            <input name="phone" type="tel" defaultValue={member.phone ?? ""} placeholder="+52 ..." className={inputClassName} />
          </label>

          <label className="space-y-2 text-sm text-zinc-700 md:col-span-2 xl:col-span-3">
            <span>Nueva contraseña (opcional)</span>
            <input name="password" type="password" placeholder="Solo si la quieres resetear" className={inputClassName} />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : (
            <p className="text-sm text-zinc-400">Actualiza rol, acceso, mercado o credenciales del broker.</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button disabled={pending} className={`${secondaryButtonClassName} disabled:opacity-60`}>
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>

      {canDelete ? (
        <form
          action={deleteFormAction}
          className="mt-3 flex justify-end"
          onSubmit={(event) => {
            if (!window.confirm(`¿Seguro que quieres borrar a ${member.name}?`)) {
              event.preventDefault();
            }
          }}
        >
          <button disabled={deletePending} className="rounded-2xl border border-rose-200 bg-white/88 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-60">
            {deletePending ? "Borrando..." : "Borrar broker"}
          </button>
        </form>
      ) : null}
    </div>
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
