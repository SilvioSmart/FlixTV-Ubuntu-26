"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  href: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  className?: string;
};

export default function HeroCarousel({ slides, className = "" }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = useMemo(() => {
    return slides[activeIndex] ?? slides[0];
  }, [activeIndex, slides]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? Math.max(slides.length - 1, 0) : currentIndex - 1
    );
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((currentIndex) =>
      currentIndex >= slides.length - 1 ? 0 : currentIndex + 1
    );
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(goToNext, 6_000);

    return () => window.clearInterval(intervalId);
  }, [goToNext, isPaused, slides.length]);

  if (!activeSlide) {
    return null;
  }

  return (
    <section
      className={`relative isolate overflow-hidden bg-black ${className}`}
      aria-label="Contenuti in evidenza"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-0">
        <img
          key={activeSlide.id}
          src={activeSlide.imageUrl}
          alt=""
          className="hero-carousel-image h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas-950 to-transparent" />
      </div>

      <div className="relative flex min-h-[500px] w-full items-end px-4 pb-10 pt-20 sm:min-h-[560px] sm:px-6 lg:min-h-[640px] lg:px-10 xl:px-14 2xl:px-16">
        <div key={activeSlide.id} className="reveal-from-screen-left max-w-2xl text-left">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">
            {activeSlide.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-6xl lg:text-7xl">
            {activeSlide.title}
          </h1>
          <p className="mt-5 max-w-xl text-left text-base leading-7 text-white/75 sm:text-lg">
            {activeSlide.description}
          </p>
          <a
            href={activeSlide.href}
            className="mt-7 inline-flex h-12 items-center gap-3 rounded-md bg-white px-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-white/90"
          >
            <Play size={18} fill="currentColor" />
            {activeSlide.ctaLabel}
          </a>
        </div>

        <div className="absolute bottom-10 right-4 flex items-center gap-2 sm:right-6 lg:right-10 xl:right-14 2xl:right-16">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Slide precedente"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:bg-white hover:text-black"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Slide successiva"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:bg-white hover:text-black"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="absolute bottom-5 left-4 flex gap-2 sm:left-6 lg:left-10 xl:left-14 2xl:left-16">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Vai alla slide ${index + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: index === activeIndex ? "34px" : "12px",
                backgroundColor: index === activeIndex ? "white" : "rgba(255,255,255,0.35)"
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
