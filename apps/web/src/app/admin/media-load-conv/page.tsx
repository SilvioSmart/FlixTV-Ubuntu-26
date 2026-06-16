"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileVideo,
  FolderCog,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  UploadCloud
} from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";
import {
  DEFAULT_MEDIA_CONFIG,
  normalizeMediaConfig,
  type MediaConfig
} from "@/lib/media-config";
import {
  DEFAULT_PROGRAMS,
  normalizeProgram,
  uniqueValues,
  type ProgramDetail
} from "@/lib/programs-config";
import { buildBackendUrl } from "@/lib/platform-config";

type ActiveSection = "media" | "convert" | "config";
type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

type MediaConfigResponse = {
  config?: MediaConfig;
  error?: string;
};

type ProgramsResponse = {
  programs?: ProgramDetail[];
  program?: ProgramDetail;
  error?: string;
};

const SECTION_BUTTONS: Array<{
  id: ActiveSection;
  label: string;
}> = [
  { id: "media", label: "MEDIA" },
  { id: "convert", label: "CONVERT" },
  { id: "config", label: "CONFIG" }
];

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createProgram(): ProgramDetail {
  return {
    id: createTempId(),
    categoria: "Nuova categoria",
    programma: "Nuovo programma",
    serie: "Nuova serie",
    stagione: "Stagione 1",
    numeroPuntate: 0
  };
}

function getProgramKey(program: ProgramDetail) {
  return program.id ?? `${program.categoria}-${program.programma}-${program.serie}-${program.stagione}`;
}

