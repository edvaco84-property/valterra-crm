import { InquiriesTable } from "@/components/inquiries/inquiries-table";
import { YaaxPhaseOneLeads } from "@/components/inquiries/yaax-phase-one-leads";
import { PageShell } from "@/components/shared/page-shell";
import { requireSessionUser } from "@/lib/auth/session";
import { getWebsiteInquiries, getYaaxPhaseOneLandingLeads, markWebsiteInquiriesSeen } from "@/lib/inquiries/queries";

export default async function InquiriesPage() {
  const user = await requireSessionUser();
  await markWebsiteInquiriesSeen(user);
  const [inquiries, yaaxPhaseOneLeads] = await Promise.all([
    getWebsiteInquiries(user),
    getYaaxPhaseOneLandingLeads(user),
  ]);

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Inbox web</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Contactos de la página</h1>
        <p className="mt-2 text-sm text-zinc-600">Vista operativa para revisar lo que entró desde la web sin andar cazando registros a mano.</p>
      </div>
      <YaaxPhaseOneLeads snapshot={yaaxPhaseOneLeads} />
      <InquiriesTable inquiries={inquiries} />
    </PageShell>
  );
}
