"use client";

import { useActionState } from "react";
import { publishPropertyToSocialAction } from "@/app/actions/properties";
import { primaryButtonClassName, secondaryButtonClassName } from "@/lib/utils";

type PublicationItem = {
  channel: "WEBSITE" | "INMUEBLES24" | "FACEBOOK" | "INSTAGRAM";
  isEnabled: boolean;
  status: "DRAFT" | "READY" | "PUBLISHED" | "PAUSED" | "ERROR";
  externalUrl?: string | null;
  syncNotes?: string | null;
  lastSyncedAt?: string | Date | null;
};

type PanelState = {
  error: string;
  success: string;
};

const initialState: PanelState = { error: "", success: "" };

function getStatusLabel(status: PublicationItem["status"]) {
  return status === "READY" ? "Lista para publicar" : status === "PUBLISHED" ? "Publicada" : status === "PAUSED" ? "Pausada" : status === "ERROR" ? "Error" : "Borrador";
}

function PublishButton({
  propertyId,
  channel,
  enabled,
  status,
}: {
  propertyId: string;
  channel: "FACEBOOK" | "INSTAGRAM";
  enabled: boolean;
  status: PublicationItem["status"];
}) {
  const [state, formAction, pending] = useActionState(
    publishPropertyToSocialAction.bind(null, propertyId, channel),
    initialState,
  );

  return (
    <form action={formAction} className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{channel === "FACEBOOK" ? "Facebook" : "Instagram"}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">Estado: {getStatusLabel(status)}</p>
        </div>
        <button
          disabled={pending || !enabled}
          className={`${enabled ? primaryButtonClassName : secondaryButtonClassName} min-h-11 text-sm disabled:cursor-not-allowed`}
        >
          {pending ? "Publicando..." : channel === "FACEBOOK" ? "Publicar en Facebook" : "Publicar en Instagram"}
        </button>
      </div>

      {!enabled ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Activa este canal en el formulario de la propiedad antes de publicar.
        </p>
      ) : null}
      {state.error ? <p className="mt-3 text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="mt-3 text-sm text-emerald-700 break-all">{state.success}</p> : null}
    </form>
  );
}

export function PropertyPublicationPanel({
  propertyId,
  publications,
}: {
  propertyId: string;
  publications: PublicationItem[];
}) {
  const facebookPublication = publications.find((publication) => publication.channel === "FACEBOOK");
  const instagramPublication = publications.find((publication) => publication.channel === "INSTAGRAM");

  return (
    <section className="space-y-4 rounded-[28px] border border-sky-200/70 bg-sky-50/75 p-6 shadow-[0_18px_60px_rgba(24,24,27,0.08)]">
      <div>
        <p className="text-sm font-semibold text-zinc-950">Publicación en Meta</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Esto dispara la publicación real vía API. Si la propiedad no está publicada en web o no tiene imágenes accesibles, Meta se va a quejar. Y con razón.
        </p>
      </div>

      <div className="grid gap-3">
        <PublishButton
          propertyId={propertyId}
          channel="FACEBOOK"
          enabled={facebookPublication?.isEnabled ?? false}
          status={facebookPublication?.status ?? "DRAFT"}
        />
        <PublishButton
          propertyId={propertyId}
          channel="INSTAGRAM"
          enabled={instagramPublication?.isEnabled ?? false}
          status={instagramPublication?.status ?? "DRAFT"}
        />
      </div>

      <div className="space-y-2 text-xs leading-5 text-zinc-500">
        {facebookPublication?.externalUrl ? <p>Facebook URL: {facebookPublication.externalUrl}</p> : null}
        {instagramPublication?.externalUrl ? <p>Instagram URL: {instagramPublication.externalUrl}</p> : null}
        {facebookPublication?.syncNotes ? <p>Facebook nota: {facebookPublication.syncNotes}</p> : null}
        {instagramPublication?.syncNotes ? <p>Instagram nota: {instagramPublication.syncNotes}</p> : null}
      </div>
    </section>
  );
}
