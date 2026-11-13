import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarRange, ClipboardList, KeyRound, Users2 } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Portal para brokers inmobiliarios | Valterra CRM",
  description:
    "Acceso para brokers de Valterra con seguimiento de leads, pipeline, agenda y tareas comerciales desde una sola entrada pública.",
  alternates: {
    canonical: "/brokers",
  },
  openGraph: {
    title: "Portal para brokers inmobiliarios | Valterra CRM",
    description:
      "Página pública de acceso para brokers con login al CRM de Valterra y contexto claro de la operación comercial.",
    url: "/brokers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal para brokers inmobiliarios | Valterra CRM",
    description:
      "Acceso brokers con login, seguimiento comercial y una ruta pública más clara hacia el CRM de Valterra.",
  },
};

const brokerBenefits = [
  {
    title: "Leads ordenados",
    copy: "Consulta oportunidades nuevas y evita que el seguimiento se pierda entre mensajes, notas sueltas y memoria optimista.",
    icon: Users2,
  },
  {
    title: "Pipeline visible",
    copy: "Visualiza avance comercial, etapas activas y prioridades de cierre en un tablero más fácil de leer.",
    icon: BarChart3,
  },
  {
    title: "Agenda y tareas",
    copy: "Coordina llamadas, citas y pendientes desde una sola entrada para sostener ritmo comercial.",
    icon: CalendarRange,
  },
  {
    title: "Acceso controlado",
    copy: "El portal funciona con credenciales asignadas por el equipo de administración de Valterra.",
    icon: KeyRound,
  },
];

export default async function BrokersPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/crm");
  }

  const siteUrl = process.env.APP_URL || "https://valterra-crm.fly.dev";
  const brokersUrl = new URL("/brokers", siteUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Portal para brokers inmobiliarios de Valterra",
        description:
          "Acceso público para brokers con login al CRM comercial de Valterra, gestión de leads, pipeline, agenda y tareas.",
        url: brokersUrl,
      },
      {
        "@type": "Service",
        serviceType: "Portal de brokers inmobiliarios",
        provider: {
          "@type": "Organization",
          name: "Valterra",
          url: new URL("/", siteUrl).toString(),
        },
        areaServed: ["CDMX", "Estado de Mexico", "Riviera Maya", "Tulum"],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#171310] px-6 py-8 text-[#f5ede2] sm:px-10 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[2rem] border border-[#5f503d]/45 bg-[#1b1612] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <section className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[#5f503d]/45 bg-[linear-gradient(160deg,#221710_0%,#171310_55%,#2c1f15_100%)] px-6 py-8 sm:px-8 sm:py-10 lg:border-b-0 lg:border-r">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d3b184]">Valterra CRM</p>
            <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.94] text-[#fff7ef]">
              Portal para brokers con seguimiento comercial real.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#eadfce]/86">
              Esta entrada pública concentra el acceso de brokers al CRM de Valterra para trabajar leads, pipeline, agenda y tareas sin depender de atajos escondidos o rutas ambiguas.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {brokerBenefits.map(({ title, copy, icon: Icon }) => (
                <div key={title} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8b7354] text-[#d3b184]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-serif text-2xl text-[#fff6ea]">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#e6d9c7]/82">{copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-[#5f503d]/45 bg-black/10 p-5">
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-5 w-5 text-[#d3b184]" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f1e4d2]">Solicitar acceso</p>
                  <p className="mt-2 text-sm leading-7 text-[#dccdb8]/82">
                    Si aún no tienes credenciales, solicita alta con el administrador del sistema antes de intentar entrar al CRM.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Volver al sitio
              </Link>
              <Link
                href="/propiedades"
                className="inline-flex min-h-12 items-center justify-center border border-[#8b7354] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] transition hover:bg-white/5"
              >
                Ver catálogo público
              </Link>
            </div>
          </div>

          <div className="bg-[#f5f1eb] p-6 sm:p-8">
            <Card className="w-full border-none bg-white/90 p-8 shadow-none">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Acceso brokers</p>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-950">Entrar al sistema</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Inicia sesión para abrir tu espacio de leads, pipeline, tareas y agenda comercial.
              </p>
              <div className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                Si tu sesión sigue activa, Valterra te redirige automáticamente al CRM.
              </div>
              <div className="mt-6">
                <LoginForm />
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
