"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import SiteHeader from "@/components/SiteHeader";
import SonicPlaylistBlock from "@/components/SonicPlaylistBlock";
import {
  DEFAULT_HOME_CONFIG,
  normalizeHomeConfig,
  type HomeConfig
} from "@/lib/home-config";
import {
  getDefaultHomepageSlides,
  toHeroSlide,
  type HomepageSlideRecord
} from "@/lib/homepage-slides";
import { buildBackendUrl } from "@/lib/platform-config";

type HomeConfigResponse = {
  config?: HomeConfig;
};

type HomepageSlidesResponse = {
  slides?: HomepageSlideRecord[];
};

type ModulesResponse = {
  modules?: HomeConfig["modules"];
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
        const [homeConfigResponse, homepageSlidesResponse, modulesResponse] = await Promise.all([
          fetch(buildBackendUrl("/api/home-config"), {
            credentials: "include",
            signal: controller.signal
          }),
          fetch(buildBackendUrl("/api/homepage"), {
            credentials: "include",
            signal: controller.signal
          }),
          fetch(buildBackendUrl("/api/modules"), {
            credentials: "include",
            signal: controller.signal
          })
        ]);

        if (!homeConfigResponse.ok) {
          throw new Error("Unable to load home config");
        }

        const homeConfigData = (await homeConfigResponse.json()) as HomeConfigResponse;
        const nextHomeConfig = normalizeHomeConfig(homeConfigData.config);

        if (homepageSlidesResponse.ok) {
          const homepageSlidesData =
            (await homepageSlidesResponse.json()) as HomepageSlidesResponse;
          const slides =
            homepageSlidesData.slides && homepageSlidesData.slides.length > 0
              ? homepageSlidesData.slides.map(toHeroSlide)
              : getDefaultHomepageSlides().map(toHeroSlide);

          const modulesData = modulesResponse.ok
            ? (await modulesResponse.json()) as ModulesResponse
            : null;

          setHomeConfig({
            ...nextHomeConfig,
            head: {
              ...nextHomeConfig.head,
              autoplayMs: Math.max(
                3000,
                slides[0]?.imageEffectMs ?? nextHomeConfig.head.autoplayMs
              ),
              slides
            },
            modules:
              modulesData?.modules && modulesData.modules.length > 0
                ? modulesData.modules
                : nextHomeConfig.modules
          });
          return;
        }

        if (modulesResponse.ok) {
          const modulesData = (await modulesResponse.json()) as ModulesResponse;

          setHomeConfig({
            ...nextHomeConfig,
            modules:
              modulesData.modules && modulesData.modules.length > 0
                ? modulesData.modules
                : nextHomeConfig.modules
          });
          return;
        }

        setHomeConfig(nextHomeConfig);
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
          <SonicPlaylistBlock key={module.id} module={module} />
        ))}
      </div>
    </main>
  );
}
