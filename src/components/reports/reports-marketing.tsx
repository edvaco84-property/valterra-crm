import { Card } from "@/components/ui/card";

type MarketingSnapshot = {
  days: number;
  totalEvents: number;
  formStarts: number;
  formSubmits: number;
  whatsappClicks: number;
  prefilledTipologyClicks: number;
  eventBreakdown: { eventName: string; count: number }[];
  labelBreakdown: { label: string; count: number }[];
  recentEvents: {
    eventName: string;
    label: string | null;
    createdAt: Date;
    details: {
      href?: string | null;
      metadata?: Record<string, string | number | boolean | null> | null;
    } | null;
  }[];
};

export function ReportsMarketing({ snapshot }: { snapshot: MarketingSnapshot }) {
  const cards = [
    { label: "Eventos", value: snapshot.totalEvents },
    { label: "Inicios de formulario", value: snapshot.formStarts },
    { label: "Formularios enviados", value: snapshot.formSubmits },
    { label: "Clics a WhatsApp", value: snapshot.whatsappClicks },
    { label: "Selección de tipología", value: snapshot.prefilledTipologyClicks },
  ];

  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Marketing de Yaax Fase 1</h2>
            <p className="text-sm text-zinc-500">Señales reales de intención dentro de la landing de la Fase 1.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right text-emerald-800">
            <p className="text-xs uppercase tracking-[0.16em]">Ventana</p>
            <p className="mt-1 text-2xl font-semibold">{snapshot.days} días</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {cards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-100 px-4 py-4">
              <p className="text-sm text-zinc-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
          {snapshot.formStarts
            ? `Conversión de inicio a envío: ${Math.round((snapshot.formSubmits / snapshot.formStarts) * 100)}%`
            : "Todavía no hay suficientes inicios de formulario para leer conversión."}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-950">Qué está jalando</h2>
        <p className="text-sm text-zinc-500">Eventos y etiquetas más activadas dentro de la landing.</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Eventos</p>
            {snapshot.eventBreakdown.length ? snapshot.eventBreakdown.map((item) => (
              <div key={item.eventName} className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
                <span className="text-zinc-700">{humanizeEvent(item.eventName)}</span>
                <span className="font-semibold text-zinc-950">{item.count}</span>
              </div>
            )) : <p className="text-sm text-zinc-500">Sin eventos capturados todavía.</p>}
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Etiquetas / tipologías</p>
            {snapshot.labelBreakdown.length ? snapshot.labelBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
                <span className="text-zinc-700">{item.label}</span>
                <span className="font-semibold text-zinc-950">{item.count}</span>
              </div>
            )) : <p className="text-sm text-zinc-500">Todavía no hay etiquetas suficientes para leer intención.</p>}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Últimos eventos</p>
          {snapshot.recentEvents.length ? snapshot.recentEvents.map((event, index) => (
            <div key={`${event.eventName}-${event.createdAt.toISOString()}-${index}`} className="rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-zinc-950">{humanizeEvent(event.eventName)}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">{formatDate(event.createdAt)}</span>
              </div>
              <p className="mt-1 text-zinc-600">{event.label || "Sin etiqueta"}</p>
              {event.details?.metadata?.tipology ? (
                <p className="mt-1 text-xs text-zinc-500">Tipología: {String(event.details.metadata.tipology)}</p>
              ) : null}
            </div>
          )) : <p className="text-sm text-zinc-500">Aún no hay eventos recientes para mostrar.</p>}
        </div>
      </Card>
    </section>
  );
}

function humanizeEvent(eventName: string) {
  switch (eventName) {
    case "lead_form_start":
      return "Inicio de formulario";
    case "lead_form_submit":
      return "Formulario enviado";
    case "yaax_phase1_whatsapp_click":
      return "WhatsApp general";
    case "yaax_phase1_inventory_whatsapp_click":
      return "WhatsApp por inventario";
    case "yaax_phase1_tipology_prefill":
      return "Selección de tipología";
    case "yaax_phase1_internal_navigation":
      return "Navegación interna";
    case "yaax_penthouse_whatsapp_click":
      return "Yaax penthouse WhatsApp";
    case "yaax_penthouse_inventory_whatsapp_click":
      return "Yaax penthouse inventario";
    case "yaax_penthouse_internal_navigation":
      return "Yaax penthouse navegación";
    default:
      return eventName;
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
