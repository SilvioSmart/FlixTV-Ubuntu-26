"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NETWORK_OPTIONS,
  type NetworkId,
  type NetworkOption
} from "@/components/ChannelSwitcher";
import EpgGrid, { type EpgProgram } from "@/components/EpgGrid";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import HomeMenu from "@/components/HomeMenu";
import SiteHeader from "@/components/SiteHeader";
import VideoPlayer from "@/components/VideoPlayer";
import VodCarousel, { type VodItem } from "@/components/VodCarousel";
import { buildBackendUrl, buildVastTagUrl } from "@/lib/platform-config";

type LiveChannel = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
};

type ChannelsResponse = {
  channels?: LiveChannel[];
};

type EpgResponse = {
  programs?: EpgProgram[];
};

const FALLBACK_CHANNELS: Record<NetworkId, LiveChannel> = {
  nove: {
    id: "fallback-nove",
    name: "Nove",
    logoUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=320&q=80",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  "real-time": {
    id: "fallback-real-time",
    name: "Real Time",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=320&q=80",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  dmax: {
    id: "fallback-dmax",
    name: "DMAX",
    logoUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  }
};

const DEFAULT_FALLBACK_CHANNEL = FALLBACK_CHANNELS.nove;
const EMPTY_EPG: EpgProgram[] = [];

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-web-live",
    eyebrow: "In diretta",
    title: "FlixTV Live",
    description: "Guarda il flusso live del canale, passa alla guida TV e ritrova i contenuti piu seguiti in una home veloce e televisiva.",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=85",
    ctaLabel: "Guarda ora",
    href: "#web-live"
  },
  {
    id: "hero-telegaribaldi",
    eyebrow: "News",
    title: "Telegaribaldi",
    description: "Informazione, territorio e aggiornamenti quotidiani con un taglio diretto e riconoscibile.",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1800&q=85",
    ctaLabel: "Vedi le news",
    href: "#telegaribaldi"
  },
  {
    id: "hero-show",
    eyebrow: "Intrattenimento",
    title: "Show",
    description: "Programmi, rubriche e format originali pensati per una visione semplice su mobile, tablet e TV.",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1800&q=85",
    ctaLabel: "Scopri gli show",
    href: "#show"
  }
];

const VOD_ITEMS: VodItem[] = [
  {
    id: "vod-1",
    title: "Cash or Trash: la notte delle occasioni",
    description: "Oggetti rari, trattative serrate e collezionisti pronti a rischiare.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=900&q=80",
    category: "Nove",
    duration: "48m"
  },
  {
    id: "vod-2",
    title: "Primo Appuntamento: storie inaspettate",
    description: "Nuovi incontri, tavoli pieni di tensione e svolte romantiche.",
    thumbnailUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
    category: "Real Time",
    duration: "52m"
  },
  {
    id: "vod-3",
    title: "Airport Security: confini caldi",
    description: "Controlli, intuizioni e casi ad alta pressione negli scali internazionali.",
    thumbnailUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    category: "DMAX",
    duration: "44m"
  },
  {
    id: "vod-4",
    title: "Fratelli di Crozza: best of",
    description: "Satira, imitazioni e i momenti piu taglienti della stagione.",
    thumbnailUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80",
    category: "Nove",
    duration: "66m"
  },
  {
    id: "vod-5",
    title: "Vite al limite: il nuovo percorso",
    description: "Una trasformazione personale raccontata con delicatezza e realismo.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    category: "Real Time",
    duration: "1h 26m"
  },
  {
    id: "vod-6",
    title: "Motori impossibili",
    description: "Officine, restauri estremi e test su strada senza margine di errore.",
    thumbnailUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    category: "DMAX",
    duration: "41m"
  }
];

const SITCOM_FUORI_CORSO_ITEMS: VodItem[] = [
  {
    id: "fuori-corso-1",
    title: "Fuori Corso: matricole allo sbando",
    description: "Coinquilini, esami impossibili e una vita universitaria sempre fuori programma.",
    thumbnailUrl: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
    category: "Fuori Corso",
    duration: "26m"
  },
  {
    id: "fuori-corso-2",
    title: "Fuori Corso: appello finale",
    description: "La sessione si avvicina e ogni scusa diventa una strategia di sopravvivenza.",
    thumbnailUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?auto=format&fit=crop&w=900&q=80",
    category: "Fuori Corso",
    duration: "24m"
  }
];

