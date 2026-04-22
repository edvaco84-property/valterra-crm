"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { resolveAssigneeForWebLead } from "@/lib/automation";

const inquirySchema = z.object({
  fullName: z.string().min(3, "Necesito tu nombre completo."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().min(8, "Teléfono muy corto.").optional().or(z.literal("")),
  market: z.enum(["CDMX", "RIVIERA_MAYA", ""]).optional(),
  interest: z.string().optional(),
  propertyTitle: z.string().optional(),
  preferredContact: z.string().optional(),
  message: z.string().min(8, "Cuéntanos un poco más.").optional().or(z.literal("")),
});

const initialState = { error: "", success: "" };

export async function createInquiryAction(_: typeof initialState, formData: FormData) {
  const parsed = inquirySchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    market: String(formData.get("market") ?? ""),
    interest: String(formData.get("interest") ?? ""),
    propertyTitle: String(formData.get("propertyTitle") ?? ""),
    preferredContact: String(formData.get("preferredContact") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude guardar tu contacto.", success: "" };
  }

  const market = parsed.data.market || "CDMX";
  const interest = parsed.data.propertyTitle
    ? `${parsed.data.interest || "Interés en propiedad"} · ${parsed.data.propertyTitle}`
    : parsed.data.interest || null;
  const message = parsed.data.message || null;

  const assignee = await resolveAssigneeForWebLead({ market });

  if (!assignee) {
    return { error: "No hay usuario administrador para recibir leads web todavía.", success: "" };
  }

  const nextAction = parsed.data.preferredContact
    ? `Contactar por ${parsed.data.preferredContact}`
    : "Contactar lead web";
  const nextActionAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.$transaction(async (tx) => {
    await tx.websiteInquiry.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        market,
        interest,
        preferredContact: parsed.data.preferredContact || null,
        message,
        source: "website",
      },
    });

    const lead = await tx.lead.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        source: "Website",
        market,
        zone: market === "RIVIERA_MAYA" ? "Riviera Maya" : "CDMX",
        stage: "Nuevo lead",
        status: "ACTIVE",
        nextAction,
        nextActionAt,
        assignedToId: assignee.id,
        propertyInterest: interest,
        profile: message,
      },
    });

    await tx.task.create({
      data: {
        title: `Dar seguimiento a lead web: ${parsed.data.fullName}`,
        description: message || interest || "Lead generado desde la página web.",
        status: "PENDING",
        dueAt: nextActionAt,
        leadId: lead.id,
        assigneeId: assignee.id,
        automationSource: "web_lead_intake",
      },
    });

    await tx.note.create({
      data: {
        leadId: lead.id,
        authorId: assignee.id,
        body: `Automatización web: lead asignado a ${assignee.name} (${assignee.role}) y tarea inicial creada para ${nextAction.toLowerCase()}.`,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/crm");
  revalidatePath("/leads");

  return { error: "", success: "Gracias. Ya recibimos tu información y te contactaremos pronto." };
}
