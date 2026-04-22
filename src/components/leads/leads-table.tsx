import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

type LeadRow = {
  id: string;
  fullName: string;
  source: string;
  zone: string;
  market: string;
  stage: string;
  status: "ACTIVE" | "REACTIVATED" | "LOST" | "WON";
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
        <Link href="/leads/new" className="rounded-2xl bg-[#1a1817] px-4 py-2 text-sm font-medium text-white">Nuevo lead</Link>
      </div>
      {leads.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
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
                <tr key={lead.id} className="border-t border-zinc-100 align-top">
                  <td className="px-5 py-4">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-zinc-950 hover:text-zinc-700">{lead.fullName}</Link>
                    <div className="mt-1 text-xs text-zinc-500">{lead.source} · {lead.zone}</div>
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
      ) : (
        <div className="px-5 py-10 text-center text-sm text-zinc-500">
          No encontré leads con esos filtros. Prueba otro mercado, estatus o asesor.
        </div>
      )}
    </Card>
  );
}
