import {
  DEFAULT_HOME_CONFIG,
  type HomeVideoItem,
  type VideoGalleryModuleConfig
} from "@/lib/home-config";

export type ModuleMediaOrderBy = "newest" | "oldest" | "title";

export type ModuleMediaQuery = {
  category?: string;
  search?: string;
  limit: number;
  orderBy: ModuleMediaOrderBy;
};

export type ModuleConfigRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  mediaQuery: ModuleMediaQuery;
  sortOrder: number;
  isActive: boolean;
};

export type ModuleConfigInput = {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  mediaQuery: ModuleMediaQuery;
  sortOrder: number;
  isActive: boolean;
};

type VideoContentLike = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  category: string;
  releaseDate: Date | string;
};

export const MODULE_CATEGORY_OPTIONS = [
  "REAL_TIME",
  "DMAX",
  "NOVE",
  "FOOD_NETWORK",
  "HGTV",
  "MOTOR_TREND",
  "WARNER_TV",
  "DISCOVERY",
  "OTHER"
] as const;

export function slugifyModuleTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeMediaQuery(value: unknown): ModuleMediaQuery {
  const query = value && typeof value === "object" ? value as Partial<ModuleMediaQuery> : {};
  const orderBy = query.orderBy;

  return {
    category:
      typeof query.category === "string" && query.category.trim()
        ? query.category.trim()
        : undefined,
    search:
      typeof query.search === "string" && query.search.trim()
        ? query.search.trim()
        : undefined,
    limit:
      typeof query.limit === "number" && Number.isFinite(query.limit)
        ? Math.min(48, Math.max(1, Math.round(query.limit)))
        : 12,
    orderBy:
      orderBy === "oldest" || orderBy === "title" || orderBy === "newest"
        ? orderBy
        : "newest"
  };
}

export function normalizeModuleConfig(
  value: unknown,
  index: number
): ModuleConfigInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const module = value as Partial<ModuleConfigInput>;
  const title = typeof module.title === "string" ? module.title.trim() : "";

  if (!title) {
    return null;
  }

  const slug =
    typeof module.slug === "string" && module.slug.trim()
      ? slugifyModuleTitle(module.slug)
      : slugifyModuleTitle(title);

  return {
    id:
      typeof module.id === "string" && !module.id.startsWith("temp-")
        ? module.id
        : undefined,
    slug: slug || `modulo-${index + 1}`,
    title,
    subtitle:
      typeof module.subtitle === "string" && module.subtitle.trim()
        ? module.subtitle.trim()
        : undefined,
    mediaQuery: normalizeMediaQuery(module.mediaQuery),
    sortOrder: (index + 1) * 10,
    isActive: typeof module.isActive === "boolean" ? module.isActive : true
  };
}

export function normalizeModuleConfigs(values: unknown): ModuleConfigInput[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map(normalizeModuleConfig)
    .filter((module): module is ModuleConfigInput => Boolean(module));
}

export function getDefaultModuleConfigs(): ModuleConfigRecord[] {
  return DEFAULT_HOME_CONFIG.modules.map((module, index) => ({
    id: module.id,
    slug: module.id,
    title: module.title,
    subtitle: module.subtitle,
    mediaQuery: {
      search: module.title,
      limit: 12,
      orderBy: "newest"
    },
    sortOrder: (index + 1) * 10,
    isActive: module.isEnabled
  }));
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0m";
  }

  const minutes = Math.max(1, Math.round(seconds / 60));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function videoContentToHomeVideoItem(video: VideoContentLike): HomeVideoItem {
  return {
    id: video.id,
    title: video.title,
    description: video.description ?? "",
    notes: video.description ?? undefined,
    series: String(video.category).replaceAll("_", " "),
    thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.videoUrl,
    category: String(video.category).replaceAll("_", " "),
    duration: formatDuration(video.duration)
  };
}

export function buildVideoGalleryModule(
  module: ModuleConfigRecord,
  items: HomeVideoItem[]
): VideoGalleryModuleConfig {
  return {
    id: module.slug,
    type: "video-gallery",
    title: module.title,
    subtitle: module.subtitle,
    isEnabled: module.isActive,
    defaultVideoId: items[0]?.id,
    items
  };
}
