"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Save } from "lucide-react";
import {
  DEFAULT_HOME_CONFIG,
  normalizeHomeConfig,
  type HomeConfig
} from "@/lib/home-config";
import { buildBackendUrl } from "@/lib/platform-config";

type HomeConfigResponse = {
  config?: HomeConfig;
};

function stringifyConfig(config: HomeConfig) {
  return JSON.stringify(config, null, 2);
}

export default function HomeConfigEditor() {
  const [configText, setConfigText] = useState(stringifyConfig(DEFAULT_HOME_CONFIG));
  const [status, setStatus] = useState("Caricamento configurazione...");
  const [isSaving, setIsSaving] = useState(false);

  const parsedConfig = useMemo(() => {
    try {
      return {
        config: normalizeHomeConfig(JSON.parse(configText)),
        error: null
      };
    } catch (error) {
      return {
        config: null,
        error: error instanceof Error ? error.message : "JSON non valido"
      };
    }
  }, [configText]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConfig() {
      try {
        const response = await fetch(buildBackendUrl("/api/home-config"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Impossibile caricare la configurazione");
        }

        const data = (await response.json()) as HomeConfigResponse;
        setConfigText(stringifyConfig(normalizeHomeConfig(data.config)));
        setStatus("Configurazione caricata");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setConfigText(stringifyConfig(DEFAULT_HOME_CONFIG));
        setStatus("Uso configurazione di default");
      }
    }

    void loadConfig();

    return () => controller.abort();
  }, []);

  async function saveConfig() {
    if (!parsedConfig.config) {
      setStatus("Correggi il JSON prima di salvare");
      return;
    }

    setIsSaving(true);
    setStatus("Salvataggio in corso...");

    try {
      const response = await fetch(buildBackendUrl("/api/home-config"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          config: parsedConfig.config
        })
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      const data = (await response.json()) as HomeConfigResponse;
      setConfigText(stringifyConfig(normalizeHomeConfig(data.config)));
      setStatus("Configurazione salvata");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Errore durante il salvataggio");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg border border-white/10 bg-canvas-900 p-4 shadow-rail">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="home-config-json"
            className="block text-sm font-bold uppercase tracking-[0.14em] text-white/55"
          >
            JSON homepage CMS
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setConfigText(stringifyConfig(DEFAULT_HOME_CONFIG));
                setStatus("Configurazione di default caricata nell'editor");
              }}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-bold uppercase tracking-[0.1em] text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={16} />
              Default
            </button>
            <button
              type="button"
              onClick={saveConfig}
              disabled={isSaving || Boolean(parsedConfig.error)}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              Salva
            </button>
          </div>
        </div>

        <textarea
          id="home-config-json"
          value={configText}
          onChange={(event) => setConfigText(event.currentTarget.value)}
          spellCheck={false}
          className="min-h-[70svh] w-full resize-y rounded-md border border-white/10 bg-black/60 p-4 font-mono text-sm leading-6 text-white outline-none transition focus:border-white/35"
        />
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/55">
            <Check size={18} />
            Stato
          </div>
          <p className="mt-3 text-sm leading-6 text-white/70">{status}</p>
          {parsedConfig.error ? (
            <p className="mt-3 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
              {parsedConfig.error}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
          <h2 className="text-lg font-black text-white">Parametri</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
            <p>`head`: carousel fullscreen, slide, testi, immagini e autoplay.</p>
            <p>`modules`: moduli replicabili per costruire il body della piattaforma.</p>
            <p>`items`: video con `title`, `notes`, `series`, `episode`, `duration`, `thumbnailUrl`, `videoUrl`.</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
