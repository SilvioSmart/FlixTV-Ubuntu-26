"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

export type VodItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  duration: string;
};

type VodCarouselProps = {
  id?: string;
  title: string;
  items: VodItem[];
  emptyMessage?: string;
  className?: string;
};

export default function VodCarousel({
  id,
  title,
  items,
  emptyMessage = "No titles available in this row.",
  className = ""
}: VodCarouselProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.18
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={className}
      aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}
    >
      <div
        className={`mb-3 flex items-end justify-between gap-4 px-1 ${
          isVisible ? "reveal-from-left" : "opacity-0"
        }`}
      >
        <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-xl font-black text-white sm:text-2xl">
          {title}
        </h2>
        <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-white/40 sm:inline">
          Stream-9
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-sm font-medium text-white/55">
          {emptyMessage}
        </div>
      ) : (
        <div className="snap-x overflow-x-auto scroll-smooth pb-3">
          <div className="flex min-w-max gap-3 sm:gap-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="group w-[188px] shrink-0 snap-start overflow-hidden rounded-md border border-white/10 bg-white/[0.05] transition duration-200 ease-stream-out hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] sm:w-[236px] lg:w-[260px]"
              >
                <div className="relative aspect-video overflow-hidden bg-canvas-800">
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 ease-stream-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <button
                    type="button"
                    aria-label={`Play ${item.title}`}
                    className="absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black opacity-95 transition group-hover:scale-105"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur">
                    {item.duration}
                  </span>
                </div>

                <div className="space-y-2 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {item.category}
                  </div>
                  <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white sm:text-base">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-5 text-white/50 sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
