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
    <form className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_1fr_auto] xl:items-end">
      <label className="space-y-2 text-sm text-zinc-700">
        <span>Búsqueda</span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Nombre, email, teléfono, fuente o zona"
          className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
        />
      </label>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>Mercado</span>
        <select name="market" defaultValue={market ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todos</option>
          <option value="CDMX">CDMX</option>
          <option value="RIVIERA_MAYA">Riviera Maya</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>Estatus</span>
        <select name="status" defaultValue={status ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todos</option>
          <option value="ACTIVE">Activo</option>
          <option value="REACTIVATED">Reactivado</option>
          <option value="WON">Ganado</option>
          <option value="LOST">Perdido</option>
        </select>
      </label>

      <label className="space-y-2 text-sm text-zinc-700">
        <span>Asesor</span>
        <select name="assignedToId" defaultValue={assignedToId ?? ""} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
          <option value="">Todos</option>
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <button className="rounded-2xl bg-[#1a1817] px-4 py-3 text-sm font-medium text-white">Filtrar</button>
        <a href="/leads" className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
          Limpiar
        </a>
      </div>
    </form>
  );
}
