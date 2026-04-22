import "dotenv/config";
import { PrismaClient, AppointmentStatus, AppointmentType, LeadStatus, Market, TaskStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "boss@valterra.mx" },
    update: {},
    create: {
      name: "Edgar V",
      email: "boss@valterra.mx",
      passwordHash,
      role: UserRole.ADMIN,
      market: Market.CDMX,
    },
  });

  const advisor = await prisma.user.upsert({
    where: { email: "andrea@valterra.mx" },
    update: {},
    create: {
      name: "Andrea Ruiz",
      email: "andrea@valterra.mx",
      passwordHash,
      role: UserRole.ADVISOR,
      market: Market.RIVIERA_MAYA,
    },
  });

  const lead = await prisma.lead.upsert({
    where: { id: "seed-lead-mariana" },
    update: {},
    create: {
      id: "seed-lead-mariana",
      fullName: "Mariana Torres",
      email: "mariana@correo.mx",
      phone: "+52 998 555 0101",
      source: "Meta Ads",
      market: Market.RIVIERA_MAYA,
      zone: "Aldea Zamá",
      budgetMin: 7000000,
      budgetMax: 9000000,
      stage: "Propiedad enviada",
      status: LeadStatus.ACTIVE,
      profile: "Inversionista con interés en renta vacacional",
      nextAction: "Enviar comparativo de 3 unidades",
      nextActionAt: new Date("2026-04-19T14:30:00-06:00"),
      assignedToId: advisor.id,
      propertyInterest: "Condo 2 recámaras",
    },
  });

  await prisma.property.upsert({
    where: { id: "seed-property-solea" },
    update: {},
    create: {
      id: "seed-property-solea",
      title: "Solea Beach Residences 3B",
      market: Market.RIVIERA_MAYA,
      zone: "Tulum Centro",
      propertyType: "Condominio",
      operationType: "Venta",
      price: 8350000,
      status: "Disponible",
      bedrooms: 2,
      bathrooms: 2,
      areaM2: 143,
      summary: "Condominio premium para inversión y renta vacacional en una zona con demanda fuerte.",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      published: true,
    },
  });

  await prisma.task.create({
    data: {
      title: "Enviar follow-up post visita",
      dueAt: new Date("2026-04-19T13:00:00-06:00"),
      status: TaskStatus.PENDING,
      leadId: lead.id,
      assigneeId: advisor.id,
    },
  });

  await prisma.appointment.create({
    data: {
      title: "Call de perfilamiento",
      type: AppointmentType.CALL,
      status: AppointmentStatus.SCHEDULED,
      scheduledAt: new Date("2026-04-19T12:30:00-06:00"),
      leadId: lead.id,
      advisorId: advisor.id,
    },
  });

  await prisma.note.create({
    data: {
      body: "Lead caliente. Priorizar comparativo y tour virtual.",
      leadId: lead.id,
      authorId: admin.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
