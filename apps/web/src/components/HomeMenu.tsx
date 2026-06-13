"use client";

const HOME_MENU_ITEMS = [
  "sitcom",
  "telegaribaldi",
  "show",
  "morning",
  "rubriche",
  "news",
  "web-live"
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
            <a
              key={item}
              href={`#${item}`}
              className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition duration-200 ease-stream-out hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
