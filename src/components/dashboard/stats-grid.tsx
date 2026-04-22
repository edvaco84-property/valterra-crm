import { Building2, CalendarClock, CircleDollarSign, TimerReset, Users, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";

type DashboardStats = {
  activeLeads: number;
  todayTasks: number;
  scheduledVisits: number;
  monthlyClosings: number;
  responseTime: string;
  activePipelineValue: string;
  staleLeads: number;
};

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Leads activos", value: stats.activeLeads, icon: Users },
    { label: "Tareas hoy", value: stats.todayTasks, icon: ClipboardList },
    { label: "Visitas agendadas", value: stats.scheduledVisits, icon: CalendarClock },
    { label: "Cierres del mes", value: stats.monthlyClosings, icon: Building2 },
    { label: "Tiempo de respuesta", value: stats.responseTime, icon: TimerReset },
    { label: "Pipeline activo", value: stats.activePipelineValue, icon: CircleDollarSign },
    { label: "Leads sin seguimiento", value: stats.staleLeads, icon: TimerReset },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
            <Icon className="h-6 w-6" />
          </div>
        </Card>
      ))}
    </section>
  );
}
