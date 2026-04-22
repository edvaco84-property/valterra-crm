import { LeadForm } from "@/components/forms/lead-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireSessionUser } from "@/lib/auth/session";
import { getAdvisors } from "@/lib/leads/queries";

export default async function NewLeadPage() {
  const user = await requireSessionUser();
  const advisors = await getAdvisors(user);

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Nuevo lead</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Alta rápida</h1>
        <p className="mt-2 text-sm text-zinc-600">Crear oportunidad, asignar asesor y dejar próxima acción desde el primer toque.</p>
      </div>
      <LeadForm advisors={advisors} actor={user} />
    </PageShell>
  );
}
