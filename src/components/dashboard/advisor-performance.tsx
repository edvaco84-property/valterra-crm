import { Card } from "@/components/ui/card";
import { getMarketLabel, type AppMarket } from "@/lib/markets";

type AdvisorPerformanceItem = {
  id: string;
  name: string;
  role: string;
  market: AppMarket;
  totalLeads: number;
  wonLeads: number;
  activeLeads: number;
  openTasks: number;
  scheduledAppointments: number;
};

export function AdvisorPerformance({ advisors }: { advisors: AdvisorPerformanceItem[] }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Vista ejecutiva</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Rendimiento por broker</h2>
          <p className="mt-2 text-sm text-zinc-600">Una lectura rápida de carga, seguimiento y tracción comercial por asesor.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {advisors.map((advisor) => (
          <div key={advisor.id} className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-950">{advisor.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{advisor.role} · {getMarketLabel(advisor.market)}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                {advisor.totalLeads} leads totales
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              <Metric label="Activos" value={advisor.activeLeads} tone="amber" />
              <Metric label="Ganados" value={advisor.wonLeads} tone="emerald" />
              <Metric label="Tareas abiertas" value={advisor.openTasks} tone="zinc" />
              <Metric label="Citas agendadas" value={advisor.scheduledAppointments} tone="sky" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "amber" | "emerald" | "zinc" | "sky" }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    zinc: "bg-zinc-100 text-zinc-700",
    sky: "bg-sky-50 text-sky-700",
  } as const;

  return (
    <div className={`rounded-2xl px-4 py-4 ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
