import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatShortDate, primaryButtonClassName, toTelHref, toWhatsAppHref } from "@/lib/utils";

type LeadRow = {
  id: string;
  fullName: string;
  source: string;
  zone: string;
  market: string;
  stage: string;
  status: "ACTIVE" | "REACTIVATED" | "LOST" | "WON";
  phone?: string | null;
  development?: {
    title: string;
  } | null;
  property?: {
    title: string;
    unitCode: string | null;
  } | null;
  nextAction: string;
  nextActionAt: Date | null;
  assignedTo: {
    name: string;
  };
};

const toneByStatus = {
  ACTIVE: "success",
  REACTIVATED: "brand",
  LOST: "danger",
  WON: "success",
} as const;

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">Leads prioritarios</h3>
          <p className="text-sm text-zinc-500">{leads.length ? `${leads.length} resultado(s) con próxima acción y contexto comercial.` : "No hubo coincidencias con esos filtros."}</p>
        </div>
        <Link href="/leads/new" className={`${primaryButtonClassName} px-4 py-2 text-sm`}>Nuevo lead</Link>
      </div>
      {leads.length ? (
        <>
        <div className="space-y-3 p-4 md:hidden">
          {leads.map((lead) => {
            const whatsappHref = toWhatsAppHref(lead.phone, `Hola ${lead.fullName}, te contacto de parte de Valterra.`);
            const telHref = toTelHref(lead.phone);

            return (
              <div key={lead.id} className="rounded-[24px] border border-zinc-200/90 bg-white/78 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/leads/${lead.id}`} className="font-medium text-zinc-950 hover:text-zinc-700">{lead.fullName}</Link>
                    <div className="mt-1 text-xs text-zinc-500">
                      {lead.source} · {lead.zone}
                      {lead.development ? ` · ${lead.development.title}` : ""}
                      {lead.property?.unitCode ? ` · ${lead.property.unitCode}` : ""}
                    </div>
                  </div>
                  <Badge tone={toneByStatus[lead.status]}>{lead.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-zinc-700">
                  <p><span className="text-zinc-500">Mercado:</span> {lead.market}</p>
                  <p><span className="text-zinc-500">Etapa:</span> {lead.stage}</p>
                  <p><span className="text-zinc-500">Asesor:</span> {lead.assignedTo.name}</p>
                  <p><span className="text-zinc-500">Próxima acción:</span> {lead.nextAction}</p>
                  {lead.nextActionAt ? <p className="text-xs text-zinc-500">{formatShortDate(lead.nextActionAt.toISOString())}</p> : null}
                </div>
                {lead.phone ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {whatsappHref ? <Link href={whatsappHref} target="_blank" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">WhatsApp</Link> : null}
                    {telHref ? <Link href={telHref} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700">Llamar</Link> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50/80 text-zinc-500 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3 font-medium">Lead</th>
                <th className="px-5 py-3 font-medium">Mercado</th>
                <th className="px-5 py-3 font-medium">Etapa</th>
                <th className="px-5 py-3 font-medium">Próxima acción</th>
                <th className="px-5 py-3 font-medium">Asesor</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-zinc-100 align-top transition hover:bg-amber-50/30">
                  <td className="px-5 py-4">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-zinc-950 hover:text-zinc-700">{lead.fullName}</Link>
                    <div className="mt-1 text-xs text-zinc-500">
                      {lead.source} · {lead.zone}
                      {lead.development ? ` · ${lead.development.title}` : ""}
                      {lead.property?.unitCode ? ` · ${lead.property.unitCode}` : ""}
                    </div>
                    <div className="mt-2"><Badge tone={toneByStatus[lead.status]}>{lead.status}</Badge></div>
                  </td>
                  <td className="px-5 py-4 text-zinc-700">{lead.market}</td>
                  <td className="px-5 py-4 text-zinc-700">{lead.stage}</td>
                  <td className="px-5 py-4 text-zinc-700">
                    <div>{lead.nextAction}</div>
                    {lead.nextActionAt ? <div className="mt-1 text-xs text-zinc-500">{formatShortDate(lead.nextActionAt.toISOString())}</div> : null}
                  </td>
                  <td className="px-5 py-4 text-zinc-700">{lead.assignedTo.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <div className="px-5 py-10 text-center text-sm text-zinc-500">
          No encontré leads con esos filtros. Prueba otro mercado, estatus o asesor.
        </div>
      )}
    </Card>
  );
}
