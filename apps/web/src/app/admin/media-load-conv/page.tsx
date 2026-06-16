"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Database,
  FileVideo,
  FolderCog,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
  UploadCloud
} from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";
import {
  DEFAULT_MEDIA_CONFIG,
  getOptionsForField,
  MEDIA_FIELD_NAMES,
  normalizeMediaConfig,
  type MediaConfig,
  type MediaFieldOption
} from "@/lib/media-config";
import { buildBackendUrl } from "@/lib/platform-config";

type ActiveSection = "media" | "convert" | "config";
type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

type MediaConfigResponse = {
  config?: MediaConfig;
  error?: string;
};

const SECTION_BUTTONS: Array<{
  id: ActiveSection;
  label: string;
}> = [
  {
    id: "media",
    label: "MEDIA"
  },
  {
    id: "convert",
    label: "CONVERT"
  },
  {
    id: "config",
    label: "CONFIG"
  }
];

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createFieldOption(fieldName = "category"): MediaFieldOption {
  return {
    id: createTempId(),
    fieldName,
    label: "Nuova voce",
    value: `nuova-voce-${Date.now()}`,
    sortOrder: 0,
    isActive: true
  };
}

function formatFieldName(fieldName: string) {
  return (
    MEDIA_FIELD_NAMES.find((field) => field.value === fieldName)?.label ?? fieldName
  );
}

