import { Card } from "@/components/ui/card";

type FunnelItem = {
  stage: string;
  count: number;
};

export function ReportsFunnel({ items }: { items: FunnelItem[] }) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Embudo por etapa</h2>
        <p className="text-sm text-zinc-500">Dónde entra volumen y dónde se empieza a caer la conversación.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.stage} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-700">{item.stage}</span>
              <span className="font-medium text-zinc-950">{item.count}</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100">
              <div className="h-3 rounded-full bg-[#8b6b43]" style={{ width: `${Math.max((item.count / max) * 100, item.count ? 8 : 0)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
