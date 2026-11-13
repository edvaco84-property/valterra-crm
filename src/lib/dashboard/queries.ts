import { db } from "@/lib/db";
import type { SessionActor } from "@/lib/access";
import { buildAppointmentAccessWhere, buildLeadAccessWhere, buildTaskAccessWhere } from "@/lib/access";
import type { AppMarket } from "@/lib/markets";
import { leadStageOptions } from "@/lib/leads/constants";

export async function getDashboardStats(actor?: SessionActor) {
  const leadWhere = actor ? buildLeadAccessWhere(actor) : {};
  const taskWhere = actor ? buildTaskAccessWhere(actor) : {};
  const appointmentWhere = actor ? buildAppointmentAccessWhere(actor) : {};
  const [activeLeads, todayTasks, scheduledVisits, monthlyClosings, overdueLeads, properties, staleLeads] = await Promise.all([
    db.lead.count({
      where: {
        ...leadWhere,
        status: {
          in: ["ACTIVE", "REACTIVATED"],
        },
      },
    }),
    db.task.count({
      where: {
        ...taskWhere,
        status: {
          in: ["PENDING", "IN_PROGRESS", "OVERDUE"],
        },
      },
    }),
    db.appointment.count({
      where: {
        ...appointmentWhere,
        type: "VISIT",
        status: "SCHEDULED",
      },
    }),
    db.lead.count({
      where: {
        ...leadWhere,
        status: "WON",
        updatedAt: {
          gte: startOfMonth(),
        },
      },
    }),
    db.lead.findMany({
      where: {
        ...leadWhere,
        status: {
          in: ["ACTIVE", "REACTIVATED"],
        },
        nextActionAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        nextActionAt: true,
      },
    }),
    db.property.findMany({
      select: {
        price: true,
        status: true,
      },
    }),
    db.lead.count({
      where: {
        ...leadWhere,
        status: {
          in: ["ACTIVE", "REACTIVATED"],
        },
        OR: [
          { nextActionAt: null },
          { nextActionAt: { lt: new Date() } },
        ],
      },
    }),
  ]);

  const responseMinutes = overdueLeads
    .map((lead) => {
      if (!lead.nextActionAt) return null;
      return Math.max(0, Math.round((lead.nextActionAt.getTime() - lead.createdAt.getTime()) / 60000));
    })
    .filter((value): value is number => value !== null);

  const averageResponse = responseMinutes.length
    ? `${Math.round(responseMinutes.reduce((sum, value) => sum + value, 0) / responseMinutes.length)} min`
    : "N/D";

  const activePipelineValue = properties
    .filter((property) => property.status !== "Cierre")
    .reduce((sum, property) => sum + property.price, 0);

  return {
    activeLeads,
    todayTasks,
    scheduledVisits,
    monthlyClosings,
    responseTime: averageResponse,
    activePipelineValue: formatCurrency(activePipelineValue),
    staleLeads,
  };
}

export async function getTasksList(actor?: SessionActor) {
  return db.task.findMany({
    where: actor ? buildTaskAccessWhere(actor) : undefined,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
      lead: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: [
      { dueAt: "asc" },
      { createdAt: "desc" },
    ],
    take: 12,
  });
}

