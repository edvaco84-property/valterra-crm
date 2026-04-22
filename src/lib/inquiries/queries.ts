import { db } from "@/lib/db";
import type { SessionActor } from "@/lib/access";

export async function getWebsiteInquiries(actor?: SessionActor) {
  return db.websiteInquiry.findMany({
    where: actor?.role === "ADMIN" ? undefined : actor?.role === "COORDINATOR" ? { market: actor.market } : { market: actor?.market },
    orderBy: {
      createdAt: "desc",
    },
  });
}
