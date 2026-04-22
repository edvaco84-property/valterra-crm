import { AgendaList } from "@/components/agenda/agenda-list";
import { AppointmentForm } from "@/components/agenda/appointment-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireSessionUser } from "@/lib/auth/session";
import { getAppointmentsList } from "@/lib/dashboard/queries";
import { getAdvisors, getLeadOptions } from "@/lib/leads/queries";

export default async function AgendaPage() {
  const user = await requireSessionUser();
  const [appointments, advisors, leads] = await Promise.all([
    getAppointmentsList(user),
    getAdvisors(user),
    getLeadOptions(user),
  ]);

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Agenda</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Citas y visitas</h1>
        <p className="mt-2 text-sm text-zinc-600">Vista operativa real para coordinar agenda comercial y registrar resultados.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AppointmentForm
          advisors={advisors.map((advisor) => ({ id: advisor.id, name: advisor.name }))}
          leads={leads.map((lead) => ({ id: lead.id, name: lead.fullName }))}
        />
        <AgendaList appointments={appointments} actor={user} />
      </section>
    </PageShell>
  );
}
