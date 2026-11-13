import { db } from "@/lib/db";
import type { SessionActor } from "@/lib/access";
import { buildLeadAccessWhere } from "@/lib/access";

function buildInquiryAccessWhere(actor?: SessionActor) {
  if (!actor || actor.role === "ADMIN") return undefined;
  return { market: actor.market };
}

export async function getWebsiteInquiries(actor?: SessionActor) {
  return db.websiteInquiry.findMany({
    where: buildInquiryAccessWhere(actor),
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnreadWebsiteInquiryCount(actor?: SessionActor) {
  return db.websiteInquiry.count({
    where: {
      ...buildInquiryAccessWhere(actor),
      seenAt: null,
    },
  });
}

export async function markWebsiteInquiriesSeen(actor?: SessionActor) {
  const result = await db.websiteInquiry.updateMany({
    where: {
      ...buildInquiryAccessWhere(actor),
      seenAt: null,
    },
    data: {
      seenAt: new Date(),
    },
  });

  return result.count;
}

export async function getYaaxPhaseOneLandingLeads(actor?: SessionActor) {
  const leads = await db.lead.findMany({
    where: {
      ...(actor ? buildLeadAccessWhere(actor) : {}),
      market: "RIVIERA_MAYA",
      source: {
        in: ["Website", "Website Propiedad"],
      },
      OR: [
        { propertyInterest: { contains: "Fase 1", mode: "insensitive" } },
        { propertyInterest: { contains: "Edificio 4", mode: "insensitive" } },
        { development: { slug: "yaax-tulum-condos" } },
        { property: { unitCode: { startsWith: "B-" } } },
      ],
    },
    include: {
      assignedTo: {
        select: {
          name: true,
        },
      },
      development: {
        select: {
          title: true,
        },
      },
      property: {
        select: {
          title: true,
          unitCode: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  const activeCount = leads.filter((lead) => lead.status === "ACTIVE" || lead.status === "REACTIVATED").length;
  const wonCount = leads.filter((lead) => lead.status === "WON").length;

  return {
    total: leads.length,
    activeCount,
    wonCount,
    leads,
  };
}
