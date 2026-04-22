import { ActivityFeed } from "@/components/activity/activity-feed";
import { ActivityFilters } from "@/components/activity/activity-filters";
import { PageShell } from "@/components/shared/page-shell";
import { getRecentActivity } from "@/lib/activity-log";
import { permissions, requireRole } from "@/lib/permissions";
import { getTeamMembers } from "@/lib/team/queries";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; entityType?: string; action?: string }>;
}) {
  await requireRole(permissions.viewActivity);
  const params = await searchParams;
  const [items, users] = await Promise.all([
    getRecentActivity(80, params),
    getTeamMembers(),
  ]);

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Actividad</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Bitácora operativa</h1>
        <p className="mt-2 text-sm text-zinc-600">Rastro transversal de cambios para que nadie juegue al fantasma con el CRM.</p>
      </div>
      <ActivityFilters
        users={users.map((user) => ({ id: user.id, name: user.name }))}
        current={{ userId: params.userId, entityType: params.entityType, action: params.action }}
      />
      <ActivityFeed items={items} title="Actividad global" />
    </PageShell>
  );
}
