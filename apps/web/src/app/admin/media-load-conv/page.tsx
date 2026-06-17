"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clapperboard,
  FileVideo,
  FolderCog,
  FolderOpen,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Tv,
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
  ACCESS_LEVELS,
  createEpisodeDraft,
  DEFAULT_PROGRAMS,
  MAX_RESOLUTIONS,
  normalizeProgram,
  PUBLICATION_STATUSES,
  uniqueValues,
  type ProgramEpisode,
  type ProgramDetail
} from "@/lib/programs-config";
import { buildBackendUrl } from "@/lib/platform-config";

type ActiveSection = "media" | "convert" | "config";
type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";
type StorageField = keyof MediaConfig["storage"];

type MediaConfigResponse = {
  config?: MediaConfig;
  error?: string;
};

type ProgramsResponse = {
  programs?: ProgramDetail[];
  program?: ProgramDetail;
  error?: string;
};

type EpisodesResponse = {
  episodes?: ProgramEpisode[];
  episode?: ProgramEpisode;
  error?: string;
};

type EpisodeTab = "info" | "media" | "technical" | "rights";

const SECTION_BUTTONS: Array<{
  id: ActiveSection;
  label: string;
}> = [
  { id: "media", label: "MEDIA" },
  { id: "convert", label: "CONVERT" },
  { id: "config", label: "CONFIG" }
];

const STORAGE_ROWS: Array<{
  field: StorageField;
  label: string;
}> = [
  { field: "uploadPath", label: "File media caricati" },
  { field: "convertedPath", label: "File media convertiti" },
  { field: "thumbnailPath", label: "File thumbnail" }
];

