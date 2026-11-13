import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string | null;
  details: string | null;
  createdAt: Date;
  user: { id: string; name: string; role?: string } | null;
};

const entityHref: Record<string, (id: string) => string> = {
  lead: (id) => `/leads/${id}`,
  property: () => `/properties`,
  task: () => `/tasks`,
  appointment: () => `/agenda`,
  user: () => `/team`,
};

export function ActivityFeed({ items, title = "Actividad reciente" }: { items: ActivityItem[]; title?: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        <Link href="/activity" className="text-sm text-zinc-500 hover:text-zinc-900">Ver todo</Link>
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => {
          const href = entityHref[item.entityType]?.(item.entityId);
          return (
            <div key={item.id} className="rounded-2xl border border-zinc-100 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-zinc-950">{item.user?.name ?? "Sistema"}</span>
                <span className="text-zinc-500">{humanizeAction(item.action)}</span>
                {href ? (
                  <Link href={href} className="font-medium text-[#8b6b43] hover:text-[#6f5434]">{item.entityLabel ?? `${item.entityType} ${item.entityId.slice(0, 6)}`}</Link>
                ) : (
                  <span className="font-medium text-zinc-950">{item.entityLabel ?? `${item.entityType} ${item.entityId.slice(0, 6)}`}</span>
                )}
              </div>
              {item.details ? <p className="mt-2 text-sm text-zinc-600">{item.details}</p> : null}
              <p className="mt-2 text-xs text-zinc-500">{formatShortDate(item.createdAt.toISOString())}</p>
            </div>
          );
        }) : <p className="text-sm text-zinc-500">Todavía no hay actividad registrada.</p>}
      </div>
    </Card>
  );
}

function humanizeAction(action: string) {
  switch (action) {
    case "created": return "creó";
    case "updated": return "actualizó";
    case "pipeline_updated": return "movió en pipeline";
    case "status_updated": return "cambió estatus de";
    case "note_added": return "agregó nota a";
    default: return action;
  }
}