export default function MediaLoadConversionPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("media");
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<MediaConfig>(DEFAULT_MEDIA_CONFIG);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento configurazione media.");
  const [isDirty, setIsDirty] = useState(false);

  const groupedOptions = useMemo(() => {
    return MEDIA_FIELD_NAMES.map((field) => ({
      ...field,
      options: config.fieldOptions
        .filter((option) => option.fieldName === field.value)
        .toSorted((firstOption, secondOption) => {
          if (firstOption.sortOrder !== secondOption.sortOrder) {
            return firstOption.sortOrder - secondOption.sortOrder;
          }

          return firstOption.label.localeCompare(secondOption.label);
        })
    }));
  }, [config.fieldOptions]);

  const categoryOptions = getOptionsForField(config, "category");
  const seriesOptions = getOptionsForField(config, "series");
  const episodeOptions = getOptionsForField(config, "episode");
  const languageOptions = getOptionsForField(config, "language");
  const ratingOptions = getOptionsForField(config, "rating");

  useEffect(() => {
    const controller = new AbortController();

    async function loadConfig() {
      try {
        const response = await fetch(buildBackendUrl("/api/media-config"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Configurazione media non disponibile.");
        }

        const data = (await response.json()) as MediaConfigResponse;
        setConfig(normalizeMediaConfig(data.config));
        setStatus("idle");
        setMessage("Configurazione caricata.");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setConfig(DEFAULT_MEDIA_CONFIG);
        setStatus("error");
        setMessage("Uso la configurazione media predefinita.");
      }
    }

    void loadConfig();

    return () => controller.abort();
  }, []);

  function simulateConversion() {
    setProgress(0);
    const intervalId = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) {
          window.clearInterval(intervalId);
          return 100;
        }

        return currentProgress + 10;
      });
    }, 260);
  }

  function markDirty(nextConfig: MediaConfig) {
    setConfig(nextConfig);
    setIsDirty(true);

    if (status !== "saving") {
      setStatus("idle");
      setMessage("Modifiche in bozza: premi Salva in CONFIG.");
    }
  }

  function updateStorage(patch: Partial<MediaConfig["storage"]>) {
    markDirty({
      ...config,
      storage: {
        ...config.storage,
        ...patch
      }
    });
  }

  function updateOption(id: string | undefined, patch: Partial<MediaFieldOption>) {
    markDirty({
      ...config,
      fieldOptions: config.fieldOptions.map((option) =>
        option.id === id
          ? {
              ...option,
              ...patch
            }
          : option
      )
    });
  }

  function deleteOption(id: string | undefined) {
    markDirty({
      ...config,
      fieldOptions: config.fieldOptions.filter((option) => option.id !== id)
    });
  }

  function addOption(fieldName: string) {
    markDirty({
      ...config,
      fieldOptions: [...config.fieldOptions, createFieldOption(fieldName)]
    });
  }

  async function saveConfig() {
    setStatus("saving");
    setMessage("Salvataggio configurazione media in corso.");

    const normalizedConfig = normalizeMediaConfig(config);

    try {
      const response = await fetch(buildBackendUrl("/api/media-config"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          config: normalizedConfig
        })
      });

      const data = (await response.json()) as MediaConfigResponse;

      if (!response.ok || !data.config) {
        throw new Error(data.error || "Salvataggio non riuscito.");
      }

      setConfig(normalizeMediaConfig(data.config));
      setStatus("saved");
      setIsDirty(false);
      setMessage("Configurazione media salvata.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito.");
    }
  }

  return (
    <AdminShell
      title="media load/conv"
      description="Caricamento media, conversione HLS e configurazione cartelle/campi database."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {SECTION_BUTTONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className="inline-flex h-11 items-center rounded-md px-5 text-sm font-black uppercase tracking-[0.14em] transition"
              style={{
                backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.08)",
                color: isActive ? "#000000" : "rgba(255,255,255,0.72)"
              }}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {activeSection === "media" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <AdminCard
            title="Caricamento media"
            description={`Storage sorgenti: ${config.storage.uploadPath}`}
          >
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/35 p-8 text-center transition hover:bg-white/[0.04]">
              <UploadCloud size={42} className="text-white/55" />
              <span className="mt-4 text-lg font-black text-white">
                Seleziona video sorgente
              </span>
              <span className="mt-2 text-sm text-white/55">
                MP4, MOV, MXF o file mezzanine
              </span>
              <input type="file" accept="video/*" className="sr-only" />
            </label>
          </AdminCard>

          <AdminCard title="Metadati contenuto">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                  Titolo
                </span>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                  Categoria
                </span>
                <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none">
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                  Serie
                </span>
                <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none">
                  {seriesOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                  Puntata
                </span>
                <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none">
                  <option value="">Non assegnata</option>
                  {episodeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    Lingua
                  </span>
                  <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none">
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    Rating
                  </span>
                  <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none">
                    {ratingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </AdminCard>
        </div>
      ) : null}

      {activeSection === "convert" ? (
        <AdminCard
          title="Conversione HLS"
          description={`Output HLS: ${config.storage.convertedPath}`}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={simulateConversion}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
                >
                  <FileVideo size={18} />
                  Avvia conversione
                </button>
                <span className="text-sm font-bold text-white/60">{progress}%</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-stream-red transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                <FolderCog size={18} />
                Cartelle pipeline
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/60">
                <p>Upload: {config.storage.uploadPath}</p>
                <p>HLS: {config.storage.convertedPath}</p>
                <p>Thumbnail: {config.storage.thumbnailPath}</p>
              </div>
            </div>
          </div>
        </AdminCard>
      ) : null}

      {activeSection === "config" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <AdminCard
              title="Indirizzi/cartelle"
              description="Percorsi server usati per media sorgente, media convertiti e thumbnail."
            >
              <div className="grid gap-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    File media caricati
                  </span>
                  <input
                    value={config.storage.uploadPath}
                    onChange={(event) =>
                      updateStorage({
                        uploadPath: event.currentTarget.value
                      })
                    }
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    File media convertiti
                  </span>
                  <input
                    value={config.storage.convertedPath}
                    onChange={(event) =>
                      updateStorage({
                        convertedPath: event.currentTarget.value
                      })
                    }
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    File thumbnail
                  </span>
                  <input
                    value={config.storage.thumbnailPath}
                    onChange={(event) =>
                      updateStorage({
                        thumbnailPath: event.currentTarget.value
                      })
                    }
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Campi media a tendina"
              description="Gestisci le opzioni disponibili nei menu a tendina dei metadati media."
            >
              <div className="space-y-5">
                {groupedOptions.map((field) => (
                  <section key={field.value} className="rounded-md border border-white/10 bg-black/30 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
                          {field.label}
                        </h3>
                        <p className="mt-1 text-xs text-white/45">
                          Campo database: {field.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addOption(field.value)}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-white/75 transition hover:bg-white/10 hover:text-white"
                      >
                        <Plus size={15} />
                        Aggiungi
                      </button>
                    </div>

                    <div className="space-y-2">
                      {field.options.length === 0 ? (
                        <div className="rounded-md border border-dashed border-white/10 p-3 text-sm text-white/35">
                          Nessuna voce configurata.
                        </div>
                      ) : null}

                      {field.options.map((option) => (
                        <div
                          key={option.id ?? `${option.fieldName}-${option.value}`}
                          className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_44px]"
                        >
                          <label className="block">
                            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                              Nome visibile
                            </span>
                            <input
                              value={option.label}
                              onChange={(event) =>
                                updateOption(option.id, {
                                  label: event.currentTarget.value
                                })
                              }
                              className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                              Valore database
                            </span>
                            <input
                              value={option.value}
                              onChange={(event) =>
                                updateOption(option.id, {
                                  value: event.currentTarget.value
                                })
                              }
                              className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                            />
                          </label>
                          <label className="flex h-full items-end gap-2 pb-2 text-sm font-bold text-white/65">
                            <input
                              type="checkbox"
                              checked={option.isActive}
                              onChange={(event) =>
                                updateOption(option.id, {
                                  isActive: event.currentTarget.checked
                                })
                              }
                              className="h-4 w-4 accent-white"
                            />
                            Attiva
                          </label>
                          <button
                            type="button"
                            onClick={() => deleteOption(option.id)}
                            aria-label={`Cancella ${option.label}`}
                            className="mt-5 grid h-10 w-10 place-items-center rounded-md text-white/55 transition hover:bg-red-500/15 hover:text-red-200"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </AdminCard>
          </div>

          <aside className="space-y-4">
            <AdminCard title="Stato configurazione">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                {status === "saving" || status === "loading" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Settings size={18} />
                )}
                CONFIG
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">{message}</p>
              <p className="mt-3 text-sm leading-6 text-white/45">
                Opzioni configurate: {config.fieldOptions.length}
              </p>
              <button
                type="button"
                onClick={saveConfig}
                disabled={!isDirty || status === "saving"}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/30"
              >
                {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Salva
              </button>
            </AdminCard>

            <AdminCard title="Campi gestiti">
              <div className="space-y-2 text-sm leading-6 text-white/65">
                {MEDIA_FIELD_NAMES.map((field) => (
                  <p key={field.value}>
                    <Database size={14} className="mr-2 inline" />
                    {formatFieldName(field.value)}
                  </p>
                ))}
              </div>
            </AdminCard>
          </aside>
        </div>
      ) : null}
    </AdminShell>
  );
}
