import { db } from "@/lib/db";
import type { AppMarket } from "@/lib/markets";

const stageCadenceMap: Record<string, { title: string; hoursFromNow: number; description: string }> = {
  "Propiedad enviada": {
    title: "Follow-up post envío de propiedad",
    hoursFromNow: 24,
    description: "Automatización: confirmar recepción, interés y objeciones tras envío de propiedad.",
  },
  "Cita agendada": {
    title: "Confirmar cita agendada",
    hoursFromNow: 12,
    description: "Automatización: confirmar asistencia y resolver fricción antes de la cita.",
  },
  "Visita realizada": {
    title: "Follow-up post visita",
    hoursFromNow: 24,
    description: "Automatización: capturar feedback, objeciones y siguiente paso después de la visita.",
  },
  Negociación: {
    title: "Empuje de negociación",
    hoursFromNow: 24,
    description: "Automatización: retomar negociación y destrabar decisión comercial.",
  },
};

type AssignWebLeadInput = {
  market: AppMarket;
};

export async function resolveAssigneeForWebLead({ market }: AssignWebLeadInput) {
  const marketAdvisor = await db.user.findFirst({
    where: {
      active: true,
      market,
      role: { in: ["COORDINATOR", "ADVISOR"] },
    },
    orderBy: [
      { role: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (marketAdvisor) return marketAdvisor;

  return db.user.findFirst({
    where: {
      active: true,
      role: "ADMIN",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });
}

export async function resolveAssigneeForPropertyInquiry({ propertyId, market }: AssignWebLeadInput & { propertyId: string }) {
  const propertyCreatorLog = await db.activityLog.findFirst({
    where: {
      entityType: "property",
      entityId: propertyId,
      action: "created",
      user: {
        active: true,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (propertyCreatorLog?.user) return propertyCreatorLog.user;

  return resolveAssigneeForWebLead({ market });
}

export async function resolveAssigneeForOwnerListing({ market }: AssignWebLeadInput) {
  const coordinator = await db.user.findFirst({
    where: {
      active: true,
      market,
      role: { in: ["COORDINATOR", "ADMIN"] },
    },
    orderBy: [
      { role: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (coordinator) return coordinator;

  return resolveAssigneeForWebLead({ market });
}

export async function ensureStaleLeadFollowUpTask(leadId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      fullName: true,
      status: true,
      nextActionAt: true,
      assignedToId: true,
    },
  });

  if (!lead || !["ACTIVE", "REACTIVATED"].includes(lead.status)) return;
  if (!lead.nextActionAt || lead.nextActionAt >= new Date()) return;

  const existingTask = await db.task.findFirst({
    where: {
      leadId: lead.id,
      title: `Rescatar lead atrasado: ${lead.fullName}`,
      status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
    },
    select: { id: true },
  });

  if (existingTask) return;

  await db.task.create({
    data: {
      title: `Rescatar lead atrasado: ${lead.fullName}`,
      description: "Automatización: el lead ya trae próxima acción vencida y necesita rescate comercial.",
      status: "PENDING",
      dueAt: new Date(Date.now() + 30 * 60 * 1000),
      leadId: lead.id,
      assigneeId: lead.assignedToId,
      automationSource: "stale_rescue",
    },
  });
}

export async function ensureNextFollowUpTask(taskId: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      lead: {
        select: {
          id: true,
          fullName: true,
          nextAction: true,
          nextActionAt: true,
          assignedToId: true,
        },
      },
    },
  });

  if (!task?.lead) return;

  const dueAt = task.lead.nextActionAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  const title = `Siguiente seguimiento: ${task.lead.fullName}`;

  const existingTask = await db.task.findFirst({
    where: {
      leadId: task.lead.id,
      title,
      status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
    },
    select: { id: true },
  });

  if (existingTask) return;

  await db.task.create({
    data: {
      title,
      description: `Automatización: continuar seguimiento con próxima acción \"${task.lead.nextAction}\".`,
      status: "PENDING",
      dueAt,
      leadId: task.lead.id,
      assigneeId: task.lead.assignedToId,
      automationSource: "next_follow_up",
    },
  });
}

export async function ensureStageCadenceTask(leadId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      fullName: true,
      stage: true,
      status: true,
      assignedToId: true,
    },
  });

  if (!lead || !["ACTIVE", "REACTIVATED"].includes(lead.status)) return;

  const cadence = stageCadenceMap[lead.stage];
  if (!cadence) return;

  const existingTask = await db.task.findFirst({
    where: {
      leadId: lead.id,
      title: `${cadence.title}: ${lead.fullName}`,
      status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
    },
    select: { id: true },
  });

  if (existingTask) return;

  await db.task.create({
    data: {
      title: `${cadence.title}: ${lead.fullName}`,
      description: cadence.description,
      status: "PENDING",
      dueAt: new Date(Date.now() + cadence.hoursFromNow * 60 * 60 * 1000),
      leadId: lead.id,
      assigneeId: lead.assignedToId,
      automationSource: "stage_cadence",
    },
  });
}
