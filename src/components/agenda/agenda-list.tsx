import { AppointmentStatusForm } from "@/components/agenda/appointment-status-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

type AppointmentItem = {
  id: string;
  title: string;
  type: "CALL" | "MEETING" | "VISIT";
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
  scheduledAt: Date;
  location: string | null;
  advisorId?: string;
  advisor: {
    name: string;
  };
  lead: {
    fullName: string;
  } | null;
};

type Actor = {
  id: string;
  role: string;
};

export function AgendaList({ appointments, actor }: { appointments: AppointmentItem[]; actor?: Actor }) {
  return (
    <Card>
      <div>
        <h3 className="text-lg font-semibold text-zinc-950">Agenda operativa</h3>
        <p className="text-sm text-zinc-500">Llamadas, visitas y juntas para que el equipo no improvise de más.</p>
      </div>
      <div className="mt-5 space-y-3">
        {appointments.length ? appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-[24px] border border-zinc-100 bg-white/75 p-4 shadow-sm sm:p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-medium text-zinc-950">{appointment.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{appointment.advisor.name}{appointment.location ? ` · ${appointment.location}` : appointment.lead ? ` · ${appointment.lead.fullName}` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Badge tone={appointment.status === "COMPLETED" ? "success" : appointment.status === "CANCELED" ? "danger" : "brand"}>{appointment.type}</Badge>
                  <span className="text-xs sm:text-sm text-zinc-500">{formatShortDate(appointment.scheduledAt.toISOString())}</span>
                </div>
              </div>
              {canUpdateAppointment(appointment, actor) ? <AppointmentStatusForm appointmentId={appointment.id} currentStatus={appointment.status} /> : null}
            </div>
          </div>
        )) : <p className="text-sm text-zinc-500">No hay citas registradas todavía.</p>}
      </div>
    </Card>
  );
}

function canUpdateAppointment(appointment: AppointmentItem, actor?: Actor) {
  if (!actor) return true;
  if (actor.role === "ADMIN" || actor.role === "COORDINATOR") return true;
  return appointment.advisorId === actor.id;
}
