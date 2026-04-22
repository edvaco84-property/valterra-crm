import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

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
        <p className="mt-2 text-sm text-zinc-600">Demo inicial con sesión por cookie segura. Nada glamoroso, pero ya abre la puerta.</p>
        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          Usuario seed: <strong>boss@valterra.mx</strong><br />
          Password seed: <strong>demo12345</strong>
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
