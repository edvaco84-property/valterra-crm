import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const trackSchema = z.object({
  eventName: z.string().trim().min(2).max(80),
  href: z.string().trim().max(500).optional(),
  label: z.string().trim().max(160).optional(),
  page: z.string().trim().max(200).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const page = parsed.data.page || "unknown";

  await db.activityLog.create({
    data: {
      action: `marketing:${parsed.data.eventName}`,
      entityType: "marketing_page",
      entityId: page,
      entityLabel: parsed.data.label || null,
      details: JSON.stringify({
        href: parsed.data.href || null,
        metadata: parsed.data.metadata || null,
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
