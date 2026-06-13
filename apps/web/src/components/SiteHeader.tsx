"use client";

import { Search, Tv } from "lucide-react";

const MAIN_NAV_ITEMS = [
  "sitcom",
  "telegaribaldi",
  "show",
  "morning",
  "rubriche",
  "news",
  "web-live"
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-header border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-content items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="flex shrink-0 items-center gap-2" aria-label="FlixTV home">
          <span className="grid h-10 w-10 place-items-center rounded-sm bg-white text-xl font-black text-black">
            F
          </span>
          <span className="text-2xl font-black uppercase leading-none tracking-wide text-white">
            FlixTV
          </span>
        </a>

        <nav
          aria-label="Menu principale"
          className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex"
        >
          {MAIN_NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className="text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition hover:text-white"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Cerca"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Search size={20} />
          </button>
          <a
            href="#web-live"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90"
          >
            <Tv size={18} />
            Live
          </a>
        </div>
      </div>
    </header>
  );
}
