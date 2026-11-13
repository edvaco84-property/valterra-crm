"use client";

import { useActionState } from "react";
import { createLeadAction, updateLeadAction } from "@/app/actions/leads";
import { inputClassName, primaryButtonClassName, selectClassName, textareaClassName } from "@/lib/utils";
import { leadStageOptions, leadStatusOptions, marketOptions } from "@/lib/leads/constants";

type AdvisorOption = {
  id: string;
  name: string;
  role: string;
  market: string;
};

type LeadValues = {
  id?: string;
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
  market?: string;
  zone?: string;
  stage?: string;
  status?: string;
  nextAction?: string;
  nextActionAt?: string | null;
  assignedToId?: string;
  developmentId?: string | null;
  propertyId?: string | null;
  propertyInterest?: string | null;
  profile?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
};

type Actor = {
  id: string;
  role: string;
  market: string;
};

type DevelopmentOption = {
  id: string;
  title: string;
  market: string;
  zone: string;
  status: string;
};

type PropertyOption = {
  id: string;
  title: string;
  unitCode: string | null;
  unitType: string | null;
  market: string;
  development: {
    id: string;
    title: string;
  } | null;
};

const initialState = { error: "" };

export function LeadForm({
  advisors,
  developments,
  properties,
  lead,
  actor,
}: {
  advisors: AdvisorOption[];
  developments: DevelopmentOption[];
  properties: PropertyOption[];
  lead?: LeadValues;
  actor: Actor;
}) {
  const action = lead?.id ? updateLeadAction.bind(null, lead.id) : createLeadAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const canReassign = actor.role !== "ADVISOR";

  return (
    <form action={formAction} className="space-y-6 rounded-[28px] border border-white/60 bg-white/82 p-6 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre completo" name="fullName" defaultValue={lead?.fullName} required />
        <Field label="Fuente" name="source" defaultValue={lead?.source} required />
        <Field label="Email" name="email" type="email" defaultValue={lead?.email ?? ""} />
        <Field label="Teléfono" name="phone" defaultValue={lead?.phone ?? ""} />
        <Select label="Mercado" name="market" defaultValue={lead?.market ?? "CDMX"} options={marketOptions} />
        <Field label="Zona" name="zone" defaultValue={lead?.zone} required />
        <Select label="Etapa" name="stage" defaultValue={lead?.stage ?? "Nuevo lead"} options={leadStageOptions.map((value) => ({ value, label: value }))} />
        <Select label="Estatus" name="status" defaultValue={lead?.status ?? "ACTIVE"} options={leadStatusOptions} />
        <Field label="Próxima acción" name="nextAction" defaultValue={lead?.nextAction} required />
        <Field label="Fecha próxima acción" name="nextActionAt" type="datetime-local" defaultValue={lead?.nextActionAt ?? ""} />
        <Field label="Presupuesto mínimo" name="budgetMin" type="number" defaultValue={lead?.budgetMin?.toString() ?? ""} />
        <Field label="Presupuesto máximo" name="budgetMax" type="number" defaultValue={lead?.budgetMax?.toString() ?? ""} />
        <Select
          label="Desarrollo"
          name="developmentId"
          defaultValue={lead?.developmentId ?? ""}
          options={[
            { value: "", label: "Sin desarrollo ligado" },
            ...developments.map((development) => ({
              value: development.id,
              label: `${development.title} · ${development.zone}`,
            })),
          ]}
        />
        <Select
          label="Unidad específica"
          name="propertyId"
          defaultValue={lead?.propertyId ?? ""}
          options={[
            { value: "", label: "Sin unidad específica" },
            ...properties.map((property) => ({
              value: property.id,
              label: [
                property.development?.title,
                property.unitCode,
                property.unitType ?? property.title,
              ].filter(Boolean).join(" · "),
            })),
          ]}
        />
        <Field label="Interés de propiedad" name="propertyInterest" defaultValue={lead?.propertyInterest ?? ""} />
        {canReassign ? (
          <Select
            label="Asesor asignado"
            name="assignedToId"
            defaultValue={lead?.assignedToId ?? advisors[0]?.id ?? actor.id}
            options={advisors.map((advisor) => ({ value: advisor.id, label: `${advisor.name} · ${advisor.market}` }))}
          />
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="assignedToId">Asesor asignado</label>
            <input type="hidden" name="assignedToId" value={actor.id} />
            <div className="rounded-2xl border border-zinc-200/90 bg-white/70 px-4 py-3 text-sm text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">{advisors[0]?.name ?? "Tú"} · {actor.market}</div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="profile">Perfil comercial</label>
        <textarea id="profile" name="profile" defaultValue={lead?.profile ?? ""} rows={4} className={textareaClassName} placeholder="Motivación, contexto, perfil de inversión..." />
      </div>
      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button disabled={pending} className={primaryButtonClassName}>
        {pending ? "Guardando..." : lead?.id ? "Guardar cambios" : "Crear lead"}
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue} className={inputClassName} />
    </div>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: ReadonlyArray<{ value: string; label: string }>; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className={selectClassName}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
