"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  description: string;
  notes?: string;
  imageUrl: string;
  ctaLabel: string;
  secondaryCtaLabel?: string;
  href: string;
  notesColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  imageEffectMs?: number;
  textEffectMs?: number;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  autoplayMs?: number;
  className?: string;
};

export default function HeroCarousel({
  slides,
  autoplayMs = 6000,
  className = ""
}: HeroCarouselProps) {
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

    const intervalId = window.setInterval(goToNext, autoplayMs);

    return () => window.clearInterval(intervalId);
  }, [autoplayMs, goToNext, isPaused, slides.length]);

  if (!activeSlide) {
    return null;
  }

  const textEffectMs = activeSlide.textEffectMs ?? 1500;

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
        <div className="hero-carousel-imageFrame absolute inset-y-0 right-0 w-full">
          <img
            key={activeSlide.id}
            src={activeSlide.imageUrl}
            alt=""
            className="hero-carousel-image h-full w-full object-contain object-right opacity-85"
            style={{
              animationDuration: `${activeSlide.imageEffectMs ?? autoplayMs}ms`
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas-950 to-transparent" />
      </div>

      <div className="relative flex min-h-[500px] w-full items-end px-4 pb-10 pt-20 sm:min-h-[560px] sm:px-6 lg:min-h-[640px] lg:px-10 xl:px-14 2xl:px-16">
        <div
          key={activeSlide.id}
          className="max-w-2xl text-left"
        >
          <p
            className="hero-text-reveal text-xs font-black uppercase tracking-[0.22em] text-white/60"
            style={{
              animationDuration: `${textEffectMs}ms`
            }}
          >
            {activeSlide.eyebrow}
          </p>
          <h1
            className="hero-text-reveal mt-3 text-4xl font-black uppercase leading-none text-white sm:text-6xl lg:text-7xl"
            style={{
              animationDelay: `${Math.round(textEffectMs * 0.12)}ms`,
              animationDuration: `${textEffectMs}ms`
            }}
          >
            {activeSlide.title}
          </h1>
          {activeSlide.subtitle ? (
            <h2
              className="hero-text-reveal mt-3 max-w-2xl text-xl font-black uppercase leading-tight text-white/85 sm:text-2xl"
              style={{
                animationDelay: `${Math.round(textEffectMs * 0.22)}ms`,
                animationDuration: `${textEffectMs}ms`
              }}
            >
              {activeSlide.subtitle}
            </h2>
          ) : null}
          <p
            className="hero-text-reveal mt-5 max-w-xl text-left text-base leading-7 text-white/75 sm:text-lg"
            style={{
              animationDelay: `${Math.round(textEffectMs * 0.32)}ms`,
              animationDuration: `${textEffectMs}ms`,
              color: activeSlide.notesColor ?? undefined
            }}
          >
            {activeSlide.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={activeSlide.href}
              className="hero-text-reveal inline-flex h-12 items-center gap-3 rounded-md bg-white px-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-white/90"
              style={{
                animationDelay: `${Math.round(textEffectMs * 0.42)}ms`,
                animationDuration: `${textEffectMs}ms`,
                backgroundColor: activeSlide.buttonBgColor ?? undefined,
                color: activeSlide.buttonTextColor ?? undefined
              }}
            >
              <Play size={18} fill="currentColor" />
              {activeSlide.ctaLabel}
            </a>
            {activeSlide.secondaryCtaLabel ? (
              <a
                href={activeSlide.href}
                className="hero-text-reveal inline-flex h-12 items-center rounded-md border px-5 text-sm font-black uppercase tracking-[0.12em] transition hover:bg-white/10"
                style={{
                  animationDelay: `${Math.round(textEffectMs * 0.5)}ms`,
                  animationDuration: `${textEffectMs}ms`,
                  borderColor: activeSlide.buttonBgColor ?? undefined,
                  color: activeSlide.buttonBgColor ?? undefined
                }}
              >
                {activeSlide.secondaryCtaLabel}
              </a>
            ) : null}
          </div>
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
