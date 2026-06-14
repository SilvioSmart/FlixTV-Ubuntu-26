import type { HeroSlide } from "@/components/HeroCarousel";

export type HomeVideoItem = {
  id: string;
  title: string;
  description: string;
  notes?: string;
  series?: string;
  episode?: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  duration: string;
};

export type VideoGalleryModuleConfig = {
  id: string;
  type: "video-gallery";
  title: string;
  subtitle?: string;
  isEnabled: boolean;
  defaultVideoId?: string;
  items: HomeVideoItem[];
};

export type HomeHeadConfig = {
  isEnabled: boolean;
  autoplayMs: number;
  slides: HeroSlide[];
};

export type HomeConfig = {
  head: HomeHeadConfig;
  modules: VideoGalleryModuleConfig[];
};

const DEMO_VIDEO_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  head: {
    isEnabled: true,
    autoplayMs: 6000,
    slides: [
      {
        id: "hero-web-live",
        eyebrow: "In diretta",
        title: "FlixTV Live",
        description:
          "Guarda il flusso live del canale, passa alle videogallery e ritrova i contenuti piu seguiti in una home modulare.",
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=85",
        ctaLabel: "Guarda ora",
        href: "#web-live"
      },
      {
        id: "hero-telegaribaldi",
        eyebrow: "News",
        title: "Telegaribaldi",
        description:
          "Informazione, territorio e aggiornamenti quotidiani con un taglio diretto e riconoscibile.",
        imageUrl:
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1800&q=85",
        ctaLabel: "Vedi le news",
        href: "#telegaribaldi"
      },
      {
        id: "hero-show",
        eyebrow: "Intrattenimento",
        title: "Show",
        description:
          "Programmi, rubriche e format originali pensati per una visione semplice su mobile, tablet e TV.",
        imageUrl:
          "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1800&q=85",
        ctaLabel: "Scopri gli show",
        href: "#show"
      }
    ]
  },
  modules: [
    {
      id: "sitcom",
      type: "video-gallery",
      title: "Sitcom",
      subtitle: "Una selezione di episodi comedy e serie leggere.",
      isEnabled: true,
      defaultVideoId: "sitcom-1",
      items: [
        {
          id: "sitcom-1",
          title: "Cash or Trash: la notte delle occasioni",
          description: "Oggetti rari, trattative serrate e collezionisti pronti a rischiare.",
          notes: "Trattative serrate e oggetti rari in studio.",
          series: "Sitcom",
          episode: "Episodio 1",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Sitcom",
          duration: "48m"
        },
        {
          id: "sitcom-2",
          title: "Primo Appuntamento: storie inaspettate",
          description: "Nuovi incontri, tavoli pieni di tensione e svolte romantiche.",
          notes: "Incontri, equivoci e svolte romantiche.",
          series: "Sitcom",
          episode: "Episodio 2",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Sitcom",
          duration: "52m"
        }
      ]
    },
    {
      id: "fuori-corso",
      type: "video-gallery",
      title: "Fuori Corso",
      subtitle: "Coinquilini, esami impossibili e vita universitaria fuori programma.",
      isEnabled: true,
      defaultVideoId: "fuori-corso-1",
      items: [
        {
          id: "fuori-corso-1",
          title: "Fuori Corso: matricole allo sbando",
          description: "Coinquilini, esami impossibili e una vita universitaria sempre fuori programma.",
          notes: "Matricole allo sbando tra lezioni e coinquilini.",
          series: "Fuori Corso",
          episode: "Puntata 1",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Fuori Corso",
          duration: "26m"
        },
        {
          id: "fuori-corso-2",
          title: "Fuori Corso: appello finale",
          description: "La sessione si avvicina e ogni scusa diventa una strategia di sopravvivenza.",
          notes: "La sessione si avvicina e nessuno e pronto.",
          series: "Fuori Corso",
          episode: "Puntata 2",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Fuori Corso",
          duration: "24m"
        }
      ]
    },
    {
      id: "bed-and-breakfast",
      type: "video-gallery",
      title: "Bed&Breakfast",
      subtitle: "Ospiti difficili, prenotazioni doppie e una reception che non dorme mai.",
      isEnabled: true,
      defaultVideoId: "bed-breakfast-1",
      items: [
        {
          id: "bed-breakfast-1",
          title: "Bed&Breakfast: stanza con imprevisto",
          description: "Ospiti difficili, prenotazioni doppie e una reception che non dorme mai.",
          notes: "Prenotazioni doppie e ospiti difficili.",
          series: "Bed&Breakfast",
          episode: "Puntata 1",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Bed&Breakfast",
          duration: "28m"
        },
        {
          id: "bed-breakfast-2",
          title: "Bed&Breakfast: colazione agitata",
          description: "Una mattina qualunque diventa una catena di equivoci tutta da ridere.",
          notes: "Una colazione tranquilla diventa ingestibile.",
          series: "Bed&Breakfast",
          episode: "Puntata 2",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Bed&Breakfast",
          duration: "25m"
        }
      ]
    },
    {
      id: "tutti-a-casa",
      type: "video-gallery",
      title: "Tutti a Casa",
      subtitle: "Una famiglia rumorosa, una casa troppo piccola e nessuna via di fuga.",
      isEnabled: true,
      defaultVideoId: "tutti-casa-1",
      items: [
        {
          id: "tutti-casa-1",
          title: "Tutti a Casa: parenti in arrivo",
          description: "Una famiglia rumorosa, una casa troppo piccola e nessuna via di fuga.",
          notes: "Parenti in arrivo e spazi sempre piu stretti.",
          series: "Tutti a Casa",
          episode: "Puntata 1",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Tutti a Casa",
          duration: "27m"
        },
        {
          id: "tutti-casa-2",
          title: "Tutti a Casa: cena di pace",
          description: "Quando tutti promettono calma, la serata diventa subito memorabile.",
          notes: "Una cena di pace con troppe cose da chiarire.",
          series: "Tutti a Casa",
          episode: "Puntata 2",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "Tutti a Casa",
          duration: "23m"
        }
      ]
    },
    {
      id: "telegaribaldi",
      type: "video-gallery",
      title: "Telegaribaldi",
      subtitle: "News e approfondimenti dal territorio.",
      isEnabled: true,
      defaultVideoId: "telegaribaldi-1",
      items: [
        {
          id: "telegaribaldi-1",
          title: "Telegaribaldi: edizione del giorno",
          description: "Le principali notizie della giornata in formato video.",
          notes: "Aggiornamento quotidiano con le notizie principali.",
          series: "Telegaribaldi",
          episode: "Edizione del giorno",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
          videoUrl: DEMO_VIDEO_URL,
          category: "News",
          duration: "32m"
        }
      ]
    }
  ]
};

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeHeroSlide(value: unknown, index: number): HeroSlide | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const slide = value as Partial<HeroSlide>;

  if (
    !isString(slide.title) ||
    !isString(slide.imageUrl) ||
    !isString(slide.description)
  ) {
    return null;
  }

  return {
    id: isString(slide.id) ? slide.id : `hero-${index + 1}`,
    eyebrow: isString(slide.eyebrow) ? slide.eyebrow : "FlixTV",
    title: slide.title,
    description: slide.description,
    imageUrl: slide.imageUrl,
    ctaLabel: isString(slide.ctaLabel) ? slide.ctaLabel : "Guarda",
    href: isString(slide.href) ? slide.href : "#web-live"
  };
}

