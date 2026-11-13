"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { resolveAssigneeForOwnerListing, resolveAssigneeForPropertyInquiry, resolveAssigneeForWebLead } from "@/lib/automation";
import { getMarketLabel, marketValues } from "@/lib/markets";
import { hasPermission, permissions } from "@/lib/permissions";

const inquirySchema = z.object({
  fullName: z.string().trim().min(3, "Necesito tu nombre completo."),
  email: z.string().trim().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().trim().min(8, "Teléfono muy corto."),
  market: z.enum([...marketValues, ""]).optional(),
  interest: z.string().trim().optional(),
  propertyTitle: z.string().trim().optional(),
  propertyId: z.string().trim().optional(),
  preferredContact: z.string().trim().optional(),
  message: z.string().trim().optional().or(z.literal("")),
  website: z.string().trim().optional(),
}).refine((data) => Boolean(data.email || data.phone), {
  message: "Necesito al menos teléfono o email para contactarte.",
  path: ["phone"],
});

type InquiryActionState = { error: string; success: string };

export async function createInquiryAction(_: InquiryActionState, formData: FormData) {
  const parsed = inquirySchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    market: String(formData.get("market") ?? ""),
    interest: String(formData.get("interest") ?? ""),
    propertyTitle: String(formData.get("propertyTitle") ?? ""),
    propertyId: String(formData.get("propertyId") ?? ""),
    preferredContact: String(formData.get("preferredContact") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude guardar tu contacto.", success: "" };
  }

  if (parsed.data.website) {
    return { error: "", success: "Gracias. Ya recibimos tu información y te contactaremos pronto." };
  }

  const market = parsed.data.market || "CDMX";
  const propertyRecord = parsed.data.propertyId
    ? await db.property.findUnique({
        where: { id: parsed.data.propertyId },
        select: {
          id: true,
          developmentId: true,
          development: {
            select: {
              title: true,
            },
          },
          unitCode: true,
          title: true,
        },
      })
    : null;
  const inquiryKind = parsed.data.propertyTitle
    ? "PROPERTY_BUYER"
    : isOwnerListingIntent(parsed.data.interest)
      ? "OWNER_LISTING"
      : "GENERAL";
  const interest = parsed.data.propertyTitle
    ? `${parsed.data.interest || "Interés en propiedad"} · ${parsed.data.propertyTitle}`
    : parsed.data.interest || null;
  const message = parsed.data.message || null;

  if (looksLikeSpamLead({
    fullName: parsed.data.fullName,
    email: parsed.data.email || null,
    phone: parsed.data.phone,
    interest,
    message,
  })) {
    return { error: "", success: "Gracias. Ya recibimos tu información y te contactaremos pronto." };
  }

  const normalizedEmail = normalizeEmail(parsed.data.email || null);
  const normalizedPhone = normalizePhone(parsed.data.phone);
  const recentDuplicate = await db.lead.findFirst({
    where: {
      source: {
        in: ["Website", "Website Propiedad", "Captación de propiedad web"],
      },
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      OR: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    },
    select: { id: true },
  });

  if (recentDuplicate) {
    return { error: "", success: "Gracias. Ya recibimos tu información y te contactaremos pronto." };
  }

  const assignee = inquiryKind === "PROPERTY_BUYER" && parsed.data.propertyId
    ? await resolveAssigneeForPropertyInquiry({ propertyId: parsed.data.propertyId, market })
    : inquiryKind === "OWNER_LISTING"
      ? await resolveAssigneeForOwnerListing({ market })
      : await resolveAssigneeForWebLead({ market });

  if (!assignee) {
    return { error: "No hay usuario administrador para recibir leads web todavía.", success: "" };
  }

  const nextAction = inquiryKind === "OWNER_LISTING"
    ? "Llamar para captar propiedad y validar ficha"
    : parsed.data.preferredContact
      ? `Contactar por ${parsed.data.preferredContact}`
      : "Contactar lead web";
  const nextActionAt = new Date(Date.now() + (inquiryKind === "OWNER_LISTING" ? 15 : 60) * 60 * 1000);

  await db.$transaction(async (tx) => {
    await tx.websiteInquiry.create({
      data: {
        fullName: parsed.data.fullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        market,
        interest,
        preferredContact: parsed.data.preferredContact || null,
        message,
        source: inquiryKind === "OWNER_LISTING" ? "website_owner_listing" : parsed.data.propertyTitle ? "website_property" : "website",
      },
    });

    const lead = await tx.lead.create({
      data: {
        fullName: parsed.data.fullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        source: inquiryKind === "OWNER_LISTING" ? "Captación de propiedad web" : parsed.data.propertyTitle ? "Website Propiedad" : "Website",
        market,
        zone: getMarketLabel(market),
        stage: "Nuevo lead",
        status: "ACTIVE",
        nextAction,
        nextActionAt,
        assignedToId: assignee.id,
        developmentId: propertyRecord?.developmentId ?? null,
        propertyId: propertyRecord?.id ?? null,
        propertyInterest: interest,
        profile: propertyRecord?.development
          ? [
              `Desarrollo: ${propertyRecord.development.title}`,
              propertyRecord.unitCode ? `Unidad: ${propertyRecord.unitCode}` : null,
              message,
            ].filter(Boolean).join("\n")
          : message,
      },
    });

    await tx.task.create({
      data: {
        title: getInquiryTaskTitle(inquiryKind, parsed.data.fullName, parsed.data.propertyTitle),
        description: getInquiryTaskDescription(inquiryKind, message, interest, parsed.data.propertyTitle),
        status: "PENDING",
        dueAt: nextActionAt,
        leadId: lead.id,
        assigneeId: assignee.id,
        automationSource: getInquiryAutomationSource(inquiryKind),
      },
    });

    await tx.note.create({
      data: {
        leadId: lead.id,
        authorId: assignee.id,
        body: getInquiryAutomationNote({
          inquiryKind,
          assigneeName: assignee.name,
          assigneeRole: assignee.role,
          nextAction,
          propertyTitle: parsed.data.propertyTitle || null,
        }),
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/crm");
  revalidatePath("/leads");

  return { error: "", success: inquiryKind === "OWNER_LISTING" ? "Gracias. Ya recibimos tu propiedad y un asesor la revisará de inmediato." : "Gracias. Ya recibimos tu información y te contactaremos pronto." };
}

export async function deleteInquiryAction(inquiryId: string, _: { error: string }, _formData: FormData) {
  void _;
  void _formData;

  const user = await requireSessionUser();

  if (!hasPermission(user.role, permissions.deleteInquiry)) {
    return { error: "No tienes permiso para borrar mensajes del inbox web." };
  }

  const inquiry = await db.websiteInquiry.findFirst({
    where: {
      id: inquiryId,
      ...(user.role === "ADMIN" ? {} : { market: user.market }),
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  if (!inquiry) {
    return { error: "No encontré ese mensaje o no lo puedes borrar." };
  }

  await db.$transaction(async (tx) => {
    await tx.activityLog.deleteMany({ where: { entityType: "inquiry", entityId: inquiryId } });
    await tx.websiteInquiry.delete({ where: { id: inquiryId } });
  });

  await logActivity({
    userId: user.id,
    action: "deleted",
    entityType: "inquiry",
    entityId: inquiryId,
    entityLabel: inquiry.fullName,
    details: "Mensaje eliminado del inbox web.",
  });

  revalidatePath("/");
  revalidatePath("/crm");
  revalidatePath("/inquiries");

  return { error: "" };
}

function normalizeEmail(email?: string | null) {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

function normalizePhone(phone?: string | null) {
  const normalized = phone?.replace(/\D/g, "") ?? "";
  return normalized || null;
}

function looksLikeSpamLead({
  fullName,
  email,
  phone,
  interest,
  message,
}: {
  fullName: string;
  email: string | null;
  phone: string | null;
  interest: string | null;
  message: string | null;
}) {
  const haystack = [fullName, email, interest, message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const spamPhrases = [
    "instagram",
    "authority",
    "niche-relevant followers",
    "followers to your page",
    "backlinks",
    "seo",
    "guest post",
    "domain authority",
    "traffic to your website",
    "customized ai system",
    "open to finding out more",
  ];

  if (spamPhrases.some((phrase) => haystack.includes(phrase))) {
    return true;
  }

  if (!interest && message && message.length > 240) {
    return true;
  }

  if (!email && (!phone || phone.replace(/\D/g, "").length < 10)) {
    return true;
  }

  return false;
}

function isOwnerListingIntent(interest?: string | null) {
  if (!interest) return false;
  const normalized = interest.toLowerCase();
  return normalized.includes("promocion") || normalized.includes("promocionar") || normalized.includes("mi propiedad") || normalized.includes("vender mi propiedad");
}

function getInquiryAutomationSource(inquiryKind: "PROPERTY_BUYER" | "OWNER_LISTING" | "GENERAL") {
  if (inquiryKind === "PROPERTY_BUYER") return "property_web_inquiry";
  if (inquiryKind === "OWNER_LISTING") return "owner_listing_alert";
  return "web_lead_intake";
}

function getInquiryTaskTitle(inquiryKind: "PROPERTY_BUYER" | "OWNER_LISTING" | "GENERAL", fullName: string, propertyTitle?: string) {
  if (inquiryKind === "PROPERTY_BUYER") {
    return `Atender lead de propiedad: ${propertyTitle || fullName}`;
  }
  if (inquiryKind === "OWNER_LISTING") {
    return `ALERTA captación de propiedad: ${fullName}`;
  }
  return `Dar seguimiento a lead web: ${fullName}`;
}

function getInquiryTaskDescription(inquiryKind: "PROPERTY_BUYER" | "OWNER_LISTING" | "GENERAL", message: string | null, interest: string | null, propertyTitle?: string) {
  if (inquiryKind === "PROPERTY_BUYER") {
    return message || interest || `Lead generado desde la ficha de ${propertyTitle || "la propiedad"}.`;
  }
  if (inquiryKind === "OWNER_LISTING") {
    return message || "Lead web que quiere que Valterra promocione su propiedad. Prioridad alta para contacto y levantamiento de ficha.";
  }
  return message || interest || "Lead generado desde la página web.";
}

function getInquiryAutomationNote({ inquiryKind, assigneeName, assigneeRole, nextAction, propertyTitle }: { inquiryKind: "PROPERTY_BUYER" | "OWNER_LISTING" | "GENERAL"; assigneeName: string; assigneeRole: string; nextAction: string; propertyTitle: string | null; }) {
  if (inquiryKind === "PROPERTY_BUYER") {
    return `Automatización web: lead de la propiedad ${propertyTitle || "seleccionada"} asignado a ${assigneeName} (${assigneeRole}) y tarea inicial creada para ${nextAction.toLowerCase()}.`;
  }
  if (inquiryKind === "OWNER_LISTING") {
    return `Automatización web: alerta especial de captación asignada a ${assigneeName} (${assigneeRole}) con prioridad alta para ${nextAction.toLowerCase()}.`;
  }
  return `Automatización web: lead asignado a ${assigneeName} (${assigneeRole}) y tarea inicial creada para ${nextAction.toLowerCase()}.`;
}
