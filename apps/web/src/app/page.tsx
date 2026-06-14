"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import SiteHeader from "@/components/SiteHeader";
import VideoGalleryModule from "@/components/VideoGalleryModule";
import {
  DEFAULT_HOME_CONFIG,
  normalizeHomeConfig,
  type HomeConfig
} from "@/lib/home-config";
import { buildBackendUrl } from "@/lib/platform-config";

type HomeConfigResponse = {
  config?: HomeConfig;
};

const FLIXTV_THEME = {
  id: "flixtv",
  themeColor: "#e50914",
  accentColor: "#ff6b6b"
};

export default function HomePage() {
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.streamChannel = FLIXTV_THEME.id;
    document.documentElement.style.setProperty("--stream-theme", FLIXTV_THEME.themeColor);
    document.documentElement.style.setProperty("--stream-accent", FLIXTV_THEME.accentColor);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomeConfig() {
      setIsConfigLoading(true);

      try {
        const response = await fetch(buildBackendUrl("/api/home-config"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Unable to load home config");
        }

        const data = (await response.json()) as HomeConfigResponse;
        setHomeConfig(normalizeHomeConfig(data.config));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setHomeConfig(DEFAULT_HOME_CONFIG);
      } finally {
        setIsConfigLoading(false);
      }
    }

    void loadHomeConfig();

    return () => controller.abort();
  }, []);

  const enabledModules = homeConfig.modules.filter((module) => module.isEnabled);

  return (
    <main className="min-h-viewport bg-canvas-950 text-white">
      <SiteHeader />

      {homeConfig.head.isEnabled ? (
        <HeroCarousel
          slides={homeConfig.head.slides}
          autoplayMs={homeConfig.head.autoplayMs}
        />
      ) : null}

      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {isConfigLoading ? (
          <div className="rounded-lg border border-white/10 bg-canvas-900 p-8 text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
            Caricamento moduli homepage
          </div>
        ) : null}

        {!isConfigLoading && enabledModules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-sm font-medium text-white/55">
            Nessun modulo attivo nella configurazione homepage.
          </div>
        ) : null}

        {enabledModules.map((module) => (
          <VideoGalleryModule key={module.id} module={module} />
        ))}
      </div>
    </main>
  );
}
