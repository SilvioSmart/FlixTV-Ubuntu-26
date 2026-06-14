"use client";

const HOME_MENU_ITEMS = [
  {
    label: "sitcom",
    href: "#sitcom",
    submenu: [
      {
        label: "Fuori Corso",
        href: "#fuori-corso"
      },
      {
        label: "Bed&Breakfast",
        href: "#bed-and-breakfast"
      },
      {
        label: "Tutti a Casa",
        href: "#tutti-a-casa"
      }
    ]
  },
  {
    label: "telegaribaldi",
    href: "#telegaribaldi"
  },
  {
    label: "show",
    href: "#show"
  },
  {
    label: "morning",
    href: "#morning"
  },
  {
    label: "rubriche",
    href: "#rubriche"
  },
  {
    label: "news",
    href: "#news"
  },
  {
    label: "web-live",
    href: "#web-live"
  }
];

export default function HomeMenu() {
  return (
    <nav
      aria-label="Sezioni principali"
      className="border-b border-white/10 bg-canvas-900/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3">
          {HOME_MENU_ITEMS.map((item) => (
            <div key={item.label} className="group relative shrink-0">
              <a
                href={item.href}
                className="flex rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition duration-200 ease-stream-out hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                {item.label}
              </a>

              {item.submenu ? (
                <div className="mt-2 flex gap-2 lg:absolute lg:left-0 lg:top-full lg:z-overlay lg:mt-3 lg:hidden lg:min-w-[260px] lg:flex-col lg:rounded-md lg:border lg:border-white/10 lg:bg-black/95 lg:p-2 lg:shadow-rail lg:backdrop-blur-xl lg:group-hover:flex lg:group-focus-within:flex">
                  {item.submenu.map((submenuItem) => (
                    <a
                      key={submenuItem.href}
                      href={submenuItem.href}
                      className="shrink-0 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/60 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white lg:border-transparent lg:bg-transparent"
                    >
                      {submenuItem.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
