"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createInquiryAction } from "@/app/actions/inquiries";
import { marketOptions, type AppMarket } from "@/lib/markets";
import { trackMarketingEvent } from "@/lib/marketing-client";
import { getTipologyLabel, resolveTipologyInterest } from "@/lib/marketing";

const initialState = { error: "", success: "" };

type ContactFormProps = {
  propertyTitle?: string;
  propertyId?: string;
  compact?: boolean;
  market?: AppMarket;
  interest?: string;
  submitLabel?: string;
  analyticsPage?: string;
  preferredContactLabel?: string;
  preferredContactPlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  formIntro?: string;
};

export function ContactForm({
  propertyTitle,
  propertyId,
  compact = false,
  market,
  interest,
  submitLabel,
  analyticsPage,
  preferredContactLabel,
  preferredContactPlaceholder,
  messageLabel,
  messagePlaceholder,
  formIntro,
}: ContactFormProps) {
  const [state, formAction, pending] = useActionState(createInquiryAction, initialState);
  const hasTrackedSuccessRef = useRef(false);
  const [tipology] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("tipologia"),
  );
  const resolvedTipologyInterest = useMemo(() => resolveTipologyInterest(tipology), [tipology]);
  const effectiveInterest = propertyTitle
    ? "Solicita llamada sobre propiedad"
    : resolvedTipologyInterest || interest;
  const selectedTipologyLabel = useMemo(() => getTipologyLabel(tipology), [tipology]);

  useEffect(() => {
    if (!state?.success || hasTrackedSuccessRef.current) return;

    hasTrackedSuccessRef.current = true;

    void trackMarketingEvent({
      eventName: "lead_form_submit",
      label: selectedTipologyLabel || propertyTitle || "general",
      metadata: {
        hasProperty: Boolean(propertyTitle),
        tipology: tipology || null,
      },
      page: analyticsPage,
    });
  }, [analyticsPage, propertyTitle, selectedTipologyLabel, state?.success, tipology]);

  useEffect(() => {
    if (!state?.success) {
      hasTrackedSuccessRef.current = false;
    }
  }, [state?.success]);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-[1.75rem] border border-[#5f503d]/45 bg-[#1a1511] p-5"
      onSubmit={() => {
        void trackMarketingEvent({
          eventName: "lead_form_start",
          label: selectedTipologyLabel || propertyTitle || "general",
          metadata: {
            hasProperty: Boolean(propertyTitle),
            tipology: tipology || null,
          },
          page: analyticsPage,
        });
      }}
    >
      {propertyTitle ? <input type="hidden" name="propertyTitle" value={propertyTitle} /> : null}
      {propertyId ? <input type="hidden" name="propertyId" value={propertyId} /> : null}
      {market ? <input type="hidden" name="market" value={market} /> : null}
      {effectiveInterest ? <input type="hidden" name="interest" value={effectiveInterest} /> : null}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {selectedTipologyLabel ? (
        <div className="rounded-2xl border border-[#6b5841] bg-[#231c16] px-4 py-3 text-sm text-[#f3e7d6]">
          Interés seleccionado: <span className="font-semibold text-[#d3b184]">{selectedTipologyLabel}</span>
        </div>
      ) : null}
      {formIntro ? (
        <p className="rounded-2xl border border-[#6b5841] bg-[#231c16] px-4 py-3 text-sm leading-7 text-[#eadfce]">
          {formIntro}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" name="fullName" required />
        <Field label="Teléfono" name="phone" required />
        <Field label="Email" name="email" type="email" />
        {!market ? (
          <Select
            label="Mercado de interés"
            name="market"
            defaultValue=""
            options={[
              { value: "", label: "Selecciona una opción" },
              ...marketOptions,
            ]}
          />
        ) : null}
        {!propertyTitle && !effectiveInterest ? (
          <Select
            label="Tipo de interés"
            name="interest"
            defaultValue=""
            options={[
              { value: "", label: "Selecciona una opción" },
              { value: "Compra", label: "Compra" },
              { value: "Inversión", label: "Inversión" },
              { value: "Residencia", label: "Residencia" },
              { value: "Quiero vender mi propiedad", label: "Quiero vender mi propiedad" },
              { value: "Quiero que promocionen mi propiedad", label: "Quiero que promocionen mi propiedad" },
            ]}
          />
        ) : null}
        <Field
          label={preferredContactLabel || "Canal preferido"}
          name="preferredContact"
          placeholder={preferredContactPlaceholder || "WhatsApp, llamada, email..."}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[#eadfce]" htmlFor="message">
          {messageLabel || (propertyTitle ? `Cuéntanos sobre tu interés en ${propertyTitle}` : "Cuéntanos qué estás buscando")}{" "}
          <span className="text-[#a89379]">(opcional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 3 : 4}
          className="w-full rounded-2xl border border-[#6b5841] bg-[#f6efe6] px-4 py-3 text-sm text-[#2b2118] outline-none placeholder:text-[#8a7763] focus:border-[#d3b184]"
          placeholder={
            messagePlaceholder ||
            (propertyTitle
              ? "Horario ideal, presupuesto, dudas sobre la propiedad..."
              : "Zona, presupuesto, si quieres comprar o si buscas que promovamos tu propiedad...")
          }
        />
      </div>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}

      <button disabled={pending} className="inline-flex items-center justify-center bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95] disabled:opacity-60">
        {pending ? "Enviando..." : submitLabel || (propertyTitle ? "Solicitar llamada" : "Solicitar asesoría")}
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
