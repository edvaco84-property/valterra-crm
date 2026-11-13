import { marketOptions } from "@/lib/markets";

type Option = { value: string; label: string };

export function ReportsFilters({
  days,
  market,
  stage,
  assignedToId,
  source,
  advisorOptions,
  stageOptions,
  sourceOptions,
}: {
  days: number;
  market?: string;
  stage?: string;
  assignedToId?: string;
  source?: string;
  advisorOptions: Option[];
  stageOptions: Option[];
  sourceOptions: Option[];
}) {
  return (
    <form className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-6">
      <label className="space-y-2 text-sm text-zinc-700">
        <span>Periodo</span>
        <select name="days" defaultValue={String(days)} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </label>
      <label className="space-y-2 text-sm text-zinc-700">
        <span>Mercado</span>
        <select name="market" defaultValue={market ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todos</option>
          {marketOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-zinc-700">
        <span>Broker</span>
        <select name="assignedToId" defaultValue={assignedToId ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todos</option>
          {advisorOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-zinc-700">
        <span>Etapa</span>
        <select name="stage" defaultValue={stage ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todas</option>
          {stageOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-zinc-700">
        <span>Fuente</span>
        <select name="source" defaultValue={source ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todas</option>
          {sourceOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button className="w-full rounded-2xl bg-[#1a1817] px-4 py-3 text-sm font-medium text-white">Actualizar reporte</button>
      </div>
    </form>
  );
}
