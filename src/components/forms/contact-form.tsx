"use client";

import { useActionState } from "react";
import { createInquiryAction } from "@/app/actions/inquiries";

const initialState = { error: "", success: "" };

export function ContactForm({ propertyTitle, compact = false }: { propertyTitle?: string; compact?: boolean }) {
  const [state, formAction, pending] = useActionState(createInquiryAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-[1.75rem] border border-[#5f503d]/45 bg-[#1a1511] p-5">
      {propertyTitle ? <input type="hidden" name="propertyTitle" value={propertyTitle} /> : null}
      {propertyTitle ? <input type="hidden" name="interest" value="Solicita llamada sobre propiedad" /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" name="fullName" required />
        <Field label="Teléfono" name="phone" required />
        <Field label="Email" name="email" type="email" />
        <Select
          label="Mercado de interés"
          name="market"
          defaultValue=""
          options={[
            { value: "", label: "Selecciona una opción" },
            { value: "CDMX", label: "CDMX" },
            { value: "RIVIERA_MAYA", label: "Riviera Maya" },
          ]}
        />
        {!propertyTitle ? <Field label="Tipo de interés" name="interest" placeholder="Compra, inversión, residencia..." /> : null}
        <Field label="Canal preferido" name="preferredContact" placeholder="WhatsApp, llamada, email..." />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[#eadfce]" htmlFor="message">{propertyTitle ? `Cuéntanos sobre tu interés en ${propertyTitle}` : "Cuéntanos qué estás buscando"}</label>
        <textarea id="message" name="message" rows={compact ? 3 : 4} className="w-full rounded-2xl border border-[#6b5841] bg-[#f6efe6] px-4 py-3 text-sm text-[#2b2118] outline-none placeholder:text-[#8a7763] focus:border-[#d3b184]" placeholder={propertyTitle ? "Horario ideal, presupuesto, dudas sobre la propiedad..." : "Zona, presupuesto, tipo de propiedad, timing..."} />
      </div>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

      <button disabled={pending} className="inline-flex items-center justify-center bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95] disabled:opacity-60">
        {pending ? "Enviando..." : propertyTitle ? "Solicitar llamada" : "Solicitar asesoría"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-[#eadfce]" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-[#6b5841] bg-[#f6efe6] px-4 py-3 text-sm text-[#2b2118] outline-none placeholder:text-[#8a7763] focus:border-[#d3b184]" />
    </div>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: ReadonlyArray<{ value: string; label: string }>; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-[#eadfce]" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-[#6b5841] bg-[#f6efe6] px-4 py-3 text-sm text-[#2b2118] outline-none focus:border-[#d3b184]">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
