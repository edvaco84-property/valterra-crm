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
    <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="flex items-center justify-between gap-3 border-white/50 bg-white/88 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{value}</p>
          </div>
          <div className="shrink-0 rounded-[20px] border border-amber-200/70 bg-amber-50/90 p-2.5 text-amber-700 shadow-sm sm:p-3">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </Card>
      ))}
    </section>
  );
}
