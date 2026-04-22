import { notFound } from "next/navigation";
import { LeadForm } from "@/components/forms/lead-form";
import { PageShell } from "@/components/shared/page-shell";
import { requireSessionUser } from "@/lib/auth/session";
import { getAdvisors, getLeadById } from "@/lib/leads/queries";

function toDateTimeLocal(value: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const { id } = await params;
  const [lead, advisors] = await Promise.all([getLeadById(id, user), getAdvisors(user)]);

  if (!lead) notFound();

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Editar lead</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{lead.fullName}</h1>
        <p className="mt-2 text-sm text-zinc-600">Ajusta seguimiento, asesor, etapa o contexto comercial.</p>
      </div>
      <LeadForm
        advisors={advisors}
        actor={user}
        lead={{
          id: lead.id,
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          market: lead.market,
          zone: lead.zone,
          stage: lead.stage,
          status: lead.status,
          nextAction: lead.nextAction,
          nextActionAt: toDateTimeLocal(lead.nextActionAt),
          assignedToId: lead.assignedToId,
          propertyInterest: lead.propertyInterest,
          profile: lead.profile,
          budgetMin: lead.budgetMin,
          budgetMax: lead.budgetMax,
        }}
      />
    </PageShell>
  );
}
