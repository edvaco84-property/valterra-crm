import { Bell, LogOut, Search, UserCircle2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth/session";

export async function Topbar() {
  const user = await getSessionUser();

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-zinc-500">{user ? `Sesión activa como ${user.email}` : "Configura sesión para trabajar con datos reales."}</p>
        <h2 className="text-xl font-semibold text-zinc-950">Hola, {user?.name ?? "equipo Valterra"}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-500 md:flex">
          <Search className="h-4 w-4" />
          Buscar leads, propiedades o tareas
        </div>
        <button className="rounded-2xl border border-zinc-200 p-2 text-zinc-600">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          <UserCircle2 className="h-5 w-5" />
          {user?.role ?? "DEMO"}
        </div>
        {user ? (
          <form action={logoutAction}>
            <button className="flex items-center gap-2 rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
