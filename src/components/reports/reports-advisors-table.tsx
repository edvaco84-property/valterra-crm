import { Card } from "@/components/ui/card";

type AdvisorReport = {
  id: string;
  name: string;
  newLeads: number;
  wonLeads: number;
  lostLeads: number;
  createdTasks: number;
  createdAppointments: number;
};

export function ReportsAdvisorsTable({ advisors, days }: { advisors: AdvisorReport[]; days: number }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-zinc-950">Desempeño por broker</h2>
        <p className="text-sm text-zinc-500">Actividad comercial en los últimos {days} días.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-medium">Broker</th>
              <th className="px-5 py-3 font-medium">Leads nuevos</th>
              <th className="px-5 py-3 font-medium">Ganados</th>
              <th className="px-5 py-3 font-medium">Perdidos</th>
              <th className="px-5 py-3 font-medium">Tareas</th>
              <th className="px-5 py-3 font-medium">Citas</th>
            </tr>
          </thead>
          <tbody>
            {advisors.map((advisor) => (
              <tr key={advisor.id} className="border-t border-zinc-100">
                <td className="px-5 py-4 font-medium text-zinc-950">{advisor.name}</td>
                <td className="px-5 py-4 text-zinc-700">{advisor.newLeads}</td>
                <td className="px-5 py-4 text-emerald-700">{advisor.wonLeads}</td>
                <td className="px-5 py-4 text-rose-700">{advisor.lostLeads}</td>
                <td className="px-5 py-4 text-zinc-700">{advisor.createdTasks}</td>
                <td className="px-5 py-4 text-zinc-700">{advisor.createdAppointments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
