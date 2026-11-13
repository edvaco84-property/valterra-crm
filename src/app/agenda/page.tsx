import { AgendaList } from "@/components/agenda/agenda-list";
import { AppointmentForm } from "@/components/agenda/appointment-form";
import { MobilePanel } from "@/components/mobile/mobile-panel";
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
      <div className="rounded-[30px] border border-white/10 bg-white/8 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/90">Agenda</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Citas y visitas</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-300">Vista operativa real para coordinar agenda comercial y registrar resultados.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <MobilePanel title="Nueva cita" description="Crea una cita sólo cuando la necesites." buttonLabel="Nueva cita">
          <AppointmentForm
            advisors={advisors.map((advisor) => ({ id: advisor.id, name: advisor.name }))}
            leads={leads.map((lead) => ({ id: lead.id, name: lead.fullName }))}
          />
        </MobilePanel>
        <AgendaList appointments={appointments} actor={user} />
      </section>
    </PageShell>
  );
}
