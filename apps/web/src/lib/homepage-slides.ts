import type { HeroSlide } from "@/components/HeroCarousel";
import { DEFAULT_HOME_CONFIG } from "@/lib/home-config";

export type HomepageSlideInput = {
  id?: string;
  title: string;
  subtitle?: string;
  notes?: string;
  imageUrl: string;
  linkUrl?: string;
  linkLabel?: string;
  notesColor: string;
  buttonTextColor: string;
  buttonBgColor: string;
  imageEffectMs: number;
  textEffectMs: number;
  sortOrder: number;
  isActive: boolean;
};

export type HomepageSlideRecord = HomepageSlideInput & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export function toHeroSlide(slide: HomepageSlideRecord): HeroSlide {
  return {
    id: slide.id,
    eyebrow: slide.subtitle || "FlixTV",
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.notes || "",
    notes: slide.notes,
    imageUrl: slide.imageUrl,
    ctaLabel: slide.linkLabel || "Guarda",
    href: slide.linkUrl || "#web-live",
    notesColor: slide.notesColor,
    buttonTextColor: slide.buttonTextColor,
    buttonBgColor: slide.buttonBgColor,
    imageEffectMs: slide.imageEffectMs,
    textEffectMs: slide.textEffectMs
  };
}

export function getDefaultHomepageSlides(): HomepageSlideRecord[] {
  return DEFAULT_HOME_CONFIG.head.slides.map((slide, index) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.eyebrow,
    notes: slide.description,
    imageUrl: slide.imageUrl,
    linkUrl: slide.href,
    linkLabel: slide.ctaLabel,
    notesColor: slide.notesColor ?? "#ffffff",
    buttonTextColor: slide.buttonTextColor ?? "#000000",
    buttonBgColor: slide.buttonBgColor ?? "#ffffff",
    imageEffectMs: slide.imageEffectMs ?? DEFAULT_HOME_CONFIG.head.autoplayMs,
    textEffectMs: slide.textEffectMs ?? 1500,
    sortOrder: (index + 1) * 10,
    isActive: true
  }));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function normalizeHomepageSlide(
  value: unknown,
  index: number
): HomepageSlideInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const slide = value as Partial<HomepageSlideInput>;
  const title = isString(slide.title) ? slide.title.trim() : "";
  const imageUrl = isString(slide.imageUrl) ? slide.imageUrl.trim() : "";

  if (!title || !imageUrl) {
    return null;
  }

  return {
    id: isString(slide.id) && !slide.id.startsWith("temp-") ? slide.id : undefined,
    title,
    subtitle: isString(slide.subtitle) ? slide.subtitle.trim() : undefined,
    notes: isString(slide.notes) ? slide.notes.trim() : undefined,
    imageUrl,
    linkUrl: isString(slide.linkUrl) ? slide.linkUrl.trim() : undefined,
    linkLabel: isString(slide.linkLabel) ? slide.linkLabel.trim() : undefined,
    notesColor: isHexColor(slide.notesColor) ? slide.notesColor : "#ffffff",
    buttonTextColor: isHexColor(slide.buttonTextColor)
      ? slide.buttonTextColor
      : "#000000",
    buttonBgColor: isHexColor(slide.buttonBgColor) ? slide.buttonBgColor : "#ffffff",
    imageEffectMs: isNumber(slide.imageEffectMs)
      ? Math.max(1000, Math.round(slide.imageEffectMs))
      : 6000,
    textEffectMs: isNumber(slide.textEffectMs)
      ? Math.max(300, Math.round(slide.textEffectMs))
      : 1500,
    sortOrder: (index + 1) * 10,
    isActive: typeof slide.isActive === "boolean" ? slide.isActive : true
  };
}

export function normalizeHomepageSlides(values: unknown): HomepageSlideInput[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map(normalizeHomepageSlide)
    .filter((slide): slide is HomepageSlideInput => Boolean(slide));
}
