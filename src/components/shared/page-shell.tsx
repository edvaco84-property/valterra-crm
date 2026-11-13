import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-0 py-0 md:px-4 md:py-4 lg:px-5 lg:py-5">
      <div className="flex min-h-screen border-white/10 bg-white/6 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl md:min-h-[calc(100vh-32px)] md:rounded-[32px] md:border">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <MobileNav />
          <main className="p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6 lg:p-7">
            <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-none">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
