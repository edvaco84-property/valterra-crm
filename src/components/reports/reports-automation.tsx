import { Card } from "@/components/ui/card";

type AutomationItem = {
  source: string;
  count: number;
};

type AutomationSnapshot = {
  total: number;
  breakdown: AutomationItem[];
};

export function ReportsAutomation({ snapshot }: { snapshot: AutomationSnapshot }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Automatización operativa</h2>
          <p className="text-sm text-zinc-500">Volumen de trabajo automatizado y reglas que lo originan.</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-right text-amber-800">
          <p className="text-xs uppercase tracking-[0.16em]">Tareas auto</p>
          <p className="mt-1 text-2xl font-semibold">{snapshot.total}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {snapshot.breakdown.length ? snapshot.breakdown.map((item) => (
          <div key={item.source} className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
            <span className="text-zinc-700">{humanizeSource(item.source)}</span>
            <span className="font-semibold text-zinc-950">{item.count}</span>
          </div>
        )) : <p className="text-sm text-zinc-500">Todavía no hay automatizaciones registradas en este corte.</p>}
      </div>
    </Card>
  );
}

function humanizeSource(source: string) {
  switch (source) {
    case "web_lead_intake": return "Lead web asignado";
    case "stale_rescue": return "Rescate de lead atrasado";
    case "next_follow_up": return "Siguiente seguimiento";
    default: return source;
  }
}
