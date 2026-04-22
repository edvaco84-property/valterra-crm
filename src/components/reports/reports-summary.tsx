import { Card } from "@/components/ui/card";

type ReportsSnapshot = {
  days: number;
  newLeads: number;
  wonLeads: number;
  lostLeads: number;
  createdTasks: number;
  createdAppointments: number;
  conversionRate: string;
  automation: {
    total: number;
    breakdown: { source: string; count: number }[];
  };
};

export function ReportsSummary({ snapshot }: { snapshot: ReportsSnapshot }) {
  const items = [
    { label: "Leads nuevos", value: snapshot.newLeads },
    { label: "Leads ganados", value: snapshot.wonLeads },
    { label: "Leads perdidos", value: snapshot.lostLeads },
    { label: "Tareas creadas", value: snapshot.createdTasks },
    { label: "Citas creadas", value: snapshot.createdAppointments },
    { label: "Conversión", value: snapshot.conversionRate },
    { label: "Tareas automáticas", value: snapshot.automation.total },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">{item.value}</p>
          <p className="mt-2 text-sm text-zinc-500">Ventana de {snapshot.days} días</p>
        </Card>
      ))}
    </section>
  );
}
