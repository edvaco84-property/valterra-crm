import Link from "next/link";
import { PipelineStageForm } from "@/components/pipeline/pipeline-stage-form";
import { Card } from "@/components/ui/card";

type PipelineColumn = {
  name: string;
  items: Array<{
    id: string;
    fullName: string;
    market: "CDMX" | "RIVIERA_MAYA";
    status: "ACTIVE" | "REACTIVATED" | "WON" | "LOST";
  }>;
};

export function PipelineBoard({ columns }: { columns: PipelineColumn[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-5 2xl:grid-cols-7">
      {columns.map((column) => (
        <Card key={column.name} className="bg-zinc-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">{column.name}</h3>
            <span className="rounded-full bg-white px-2 py-1 text-xs text-zinc-500">{column.items.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {column.items.length ? column.items.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-3 text-sm text-zinc-700 shadow-sm">
                <Link href={`/leads/${item.id}`} className="font-medium text-zinc-900 hover:text-zinc-700">{item.fullName}</Link>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">{item.market === "RIVIERA_MAYA" ? "Riviera Maya" : "CDMX"}</p>
                <PipelineStageForm leadId={item.id} stage={column.name} status={item.status} />
              </div>
            )) : <p className="text-sm text-zinc-500">Sin leads.</p>}
          </div>
        </Card>
      ))}
    </section>
  );
}
