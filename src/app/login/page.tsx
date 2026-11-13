import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Acceso privado al CRM | Valterra",
  description:
    "Acceso privado al CRM de Valterra para usuarios con credenciales activas. La ruta pública para brokers está disponible en /brokers.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/crm");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1eb] p-6">
      <Card className="w-full max-w-md p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Valterra CRM</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950">Entrar al sistema</h1>
        <p className="mt-2 text-sm text-zinc-600">Portal de acceso para brokers, coordinación y administración comercial de Valterra.</p>
        <div className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
          Si necesitas acceso, solicita tus credenciales al administrador del sistema.
        </div>
        <div className="mt-4 text-sm text-zinc-600">
          Si llegaste aquí desde búsqueda o una liga antigua, usa el{" "}
          <Link href="/brokers" className="font-medium text-zinc-950 underline underline-offset-4">
            portal para brokers
          </Link>{" "}
          como entrada pública.
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
