export type Market = "CDMX" | "ESTADO_DE_MEXICO" | "RIVIERA_MAYA";

export type Role = "ADMIN" | "COORDINATOR" | "ADVISOR";

export type Lead = {
  id: string;
  fullName: string;
  source: string;
  market: Market;
  zone: string;
  stage: string;
  status: "ACTIVE" | "WON" | "LOST" | "REACTIVATED";
  nextAction: string;
  nextActionAt?: string;
  assignedTo: string;
  phone?: string;
  email?: string;
  budgetRange?: string;
  propertyInterest?: string;
};

export type Property = {
  id: string;
  title: string;
  market: Market;
  zone: string;
  propertyType: string;
  operationType: string;
  price: number;
  currency: string;
  status: string;
  featured?: boolean;
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
};

export type Task = {
  id: string;
  title: string;
  dueAt: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "OVERDUE";
  assignee: string;
  lead?: string;
};

export type Appointment = {
  id: string;
  title: string;
  type: "CALL" | "MEETING" | "VISIT";
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
  scheduledAt: string;
  advisor: string;
  location?: string;
  lead?: string;
};

export type DashboardStats = {
  activeLeads: number;
  todayTasks: number;
  scheduledVisits: number;
  monthlyClosings: number;
  responseTime: string;
  activePipelineValue: string;
};
