export { marketOptions } from "@/lib/markets";

export const leadStatusOptions = [
  { value: "ACTIVE", label: "Activo" },
  { value: "REACTIVATED", label: "Reactivado" },
  { value: "WON", label: "Ganado" },
  { value: "LOST", label: "Perdido" },
] as const;

export const leadStageOptions = [
  "Nuevo lead",
  "Sin contactar",
  "Contactado",
  "Perfilado",
  "Propiedad enviada",
  "Interés confirmado",
  "Cita agendada",
  "Visita realizada",
  "Seguimiento activo",
  "Negociación",
  "Apartado",
  "Cierre",
  "Perdido",
  "Reactivación",
] as const;
