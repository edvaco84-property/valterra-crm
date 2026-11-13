import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shared/page-shell";
import { LeadNoteForm } from "@/components/leads/lead-note-form";
import { LeadDeleteButton } from "@/components/leads/lead-delete-button";
import { LeadQuickAppointmentForm } from "@/components/leads/lead-quick-appointment-form";
import { LeadQuickTaskForm } from "@/components/leads/lead-quick-task-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { requireSessionUser } from "@/lib/auth/session";
import { getAdvisors, getLeadById } from "@/lib/leads/queries";
import { getMarketLabel } from "@/lib/markets";
import { hasPermission, permissions } from "@/lib/permissions";
import { formatShortDate, toTelHref, toWhatsAppHref } from "@/lib/utils";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const { id } = await params;
  const [lead, advisors] = await Promise.all([
    getLeadById(id, user),
    getAdvisors(user),
  ]);

  if (!lead) notFound();

  const advisorOptions = advisors.map((advisor) => ({
    id: advisor.id,
    name: advisor.name,
  }));
  const canDeleteLead = hasPermission(user.role, permissions.deleteLead);
  const leadWhatsappHref = toWhatsAppHref(lead.phone, `Hola ${lead.fullName}, te contacto de parte de Valterra.`);
  const leadTelHref = toTelHref(lead.phone);
  const advisorWhatsappHref = toWhatsAppHref(lead.assignedTo.phone, `Hola ${lead.assignedTo.name}, seguimiento sobre ${lead.fullName}.`);
  const advisorTelHref = toTelHref(lead.assignedTo.phone);

  return (
    <PageShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Lead</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{lead.fullName}</h1>
          <p className="mt-2 text-sm text-zinc-600">{lead.source} · {lead.zone} · {getMarketLabel(lead.market)}</p>
          {lead.development || lead.property ? (
            <p className="mt-2 text-sm text-zinc-500">
              {lead.development ? lead.development.title : "Sin desarrollo"}
              {lead.property?.unitCode ? ` · ${lead.property.unitCode}` : lead.property ? ` · ${lead.property.title}` : ""}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <Badge tone={lead.status === "LOST" ? "danger" : lead.status === "REACTIVATED" ? "brand" : "success"}>{lead.status}</Badge>
            <Badge tone="neutral">{lead.stage}</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {leadWhatsappHref ? <Link href={leadWhatsappHref} target="_blank" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">WhatsApp lead</Link> : null}
          {leadTelHref ? <Link href={leadTelHref} className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-medium text-zinc-800">Llamar lead</Link> : null}
          <Link href={`/leads/${lead.id}/edit`} className="rounded-2xl bg-[#1a1817] px-4 py-3 text-center text-sm font-medium text-white">Editar lead</Link>
          {canDeleteLead ? <LeadDeleteButton leadId={lead.id} /> : null}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Resumen ejecutivo</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Tareas" value={String(lead.tasks.length)} helper={lead.tasks.filter((task) => task.status !== "DONE").length ? `${lead.tasks.filter((task) => task.status !== "DONE").length} activas` : "Todo al día"} />
              <Metric label="Citas" value={String(lead.appointments.length)} helper={lead.appointments.length ? "Con seguimiento" : "Sin agenda"} />
              <Metric label="Notas" value={String(lead.notes.length)} helper={lead.notes.length ? "Con contexto" : "Sin contexto"} />
              <Metric label="Presupuesto" value={formatBudgetRange(lead.budgetMin, lead.budgetMax)} helper={`Mercado ${getMarketLabel(lead.market)}`} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Contexto comercial</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <Info label="Asesor" value={lead.assignedTo.name} />
              <Info label="Email" value={lead.email ?? "Sin email"} />
              <Info label="Teléfono" value={lead.phone ?? "Sin teléfono"} />
              <Info label="Próxima acción" value={lead.nextAction} />
              <Info label="Fecha próxima acción" value={lead.nextActionAt ? formatShortDate(lead.nextActionAt.toISOString()) : "Sin fecha"} />
              <Info label="Desarrollo" value={lead.development?.title ?? "No definido"} />
              <Info label="Unidad" value={lead.property?.unitCode ? `${lead.property.unitCode} · ${lead.property.title}` : lead.property?.title ?? "Sin unidad específica"} />
              <Info label="Interés" value={lead.propertyInterest ?? "No definido"} />
              <Info label="Budget min" value={lead.budgetMin ? `$${lead.budgetMin.toLocaleString("es-MX")}` : "N/D"} />
              <Info label="Budget max" value={lead.budgetMax ? `$${lead.budgetMax.toLocaleString("es-MX")}` : "N/D"} />
            </dl>
            {lead.assignedTo.phone || lead.phone ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {advisorWhatsappHref ? <Link href={advisorWhatsappHref} target="_blank" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">WhatsApp asesor</Link> : null}
                {advisorTelHref ? <Link href={advisorTelHref} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700">Llamar asesor</Link> : null}
              </div>
            ) : null}
            <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">Perfil</p>
              <p className="mt-2 text-sm text-zinc-600">{lead.profile ?? "Todavía no hay contexto cualitativo registrado para este lead."}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Timeline comercial</h2>
            <div className="mt-5 space-y-4">
              {buildTimeline(lead).length ? buildTimeline(lead).map((item) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-zinc-100 p-4">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#a67c52]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-zinc-950">{item.title}</p>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-500">{item.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                    <p className="mt-2 text-xs text-zinc-500">{item.dateLabel}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-zinc-500">Todavía no hay actividad registrada para este lead.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Acciones rápidas</h2>
            <div className="mt-4 space-y-4">
              <LeadNoteForm leadId={lead.id} />
              <LeadQuickTaskForm leadId={lead.id} assignees={advisorOptions} defaultAssigneeId={lead.assignedToId} />
              <LeadQuickAppointmentForm leadId={lead.id} advisors={advisorOptions} defaultAdvisorId={lead.assignedToId} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Tareas ligadas</h2>
            <div className="mt-4 space-y-3">
              {lead.tasks.length ? lead.tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-zinc-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-zinc-950">{task.title}</p>
                      {task.automationSource ? <Badge tone="brand">Automatización</Badge> : null}
                    </div>
                    <Badge tone={task.status === "DONE" ? "success" : task.status === "OVERDUE" ? "danger" : "warning"}>{task.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{task.description || "Sin descripción adicional."}</p>
                  <p className="mt-2 text-xs text-zinc-500">Vence: {formatShortDate(task.dueAt.toISOString())}</p>
                </div>
              )) : <p className="text-sm text-zinc-500">Sin tareas registradas.</p>}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Citas y compromisos</h2>
            <div className="mt-4 space-y-3">
              {lead.appointments.length ? lead.appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-zinc-100 p-4 text-sm text-zinc-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-zinc-950">{appointment.title}</p>
                    <Badge tone={appointment.status === "COMPLETED" ? "success" : appointment.status === "CANCELED" ? "danger" : "warning"}>{appointment.status}</Badge>
                  </div>
                  <p className="mt-1">{appointment.type} · {formatShortDate(appointment.scheduledAt.toISOString())}</p>
                  <p className="mt-2 text-zinc-600">{appointment.location || appointment.result || "Sin ubicación ni resultado registrado."}</p>
                </div>
              )) : <p className="text-sm text-zinc-500">Sin citas registradas.</p>}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-950">Notas</h2>
            <div className="mt-4 space-y-3">
              {lead.notes.length ? lead.notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-zinc-100 p-4">
                  <p className="text-sm text-zinc-700">{note.body}</p>
                  <p className="mt-2 text-xs text-zinc-500">{note.author.name} · {formatShortDate(note.createdAt.toISOString())}</p>
                </div>
              )) : <p className="text-sm text-zinc-500">Sin notas todavía.</p>}
            </div>
          </Card>

          <ActivityFeed items={lead.activityLogs} title="Auditoría del lead" />
        </div>
      </section>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-zinc-400">{label}</dt>
      <dd className="mt-2 text-sm text-zinc-800">{value}</dd>
    </div>
  );
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{helper}</p>
    </div>
  );
}

