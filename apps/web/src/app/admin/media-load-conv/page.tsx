"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react";
import {
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Captions,
  CircleCheck,
  CircleX,
  FileVideo,
  FolderCog,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
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
  generateEpisodeCode,
  generateProductionCode,
  generateProgramCode,
  generateSeasonCode,
  MAX_RESOLUTIONS,
  normalizeProgram,
  PUBLICATION_STATUSES,
  uniqueValues,
  type ProgramEpisode,
  type ProgramDetail
} from "@/lib/programs-config";
import { buildBackendUrl } from "@/lib/platform-config";

type ActiveSection = "catalog" | "video" | "mediaLoad" | "config";
type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";
type StorageField = keyof MediaConfig["storage"];
type CatalogNodeType = "category" | "program" | "season";
type EpisodeTab = "info" | "media" | "technical" | "rights" | "vast";
type MediaFolder = "video" | "thumbnail" | "subtitles";

type MediaAsset = {
  id: string;
  mediaType: MediaFolder;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number | null;
  frameRate: number | null;
  width: number | null;
  height: number | null;
  videoCodec: string | null;
  containerFormat: string | null;
  audioTracks: Array<{
    index: number;
    codec: string;
    channels: number | null;
    layout: string | null;
    language: string | null;
  }>;
  sourceExists: boolean;
  hlsExists: boolean;
  hlsPath: string | null;
  conversionStatus: string;
  conversionProgress: number;
  conversionError: string | null;
};

type MediaAssetsResponse = {
  assets?: MediaAsset[];
  asset?: MediaAsset;
  error?: string;
};

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

type VastConfigResponse = {
  config?: {
    vastUrl?: string;
  };
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
  genere: string;
  programma: string;
  stagione: string;
  numeroPuntate: number;
};

const SECTION_BUTTONS: Array<{
  id: ActiveSection;
  label: string;
}> = [
  { id: "catalog", label: "CATALOGO" },
  { id: "video", label: "VIDEO" },
  { id: "mediaLoad", label: "MEDIA/LOAD" },
  { id: "config", label: "CONFIG" }
];

const EPISODE_TABS: Array<{
  id: EpisodeTab;
  label: string;
}> = [
  { id: "info", label: "Info generali" },
  { id: "media", label: "Media e video" },
  { id: "technical", label: "Punti e tecnica" },
  { id: "rights", label: "Regole" },
  { id: "vast", label: "VAST" }
];

const STORAGE_ROWS: Array<{
  field: StorageField;
  label: string;
}> = [
  { field: "uploadPath", label: "File media caricati" },
  { field: "convertedPath", label: "File media convertiti" },
  { field: "thumbnailPath", label: "File thumbnail" },
  { field: "subtitlesPath", label: "File sottotitoli" }
];