function normalizeVideoItem(value: unknown, index: number): HomeVideoItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<HomeVideoItem>;

  if (!isString(item.title) || !isString(item.thumbnailUrl) || !isString(item.videoUrl)) {
    return null;
  }

  return {
    id: isString(item.id) ? item.id : `video-${index + 1}`,
    title: item.title,
    description: isString(item.description) ? item.description : "",
    notes: isString(item.notes) ? item.notes : undefined,
    series: isString(item.series) ? item.series : isString(item.category) ? item.category : undefined,
    episode: isString(item.episode) ? item.episode : undefined,
    thumbnailUrl: item.thumbnailUrl,
    videoUrl: item.videoUrl,
    category: isString(item.category) ? item.category : "Video",
    duration: isString(item.duration) ? item.duration : "0m"
  };
}

function normalizeModule(value: unknown, index: number): VideoGalleryModuleConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const module = value as Partial<VideoGalleryModuleConfig>;
  const items = Array.isArray(module.items)
    ? module.items.map(normalizeVideoItem).filter((item): item is HomeVideoItem => Boolean(item))
    : [];

  if (!isString(module.title) || items.length === 0) {
    return null;
  }

  return {
    id: isString(module.id) ? module.id : `module-${index + 1}`,
    type: "video-gallery",
    title: module.title,
    subtitle: isString(module.subtitle) ? module.subtitle : undefined,
    isEnabled: isBoolean(module.isEnabled) ? module.isEnabled : true,
    defaultVideoId: isString(module.defaultVideoId) ? module.defaultVideoId : items[0]?.id,
    items
  };
}

export function normalizeHomeConfig(value: unknown): HomeConfig {
  if (!value || typeof value !== "object") {
    return DEFAULT_HOME_CONFIG;
  }

  const config = value as Partial<HomeConfig>;
  const head = config.head && typeof config.head === "object" ? config.head : {};
  const slides = Array.isArray((head as Partial<HomeHeadConfig>).slides)
    ? (head as Partial<HomeHeadConfig>).slides
        ?.map(normalizeHeroSlide)
        .filter((slide): slide is HeroSlide => Boolean(slide)) ?? []
    : [];

  const modules = Array.isArray(config.modules)
    ? config.modules
        .map(normalizeModule)
        .filter((module): module is VideoGalleryModuleConfig => Boolean(module))
    : [];

  return {
    head: {
      isEnabled: isBoolean((head as Partial<HomeHeadConfig>).isEnabled)
        ? Boolean((head as Partial<HomeHeadConfig>).isEnabled)
        : DEFAULT_HOME_CONFIG.head.isEnabled,
      autoplayMs: isNumber((head as Partial<HomeHeadConfig>).autoplayMs)
        ? Math.max(3000, Number((head as Partial<HomeHeadConfig>).autoplayMs))
        : DEFAULT_HOME_CONFIG.head.autoplayMs,
      slides: slides.length > 0 ? slides : DEFAULT_HOME_CONFIG.head.slides
    },
    modules: modules.length > 0 ? modules : DEFAULT_HOME_CONFIG.modules
  };
}
