import { InquiriesTable } from "@/components/inquiries/inquiries-table";
import { PageShell } from "@/components/shared/page-shell";
import { requireSessionUser } from "@/lib/auth/session";
import { getWebsiteInquiries } from "@/lib/inquiries/queries";

export default async function InquiriesPage() {
  const user = await requireSessionUser();
  const inquiries = await getWebsiteInquiries(user);

  return (
    <PageShell>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Inbox web</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Contactos de la página</h1>
        <p className="mt-2 text-sm text-zinc-600">Vista operativa para revisar lo que entró desde la web sin andar cazando registros a mano.</p>
      </div>
      <InquiriesTable inquiries={inquiries} />
    </PageShell>
  );
}