const MEDIA_FOLDERS: Array<{
  id: MediaFolder;
  label: string;
  storageField: StorageField;
  accept: string;
  hint: string;
}> = [
  {
    id: "video",
    label: "VIDEO",
    storageField: "uploadPath",
    accept: "video/*",
    hint: "MP4, MOV, MXF o file mezzanine"
  },
  {
    id: "thumbnail",
    label: "THUMBNAIL",
    storageField: "thumbnailPath",
    accept: "image/jpeg,image/png,image/webp",
    hint: "JPG, PNG o WEBP in formato 16:9"
  },
  {
    id: "subtitles",
    label: "SOTTOTITOLI",
    storageField: "subtitlesPath",
    accept: ".vtt,.srt,text/vtt,application/x-subrip",
    hint: "File VTT o SRT"
  }
];

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createProgram(): ProgramDetail {
  const programma = "Nuovo programma";
  const stagione = "Stagione 1";
  const programCode = generateProgramCode(programma);

  return {
    id: createTempId(),
    categoria: "Nuova categoria",
    genere: "Nuovo genere",
    programma,
    stagione,
    numeroPuntate: 0,
    IDprogramma: programCode,
    IDstagione: generateSeasonCode(programCode, stagione)
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

function formatVideoDuration(durationSeconds: number | null, frameRate: number | null) {
  if (durationSeconds === null || !Number.isFinite(durationSeconds)) {
    return "--:--:--:--";
  }

  const wholeSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;
  const framesPerSecond = frameRate && frameRate > 0 ? frameRate : 25;
  const frames = Math.floor((durationSeconds - wholeSeconds) * framesPerSecond);

  return [hours, minutes, seconds, frames]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function getVideoQuality(asset: MediaAsset) {
  if (!asset.width || !asset.height) {
    return "Non rilevata";
  }

  const quality = asset.height >= 2160
    ? "UHD 4K"
    : asset.height >= 1080
      ? "Full HD"
      : asset.height >= 720
        ? "HD"
        : "SD";

  return `${quality} · ${asset.width}×${asset.height}`;
}

function getAudioDescription(asset: MediaAsset) {
  if (asset.audioTracks.length === 0) {
    return "Nessuna traccia";
  }

  const formats = Array.from(
    new Set(asset.audioTracks.map((track) => track.codec.toUpperCase()))
  ).join(", ");

  return `${asset.audioTracks.length} ${asset.audioTracks.length === 1 ? "traccia" : "tracce"} · ${formats}`;
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
        genere: season.genere,
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
      genere: program?.genere ?? "",
      programma: selection.programma ?? program?.programma ?? "",
      stagione: program?.stagione ?? "",
      numeroPuntate: program?.numeroPuntate ?? 0
    };
  }

  const categoryProgram = programs.find((item) => item.categoria === selection.categoria);

  return {
    categoria: selection.categoria,
    genere: categoryProgram?.genere ?? "",
    programma: categoryProgram?.programma ?? "",
    stagione: categoryProgram?.stagione ?? "",
    numeroPuntate: categoryProgram?.numeroPuntate ?? 0
  };
}

export default function MediaLoadConversionPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("catalog");
  const [selectedMediaFolder, setSelectedMediaFolder] = useState<MediaFolder>("video");
  const [config, setConfig] = useState<MediaConfig>(DEFAULT_MEDIA_CONFIG);
  const [savedStorage, setSavedStorage] = useState<MediaConfig["storage"]>(
    DEFAULT_MEDIA_CONFIG.storage
  );
  const [programs, setPrograms] = useState<ProgramDetail[]>(DEFAULT_PROGRAMS);
  const [episodes, setEpisodes] = useState<ProgramEpisode[]>([]);
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
  const [selectedVideoSeasonId, setSelectedVideoSeasonId] = useState<string | null>(
    DEFAULT_PROGRAMS[0]?.id ?? null
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [episodeDraft, setEpisodeDraft] = useState<ProgramEpisode | null>(
    DEFAULT_PROGRAMS[0] ? createEpisodeDraft(DEFAULT_PROGRAMS[0]) : null
  );
  const [activeEpisodeTab, setActiveEpisodeTab] = useState<EpisodeTab>("info");
  const [vastUrl, setVastUrl] = useState("https://adsrv.org/vast.xml");
  const [savedVastUrl, setSavedVastUrl] = useState("https://adsrv.org/vast.xml");
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento configurazione media.");
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [savingEpisode, setSavingEpisode] = useState(false);
  const [savingVast, setSavingVast] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loadingMediaAssets, setLoadingMediaAssets] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [destinationPath, setDestinationPath] = useState(DEFAULT_MEDIA_CONFIG.storage.uploadPath);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

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
  const videoTree = useMemo(() => {
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
            .map((season) => ({
              season,
              episodes: episodes
                .filter((episode) => episode.IDstagione === season.IDstagione)
                .toSorted((firstEpisode, secondEpisode) =>
                  firstEpisode.episodeNumber - secondEpisode.episodeNumber
                )
            }))
        }))
      };
    });
  }, [categoriaOptions, episodes, programs]);
  const selectedVideoSeason = useMemo(
    () => programs.find((program) => (program.id ?? getProgramKey(program)) === selectedVideoSeasonId) ?? null,
    [programs, selectedVideoSeasonId]
  );
  const selectedEpisode = useMemo(
    () => episodes.find((episode) => episode.id === selectedEpisodeId) ?? null,
    [episodes, selectedEpisodeId]
  );
  const activeMediaFolder = MEDIA_FOLDERS.find((folder) => folder.id === selectedMediaFolder) ??
    MEDIA_FOLDERS[0]!;
  const generatedVideoCodes = useMemo(() => {
    const programCode = selectedVideoSeason?.IDprogramma ||
      generateProgramCode(selectedVideoSeason?.programma ?? "");
    const seasonCode = selectedVideoSeason?.IDstagione ||
      generateSeasonCode(programCode, selectedVideoSeason?.stagione ?? "Stagione 1");
    const IDepisode = generateEpisodeCode(
      programCode,
      selectedVideoSeason?.stagione ?? "Stagione 1",
      episodeDraft?.episodeNumber ?? 1
    );

    return {
      programCode,
      seasonCode,
      IDepisode,
      productionCode: generateProductionCode(
        selectedVideoSeason?.stagione ?? "Stagione 1",
        episodeDraft?.episodeNumber ?? 1
      )
    };
  }, [episodeDraft?.episodeNumber, selectedVideoSeason]);

  const loadMediaAssets = useCallback(async (mediaType: MediaFolder) => {
    setLoadingMediaAssets(true);

    try {
      const response = await fetch(
        buildBackendUrl(`/api/media-files?mediaType=${encodeURIComponent(mediaType)}`),
        {
          credentials: "include",
          cache: "no-store"
        }
      );
      const data = (await response.json()) as MediaAssetsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Caricamento elenco media non riuscito.");
      }

      setMediaAssets(Array.isArray(data.assets) ? data.assets : []);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Caricamento elenco media non riuscito.");
    } finally {
      setLoadingMediaAssets(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [configResponse, programsResponse, episodesResponse, vastResponse] = await Promise.all([
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
          }),
          fetch(buildBackendUrl("/api/vast-config"), {
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
          const firstSeason = loadedPrograms[0] ?? null;

          if (firstSeason) {
            setSelectedVideoSeasonId(firstSeason.id ?? getProgramKey(firstSeason));
            setEpisodeDraft(createEpisodeDraft(firstSeason));
          }
        }

        if (episodesResponse.ok) {
          const episodesData = (await episodesResponse.json()) as EpisodesResponse;
          setEpisodes(Array.isArray(episodesData.episodes) ? episodesData.episodes : []);
        }

        if (vastResponse.ok) {
          const vastData = (await vastResponse.json()) as VastConfigResponse;
          const loadedVastUrl = vastData.config?.vastUrl || "https://adsrv.org/vast.xml";
          setVastUrl(loadedVastUrl);
          setSavedVastUrl(loadedVastUrl);
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

  useEffect(() => {
    setDestinationPath(config.storage[activeMediaFolder.storageField]);
  }, [activeMediaFolder.storageField, config.storage]);

  useEffect(() => {
    if (activeSection !== "mediaLoad") {
      return;
    }

    void loadMediaAssets(selectedMediaFolder);
  }, [activeSection, loadMediaAssets, selectedMediaFolder]);

  useEffect(() => {
    if (
      activeSection !== "mediaLoad" ||
      !mediaAssets.some((asset) => ["queued", "converting"].includes(asset.conversionStatus))
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadMediaAssets(selectedMediaFolder);
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [activeSection, loadMediaAssets, mediaAssets, selectedMediaFolder]);

  async function uploadMediaFiles(files: FileList | File[]) {
    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) {
      return;
    }

    setUploadingMedia(true);
    setStatus("saving");
    setMessage(
      selectedFiles.length === 1
        ? "Caricamento file in corso."
        : `Caricamento di ${selectedFiles.length} file in corso.`
    );

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaType", selectedMediaFolder);
        formData.append("destinationPath", destinationPath);

        const response = await fetch(buildBackendUrl("/api/media-files"), {
          method: "POST",
          credentials: "include",
          body: formData
        });
        const data = (await response.json()) as MediaAssetsResponse;

        if (!response.ok || !data.asset) {
          throw new Error(data.error || `Caricamento di ${file.name} non riuscito.`);
        }

        setMediaAssets((currentAssets) => [
          data.asset as MediaAsset,
          ...currentAssets.filter((asset) => asset.id !== data.asset?.id)
        ]);
      }

      setStatus("saved");
      setMessage(
        selectedFiles.length === 1
          ? "File caricato e analizzato."
          : `${selectedFiles.length} file caricati e analizzati.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Caricamento file non riuscito.");
    } finally {
      setUploadingMedia(false);

      if (mediaFileInputRef.current) {
        mediaFileInputRef.current.value = "";
      }
    }
  }

  function handleMediaFileSelection(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files) {
      void uploadMediaFiles(event.currentTarget.files);
    }
  }

  function handleMediaDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingMedia(false);

    if (!uploadingMedia && event.dataTransfer.files.length > 0) {
      void uploadMediaFiles(event.dataTransfer.files);
    }
  }

  function browseDestinationPath() {
    const selectedPath = window.prompt(
      "Cartella server in cui copiare i file",
      destinationPath
    );

    if (selectedPath !== null && selectedPath.trim()) {
      setDestinationPath(selectedPath.trim());
    }
  }

  async function deleteMediaAsset(asset: MediaAsset) {
    if (!window.confirm(`Eliminare ${asset.originalName} e gli eventuali file HLS?`)) {
      return;
    }

    try {
      const response = await fetch(
        buildBackendUrl(`/api/media-files?id=${encodeURIComponent(asset.id)}`),
        {
          method: "DELETE",
          credentials: "include"
        }
      );
      const data = (await response.json()) as MediaAssetsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Eliminazione file non riuscita.");
      }

      setMediaAssets((currentAssets) =>
        currentAssets.filter((currentAsset) => currentAsset.id !== asset.id)
      );
      setStatus("saved");
      setMessage(`${asset.originalName} eliminato.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Eliminazione file non riuscita.");
    }
  }

  async function convertMediaAsset(asset: MediaAsset) {
    setMediaAssets((currentAssets) =>
      currentAssets.map((currentAsset) =>
        currentAsset.id === asset.id
          ? {
              ...currentAsset,
              conversionStatus: "queued",
              conversionProgress: 0,
              conversionError: null
            }
          : currentAsset
      )
    );

    try {
      const response = await fetch(
        buildBackendUrl(`/api/media-files/${encodeURIComponent(asset.id)}/convert`),
        {
          method: "POST",
          credentials: "include"
        }
      );
      const data = (await response.json()) as MediaAssetsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Avvio conversione HLS non riuscito.");
      }

      setStatus("saving");
      setMessage(`${asset.originalName} aggiunto alla coda di conversione.`);
      window.setTimeout(() => void loadMediaAssets(selectedMediaFolder), 500);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Avvio conversione HLS non riuscito.");
      void loadMediaAssets(selectedMediaFolder);
    }
  }

  async function stopMediaConversion(asset: MediaAsset) {
    try {
      const response = await fetch(
        buildBackendUrl(`/api/media-files/${encodeURIComponent(asset.id)}/convert`),
        {
          method: "DELETE",
          credentials: "include"
        }
      );
      const data = (await response.json()) as MediaAssetsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Interruzione conversione non riuscita.");
      }

      setMediaAssets((currentAssets) =>
        currentAssets.map((currentAsset) =>
          currentAsset.id === asset.id
            ? {
                ...currentAsset,
                conversionStatus: "cancelled",
                conversionError: null,
                hlsExists: false
              }
            : currentAsset
        )
      );
      setStatus("idle");
      setMessage(`Conversione di ${asset.originalName} interrotta.`);
      window.setTimeout(() => void loadMediaAssets(selectedMediaFolder), 400);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Interruzione conversione non riuscita.");
    }
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
      genere: baseDraft.genere || "Nuovo genere",
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
      ...catalogDraft
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
              genere: normalizedDraft.genere,
              programma: normalizedDraft.programma,
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
              categoria: normalizedDraft.categoria,
              genere: normalizedDraft.genere
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

    if (!window.confirm("Confermi la cancellazione della voce catalogo selezionata?")) {
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

  function selectVideoSeason(season: ProgramDetail) {
    const seasonId = season.id ?? getProgramKey(season);
    setSelectedVideoSeasonId(seasonId);
    setSelectedEpisodeId(null);
    setEpisodeDraft(createEpisodeDraft(season));
    setActiveEpisodeTab("info");
  }

  function selectEpisode(episode: ProgramEpisode) {
    const season = programs.find((program) => program.IDstagione === episode.IDstagione);
    setSelectedVideoSeasonId(season?.id ?? null);
    setSelectedEpisodeId(episode.id ?? null);
    setEpisodeDraft(episode);
    setActiveEpisodeTab("info");
  }

  function createEpisodeForSeason() {
    if (!selectedVideoSeason) {
      setStatus("error");
      setMessage("Seleziona una stagione nella sezione VIDEO prima di creare l'episodio.");
      return;
    }

    if (!selectedVideoSeason.id || selectedVideoSeason.id.startsWith("default-")) {
      setStatus("error");
      setMessage("Salva prima la stagione nel database, poi crea il video.");
      return;
    }

    const nextEpisode = createEpisodeDraft(selectedVideoSeason);
    const seasonEpisodes = episodes.filter(
      (episode) => episode.IDstagione === selectedVideoSeason.IDstagione
    );
    nextEpisode.episodeNumber = seasonEpisodes.length + 1;
    nextEpisode.IDepisode = generateEpisodeCode(
      selectedVideoSeason.IDprogramma || generateProgramCode(selectedVideoSeason.programma),
      selectedVideoSeason.stagione,
      nextEpisode.episodeNumber
    );
    setSelectedEpisodeId(nextEpisode.id ?? null);
    setEpisodeDraft(nextEpisode);
    setActiveEpisodeTab("info");
    setMessage("Nuovo video in bozza.");
  }

  function updateEpisodeDraft(patch: Partial<ProgramEpisode>) {
    setEpisodeDraft((currentDraft) => currentDraft ? { ...currentDraft, ...patch } : currentDraft);
    setMessage("Modifiche video in bozza.");
  }

  async function saveEpisode() {
    if (!episodeDraft) {
      return;
    }

    if (!episodeDraft.title.trim()) {
      setStatus("error");
      setMessage("Il titolo del video e obbligatorio.");
      return;
    }

    if (!episodeDraft.IDprogramma || !episodeDraft.IDstagione) {
      setStatus("error");
      setMessage("Salva prima la stagione nel database, poi crea il video.");
      return;
    }

    const isNew = !episodeDraft.id || episodeDraft.id.startsWith("temp-");
    setSavingEpisode(true);
    setStatus("saving");
    setMessage("Salvataggio video in corso.");

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
        throw new Error(data.error || "Salvataggio video non riuscito.");
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
      setMessage("Video salvato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio video non riuscito.");
    } finally {
      setSavingEpisode(false);
    }
  }

  async function deleteEpisode() {
    if (!episodeDraft?.id || episodeDraft.id.startsWith("temp-")) {
      if (!window.confirm("Confermi l'annullamento del nuovo video non salvato?")) {
        return;
      }

      if (selectedVideoSeason) {
        selectVideoSeason(selectedVideoSeason);
      }
      return;
    }

    if (!window.confirm("Confermi la cancellazione del video selezionato?")) {
      return;
    }

    setSavingEpisode(true);
    setStatus("saving");
    setMessage("Cancellazione video in corso.");

    try {
      const response = await fetch(
        buildBackendUrl(`/api/program-episodes?id=${encodeURIComponent(episodeDraft.id)}`),
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Cancellazione video non riuscita.");
      }

      setEpisodes((currentEpisodes) =>
        currentEpisodes.filter((episode) => episode.id !== episodeDraft.id)
      );

      if (selectedVideoSeason) {
        selectVideoSeason(selectedVideoSeason);
      }

      setStatus("saved");
      setMessage("Video cancellato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cancellazione video non riuscita.");
    } finally {
      setSavingEpisode(false);
    }
  }

  function updateVastUrl(value: string) {
    setVastUrl(value);
    setMessage("Modifiche VAST in bozza.");
  }

  function cancelVastUrl() {
    setVastUrl(savedVastUrl);
    setMessage("Modifiche VAST annullate.");
  }

  function clearVastUrl() {
    if (!window.confirm("Confermi la cancellazione del VAST URL?")) {
      return;
    }

    setVastUrl("");
    setMessage("VAST URL cancellato in bozza.");
  }

  async function saveVastConfig() {
    setSavingVast(true);
    setStatus("saving");
    setMessage("Salvataggio VAST URL in corso.");

    try {
      const response = await fetch(buildBackendUrl("/api/vast-config"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vastUrl
        })
      });
      const data = (await response.json()) as VastConfigResponse;

      if (!response.ok || typeof data.config?.vastUrl !== "string") {
        throw new Error(data.error || "Salvataggio VAST URL non riuscito.");
      }

      setVastUrl(data.config.vastUrl);
      setSavedVastUrl(data.config.vastUrl);
      setStatus("saved");
      setMessage("VAST URL salvato.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio VAST URL non riuscito.");
    } finally {
      setSavingVast(false);
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
      description="Gestione catalogo, caricamento media e configurazione storage/server."
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

      {activeSection === "catalog" ? (
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
                    Genere
                  </span>
                  <input
                    value={catalogDraft.genere}
                    disabled={!isCatalogEditing}
                    onChange={(event) => updateCatalogDraft({ genere: event.currentTarget.value })}
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
                    IDprogramma
                  </span>
                  <input
                    value={generateProgramCode(catalogDraft.programma)}
                    readOnly
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black text-white/75 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    IDstagione
                  </span>
                  <input
                    value={generateSeasonCode(
                      generateProgramCode(catalogDraft.programma),
                      catalogDraft.stagione
                    )}
                    readOnly
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black text-white/75 outline-none"
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

      {activeSection === "video" ? (
        <AdminCard
          title="Programmi"
          description="Gestione video con struttura Categoria -> Programmi -> Stagione -> Episodio."
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
                onClick={createEpisodeForSeason}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90"
              >
                <Plus size={16} />
                Nuovo video
              </button>
              <button
                type="button"
                onClick={deleteEpisode}
                disabled={!episodeDraft || savingEpisode}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-red-400/20 px-3 text-sm font-black uppercase tracking-[0.1em] text-red-100 transition hover:bg-red-500/15 disabled:opacity-40"
              >
                <Trash2 size={16} />
                Cancella
              </button>
              <button
                type="button"
                onClick={saveEpisode}
                disabled={!episodeDraft || savingEpisode}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:opacity-40"
              >
                {savingEpisode ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salva
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="min-h-[640px] rounded-md border border-white/10 bg-black/30 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-white">
                  <Layers size={17} />
                  Video tree
                </div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/55">
                  {episodes.length} video
                </span>
              </div>

              <div className="space-y-1">
                {videoTree.map((categoryNode) => {
                  const categoryKey = `video-category:${categoryNode.categoria}`;
                  const isCategoryOpen = expandedTree[categoryKey] ?? true;

                  return (
                    <div key={categoryKey}>
                      <button
                        type="button"
                        onClick={() => toggleTreeNode(categoryKey)}
                        className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/10"
                      >
                        {isCategoryOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        {categoryNode.categoria}
                      </button>

                      {isCategoryOpen ? (
                        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                          {categoryNode.programs.map((programNode) => {
                            const programKey = `${categoryKey}:program:${programNode.programma}`;
                            const isProgramOpen = expandedTree[programKey] ?? true;

                            return (
                              <div key={programKey}>
                                <button
                                  type="button"
                                  onClick={() => toggleTreeNode(programKey)}
                                  className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-bold text-white/80 transition hover:bg-white/10"
                                >
                                  {isProgramOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                  {programNode.programma}
                                </button>

                                {isProgramOpen ? (
                                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                                    {programNode.seasons.map(({ season, episodes: seasonEpisodes }) => {
                                      const seasonId = season.id ?? getProgramKey(season);
                                      const seasonKey = `${programKey}:season:${seasonId}`;
                                      const isSeasonOpen = expandedTree[seasonKey] ?? true;
                                      const isSeasonSelected = selectedVideoSeasonId === seasonId && !selectedEpisode;

                                      return (
                                        <div key={seasonKey}>
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => toggleTreeNode(seasonKey)}
                                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
                                              aria-label="Apri stagione video"
                                            >
                                              {isSeasonOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => selectVideoSeason(season)}
                                              className="flex min-h-9 flex-1 items-center justify-between gap-2 rounded-md px-2 text-left text-sm transition hover:bg-white/10"
                                              style={{
                                                backgroundColor: isSeasonSelected
                                                  ? "rgba(255,255,255,0.14)"
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
                        Video selezionato
                      </div>
                      <h3 className="mt-1 text-xl font-black text-white">
                        {episodeDraft.title || "Nuovo video"}
                      </h3>
                      <p className="mt-1 text-sm text-white/55">
                        Record DB: {episodeDraft.id?.startsWith("temp-") ? "Autogenerato al salvataggio" : episodeDraft.id}
                      </p>
                      <p className="mt-1 text-sm text-white/45">
                        IDprogramma: {episodeDraft.IDprogramma} | IDstagione: {episodeDraft.IDstagione}
                      </p>
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
                          ID PROGRAMMA
                        </span>
                        <input
                          value={generatedVideoCodes.programCode}
                          readOnly
                          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black text-white/75 outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                          ID STAGIONE
                        </span>
                        <input
                          value={generatedVideoCodes.seasonCode}
                          readOnly
                          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black text-white/75 outline-none"
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                          ID Episodio
                        </span>
                        <input
                          value={generatedVideoCodes.IDepisode}
                          readOnly
                          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black text-white/75 outline-none"
                        />
                      </label>
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
                          value={generatedVideoCodes.productionCode}
                          readOnly
                          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black text-white/75 outline-none"
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

                  {activeEpisodeTab === "vast" ? (
                    <div className="mt-5">
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

                      <div className="grid gap-3 rounded-md border border-white/10 bg-black/25 p-4 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-center">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                          VAST URL
                        </span>
                        <input
                          value={vastUrl}
                          onChange={(event) => updateVastUrl(event.currentTarget.value)}
                          placeholder="https://adsrv.org/vast.xml"
                          className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none"
                        />
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={cancelVastUrl}
                            title="Annulla"
                            aria-label="Annulla modifiche VAST URL"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
                          >
                            <RotateCcw size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={clearVastUrl}
                            title="Cancella"
                            aria-label="Cancella VAST URL"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-400/20 text-red-100 transition hover:bg-red-500/15"
                          >
                            <Trash2 size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={saveVastConfig}
                            disabled={savingVast}
                            title="Salva"
                            aria-label="Salva VAST URL"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-black transition hover:bg-white/90 disabled:opacity-40"
                          >
                            {savingVast ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center rounded-md border border-dashed border-white/10 text-center text-sm text-white/55">
                  Seleziona una stagione nell'albero per creare o modificare un video.
                </div>
              )}
            </section>
          </div>
        </AdminCard>
      ) : null}

      {activeSection === "mediaLoad" ? (
        <AdminCard
          title="MEDIA/LOAD"
          description="Caricamento organizzato per tipologia di contenuto."
        >
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {MEDIA_FOLDERS.map((folder) => {
              const isSelected = selectedMediaFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedMediaFolder(folder.id)}
                  className="flex min-h-24 items-center gap-3 rounded-md border p-4 text-left transition"
                  style={{
                    borderColor: isSelected ? "#ffffff" : "rgba(255,255,255,0.1)",
                    backgroundColor: isSelected ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.28)",
                    color: isSelected ? "#ffffff" : "rgba(255,255,255,0.65)"
                  }}
                >
                  {folder.id === "video" ? <FileVideo size={24} /> : null}
                  {folder.id === "thumbnail" ? <ImageIcon size={24} /> : null}
                  {folder.id === "subtitles" ? <Captions size={24} /> : null}
                  <span>
                    <span className="block text-sm font-black uppercase tracking-[0.12em]">
                      {folder.label}
                    </span>
                    <span className="mt-1 block text-xs text-white/45">
                      {config.storage[folder.storageField]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="grid gap-2 lg:grid-cols-[170px_minmax(0,1fr)_auto] lg:items-center">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                <FolderCog size={17} />
                Cartella destinazione
              </span>
              <input
                value={destinationPath}
                onChange={(event) => setDestinationPath(event.currentTarget.value)}
                aria-label="Cartella di destinazione"
                className="h-11 min-w-0 rounded-md border border-white/10 bg-black/45 px-3 font-mono text-sm text-white outline-none transition focus:border-white/35"
              />
              <button
                type="button"
                onClick={browseDestinationPath}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/10"
              >
                <FolderOpen size={17} />
                Sfoglia cartella
              </button>
            </div>

            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingMedia(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsDraggingMedia(false);
                }
              }}
              onDrop={handleMediaDrop}
              className="mt-4 flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition"
              style={{
                borderColor: isDraggingMedia ? "#ffffff" : "rgba(255,255,255,0.2)",
                backgroundColor: isDraggingMedia ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.3)"
              }}
            >
              {uploadingMedia ? (
                <Loader2 size={42} className="animate-spin text-white/70" />
              ) : selectedMediaFolder === "video" ? (
                <FileVideo size={42} className="text-white/55" />
              ) : selectedMediaFolder === "thumbnail" ? (
                <ImageIcon size={42} className="text-white/55" />
              ) : (
                <Captions size={42} className="text-white/55" />
              )}
              <span className="mt-4 text-lg font-black text-white">
                {uploadingMedia
                  ? "Caricamento e analisi in corso"
                  : `Trascina qui ${activeMediaFolder.label.toLowerCase()}`}
              </span>
              <span className="mt-2 text-sm text-white/55">
                {activeMediaFolder.hint} · puoi caricare più file
              </span>
              <button
                type="button"
                onClick={() => mediaFileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-black uppercase tracking-[0.09em] text-black transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-50"
              >
                <UploadCloud size={18} />
                Sfoglia file
              </button>
              <input
                ref={mediaFileInputRef}
                type="file"
                accept={activeMediaFolder.accept}
                multiple
                onChange={handleMediaFileSelection}
                className="sr-only"
              />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-md border border-white/10 bg-black/25">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  File caricati
                </div>
                <div className="mt-1 text-xs text-white/45">
                  {loadingMediaAssets ? "Aggiornamento elenco…" : `${mediaAssets.length} file in archivio`}
                </div>
              </div>
              {loadingMediaAssets ? <Loader2 size={18} className="animate-spin text-white/55" /> : null}
            </div>

            {mediaAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-[1180px]">
                  <div className="grid grid-cols-[minmax(320px,2fr)_150px_180px_210px_125px_125px] gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                    <span>File e percorso</span>
                    <span>Durata</span>
                    <span>Qualità / formato</span>
                    <span>Tracce audio</span>
                    <span>File archivio</span>
                    <span>HLS archivio</span>
                  </div>

                  {mediaAssets.map((asset) => {
                    const isConverting = ["queued", "converting"].includes(asset.conversionStatus);
                    const conversionLabel = asset.conversionStatus === "completed"
                      ? "Completata"
                      : asset.conversionStatus === "error"
                        ? "Errore"
                        : asset.conversionStatus === "cancelled"
                          ? "Interrotta"
                        : asset.conversionStatus === "queued"
                          ? "In coda"
                          : asset.conversionStatus === "converting"
                            ? "Conversione"
                            : "Non avviata";

                    return (
                      <div
                        key={asset.id}
                        className="border-b border-white/[0.07] last:border-b-0"
                      >
                        <div className="grid grid-cols-[minmax(320px,2fr)_150px_180px_210px_125px_125px] gap-3 px-4 py-4 text-sm text-white/75">
                          <div className="min-w-0">
                            <div className="truncate font-bold text-white" title={asset.originalName}>
                              {asset.originalName}
                            </div>
                            <div
                              className="mt-1 break-all font-mono text-[11px] leading-4 text-white/40"
                              title={asset.filePath}
                            >
                              {asset.filePath}
                            </div>
                          </div>
                          <div className="font-mono text-xs font-bold text-white/70">
                            {formatVideoDuration(asset.durationSeconds, asset.frameRate)}
                            {asset.frameRate ? (
                              <div className="mt-1 text-[10px] font-normal text-white/35">
                                {asset.frameRate.toFixed(2)} fps
                              </div>
                            ) : null}
                          </div>
                          <div className="text-xs leading-5">
                            <div className="font-bold text-white/80">{getVideoQuality(asset)}</div>
                            <div className="text-white/40">
                              {[asset.videoCodec, asset.containerFormat]
                                .filter(Boolean)
                                .map((value) => value?.toUpperCase())
                                .join(" · ") || "Formato non rilevato"}
                            </div>
                          </div>
                          <div className="text-xs leading-5">
                            <div className="font-bold text-white/80">{getAudioDescription(asset)}</div>
                            {asset.audioTracks.length > 0 ? (
                              <div className="text-white/40">
                                {asset.audioTracks
                                  .map((track) =>
                                    [track.language?.toUpperCase(), track.layout || (track.channels ? `${track.channels} ch` : null)]
                                      .filter(Boolean)
                                      .join(" ")
                                  )
                                  .filter(Boolean)
                                  .join(" · ")}
                              </div>
                            ) : null}
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                                asset.sourceExists
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-red-500/15 text-red-300"
                              }`}
                            >
                              {asset.sourceExists ? <CircleCheck size={13} /> : <CircleX size={13} />}
                              {asset.sourceExists ? "Presente" : "Assente"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                                asset.hlsExists
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : isConverting
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-white/[0.07] text-white/45"
                              }`}
                            >
                              {asset.hlsExists ? <CircleCheck size={13} /> : <CircleX size={13} />}
                              {asset.hlsExists ? "Presente" : isConverting ? "In corso" : "Assente"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-t border-white/[0.05] bg-black/20 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.06em]">
                              <span
                                className={
                                  asset.conversionStatus === "error"
                                    ? "text-red-300"
                                    : asset.conversionStatus === "completed"
                                      ? "text-emerald-300"
                                      : asset.conversionStatus === "cancelled"
                                        ? "text-amber-300"
                                        : "text-white/55"
                                }
                              >
                                {conversionLabel}
                              </span>
                              <span className="text-white/45">{asset.conversionProgress}%</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className={`h-full rounded-full transition-[width] duration-500 ${
                                  asset.conversionStatus === "error"
                                    ? "bg-red-500"
                                    : asset.conversionStatus === "completed"
                                      ? "bg-emerald-500"
                                      : asset.conversionStatus === "cancelled"
                                        ? "bg-amber-400"
                                        : "bg-stream-red"
                                }`}
                                style={{ width: `${asset.conversionProgress}%` }}
                              />
                            </div>
                            {asset.conversionError ? (
                              <div className="mt-2 line-clamp-2 text-[10px] leading-4 text-red-300/75" title={asset.conversionError}>
                                {asset.conversionError}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {asset.mediaType === "video" ? (
                              isConverting ? (
                                <button
                                  type="button"
                                  onClick={() => void stopMediaConversion(asset)}
                                  title="Interrompi conversione"
                                  aria-label={`Interrompi conversione di ${asset.originalName}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-300 text-black transition hover:bg-amber-200"
                                >
                                  <CircleX size={17} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void convertMediaAsset(asset)}
                                  disabled={!asset.sourceExists}
                                  title="Converti in HLS"
                                  aria-label={`Converti ${asset.originalName} in HLS`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  <FileVideo size={17} />
                                </button>
                              )
                            ) : null}
                          <button
                            type="button"
                            onClick={() => void deleteMediaAsset(asset)}
                            disabled={isConverting}
                            title="Elimina file"
                            aria-label={`Elimina ${asset.originalName}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-400/20 text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Trash2 size={17} />
                          </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex min-h-32 items-center justify-center px-6 text-center text-sm text-white/45">
                {loadingMediaAssets
                  ? "Caricamento dei file in archivio…"
                  : `Nessun file ${activeMediaFolder.label.toLowerCase()} caricato.`}
              </div>
            )}
          </div>
        </AdminCard>
      ) : null}

      {activeSection === "config" ? (
        <div className="space-y-5">
          <AdminCard
            title="STORAGE/SERVER"
            description="Percorsi server usati per video, media convertiti, thumbnail e sottotitoli."
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
