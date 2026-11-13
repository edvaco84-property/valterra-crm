import { Building2, LogOut, UserCircle2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth/session";
import { getMarketLabel } from "@/lib/markets";

export async function Topbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(18,16,15,0.78)] px-4 py-3 backdrop-blur-2xl md:px-6 md:py-4 lg:static lg:bg-white/8 lg:px-7">
      <div className="mx-auto w-full max-w-[430px] md:max-w-none lg:flex lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="rounded-[18px] border border-white/15 bg-white/10 p-2.5 text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-3">
            <Building2 className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="pr-16 md:pr-0">
            <p className="max-w-[12rem] truncate text-xs text-zinc-400 md:max-w-none md:text-sm">{user ? `Sesión activa como ${user.email}` : "Configura sesión para trabajar con datos reales."}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">Hola, {user?.name ?? "equipo Valterra"}</h2>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 lg:mt-0">
          {user ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-zinc-200 md:text-sm">
              <Building2 className="h-4 w-4 text-amber-200" />
              {getMarketLabel(user.market)}
            </div>
          ) : null}
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-3 py-2 text-xs text-zinc-100 shadow-sm sm:text-sm">
            <UserCircle2 className="h-5 w-5 text-amber-200" />
            {user?.role ?? "DEMO"}
          </div>
          {user ? (
            <form action={logoutAction} className="lg:block">
              <button className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-zinc-100 transition hover:bg-white/14 sm:text-sm">
                <LogOut className="h-4 w-4" />
                <span className="lg:inline">Salir</span>
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
