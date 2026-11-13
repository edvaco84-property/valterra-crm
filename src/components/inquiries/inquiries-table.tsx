import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InquiryDeleteButton } from "@/components/inquiries/inquiry-delete-button";
import { getMarketLabel, type AppMarket } from "@/lib/markets";
import { formatShortDate } from "@/lib/utils";

type InquiryItem = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  market: AppMarket | null;
  interest: string | null;
  message: string | null;
  source: string;
  preferredContact: string | null;
  seenAt: Date | null;
  createdAt: Date;
};

export function InquiriesTable({ inquiries }: { inquiries: InquiryItem[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-zinc-950">Leads captados desde la web</h3>
        <p className="text-sm text-zinc-500">Cada contacto de la página vive aquí y además se crea como lead operativo.</p>
      </div>
      <div className="divide-y divide-zinc-100">
        {inquiries.length ? inquiries.map((inquiry) => (
          <div key={inquiry.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-zinc-950">{inquiry.fullName}</p>
                <Badge tone="brand">{getMarketLabel(inquiry.market)}</Badge>
                {!inquiry.seenAt ? <Badge tone="warning">Nuevo</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-zinc-600">{inquiry.interest || "Sin interés definido"}</p>
              {inquiry.message ? <p className="mt-2 text-sm text-zinc-500">{inquiry.message}</p> : null}
            </div>
            <div className="text-sm text-zinc-600">
              <p>{inquiry.email || "Sin email"}</p>
              <p className="mt-1">{inquiry.phone || "Sin teléfono"}</p>
              <p className="mt-1">Canal: {inquiry.preferredContact || "Sin preferencia"}</p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-zinc-500 lg:items-end lg:text-right">
              <InquiryDeleteButton inquiryId={inquiry.id} />
              <p>{formatShortDate(inquiry.createdAt.toISOString())}</p>
              <p className="mt-1 uppercase tracking-[0.18em]">{inquiry.source}</p>
            </div>
          </div>
        )) : <p className="px-5 py-6 text-sm text-zinc-500">Todavía no entran contactos desde la web.</p>}
      </div>
    </Card>
  );
}