const EPISODE_TABS: Array<{
  id: EpisodeTab;
  label: string;
}> = [
  { id: "info", label: "Info generali" },
  { id: "media", label: "Media e video" },
  { id: "technical", label: "Punti e tecnica" },
  { id: "rights", label: "Regole" }
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
  const [savedStorage, setSavedStorage] = useState<MediaConfig["storage"]>(
    DEFAULT_MEDIA_CONFIG.storage
  );
  const [programs, setPrograms] = useState<ProgramDetail[]>(DEFAULT_PROGRAMS);
  const [episodes, setEpisodes] = useState<ProgramEpisode[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(
    DEFAULT_PROGRAMS[0]?.id ?? null
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [episodeDraft, setEpisodeDraft] = useState<ProgramEpisode | null>(
    DEFAULT_PROGRAMS[0] ? createEpisodeDraft(DEFAULT_PROGRAMS[0]) : null
  );
  const [activeEpisodeTab, setActiveEpisodeTab] = useState<EpisodeTab>("info");
  const [expandedTree, setExpandedTree] = useState<Record<string, boolean>>({
    "category:Sitcom": true
  });
  const [draftPrograms, setDraftPrograms] = useState<Record<string, ProgramDetail>>({});
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento configurazione media.");
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [savingEpisode, setSavingEpisode] = useState(false);

  const categoriaOptions = useMemo(() => uniqueValues(programs, "categoria"), [programs]);
  const programmaOptions = useMemo(() => uniqueValues(programs, "programma"), [programs]);
  const serieOptions = useMemo(() => uniqueValues(programs, "serie"), [programs]);
  const stagioneOptions = useMemo(() => uniqueValues(programs, "stagione"), [programs]);
  const selectedSeason = useMemo(
    () => programs.find((program) => (program.id ?? getProgramKey(program)) === selectedSeasonId) ?? null,
    [programs, selectedSeasonId]
  );
  const selectedEpisode = useMemo(
    () => episodes.find((episode) => episode.id === selectedEpisodeId) ?? null,
    [episodes, selectedEpisodeId]
  );
  const programTree = useMemo(() => {
    return categoriaOptions.map((categoria) => {
      const categoryPrograms = programs.filter((program) => program.categoria === categoria);
      const seriesNames = uniqueValues(categoryPrograms, "serie");

      return {
        categoria,
        series: seriesNames.map((serie) => {
          const seriesPrograms = categoryPrograms.filter((program) => program.serie === serie);
          const seasons = seriesPrograms.toSorted((firstProgram, secondProgram) =>
            firstProgram.stagione.localeCompare(secondProgram.stagione)
          );

          return {
            serie,
            seasons: seasons.map((season) => ({
              season,
              episodes: episodes
                .filter((episode) => episode.seasonId === season.id)
                .toSorted((firstEpisode, secondEpisode) =>
                  firstEpisode.episodeNumber - secondEpisode.episodeNumber
                )
            }))
          };
        })
      };
    });
  }, [categoriaOptions, episodes, programs]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [configResponse, programsResponse, episodesResponse] = await Promise.all([
          fetch(buildBackendUrl("/api/media-config"), {
            credentials: "include",
            signal: controller.signal
          }),
          fetch(buildBackendUrl("/api/programs"), {
            credentials: "include",
            signal: controller.signal
          }),
          fetch(buildBackendUrl("/api/program-episodes"), {
            credentials: "include",
            signal: controller.signal
          })
        ]);

        if (configResponse.ok) {
          const configData = (await configResponse.json()) as MediaConfigResponse;
          const normalizedConfig = normalizeMediaConfig(configData.config);
          setConfig(normalizedConfig);
          setSavedStorage(normalizedConfig.storage);
        }

        if (programsResponse.ok) {
          const programsData = (await programsResponse.json()) as ProgramsResponse;
          const loadedPrograms = Array.isArray(programsData.programs)
            ? programsData.programs
            : DEFAULT_PROGRAMS;
          setPrograms(loadedPrograms);
          const firstSeason = loadedPrograms[0] ?? null;

          if (firstSeason) {
            setSelectedSeasonId(firstSeason.id ?? getProgramKey(firstSeason));
            setEpisodeDraft(createEpisodeDraft(firstSeason));
          }
        }

        if (episodesResponse.ok) {
          const episodesData = (await episodesResponse.json()) as EpisodesResponse;
          setEpisodes(Array.isArray(episodesData.episodes) ? episodesData.episodes : []);
        }

        setStatus("idle");
        setMessage("Configurazione media caricata.");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setConfig(DEFAULT_MEDIA_CONFIG);
        setSavedStorage(DEFAULT_MEDIA_CONFIG.storage);
        setPrograms(DEFAULT_PROGRAMS);
        setEpisodes([]);
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

  function browseStoragePath(field: StorageField) {
    const selectedPath = window.prompt("Percorso storage/server", config.storage[field]);

    if (selectedPath === null) {
      return;
    }

    updateStorage({ [field]: selectedPath } as Partial<MediaConfig["storage"]>);
  }

  function cancelStoragePath(field: StorageField) {
    updateStorage({ [field]: savedStorage[field] } as Partial<MediaConfig["storage"]>);
  }

  function clearStoragePath(field: StorageField) {
    updateStorage({ [field]: "" } as Partial<MediaConfig["storage"]>);
  }

  function toggleTreeNode(nodeKey: string) {
    setExpandedTree((currentTree) => ({
      ...currentTree,
      [nodeKey]: !currentTree[nodeKey]
    }));
  }

  function selectSeason(season: ProgramDetail) {
    const seasonId = season.id ?? getProgramKey(season);
    setSelectedSeasonId(seasonId);
    setSelectedEpisodeId(null);
    setEpisodeDraft(createEpisodeDraft(season));
    setActiveEpisodeTab("info");
  }

  function selectEpisode(episode: ProgramEpisode) {
    setSelectedSeasonId(episode.seasonId);
    setSelectedEpisodeId(episode.id ?? null);
    setEpisodeDraft(episode);
    setActiveEpisodeTab("info");
  }

  function createEpisodeForSeason() {
    if (!selectedSeason) {
      setStatus("error");
      setMessage("Seleziona una stagione nell'albero prima di creare l'episodio.");
      return;
    }

    const nextEpisode = createEpisodeDraft(selectedSeason);
    const seasonEpisodes = episodes.filter((episode) => episode.seasonId === selectedSeason.id);
    nextEpisode.episodeNumber = seasonEpisodes.length + 1;
    setSelectedEpisodeId(nextEpisode.id ?? null);
    setEpisodeDraft(nextEpisode);
    setActiveEpisodeTab("info");
  }

  function updateEpisodeDraft(patch: Partial<ProgramEpisode>) {
    setEpisodeDraft((currentDraft) => currentDraft ? { ...currentDraft, ...patch } : currentDraft);
    setMessage("Modifiche episodio in bozza.");
  }

  async function saveEpisode() {
    if (!episodeDraft) {
      return;
    }

    if (!episodeDraft.title.trim()) {
      setStatus("error");
      setMessage("Il titolo dell'episodio e obbligatorio.");
      return;
    }

    if (!episodeDraft.seasonId || episodeDraft.seasonId.startsWith("default-")) {
      setStatus("error");
      setMessage("Salva prima la stagione nel database, poi crea l'episodio.");
      return;
    }

    const isNew = !episodeDraft.id || episodeDraft.id.startsWith("temp-");
    setSavingEpisode(true);
    setStatus("saving");
    setMessage("Salvataggio episodio in corso.");

    try {
      const response = await fetch(buildBackendUrl("/api/program-episodes"), {
        method: isNew ? "POST" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...episodeDraft,
          id: isNew ? undefined : episodeDraft.id
        })
      });
      const data = (await response.json()) as EpisodesResponse;

      if (!response.ok || !data.episode) {
        throw new Error(data.error || "Salvataggio episodio non riuscito.");
      }

      setEpisodes((currentEpisodes) => {
        const withoutSavedEpisode = currentEpisodes.filter((episode) => episode.id !== data.episode?.id);
        return [...withoutSavedEpisode, data.episode as ProgramEpisode].toSorted(
          (firstEpisode, secondEpisode) => firstEpisode.episodeNumber - secondEpisode.episodeNumber
        );
      });
      setSelectedEpisodeId(data.episode.id ?? null);
      setEpisodeDraft(data.episode);
      setStatus("saved");
      setMessage("Episodio salvato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio episodio non riuscito.");
    } finally {
      setSavingEpisode(false);
    }
  }

  async function deleteEpisode() {
    if (!episodeDraft?.id || episodeDraft.id.startsWith("temp-")) {
      if (selectedSeason) {
        selectSeason(selectedSeason);
      }
      return;
    }

    setSavingEpisode(true);

    try {
      const response = await fetch(
        buildBackendUrl(`/api/program-episodes?id=${encodeURIComponent(episodeDraft.id)}`),
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Cancellazione episodio non riuscita.");
      }

      setEpisodes((currentEpisodes) =>
        currentEpisodes.filter((episode) => episode.id !== episodeDraft.id)
      );

      if (selectedSeason) {
        selectSeason(selectedSeason);
      }

      setStatus("saved");
      setMessage("Episodio cancellato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cancellazione episodio non riuscita.");
    } finally {
      setSavingEpisode(false);
    }
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

      const normalizedConfig = normalizeMediaConfig(data.config);
      setConfig(normalizedConfig);
      setSavedStorage(normalizedConfig.storage);
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
        <div className="space-y-5">
            <AdminCard
              title="STORAGE/SERVER"
              description="Percorsi server usati per media sorgente, media convertiti e thumbnail."
            >
              <div className="mb-4 rounded-md border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white/65">
                {status === "saving" || status === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    {message}
                  </span>
                ) : (
                  message
                )}
              </div>

              <div className="grid gap-3">
                {STORAGE_ROWS.map((row) => (
                  <div
                    key={row.field}
                    className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                      {row.label}
                    </span>
                    <input
                      value={config.storage[row.field]}
                      onChange={(event) =>
                        updateStorage({
                          [row.field]: event.currentTarget.value
                        } as Partial<MediaConfig["storage"]>)
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                    />
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => browseStoragePath(row.field)}
                        title="Sfoglia"
                        aria-label={`Sfoglia ${row.label}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <FolderOpen size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelStoragePath(row.field)}
                        title="Annulla"
                        aria-label={`Annulla modifiche ${row.label}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <RotateCcw size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => clearStoragePath(row.field)}
                        title="Cancella"
                        aria-label={`Cancella ${row.label}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-400/20 text-red-100 transition hover:bg-red-500/15"
                      >
                        <Trash2 size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={saveStorageConfig}
                        title="Salva"
                        aria-label={`Salva ${row.label}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-black transition hover:bg-white/90"
                      >
                        <Save size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard
              title="Programmi"
              description="Struttura ad albero collassabile con form episodio in split screen."
            >
              <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="min-h-[620px] rounded-md border border-white/10 bg-black/30 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                      <Layers size={17} />
                      Catalogo
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/55">
                      {episodes.length} ep.
                    </span>
                  </div>

                  <div className="space-y-1">
                    {programTree.map((categoryNode) => {
                      const categoryKey = `category:${categoryNode.categoria}`;
                      const isCategoryOpen = expandedTree[categoryKey] ?? true;

                      return (
                        <div key={categoryKey}>
                          <button
                            type="button"
                            onClick={() => toggleTreeNode(categoryKey)}
                            className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/10"
                          >
                            {isCategoryOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            <Tv size={15} />
                            {categoryNode.categoria}
                          </button>

                          {isCategoryOpen ? (
                            <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                              {categoryNode.series.map((seriesNode) => {
                                const seriesKey = `${categoryKey}:series:${seriesNode.serie}`;
                                const isSeriesOpen = expandedTree[seriesKey] ?? true;

                                return (
                                  <div key={seriesKey}>
                                    <button
                                      type="button"
                                      onClick={() => toggleTreeNode(seriesKey)}
                                      className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-bold text-white/80 transition hover:bg-white/10"
                                    >
                                      {isSeriesOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                      {seriesNode.serie}
                                    </button>

                                    {isSeriesOpen ? (
                                      <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                                        {seriesNode.seasons.map(({ season, episodes: seasonEpisodes }) => {
                                          const seasonId = season.id ?? getProgramKey(season);
                                          const isSeasonSelected = selectedSeasonId === seasonId && !selectedEpisode;
                                          const seasonKey = `${seriesKey}:season:${seasonId}`;
                                          const isSeasonOpen = expandedTree[seasonKey] ?? true;

                                          return (
                                            <div key={seasonKey}>
                                              <div className="flex items-center gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => toggleTreeNode(seasonKey)}
                                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
                                                  aria-label="Apri stagione"
                                                >
                                                  {isSeasonOpen ? (
                                                    <ChevronDown size={14} />
                                                  ) : (
                                                    <ChevronRight size={14} />
                                                  )}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => selectSeason(season)}
                                                  className="flex min-h-9 flex-1 items-center justify-between gap-2 rounded-md px-2 text-left text-sm transition hover:bg-white/10"
                                                  style={{
                                                    backgroundColor: isSeasonSelected
                                                      ? "rgba(255,255,255,0.12)"
                                                      : "transparent",
                                                    color: isSeasonSelected ? "#ffffff" : "rgba(255,255,255,0.72)"
                                                  }}
                                                >
                                                  <span>{season.stagione}</span>
                                                  <span className="text-xs text-white/40">
                                                    {seasonEpisodes.length}/{season.numeroPuntate}
                                                  </span>
                                                </button>
                                              </div>

                                              {isSeasonOpen ? (
                                                <div className="ml-8 mt-1 space-y-1">
                                                  {seasonEpisodes.map((episode) => {
                                                    const isEpisodeSelected = selectedEpisodeId === episode.id;

                                                    return (
                                                      <button
                                                        key={episode.id}
                                                        type="button"
                                                        onClick={() => selectEpisode(episode)}
                                                        className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition hover:bg-white/10"
                                                        style={{
                                                          backgroundColor: isEpisodeSelected
                                                            ? "rgba(255,255,255,0.14)"
                                                            : "transparent",
                                                          color: isEpisodeSelected
                                                            ? "#ffffff"
                                                            : "rgba(255,255,255,0.62)"
                                                        }}
                                                      >
                                                        <Clapperboard size={14} />
                                                        <span className="truncate">
                                                          Ep. {episode.episodeNumber} - {episode.title}
                                                        </span>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              ) : null}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </aside>

                <section className="rounded-md border border-white/10 bg-black/25 p-4">
                  {episodeDraft ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.14em] text-white/40">
                            Episodio selezionato
                          </div>
                          <h3 className="mt-1 text-xl font-black text-white">
                            {episodeDraft.title || "Nuovo episodio"}
                          </h3>
                          <p className="mt-1 text-sm text-white/55">
                            ID episodio: {episodeDraft.id?.startsWith("temp-") ? "Autogenerato al salvataggio" : episodeDraft.id}
                          </p>
                          <p className="mt-1 text-sm text-white/45">
                            ID stagione: {episodeDraft.seasonId} | ID serie: {episodeDraft.seriesId}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={createEpisodeForSeason}
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
                          >
                            <Plus size={16} />
                            Nuovo episodio
                          </button>
                          <button
                            type="button"
                            onClick={deleteEpisode}
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-red-400/20 px-3 text-sm font-black uppercase tracking-[0.1em] text-red-100 transition hover:bg-red-500/15"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={saveEpisode}
                            disabled={savingEpisode}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:opacity-40"
                          >
                            {savingEpisode ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {EPISODE_TABS.map((tab) => {
                          const isTabActive = activeEpisodeTab === tab.id;

                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveEpisodeTab(tab.id)}
                              className="h-10 rounded-md px-3 text-sm font-black uppercase tracking-[0.1em] transition"
                              style={{
                                backgroundColor: isTabActive ? "#ffffff" : "rgba(255,255,255,0.08)",
                                color: isTabActive ? "#000000" : "rgba(255,255,255,0.7)"
                              }}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {activeEpisodeTab === "info" ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Numero episodio
                            </span>
                            <input
                              type="number"
                              min={1}
                              required
                              value={episodeDraft.episodeNumber}
                              onChange={(event) =>
                                updateEpisodeDraft({ episodeNumber: Number(event.currentTarget.value) })
                              }
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Codice di produzione
                            </span>
                            <input
                              value={episodeDraft.productionCode}
                              onChange={(event) => updateEpisodeDraft({ productionCode: event.currentTarget.value })}
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                              placeholder="S01E01"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Titolo episodio
                            </span>
                            <input
                              maxLength={150}
                              value={episodeDraft.title}
                              onChange={(event) => updateEpisodeDraft({ title: event.currentTarget.value })}
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Sinossi breve
                            </span>
                            <input
                              maxLength={250}
                              value={episodeDraft.shortPlot}
                              onChange={(event) => updateEpisodeDraft({ shortPlot: event.currentTarget.value })}
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Sinossi lunga
                            </span>
                            <textarea
                              value={episodeDraft.longPlot}
                              onChange={(event) => updateEpisodeDraft({ longPlot: event.currentTarget.value })}
                              className="mt-1 min-h-32 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                            />
                          </label>
                        </div>
                      ) : null}

                      {activeEpisodeTab === "media" ? (
                        <div className="mt-5 grid gap-4">
                          {[
                            ["Immagine di anteprima", "thumbnailUrl", "JPG o WEBP 16:9"],
                            ["File video principale", "mezzanineFileUrl", "Mezzanine file sorgente"],
                            ["File trailer / anteprima", "trailerUrl", "Clip opzionale"]
                          ].map(([label, field, hint]) => {
                            const episodeField = field as "thumbnailUrl" | "mezzanineFileUrl" | "trailerUrl";

                            return (
                            <label key={field} className="block rounded-md border border-dashed border-white/15 bg-black/30 p-3">
                              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                                {label}
                              </span>
                              <input
                                value={episodeDraft[episodeField]}
                                onChange={(event) =>
                                  updateEpisodeDraft({
                                    [episodeField]: event.currentTarget.value
                                  } as Partial<ProgramEpisode>)
                                }
                                className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                                placeholder={`Trascina file o incolla URL - ${hint}`}
                              />
                            </label>
                            );
                          })}
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                                Sottotitoli JSON
                              </span>
                              <textarea
                                value={episodeDraft.subtitlesJson}
                                onChange={(event) => updateEpisodeDraft({ subtitlesJson: event.currentTarget.value })}
                                className="mt-1 min-h-32 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none"
                              />
                            </label>
                            <label className="block">
                              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                                Tracce audio JSON
                              </span>
                              <textarea
                                value={episodeDraft.audioTracksJson}
                                onChange={(event) => updateEpisodeDraft({ audioTracksJson: event.currentTarget.value })}
                                className="mt-1 min-h-32 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none"
                              />
                            </label>
                          </div>
                        </div>
                      ) : null}

                      {activeEpisodeTab === "technical" ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Durata secondi
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={episodeDraft.duration}
                              onChange={(event) => updateEpisodeDraft({ duration: Number(event.currentTarget.value) })}
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Risoluzione massima
                            </span>
                            <select
                              value={episodeDraft.maxResolution}
                              onChange={(event) =>
                                updateEpisodeDraft({
                                  maxResolution: event.currentTarget.value as ProgramEpisode["maxResolution"]
                                })
                              }
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            >
                              {MAX_RESOLUTIONS.map((resolution) => (
                                <option key={resolution} value={resolution}>
                                  {resolution}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Cue points JSON
                            </span>
                            <textarea
                              value={episodeDraft.cuePointsJson}
                              onChange={(event) => updateEpisodeDraft({ cuePointsJson: event.currentTarget.value })}
                              className="mt-1 min-h-32 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Formati audio JSON
                            </span>
                            <textarea
                              value={episodeDraft.audioFormatsJson}
                              onChange={(event) => updateEpisodeDraft({ audioFormatsJson: event.currentTarget.value })}
                              className="mt-1 min-h-32 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none"
                            />
                          </label>
                        </div>
                      ) : null}

                      {activeEpisodeTab === "rights" ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Stato pubblicazione
                            </span>
                            <select
                              value={episodeDraft.publicationStatus}
                              onChange={(event) =>
                                updateEpisodeDraft({
                                  publicationStatus: event.currentTarget.value as ProgramEpisode["publicationStatus"]
                                })
                              }
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            >
                              {PUBLICATION_STATUSES.map((statusOption) => (
                                <option key={statusOption} value={statusOption}>
                                  {statusOption}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Livello accesso
                            </span>
                            <select
                              value={episodeDraft.accessLevel}
                              onChange={(event) =>
                                updateEpisodeDraft({
                                  accessLevel: event.currentTarget.value as ProgramEpisode["accessLevel"]
                                })
                              }
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            >
                              {ACCESS_LEVELS.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Data pubblicazione
                            </span>
                            <input
                              type="datetime-local"
                              value={episodeDraft.publishAt}
                              onChange={(event) => updateEpisodeDraft({ publishAt: event.currentTarget.value })}
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Scadenza diritti
                            </span>
                            <input
                              type="datetime-local"
                              value={episodeDraft.licensingEnd}
                              onChange={(event) => updateEpisodeDraft({ licensingEnd: event.currentTarget.value })}
                              className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                              Restrizioni geografiche JSON
                            </span>
                            <textarea
                              value={episodeDraft.geoRestrictionsJson}
                              onChange={(event) =>
                                updateEpisodeDraft({ geoRestrictionsJson: event.currentTarget.value })
                              }
                              className="mt-1 min-h-24 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none"
                            />
                          </label>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center rounded-md border border-dashed border-white/10 text-center text-sm text-white/55">
                      Seleziona una stagione nell'albero per creare o modificare un episodio.
                    </div>
                  )}
                </section>
              </div>
            </AdminCard>
        </div>
      ) : null}
    </AdminShell>
  );
}
