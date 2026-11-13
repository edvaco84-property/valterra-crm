import { Card } from "@/components/ui/card";

type SourceItem = {
  source: string;
  count: number;
};

export function ReportsSources({ items }: { items: SourceItem[] }) {
  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Fuentes de entrada</h2>
        <p className="text-sm text-zinc-500">Canales que están alimentando la operación comercial.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.source} className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
            <span className="text-zinc-700">{item.source}</span>
            <span className="font-semibold text-zinc-950">{item.count}</span>
          </div>
        )) : <p className="text-sm text-zinc-500">No hay fuentes con ese corte.</p>}
      </div>
    </Card>
  );
}