export async function getAppointmentsList(actor?: SessionActor) {
  return db.appointment.findMany({
    where: actor ? buildAppointmentAccessWhere(actor) : undefined,
    include: {
      advisor: {
        select: {
          id: true,
          name: true,
        },
      },
      lead: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    take: 12,
  });
}

export async function getPipelineColumns(actor?: SessionActor) {
  const leads = await db.lead.findMany({
    where: {
      ...(actor ? buildLeadAccessWhere(actor) : {}),
      status: {
        in: ["ACTIVE", "REACTIVATED"],
      },
    },
    select: {
      id: true,
      fullName: true,
      stage: true,
      market: true,
      status: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return leadStageOptions.map((stage) => ({
    name: stage,
    items: leads.filter((lead) => lead.stage === stage),
  }));
}

export async function getAdvisorPerformance(actor?: SessionActor) {
  if (actor?.role === "ADVISOR") {
    return [];
  }

  const advisors = await db.user.findMany({
    where: {
      active: true,
      ...(actor?.role === "COORDINATOR" ? { market: actor.market } : {}),
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      role: true,
      market: true,
      _count: {
        select: {
          leads: true,
          tasks: true,
          appointments: true,
        },
      },
      leads: {
        select: {
          status: true,
        },
      },
      tasks: {
        where: {
          status: {
            in: ["PENDING", "IN_PROGRESS", "OVERDUE"],
          },
        },
        select: {
          id: true,
        },
      },
      appointments: {
        where: {
          status: "SCHEDULED",
        },
        select: {
          id: true,
        },
      },
    },
  });

  return advisors.map((advisor) => ({
    id: advisor.id,
    name: advisor.name,
    role: advisor.role,
    market: advisor.market,
    totalLeads: advisor._count.leads,
    wonLeads: advisor.leads.filter((lead) => lead.status === "WON").length,
    activeLeads: advisor.leads.filter((lead) => lead.status === "ACTIVE" || lead.status === "REACTIVATED").length,
    openTasks: advisor.tasks.length,
    scheduledAppointments: advisor.appointments.length,
  }));
}

export async function getStaleLeadAlerts(actor?: SessionActor) {
  const leads = await db.lead.findMany({
    where: {
      ...(actor ? buildLeadAccessWhere(actor) : {}),
      status: {
        in: ["ACTIVE", "REACTIVATED"],
      },
      OR: [
        { nextActionAt: null },
        { nextActionAt: { lt: new Date() } },
      ],
    },
    include: {
      assignedTo: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { nextActionAt: "asc" },
      { updatedAt: "desc" },
    ],
    take: 8,
  });

  return leads.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    stage: lead.stage,
    market: lead.market,
    assignedTo: lead.assignedTo.name,
    nextAction: lead.nextAction,
    nextActionAt: lead.nextActionAt,
    severity: (!lead.nextActionAt
      ? "high"
      : lead.nextActionAt.getTime() < Date.now() - 1000 * 60 * 60 * 24
        ? "high"
        : "medium") as "high" | "medium",
  }));
}

export async function getReportsSnapshot(days = 30, filters?: { market?: string; stage?: string; assignedToId?: string; source?: string }) {
  const from = new Date();
  from.setDate(from.getDate() - Math.max(days - 1, 0));
  from.setHours(0, 0, 0, 0);

  const leadFilters = {
    ...(filters?.market ? { market: filters.market as AppMarket } : {}),
    ...(filters?.stage ? { stage: filters.stage } : {}),
    ...(filters?.assignedToId ? { assignedToId: filters.assignedToId } : {}),
    ...(filters?.source ? { source: filters.source } : {}),
  };

  const [newLeads, wonLeads, lostLeads, createdTasks, createdAppointments, advisors, funnelLeads, sourceLeads, automatedTasks] = await Promise.all([
    db.lead.count({
      where: {
        ...leadFilters,
        createdAt: { gte: from },
      },
    }),
    db.lead.count({
      where: {
        ...leadFilters,
        status: "WON",
        updatedAt: { gte: from },
      },
    }),
    db.lead.count({
      where: {
        ...leadFilters,
        status: "LOST",
        updatedAt: { gte: from },
      },
    }),
    db.task.count({
      where: {
        createdAt: { gte: from },
      },
    }),
    db.appointment.count({
      where: {
        createdAt: { gte: from },
      },
    }),
    db.user.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        leads: {
          where: {
            ...leadFilters,
            createdAt: { gte: from },
          },
          select: {
            status: true,
          },
        },
        tasks: {
          where: {
            createdAt: { gte: from },
          },
          select: { id: true },
        },
        appointments: {
          where: {
            createdAt: { gte: from },
          },
          select: { id: true },
        },
      },
    }),
    db.lead.findMany({
      where: {
        ...leadFilters,
        createdAt: { gte: from },
      },
      select: {
        stage: true,
      },
    }),
    db.lead.findMany({
      where: {
        ...(filters?.market ? { market: filters.market as AppMarket } : {}),
        ...(filters?.assignedToId ? { assignedToId: filters.assignedToId } : {}),
        createdAt: { gte: from },
      },
      select: {
        source: true,
      },
    }),
    db.task.findMany({
      where: {
        createdAt: { gte: from },
        automationSource: {
          not: null,
        },
      },
      select: {
        automationSource: true,
      },
    }),
  ]);

  const funnelMap = new Map<string, number>();
  funnelLeads.forEach((lead) => {
    funnelMap.set(lead.stage, (funnelMap.get(lead.stage) ?? 0) + 1);
  });

  const sourceMap = new Map<string, number>();
  sourceLeads.forEach((lead) => {
    const key = lead.source || "Sin fuente";
    sourceMap.set(key, (sourceMap.get(key) ?? 0) + 1);
  });

  const automationMap = new Map<string, number>();
  automatedTasks.forEach((task) => {
    const key = task.automationSource || "manual";
    automationMap.set(key, (automationMap.get(key) ?? 0) + 1);
  });

  return {
    days,
    newLeads,
    wonLeads,
    lostLeads,
    createdTasks,
    createdAppointments,
    conversionRate: newLeads ? `${Math.round((wonLeads / newLeads) * 100)}%` : "0%",
    advisors: advisors.map((advisor) => ({
      id: advisor.id,
      name: advisor.name,
      newLeads: advisor.leads.length,
      wonLeads: advisor.leads.filter((lead) => lead.status === "WON").length,
      lostLeads: advisor.leads.filter((lead) => lead.status === "LOST").length,
      createdTasks: advisor.tasks.length,
      createdAppointments: advisor.appointments.length,
    })),
    funnel: leadStageOptions.map((stage) => ({
      stage,
      count: funnelMap.get(stage) ?? 0,
    })),
    sourceBreakdown: Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    automation: {
      total: automatedTasks.length,
      breakdown: Array.from(automationMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    },
  };
}

