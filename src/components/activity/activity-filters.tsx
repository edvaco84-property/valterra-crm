type UserOption = { id: string; name: string };

const entityOptions = [
  { value: "", label: "Todos los módulos" },
  { value: "lead", label: "Leads" },
  { value: "property", label: "Propiedades" },
  { value: "task", label: "Tareas" },
  { value: "appointment", label: "Citas" },
  { value: "user", label: "Equipo" },
];

const actionOptions = [
  { value: "", label: "Todas las acciones" },
  { value: "created", label: "Creación" },
  { value: "updated", label: "Actualización" },
  { value: "pipeline_updated", label: "Cambio pipeline" },
  { value: "status_updated", label: "Cambio estatus" },
  { value: "note_added", label: "Nota agregada" },
];

export function ActivityFilters({
  users,
  current,
}: {
  users: UserOption[];
  current: { userId?: string; entityType?: string; action?: string };
}) {
  return (
    <form className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4">
      <Select
        label="Usuario"
        name="userId"
        defaultValue={current.userId ?? ""}
        options={[{ value: "", label: "Todos" }, ...users.map((user) => ({ value: user.id, label: user.name }))]}
      />
      <Select label="Módulo" name="entityType" defaultValue={current.entityType ?? ""} options={entityOptions} />
      <Select label="Acción" name="action" defaultValue={current.action ?? ""} options={actionOptions} />
      <div className="flex items-end">
        <button className="w-full rounded-2xl bg-[#1a1817] px-4 py-3 text-sm font-medium text-white">Filtrar actividad</button>
      </div>
    </form>
  );
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <label className="space-y-2 text-sm text-zinc-700">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
