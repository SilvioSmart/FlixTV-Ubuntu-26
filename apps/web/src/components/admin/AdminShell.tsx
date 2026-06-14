"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Clapperboard,
  Home,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  Radio,
  UploadCloud
} from "lucide-react";
import { buildBackendUrl } from "@/lib/platform-config";

const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/admin/menu-cfg",
    label: "menu cfg",
    icon: Menu
  },
  {
    href: "/admin/homepage-cfg",
    label: "homepage-cfg",
    icon: Home
  },
  {
    href: "/admin/moduli-cfg",
    label: "moduli cfg",
    icon: ListTree
  },
  {
    href: "/admin/media-load-conv",
    label: "media load/conv",
    icon: UploadCloud
  },
  {
    href: "/admin/live-epg-cfg",
    label: "live/epg cfg",
    icon: Radio
  }
];

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch(buildBackendUrl("/api/admin/logout"), {
      method: "POST",
      credentials: "include"
    });
    router.push("/admin/login");
  }

  return (
    <main className="min-h-viewport bg-canvas-950 text-white">
      <div className="grid min-h-viewport lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-black/90 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
            <a href="/admin" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-sm bg-white text-xl font-black text-black">
                F
              </span>
              <span>
                <span className="block text-lg font-black uppercase leading-none">FlixTV</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Backoffice
                </span>
              </span>
            </a>

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:pb-0">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-bold uppercase tracking-[0.08em] transition lg:flex"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.62)"
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden px-3 pb-5 pt-6 lg:block">
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/10 text-sm font-bold uppercase tracking-[0.1em] text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              CMS gestione
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">{title}</h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">
                {description}
              </p>
            ) : null}
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
