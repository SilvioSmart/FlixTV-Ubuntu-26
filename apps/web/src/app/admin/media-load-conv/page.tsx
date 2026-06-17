"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileVideo,
  FolderCog,
  FolderOpen,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2
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
type StorageField = keyof MediaConfig["storage"];
type CatalogNodeType = "category" | "program" | "season";

type MediaConfigResponse = {
  config?: MediaConfig;
  error?: string;
};

type ProgramsResponse = {
  programs?: ProgramDetail[];
  program?: ProgramDetail;
  error?: string;
};

type CatalogSelection = {
  type: CatalogNodeType;
  key: string;
  categoria: string;
  programma?: string;
  seasonId?: string;
};

type CatalogDraft = {
  id?: string;
  categoria: string;
  programma: string;
  stagione: string;
  numeroPuntate: number;
};

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

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createProgram(): ProgramDetail {
  return {
    id: createTempId(),
    categoria: "Nuova categoria",
    programma: "Nuovo programma",
    serie: "Nuovo programma",
    stagione: "Stagione 1",
    numeroPuntate: 0
  };
}

function getProgramKey(program: ProgramDetail) {
  return program.id ?? `${program.categoria}-${program.programma}-${program.stagione}`;
}

function getInitialSelection(programs: ProgramDetail[]): CatalogSelection | null {
  const firstProgram = programs[0];

  if (!firstProgram) {
    return null;
  }

  return {
    type: "season",
    key: `season:${firstProgram.id ?? getProgramKey(firstProgram)}`,
    categoria: firstProgram.categoria,
    programma: firstProgram.programma,
    seasonId: firstProgram.id ?? getProgramKey(firstProgram)
  };
}

function createDraftFromSelection(
  selection: CatalogSelection | null,
  programs: ProgramDetail[]
): CatalogDraft {
  if (!selection) {
    return createProgram();
  }

  if (selection.type === "season") {
    const season = programs.find((program) => (program.id ?? getProgramKey(program)) === selection.seasonId);

    if (season) {
      return {
        id: season.id,
        categoria: season.categoria,
        programma: season.programma,
        stagione: season.stagione,
        numeroPuntate: season.numeroPuntate
      };
    }
  }

  if (selection.type === "program") {
    const program = programs.find(
      (item) => item.categoria === selection.categoria && item.programma === selection.programma
    );

    return {
      categoria: selection.categoria,
      programma: selection.programma ?? program?.programma ?? "",
      stagione: program?.stagione ?? "",
      numeroPuntate: program?.numeroPuntate ?? 0
    };
  }

  const categoryProgram = programs.find((item) => item.categoria === selection.categoria);

  return {
    categoria: selection.categoria,
    programma: categoryProgram?.programma ?? "",
    stagione: categoryProgram?.stagione ?? "",
    numeroPuntate: categoryProgram?.numeroPuntate ?? 0
  };
}

