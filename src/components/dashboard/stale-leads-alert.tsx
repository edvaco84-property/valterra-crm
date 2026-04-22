import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

type StaleLeadAlert = {
  id: string;
  fullName: string;
  stage: string;
  market: "CDMX" | "RIVIERA_MAYA";
  assignedTo: string;
  nextAction: string;
  nextActionAt: Date | null;
  severity: "high" | "medium";
};

export function StaleLeadsAlert({ leads }: { leads: StaleLeadAlert[] }) {
  if (!leads.length) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/70">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Seguimiento sano</p>
            <h2 className="mt-1 text-xl font-semibold text-emerald-950">No hay leads atrasados</h2>
            <p className="mt-2 text-sm text-emerald-800/80">Milagro operativo. Nadie se está enfriando por abandono ahorita.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Atención operativa</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950">Leads con seguimiento vencido o ausente</h2>
          <p className="mt-2 text-sm text-zinc-600">Prioriza estos contactos antes de que se conviertan en “se nos fue” con tono elegante.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-2xl border border-white/80 bg-white/90 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/leads/${lead.id}`} className="font-medium text-zinc-950 hover:text-zinc-700">{lead.fullName}</Link>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${lead.severity === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {lead.severity === "high" ? "Crítico" : "Atender hoy"}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{lead.stage} · {lead.market === "RIVIERA_MAYA" ? "Riviera Maya" : "CDMX"} · {lead.assignedTo}</p>
                <p className="mt-3 text-sm text-zinc-700">{lead.nextAction}</p>
                <p className="mt-1 text-xs text-zinc-500">{lead.nextActionAt ? `Próxima acción: ${formatShortDate(lead.nextActionAt.toISOString())}` : "Sin próxima acción programada"}</p>
              </div>
              <Link href={`/leads/${lead.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950">
                Abrir lead
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
