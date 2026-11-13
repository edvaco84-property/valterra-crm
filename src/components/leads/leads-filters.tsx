import Link from "next/link";
import { MobilePanel } from "@/components/mobile/mobile-panel";
import { marketOptions } from "@/lib/markets";
import { inputClassName, primaryButtonClassName, selectClassName, secondaryButtonClassName } from "@/lib/utils";
import { getAdvisors } from "@/lib/leads/queries";

export async function LeadsFilters({
  query,
  market,
  status,
  assignedToId,
}: {
  query?: string;
  market?: string;
  status?: string;
  assignedToId?: string;
}) {
  const advisors = await getAdvisors();

  return (
    <MobilePanel title="Filtros" description="Abre sólo los filtros cuando los necesites." buttonLabel="Filtros">
      <form className="grid gap-3 rounded-[28px] border border-white/60 bg-white/82 p-4 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_1fr_auto] xl:items-end">
        <label className="space-y-2 text-sm text-zinc-700">
        <span>Búsqueda</span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Nombre, email, teléfono, fuente o zona"
          className={inputClassName}
        />
      </label>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>Mercado</span>
        <select name="market" defaultValue={market ?? ""} className={selectClassName}>
          <option value="">Todos</option>
          {marketOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>Estatus</span>
        <select name="status" defaultValue={status ?? ""} className={selectClassName}>
          <option value="">Todos</option>
          <option value="ACTIVE">Activo</option>
          <option value="REACTIVATED">Reactivado</option>
          <option value="WON">Ganado</option>
          <option value="LOST">Perdido</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>Asesor</span>
        <select name="assignedToId" defaultValue={assignedToId ?? ""} className={selectClassName}>
          <option value="">Todos</option>
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
          ))}
        </select>
      </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className={`${primaryButtonClassName} text-sm`}>Filtrar</button>
          <Link href="/leads" className={secondaryButtonClassName}>
            Limpiar
          </Link>
        </div>
      </form>
    </MobilePanel>
  );
}
