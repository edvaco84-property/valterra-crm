import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublishedPropertiesForInstagram } from "@/lib/properties/queries";
import { marketValues } from "@/lib/markets";
import { buildInstagramPostDraft } from "@/lib/social/instagram";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  market: z.enum(marketValues).optional(),
  developmentSlug: z.string().trim().min(1).max(120).optional(),
  operationType: z.string().trim().min(1).max(80).optional(),
  requireImage: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: searchParams.get("limit") || undefined,
    market: searchParams.get("market") || undefined,
    developmentSlug: searchParams.get("developmentSlug") || undefined,
    operationType: searchParams.get("operationType") || undefined,
    requireImage: searchParams.get("requireImage") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid query parameters",
      },
      { status: 400 },
    );
  }

  const properties = await getPublishedPropertiesForInstagram({
    limit: parsed.data.limit,
    market: parsed.data.market,
    developmentSlug: parsed.data.developmentSlug,
    operationType: parsed.data.operationType,
    requireImage: parsed.data.requireImage ?? true,
  });

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    total: properties.length,
    posts: properties.map(buildInstagramPostDraft),
  });
}