const SITCOM_BED_AND_BREAKFAST_ITEMS: VodItem[] = [
  {
    id: "bed-breakfast-1",
    title: "Bed&Breakfast: stanza con imprevisto",
    description: "Ospiti difficili, prenotazioni doppie e una reception che non dorme mai.",
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    category: "Bed&Breakfast",
    duration: "28m"
  },
  {
    id: "bed-breakfast-2",
    title: "Bed&Breakfast: colazione agitata",
    description: "Una mattina qualunque diventa una catena di equivoci tutta da ridere.",
    thumbnailUrl: "https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?auto=format&fit=crop&w=900&q=80",
    category: "Bed&Breakfast",
    duration: "25m"
  }
];

const SITCOM_TUTTI_A_CASA_ITEMS: VodItem[] = [
  {
    id: "tutti-casa-1",
    title: "Tutti a Casa: parenti in arrivo",
    description: "Una famiglia rumorosa, una casa troppo piccola e nessuna via di fuga.",
    thumbnailUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    category: "Tutti a Casa",
    duration: "27m"
  },
  {
    id: "tutti-casa-2",
    title: "Tutti a Casa: cena di pace",
    description: "Quando tutti promettono calma, la serata diventa subito memorabile.",
    thumbnailUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
    category: "Tutti a Casa",
    duration: "23m"
  }
];

const RECENT_EPISODES = [...VOD_ITEMS].reverse();

const CATEGORY_ITEMS: VodItem[] = [
  {
    id: "cat-nove",
    title: "Nove Originals",
    description: "Talk, comedy, crime e prime serate editoriali.",
    thumbnailUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    category: "Category",
    duration: "24 titles"
  },
  {
    id: "cat-real-time",
    title: "Real Time Stories",
    description: "Lifestyle, relazioni, cucina e storie quotidiane.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    category: "Category",
    duration: "31 titles"
  },
  {
    id: "cat-dmax",
    title: "DMAX Action",
    description: "Motori, survival, factual e avventure ad alta energia.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    category: "Category",
    duration: "18 titles"
  }
];

function matchesNetwork(channel: LiveChannel, networkId: NetworkId) {
  const normalizedName = channel.name.toLowerCase().replaceAll(" ", "-");
  return normalizedName.includes(networkId);
}

function getFallbackChannel(networkId: NetworkId): LiveChannel {
  return FALLBACK_CHANNELS[networkId] ?? DEFAULT_FALLBACK_CHANNEL;
}

function getFallbackEpg(channelId: string): EpgProgram[] {
  const now = new Date();
  const startOfCurrentProgram = new Date(now);
  startOfCurrentProgram.setMinutes(now.getMinutes() - 25);
  const endOfCurrentProgram = new Date(now);
  endOfCurrentProgram.setMinutes(now.getMinutes() + 35);
  const secondStart = new Date(endOfCurrentProgram);
  const secondEnd = new Date(secondStart);
  secondEnd.setMinutes(secondStart.getMinutes() + 55);
  const thirdStart = new Date(secondEnd);
  const thirdEnd = new Date(thirdStart);
  thirdEnd.setMinutes(thirdStart.getMinutes() + 60);

  return [
    {
      id: `${channelId}-now`,
      channelId,
      title: "In onda adesso",
      description: "Il programma live corrente del network selezionato.",
      startTime: startOfCurrentProgram,
      endTime: endOfCurrentProgram
    },
    {
      id: `${channelId}-next`,
      channelId,
      title: "Prossimo programma",
      description: "La prossima fascia del palinsesto di oggi.",
      startTime: secondStart,
      endTime: secondEnd
    },
    {
      id: `${channelId}-later`,
      channelId,
      title: "Prima serata",
      description: "Una selezione premium per il pubblico serale.",
      startTime: thirdStart,
      endTime: thirdEnd
    }
  ];
}

