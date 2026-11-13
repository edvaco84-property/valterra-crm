import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

type YaaxLeadItem = {
  id: string;
  fullName: string;
  status: "ACTIVE" | "REACTIVATED" | "LOST" | "WON";
  stage: string;
  source: string;
  propertyInterest: string | null;
  nextAction: string;
  nextActionAt: Date | null;
  createdAt: Date;
  assignedTo: {
    name: string;
  };
  development: {
    title: string;
  } | null;
  property: {
    title: string;
    unitCode: string | null;
  } | null;
};

const toneByStatus = {
  ACTIVE: "success",
  REACTIVATED: "brand",
  LOST: "danger",
  WON: "success",
} as const;

export function YaaxPhaseOneLeads({
  snapshot,
}: {
  snapshot: {
    total: number;
    activeCount: number;
    wonCount: number;
    leads: YaaxLeadItem[];
  };
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-zinc-200 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Leads de Yaax Fase 1</h3>
            <p className="text-sm text-zinc-500">Oportunidades ligadas a la landing de la Fase 1 ya aterrizadas como leads operativos.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-700">Total: {snapshot.total}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">Activos: {snapshot.activeCount}</span>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">Ganados: {snapshot.wonCount}</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {snapshot.leads.length ? snapshot.leads.map((lead) => (
          <div key={lead.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.15fr_0.9fr_0.95fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/leads/${lead.id}`} className="font-medium text-zinc-950 hover:text-zinc-700">
                  {lead.fullName}
                </Link>
                <Badge tone={toneByStatus[lead.status]}>{lead.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{lead.propertyInterest || "Sin interés capturado"}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {lead.source}
                {lead.development ? ` · ${lead.development.title}` : ""}
                {lead.property?.unitCode ? ` · ${lead.property.unitCode}` : ""}
              </p>
            </div>

            <div className="text-sm text-zinc-600">
              <p><span className="text-zinc-500">Etapa:</span> {lead.stage}</p>
              <p className="mt-1"><span className="text-zinc-500">Asesor:</span> {lead.assignedTo.name}</p>
              <p className="mt-1"><span className="text-zinc-500">Próxima acción:</span> {lead.nextAction}</p>
            </div>

            <div className="text-sm text-zinc-500 lg:text-right">
              <p>Creado: {formatShortDate(lead.createdAt.toISOString())}</p>
              {lead.nextActionAt ? <p className="mt-1">Siguiente paso: {formatShortDate(lead.nextActionAt.toISOString())}</p> : null}
            </div>
          </div>
        )) : (
          <p className="px-5 py-6 text-sm text-zinc-500">Todavía no hay leads de Yaax Fase 1 entrando por la web.</p>
        )}
      </div>
    </Card>
  );
}