export default function MediaLoadConversionPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("media");
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<MediaConfig>(DEFAULT_MEDIA_CONFIG);
  const [savedStorage, setSavedStorage] = useState<MediaConfig["storage"]>(
    DEFAULT_MEDIA_CONFIG.storage
  );
  const [programs, setPrograms] = useState<ProgramDetail[]>(DEFAULT_PROGRAMS);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogSelection | null>(
    getInitialSelection(DEFAULT_PROGRAMS)
  );
  const [catalogDraft, setCatalogDraft] = useState<CatalogDraft>(
    createDraftFromSelection(getInitialSelection(DEFAULT_PROGRAMS), DEFAULT_PROGRAMS)
  );
  const [isCatalogEditing, setIsCatalogEditing] = useState(false);
  const [isNewCatalogItem, setIsNewCatalogItem] = useState(false);
  const [expandedTree, setExpandedTree] = useState<Record<string, boolean>>({
    "category:Sitcom": true
  });
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento configurazione media.");
  const [savingCatalog, setSavingCatalog] = useState(false);

  const categoriaOptions = useMemo(() => uniqueValues(programs, "categoria"), [programs]);
  const catalogTree = useMemo(() => {
    return categoriaOptions.map((categoria) => {
      const categoryPrograms = programs.filter((program) => program.categoria === categoria);
      const programNames = uniqueValues(categoryPrograms, "programma");

      return {
        categoria,
        programs: programNames.map((programma) => ({
          programma,
          seasons: categoryPrograms
            .filter((program) => program.programma === programma)
            .toSorted((firstProgram, secondProgram) =>
              firstProgram.stagione.localeCompare(secondProgram.stagione)
            )
        }))
      };
    });
  }, [categoriaOptions, programs]);

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
          const normalizedConfig = normalizeMediaConfig(configData.config);
          setConfig(normalizedConfig);
          setSavedStorage(normalizedConfig.storage);
        }

        if (programsResponse.ok) {
          const programsData = (await programsResponse.json()) as ProgramsResponse;
          const loadedPrograms = Array.isArray(programsData.programs)
            ? programsData.programs
            : DEFAULT_PROGRAMS;
          const initialSelection = getInitialSelection(loadedPrograms);
          setPrograms(loadedPrograms);
          setSelectedCatalog(initialSelection);
          setCatalogDraft(createDraftFromSelection(initialSelection, loadedPrograms));
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

  function selectCatalogNode(selection: CatalogSelection) {
    setSelectedCatalog(selection);
    setCatalogDraft(createDraftFromSelection(selection, programs));
    setIsCatalogEditing(false);
    setIsNewCatalogItem(false);
  }

  function startNewCatalogItem() {
    const baseDraft = createDraftFromSelection(selectedCatalog, programs);
    setCatalogDraft({
      id: undefined,
      categoria: baseDraft.categoria || "Nuova categoria",
      programma: selectedCatalog?.type === "category" ? "Nuovo programma" : baseDraft.programma || "Nuovo programma",
      stagione: "Stagione 1",
      numeroPuntate: 0
    });
    setIsCatalogEditing(true);
    setIsNewCatalogItem(true);
    setMessage("Nuova voce catalogo in bozza.");
  }

  function startCatalogEdit() {
    setCatalogDraft(createDraftFromSelection(selectedCatalog, programs));
    setIsCatalogEditing(true);
    setIsNewCatalogItem(false);
  }

  function updateCatalogDraft(patch: Partial<CatalogDraft>) {
    setCatalogDraft((currentDraft) => ({
      ...currentDraft,
      ...patch
    }));
  }

  async function refreshPrograms(nextPrograms?: ProgramDetail[]) {
    if (nextPrograms) {
      setPrograms(nextPrograms);
      return;
    }

    const response = await fetch(buildBackendUrl("/api/programs"), {
      credentials: "include"
    });
    const data = (await response.json()) as ProgramsResponse;

    if (response.ok && Array.isArray(data.programs)) {
      setPrograms(data.programs);
    }
  }

  async function upsertProgram(program: ProgramDetail) {
    const isNew = !program.id || program.id.startsWith("temp-") || program.id.startsWith("default-");
    const response = await fetch(buildBackendUrl("/api/programs"), {
      method: isNew ? "POST" : "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...program,
        id: isNew ? undefined : program.id
      })
    });
    const data = (await response.json()) as ProgramsResponse;

    if (!response.ok || !data.program) {
      throw new Error(data.error || "Salvataggio voce catalogo non riuscito.");
    }

    return data.program;
  }

  async function deleteProgramById(id: string) {
    const response = await fetch(buildBackendUrl(`/api/programs?id=${encodeURIComponent(id)}`), {
      method: "DELETE",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Cancellazione voce catalogo non riuscita.");
    }
  }

  async function saveCatalog() {
    const normalizedDraft = normalizeProgram({
      ...catalogDraft,
      serie: catalogDraft.programma
    });

    if (!normalizedDraft) {
      setStatus("error");
      setMessage("Compila categoria, programma e stagione prima di salvare.");
      return;
    }

    setSavingCatalog(true);
    setStatus("saving");
    setMessage("Salvataggio catalogo in corso.");

    try {
      if (isNewCatalogItem || selectedCatalog?.type === "season") {
        const savedProgram = await upsertProgram({
          ...normalizedDraft,
          id: isNewCatalogItem ? undefined : catalogDraft.id
        });
        const nextPrograms = isNewCatalogItem
          ? [...programs, savedProgram]
          : programs.map((program) => program.id === savedProgram.id ? savedProgram : program);
        const nextSelection: CatalogSelection = {
          type: "season",
          key: `season:${savedProgram.id ?? getProgramKey(savedProgram)}`,
          categoria: savedProgram.categoria,
          programma: savedProgram.programma,
          seasonId: savedProgram.id ?? getProgramKey(savedProgram)
        };
        await refreshPrograms(nextPrograms);
        setSelectedCatalog(nextSelection);
        setCatalogDraft(createDraftFromSelection(nextSelection, nextPrograms));
      } else if (selectedCatalog?.type === "program") {
        const affectedPrograms = programs.filter(
          (program) =>
            program.categoria === selectedCatalog.categoria &&
            program.programma === selectedCatalog.programma
        );
        const savedPrograms = await Promise.all(
          affectedPrograms.map((program) =>
            upsertProgram({
              ...program,
              categoria: normalizedDraft.categoria,
              programma: normalizedDraft.programma,
              serie: normalizedDraft.programma
            })
          )
        );
        const savedIds = new Set(savedPrograms.map((program) => program.id));
        const nextPrograms = [
          ...programs.filter((program) => !savedIds.has(program.id)),
          ...savedPrograms
        ];
        const nextSelection: CatalogSelection = {
          type: "program",
          key: `program:${normalizedDraft.categoria}:${normalizedDraft.programma}`,
          categoria: normalizedDraft.categoria,
          programma: normalizedDraft.programma
        };
        await refreshPrograms(nextPrograms);
        setSelectedCatalog(nextSelection);
        setCatalogDraft(createDraftFromSelection(nextSelection, nextPrograms));
      } else if (selectedCatalog?.type === "category") {
        const affectedPrograms = programs.filter((program) => program.categoria === selectedCatalog.categoria);
        const savedPrograms = await Promise.all(
          affectedPrograms.map((program) =>
            upsertProgram({
              ...program,
              categoria: normalizedDraft.categoria
            })
          )
        );
        const savedIds = new Set(savedPrograms.map((program) => program.id));
        const nextPrograms = [
          ...programs.filter((program) => !savedIds.has(program.id)),
          ...savedPrograms
        ];
        const nextSelection: CatalogSelection = {
          type: "category",
          key: `category:${normalizedDraft.categoria}`,
          categoria: normalizedDraft.categoria
        };
        await refreshPrograms(nextPrograms);
        setSelectedCatalog(nextSelection);
        setCatalogDraft(createDraftFromSelection(nextSelection, nextPrograms));
      }

      setIsCatalogEditing(false);
      setIsNewCatalogItem(false);
      setStatus("saved");
      setMessage("Catalogo salvato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio catalogo non riuscito.");
    } finally {
      setSavingCatalog(false);
    }
  }

  async function deleteCatalog() {
    if (!selectedCatalog) {
      return;
    }

    setSavingCatalog(true);
    setStatus("saving");
    setMessage("Cancellazione catalogo in corso.");

    try {
      const affectedPrograms = programs.filter((program) => {
        if (selectedCatalog.type === "category") {
          return program.categoria === selectedCatalog.categoria;
        }

        if (selectedCatalog.type === "program") {
          return (
            program.categoria === selectedCatalog.categoria &&
            program.programma === selectedCatalog.programma
          );
        }

        return (program.id ?? getProgramKey(program)) === selectedCatalog.seasonId;
      });

      await Promise.all(
        affectedPrograms
          .filter((program) => program.id && !program.id.startsWith("default-"))
          .map((program) => deleteProgramById(program.id as string))
      );

      const nextPrograms = programs.filter(
        (program) => !affectedPrograms.some((affectedProgram) => getProgramKey(affectedProgram) === getProgramKey(program))
      );
      const nextSelection = getInitialSelection(nextPrograms);
      await refreshPrograms(nextPrograms);
      setSelectedCatalog(nextSelection);
      setCatalogDraft(createDraftFromSelection(nextSelection, nextPrograms));
      setIsCatalogEditing(false);
      setIsNewCatalogItem(false);
      setStatus("saved");
      setMessage("Voce catalogo cancellata.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cancellazione catalogo non riuscita.");
    } finally {
      setSavingCatalog(false);
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
      description="Gestione catalogo, conversione HLS e configurazione storage/server."
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
        <AdminCard
          title="Gestione Catalogo"
          description="Crea e modifica la struttura Categoria -> Programmi -> Stagione."
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-md border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white/65">
              {status === "saving" || status === "loading" ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {message}
                </span>
              ) : (
                message
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startNewCatalogItem}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90"
              >
                <Plus size={16} />
                Nuova voce catalogo
              </button>
              <button
                type="button"
                onClick={startCatalogEdit}
                disabled={!selectedCatalog}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                <Pencil size={16} />
                Modifica
              </button>
              <button
                type="button"
                onClick={deleteCatalog}
                disabled={!selectedCatalog || savingCatalog}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-red-400/20 px-3 text-sm font-black uppercase tracking-[0.1em] text-red-100 transition hover:bg-red-500/15 disabled:opacity-40"
              >
                <Trash2 size={16} />
                Cancella
              </button>
              <button
                type="button"
                onClick={saveCatalog}
                disabled={!isCatalogEditing || savingCatalog}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:opacity-40"
              >
                {savingCatalog ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salva
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="min-h-[560px] rounded-md border border-white/10 bg-black/30 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                <Layers size={17} />
                Struttura catalogo
              </div>

              <div className="space-y-1">
                {catalogTree.map((categoryNode) => {
                  const categoryKey = `category:${categoryNode.categoria}`;
                  const isCategoryOpen = expandedTree[categoryKey] ?? true;
                  const isCategorySelected = selectedCatalog?.key === categoryKey;

                  return (
                    <div key={categoryKey}>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleTreeNode(categoryKey)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
                          aria-label="Apri categoria"
                        >
                          {isCategoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            selectCatalogNode({
                              type: "category",
                              key: categoryKey,
                              categoria: categoryNode.categoria
                            })
                          }
                          className="flex h-9 flex-1 items-center rounded-md px-2 text-left text-sm font-black uppercase tracking-[0.08em] transition hover:bg-white/10"
                          style={{
                            backgroundColor: isCategorySelected ? "rgba(255,255,255,0.14)" : "transparent",
                            color: isCategorySelected ? "#ffffff" : "rgba(255,255,255,0.82)"
                          }}
                        >
                          {categoryNode.categoria}
                        </button>
                      </div>

                      {isCategoryOpen ? (
                        <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-2">
                          {categoryNode.programs.map((programNode) => {
                            const programKey = `${categoryKey}:program:${programNode.programma}`;
                            const isProgramOpen = expandedTree[programKey] ?? true;
                            const isProgramSelected = selectedCatalog?.key === programKey;

                            return (
                              <div key={programKey}>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleTreeNode(programKey)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Apri programma"
                                  >
                                    {isProgramOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectCatalogNode({
                                        type: "program",
                                        key: programKey,
                                        categoria: categoryNode.categoria,
                                        programma: programNode.programma
                                      })
                                    }
                                    className="flex h-9 flex-1 items-center rounded-md px-2 text-left text-sm font-bold transition hover:bg-white/10"
                                    style={{
                                      backgroundColor: isProgramSelected
                                        ? "rgba(255,255,255,0.14)"
                                        : "transparent",
                                      color: isProgramSelected ? "#ffffff" : "rgba(255,255,255,0.72)"
                                    }}
                                  >
                                    {programNode.programma}
                                  </button>
                                </div>

                                {isProgramOpen ? (
                                  <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-2">
                                    {programNode.seasons.map((season) => {
                                      const seasonId = season.id ?? getProgramKey(season);
                                      const seasonKey = `${programKey}:season:${seasonId}`;
                                      const isSeasonSelected = selectedCatalog?.key === seasonKey;

                                      return (
                                        <button
                                          key={seasonKey}
                                          type="button"
                                          onClick={() =>
                                            selectCatalogNode({
                                              type: "season",
                                              key: seasonKey,
                                              categoria: season.categoria,
                                              programma: season.programma,
                                              seasonId
                                            })
                                          }
                                          className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm transition hover:bg-white/10"
                                          style={{
                                            backgroundColor: isSeasonSelected
                                              ? "rgba(255,255,255,0.14)"
                                              : "transparent",
                                            color: isSeasonSelected ? "#ffffff" : "rgba(255,255,255,0.62)"
                                          }}
                                        >
                                          <span>{season.stagione}</span>
                                          <span className="text-xs text-white/40">
                                            {season.numeroPuntate} ep.
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
            </aside>

            <section className="rounded-md border border-white/10 bg-black/25 p-4">
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-white/40">
                  Voce selezionata
                </div>
                <h3 className="mt-1 text-xl font-black text-white">
                  {isNewCatalogItem ? "Nuova voce catalogo" : selectedCatalog?.type ?? "Catalogo"}
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  {selectedCatalog
                    ? "Le modifiche agiscono sulle righe della tabella programmi."
                    : "Seleziona una voce o creane una nuova."}
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    Categoria
                  </span>
                  <input
                    value={catalogDraft.categoria}
                    disabled={!isCatalogEditing}
                    onChange={(event) => updateCatalogDraft({ categoria: event.currentTarget.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none disabled:opacity-55"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    Programma
                  </span>
                  <input
                    value={catalogDraft.programma}
                    disabled={!isCatalogEditing || (selectedCatalog?.type === "category" && !isNewCatalogItem)}
                    onChange={(event) => updateCatalogDraft({ programma: event.currentTarget.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none disabled:opacity-55"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    Stagione
                  </span>
                  <input
                    value={catalogDraft.stagione}
                    disabled={!isCatalogEditing || (selectedCatalog?.type !== "season" && !isNewCatalogItem)}
                    onChange={(event) => updateCatalogDraft({ stagione: event.currentTarget.value })}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none disabled:opacity-55"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    Numero puntate
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={catalogDraft.numeroPuntate}
                    disabled={!isCatalogEditing || (selectedCatalog?.type !== "season" && !isNewCatalogItem)}
                    onChange={(event) =>
                      updateCatalogDraft({ numeroPuntate: Number(event.currentTarget.value) })
                    }
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none disabled:opacity-55"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-md border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/55">
                Categoria modifica tutte le voci della categoria selezionata. Programma modifica tutte le
                stagioni del programma selezionato. Stagione modifica una singola riga della tabella
                programmi.
              </div>
            </section>
          </div>
        </AdminCard>
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
        </div>
      ) : null}
    </AdminShell>
  );
}