export default function HomePage() {
  const [activeNetwork, setActiveNetwork] = useState<NetworkOption>(NETWORK_OPTIONS[0] as NetworkOption);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [epgPrograms, setEpgPrograms] = useState<EpgProgram[]>(EMPTY_EPG);
  const [isChannelsLoading, setIsChannelsLoading] = useState(true);
  const [isEpgLoading, setIsEpgLoading] = useState(false);

  const activeChannel = useMemo(() => {
    return (
      channels.find((channel) => matchesNetwork(channel, activeNetwork.id)) ??
      getFallbackChannel(activeNetwork.id)
    );
  }, [activeNetwork.id, channels]);

  const filteredMostWatched = useMemo(() => {
    return VOD_ITEMS.filter((item) => item.category.toLowerCase().replaceAll(" ", "-") === activeNetwork.id);
  }, [activeNetwork.id]);

  const filteredRecentEpisodes = useMemo(() => {
    return RECENT_EPISODES.filter((item) => item.category.toLowerCase().replaceAll(" ", "-") === activeNetwork.id);
  }, [activeNetwork.id]);

  useEffect(() => {
    document.documentElement.dataset.streamNetwork = activeNetwork.id;
    document.documentElement.style.setProperty("--stream-theme", activeNetwork.themeColor);
    document.documentElement.style.setProperty("--stream-accent", activeNetwork.accentColor);
  }, [activeNetwork]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChannels() {
      setIsChannelsLoading(true);

      try {
        const response = await fetch(buildBackendUrl("/api/channels"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Unable to load channels");
        }

        const data = (await response.json()) as ChannelsResponse;
        setChannels(data.channels ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setChannels([]);
      } finally {
        setIsChannelsLoading(false);
      }
    }

    void loadChannels();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEpg() {
      if (!activeChannel) {
        setEpgPrograms(EMPTY_EPG);
        return;
      }

      setIsEpgLoading(true);

      try {
        const response = await fetch(
          buildBackendUrl(`/api/epg?channelId=${encodeURIComponent(activeChannel.id)}`),
          {
            credentials: "include",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load EPG");
        }

        const data = (await response.json()) as EpgResponse;
        setEpgPrograms(data.programs ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setEpgPrograms(getFallbackEpg(activeChannel.id));
      } finally {
        setIsEpgLoading(false);
      }
    }

    void loadEpg();

    return () => controller.abort();
  }, [activeChannel]);

  return (
    <main className="min-h-viewport bg-canvas-950 text-white">
      <SiteHeader />
      <HomeMenu />

      <HeroCarousel slides={HERO_SLIDES} />

      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-10">
        <section id="web-live" className="grid scroll-mt-32 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  Live TV
                </p>
                <h1 className="mt-1 truncate text-2xl font-black text-white sm:text-4xl">
                  {activeChannel.name}
                </h1>
              </div>
              <div
                className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black"
                style={{ backgroundColor: "var(--stream-accent, #ff6b6b)" }}
              >
                {isChannelsLoading ? "Loading" : activeNetwork.label}
              </div>
            </div>

            <VideoPlayer
              key={activeChannel.id}
              src={activeChannel.streamUrl}
              type="live"
              title={`${activeChannel.name} Live`}
              poster={activeChannel.logoUrl}
              vastTagUrl={buildVastTagUrl({
                placement: "live",
                channelId: activeChannel.id,
                network: activeNetwork.id
              })}
              muted
              className="aspect-video"
            />
          </div>

          <aside className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
            <div className="mb-5 flex items-center gap-3">
              <img
                src={activeChannel.logoUrl}
                alt=""
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-lg font-black text-white">{activeNetwork.label}</div>
                <div className="text-sm text-white/50">{activeNetwork.description}</div>
              </div>
            </div>
            <div className="space-y-3 text-sm leading-6 text-white/60">
              <p>
                Streaming live, guida TV e contenuti on demand in una sola esperienza responsive.
              </p>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                  Active stream
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-white/80">
                  {activeChannel.streamUrl}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <EpgGrid
          channelName={activeChannel.name}
          programs={epgPrograms}
          isLoading={isEpgLoading}
          emptyMessage="No programs scheduled for today on this channel."
        />

        <div className="space-y-8">
          <VodCarousel
            id="sitcom"
            className="scroll-mt-32"
            title="Sitcom"
            items={filteredMostWatched.length > 0 ? filteredMostWatched : VOD_ITEMS}
          />
          <VodCarousel
            id="fuori-corso"
            className="scroll-mt-32"
            title="Fuori Corso"
            items={SITCOM_FUORI_CORSO_ITEMS}
          />
          <VodCarousel
            id="bed-and-breakfast"
            className="scroll-mt-32"
            title="Bed&Breakfast"
            items={SITCOM_BED_AND_BREAKFAST_ITEMS}
          />
          <VodCarousel
            id="tutti-a-casa"
            className="scroll-mt-32"
            title="Tutti a Casa"
            items={SITCOM_TUTTI_A_CASA_ITEMS}
          />
          <VodCarousel
            id="telegaribaldi"
            className="scroll-mt-32"
            title="Telegaribaldi"
            items={filteredRecentEpisodes.length > 0 ? filteredRecentEpisodes : RECENT_EPISODES}
          />
          <VodCarousel
            id="show"
            className="scroll-mt-32"
            title="Show"
            items={VOD_ITEMS}
          />
          <VodCarousel
            id="morning"
            className="scroll-mt-32"
            title="Morning"
            items={RECENT_EPISODES}
          />
          <VodCarousel
            id="rubriche"
            className="scroll-mt-32"
            title="Rubriche"
            items={CATEGORY_ITEMS}
          />
          <VodCarousel
            id="news"
            className="scroll-mt-32"
            title="News"
            items={CATEGORY_ITEMS}
          />
        </div>
      </div>
    </main>
  );
}