function formatBudgetRange(min: number | null, max: number | null) {
  if (!min && !max) return "N/D";
  if (min && max) return `$${min.toLocaleString("es-MX")} - $${max.toLocaleString("es-MX")}`;
  if (min) return `Desde $${min.toLocaleString("es-MX")}`;
  return `Hasta $${max?.toLocaleString("es-MX")}`;
}

function buildTimeline(lead: NonNullable<Awaited<ReturnType<typeof getLeadById>>>) {
  const noteItems = lead.notes.map((note) => ({
    id: `note-${note.id}`,
    type: "Nota",
    title: note.author.name,
    description: note.body,
    timestamp: note.createdAt.getTime(),
    dateLabel: formatShortDate(note.createdAt.toISOString()),
  }));

  const taskItems = lead.tasks.map((task) => ({
    id: `task-${task.id}`,
    type: "Tarea",
    title: task.title,
    description: `${task.status} · vence ${formatShortDate(task.dueAt.toISOString())}`,
    timestamp: task.updatedAt.getTime(),
    dateLabel: formatShortDate(task.updatedAt.toISOString()),
  }));

  const appointmentItems = lead.appointments.map((appointment) => ({
    id: `appointment-${appointment.id}`,
    type: "Cita",
    title: appointment.title,
    description: `${appointment.type} · ${appointment.status}`,
    timestamp: appointment.scheduledAt.getTime(),
    dateLabel: formatShortDate(appointment.scheduledAt.toISOString()),
  }));

  return [...noteItems, ...taskItems, ...appointmentItems].sort((a, b) => b.timestamp - a.timestamp);
}