export async function getMarketingSnapshot(days = 30) {
  const from = new Date();
  from.setDate(from.getDate() - Math.max(days - 1, 0));
  from.setHours(0, 0, 0, 0);

  const events = await db.activityLog.findMany({
    where: {
      entityType: "marketing_page",
      entityId: "/desarrollos/yaax-tulum-condos/fase-1-edificio-4",
      createdAt: { gte: from },
      action: {
        startsWith: "marketing:",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      action: true,
      entityLabel: true,
      details: true,
      createdAt: true,
    },
  });

  const byEvent = new Map<string, number>();
  const byLabel = new Map<string, number>();

  for (const event of events) {
    const eventName = event.action.replace(/^marketing:/, "");
    byEvent.set(eventName, (byEvent.get(eventName) ?? 0) + 1);

    if (event.entityLabel) {
      byLabel.set(event.entityLabel, (byLabel.get(event.entityLabel) ?? 0) + 1);
    }
  }

  return {
    days,
    totalEvents: events.length,
    formStarts: byEvent.get("lead_form_start") ?? 0,
    formSubmits: byEvent.get("lead_form_submit") ?? 0,
    whatsappClicks:
      (byEvent.get("yaax_phase1_whatsapp_click") ?? 0) +
      (byEvent.get("yaax_phase1_inventory_whatsapp_click") ?? 0),
    prefilledTipologyClicks: byEvent.get("yaax_phase1_tipology_prefill") ?? 0,
    eventBreakdown: Array.from(byEvent.entries())
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count),
    labelBreakdown: Array.from(byLabel.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    recentEvents: events.slice(0, 8).map((event) => ({
      eventName: event.action.replace(/^marketing:/, ""),
      label: event.entityLabel,
      createdAt: event.createdAt,
      details: parseMarketingDetails(event.details),
    })),
  };
}

function startOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseMarketingDetails(details?: string | null) {
  if (!details) return null;

  try {
    return JSON.parse(details) as {
      href?: string | null;
      metadata?: Record<string, string | number | boolean | null> | null;
    };
  } catch {
    return null;
  }
}
