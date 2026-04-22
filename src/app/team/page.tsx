import { PageShell } from "@/components/shared/page-shell";
import { TeamCreateForm } from "@/components/team/team-create-form";
import { TeamTable } from "@/components/team/team-table";
import { requireRole } from "@/lib/permissions";
import { getTeamMembers } from "@/lib/team/queries";

export default async function TeamPage() {
  await requireRole(["ADMIN"]);

  const members = await getTeamMembers();

  return (
    <PageShell>
      <section className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Equipo</p>
        <h1 className="text-3xl font-semibold text-zinc-950">Administración de brokers</h1>
        <p className="text-sm text-zinc-600">Aquí agregas usuarios, cambias roles y activas o desactivas acceso.</p>
      </section>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TeamCreateForm />
        <TeamTable members={members} />
      </div>
    </PageShell>
  );
}