export default function MediaLoadConversionPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("media");
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<MediaConfig>(DEFAULT_MEDIA_CONFIG);
  const [programs, setPrograms] = useState<ProgramDetail[]>(DEFAULT_PROGRAMS);
  const [draftPrograms, setDraftPrograms] = useState<Record<string, ProgramDetail>>({});
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento configurazione media.");
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  const categoriaOptions = useMemo(() => uniqueValues(programs, "categoria"), [programs]);
  const programmaOptions = useMemo(() => uniqueValues(programs, "programma"), [programs]);
  const serieOptions = useMemo(() => uniqueValues(programs, "serie"), [programs]);
  const stagioneOptions = useMemo(() => uniqueValues(programs, "stagione"), [programs]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [configResponse, programsResponse] = await Promise.all([
          fetch(buildBackendUrl("/api/media-config"), {
            credentials: "include",
            signal: controller.signal
          }),
          fetch(buildBackendUrl("/api/programs"), {
            credentials: "include",
            signal: controller.signal
          })
        ]);

        if (configResponse.ok) {
          const configData = (await configResponse.json()) as MediaConfigResponse;
          setConfig(normalizeMediaConfig(configData.config));
        }

        if (programsResponse.ok) {
          const programsData = (await programsResponse.json()) as ProgramsResponse;
          setPrograms(Array.isArray(programsData.programs) ? programsData.programs : DEFAULT_PROGRAMS);
        }

        setStatus("idle");
        setMessage("Configurazione media caricata.");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setConfig(DEFAULT_MEDIA_CONFIG);
        setPrograms(DEFAULT_PROGRAMS);
        setStatus("error");
        setMessage("Uso la configurazione media predefinita.");
      }
    }

    void loadData();

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

  function updateStorage(patch: Partial<MediaConfig["storage"]>) {
    setConfig((currentConfig) => ({
      ...currentConfig,
      storage: {
        ...currentConfig.storage,
        ...patch
      }
    }));
    setMessage("Modifiche in bozza: premi Salva in CONFIG.");
  }

  function updateProgramDraft(rowKey: string, patch: Partial<ProgramDetail>) {
    const sourceProgram =
      draftPrograms[rowKey] ?? programs.find((program) => getProgramKey(program) === rowKey);

    if (!sourceProgram) {
      return;
    }

    setDraftPrograms((currentDrafts) => ({
      ...currentDrafts,
      [rowKey]: {
        ...sourceProgram,
        ...patch
      }
    }));
  }

  function addProgram() {
    const program = createProgram();
    setPrograms((currentPrograms) => [...currentPrograms, program]);
    setDraftPrograms((currentDrafts) => ({
      ...currentDrafts,
      [getProgramKey(program)]: program
    }));
  }

  function cancelProgram(rowKey: string) {
    const program = programs.find((currentProgram) => getProgramKey(currentProgram) === rowKey);

    if (program?.id?.startsWith("temp-")) {
      setPrograms((currentPrograms) =>
        currentPrograms.filter((currentProgram) => getProgramKey(currentProgram) !== rowKey)
      );
    }

    setDraftPrograms((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[rowKey];
      return nextDrafts;
    });
  }

  async function saveProgram(rowKey: string) {
    const program = draftPrograms[rowKey] ?? programs.find((item) => getProgramKey(item) === rowKey);
    const normalizedProgram = normalizeProgram(program);

    if (!normalizedProgram || !program) {
      setStatus("error");
      setMessage("Compila categoria, programma, serie e stagione.");
      return;
    }

    const isNew = !program.id || program.id.startsWith("temp-") || program.id.startsWith("default-");
    setSavingRowId(rowKey);
    setStatus("saving");
    setMessage("Salvataggio programma in corso.");

    try {
      const response = await fetch(buildBackendUrl("/api/programs"), {
        method: isNew ? "POST" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...normalizedProgram,
          id: isNew ? undefined : program.id
        })
      });
      const data = (await response.json()) as ProgramsResponse;

      if (!response.ok || !data.program) {
        throw new Error(data.error || "Salvataggio programma non riuscito.");
      }

      setPrograms((currentPrograms) =>
        currentPrograms.map((currentProgram) =>
          getProgramKey(currentProgram) === rowKey ? data.program as ProgramDetail : currentProgram
        )
      );
      setDraftPrograms((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[rowKey];
        return nextDrafts;
      });
      setStatus("saved");
      setMessage("Programma salvato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio programma non riuscito.");
    } finally {
      setSavingRowId(null);
    }
  }

  async function deleteProgram(rowKey: string) {
    const program = programs.find((item) => getProgramKey(item) === rowKey);

    if (!program) {
      return;
    }

    if (!program.id || program.id.startsWith("temp-") || program.id.startsWith("default-")) {
      setPrograms((currentPrograms) =>
        currentPrograms.filter((currentProgram) => getProgramKey(currentProgram) !== rowKey)
      );
      cancelProgram(rowKey);
      return;
    }

    setSavingRowId(rowKey);

    try {
      const response = await fetch(
        buildBackendUrl(`/api/programs?id=${encodeURIComponent(program.id)}`),
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Cancellazione programma non riuscita.");
      }

      setPrograms((currentPrograms) =>
        currentPrograms.filter((currentProgram) => getProgramKey(currentProgram) !== rowKey)
      );
      setDraftPrograms((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[rowKey];
        return nextDrafts;
      });
      setStatus("saved");
      setMessage("Programma cancellato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cancellazione programma non riuscita.");
    } finally {
      setSavingRowId(null);
    }
  }

  async function saveStorageConfig() {
    setStatus("saving");
    setMessage("Salvataggio configurazione cartelle in corso.");

    try {
      const response = await fetch(buildBackendUrl("/api/media-config"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          config: normalizeMediaConfig(config)
        })
      });
      const data = (await response.json()) as MediaConfigResponse;

      if (!response.ok || !data.config) {
        throw new Error(data.error || "Salvataggio configurazione non riuscito.");
      }

      setConfig(normalizeMediaConfig(data.config));
      setStatus("saved");
      setMessage("Configurazione cartelle salvata.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio configurazione non riuscito.");
    }
  }

  return (
    <AdminShell
      title="media load/conv"
      description="Caricamento media, conversione HLS e configurazione cartelle/programmi."
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
              <span className="mt-4 text-lg font-black text-white">Seleziona video sorgente</span>
              <span className="mt-2 text-sm text-white/55">MP4, MOV, MXF o file mezzanine</span>
              <input type="file" accept="video/*" className="sr-only" />
            </label>
          </AdminCard>

          <AdminCard title="Metadati contenuto">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">Titolo</span>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none" />
              </label>
              {[
                ["Categoria", categoriaOptions],
                ["Programma", programmaOptions],
                ["Serie", serieOptions],
                ["Stagione", stagioneOptions]
              ].map(([label, options]) => (
                <label key={label as string} className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    {label as string}
                  </span>
                  <select className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none">
                    {(options as string[]).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </AdminCard>
        </div>
      ) : null}

      {activeSection === "convert" ? (
        <AdminCard title="Conversione HLS" description={`Output HLS: ${config.storage.convertedPath}`}>
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
                    onChange={(event) => updateStorage({ uploadPath: event.currentTarget.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    File media convertiti
                  </span>
                  <input
                    value={config.storage.convertedPath}
                    onChange={(event) => updateStorage({ convertedPath: event.currentTarget.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    File thumbnail
                  </span>
                  <input
                    value={config.storage.thumbnailPath}
                    onChange={(event) => updateStorage({ thumbnailPath: event.currentTarget.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                  />
                </label>
              </div>
            </AdminCard>

            <AdminCard
              title="Programmi"
              description="Dettagli dei programmi usati nei menu a tendina dei media."
            >
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={addProgram}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
                >
                  <Plus size={17} />
                  Aggiungi programma
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-separate border-spacing-y-2 text-left">
                  <thead>
                    <tr className="text-xs font-black uppercase tracking-[0.12em] text-white/40">
                      <th className="px-3 py-2">Categoria</th>
                      <th className="px-3 py-2">Programma</th>
                      <th className="px-3 py-2">Serie</th>
                      <th className="px-3 py-2">Stagione</th>
                      <th className="px-3 py-2">Numero puntate</th>
                      <th className="px-3 py-2 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => {
                      const rowKey = getProgramKey(program);
                      const draft = draftPrograms[rowKey] ?? program;
                      const isSaving = savingRowId === rowKey;

                      return (
                        <tr key={rowKey} className="bg-black/35">
                          {(["categoria", "programma", "serie", "stagione"] as const).map((field) => (
                            <td key={field} className="px-3 py-2">
                              <input
                                value={draft[field]}
                                onChange={(event) =>
                                  updateProgramDraft(rowKey, {
                                    [field]: event.currentTarget.value
                                  })
                                }
                                className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              value={draft.numeroPuntate}
                              onChange={(event) =>
                                updateProgramDraft(rowKey, {
                                  numeroPuntate: Number(event.currentTarget.value)
                                })
                              }
                              className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => deleteProgram(rowKey)}
                                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-black uppercase tracking-[0.1em] text-red-100 transition hover:bg-red-500/15"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelProgram(rowKey)}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-white/70 transition hover:bg-white/10"
                              >
                                <RotateCcw size={15} />
                                Annulla
                              </button>
                              <button
                                type="button"
                                onClick={() => saveProgram(rowKey)}
                                disabled={isSaving}
                                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:opacity-40"
                              >
                                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                Programmi configurati: {programs.length}
              </p>
              <button
                type="button"
                onClick={saveStorageConfig}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90"
              >
                <Save size={18} />
                Salva cartelle
              </button>
            </AdminCard>
          </aside>
        </div>
      ) : null}
    </AdminShell>
  );
}
