export type ProgramDetail = {
  id?: string;
  categoria: string;
  genere: string;
  programma: string;
  stagione: string;
  numeroPuntate: number;
  IDprogramma: string;
  IDstagione: string;
};

export type ProgramEpisode = {
  id?: string;
  episodeCode: string;
  seasonId: string;
  seriesId: string;
  episodeNumber: number;
  productionCode: string;
  title: string;
  shortPlot: string;
  longPlot: string;
  thumbnailUrl: string;
  mezzanineFileUrl: string;
  trailerUrl: string;
  subtitlesJson: string;
  audioTracksJson: string;
  duration: number;
  cuePointsJson: string;
  maxResolution: "SD" | "HD" | "FHD" | "4K";
  audioFormatsJson: string;
  publicationStatus: "Draft" | "Scheduled" | "Published" | "Archived";
  publishAt: string;
  licensingEnd: string;
  geoRestrictionsJson: string;
  accessLevel: "Free" | "Registered" | "Premium" | "TVOD";
};

export const DEFAULT_PROGRAMS: ProgramDetail[] = [
  {
    id: "default-fuori-corso",
    categoria: "Sitcom",
    genere: "Commedia",
    programma: "Fuori Corso",
    stagione: "Stagione 1",
    numeroPuntate: 12,
    IDprogramma: "FRCRS",
    IDstagione: "FCS01"
  },
  {
    id: "default-bed-and-breakfast",
    categoria: "Sitcom",
    genere: "Commedia",
    programma: "Bed&Breakfast",
    stagione: "Stagione 1",
    numeroPuntate: 10,
    IDprogramma: "BDBRK",
    IDstagione: "BBK01"
  },
  {
    id: "default-tutti-a-casa",
    categoria: "Sitcom",
    genere: "Commedia",
    programma: "Tutti a Casa",
    stagione: "Stagione 1",
    numeroPuntate: 8,
    IDprogramma: "TTTCS",
    IDstagione: "TTS01"
  },
  {
    id: "default-telegaribaldi",
    categoria: "News",
    genere: "Informazione",
    programma: "Telegaribaldi",
    stagione: "2026",
    numeroPuntate: 365,
    IDprogramma: "TLGRB",
    IDstagione: "TGB26"
  }
];

export const EMPTY_EPISODE_JSON = {
  subtitlesJson: '[{"lang":"it","url":""}]',
  audioTracksJson: '[{"lang":"it","trackId":""}]',
  cuePointsJson: '{"intro_start":0,"intro_end":0,"credits_start":0}',
  audioFormatsJson: '["Stereo 2.0"]',
  geoRestrictionsJson: '[]'
};

export const MAX_RESOLUTIONS = ["SD", "HD", "FHD", "4K"] as const;
export const PUBLICATION_STATUSES = ["Draft", "Scheduled", "Published", "Archived"] as const;
export const ACCESS_LEVELS = ["Free", "Registered", "Premium", "TVOD"] as const;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeJsonText(value: unknown, fallback: string) {
  if (!isString(value)) {
    return fallback;
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return fallback;
  }
}

function normalizeCodeSource(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function twoDigit(value: number) {
  return Math.max(0, Math.min(99, Math.round(value))).toString().padStart(2, "0");
}

export function getSeasonNumber(stagione: string) {
  const matches = stagione.match(/\d+/g);
  const lastMatch = matches?.at(-1);

  if (!lastMatch) {
    return 1;
  }

  return Number(lastMatch.slice(-2)) || 1;
}

export function generateProgramCode(programma: string) {
  const consonants = normalizeCodeSource(programma).replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, "");
  return consonants.padEnd(5, "X").slice(0, 5);
}

export function generateSeasonCode(programCode: string, stagione: string) {
  const normalizedProgramCode = normalizeCodeSource(programCode).padEnd(5, "X").slice(0, 5);
  return `${normalizedProgramCode[0]}${normalizedProgramCode[2]}${normalizedProgramCode[4]}S${twoDigit(getSeasonNumber(stagione))}`;
}

export function generateEpisodeCode(programCode: string, stagione: string, episodeNumber: number) {
  const normalizedProgramCode = normalizeCodeSource(programCode).padEnd(5, "X").slice(0, 5);
  return `${normalizedProgramCode[0]}${normalizedProgramCode[4]}${twoDigit(getSeasonNumber(stagione))}${twoDigit(episodeNumber)}`;
}

export function generateProductionCode(stagione: string, episodeNumber: number) {
  return `S${twoDigit(getSeasonNumber(stagione))}E${twoDigit(episodeNumber)}`;
}

export function normalizeProgram(value: unknown): ProgramDetail | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const program = value as Partial<ProgramDetail>;
  const categoria = isString(program.categoria) ? program.categoria.trim() : "";
  const genere = isString(program.genere) ? program.genere.trim() : "";
  const programma = isString(program.programma) ? program.programma.trim() : "";
  const stagione = isString(program.stagione) ? program.stagione.trim() : "";
  const programCode = generateProgramCode(programma);

  if (!categoria || !genere || !programma || !stagione) {
    return null;
  }

  return {
    id:
      isString(program.id) && !program.id.startsWith("temp-") && !program.id.startsWith("default-")
        ? program.id
        : undefined,
    categoria,
    genere,
    programma,
    stagione,
    numeroPuntate: isNumber(program.numeroPuntate)
      ? Math.max(0, Math.round(program.numeroPuntate))
      : 0,
    IDprogramma: programCode,
    IDstagione: generateSeasonCode(programCode, stagione)
  };
}

export function normalizePrograms(value: unknown): ProgramDetail[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeProgram)
    .filter((program): program is ProgramDetail => Boolean(program));
}

export function uniqueValues(programs: ProgramDetail[], key: keyof ProgramDetail) {
  return Array.from(
    new Set(
      programs
        .map((program) => program[key])
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  ).sort((firstValue, secondValue) => firstValue.localeCompare(secondValue));
}

export function createEpisodeDraft(season: ProgramDetail): ProgramEpisode {
  const seasonId = season.id ?? `${season.categoria}-${season.programma}-${season.stagione}`;

  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    episodeCode: generateEpisodeCode(
      season.IDprogramma || generateProgramCode(season.programma),
      season.stagione,
      1
    ),
    seasonId,
    seriesId: season.IDstagione || generateSeasonCode(generateProgramCode(season.programma), season.stagione),
    episodeNumber: 1,
    productionCode: generateProductionCode(season.stagione, 1),
    title: "",
    shortPlot: "",
    longPlot: "",
    thumbnailUrl: "",
    mezzanineFileUrl: "",
    trailerUrl: "",
    subtitlesJson: EMPTY_EPISODE_JSON.subtitlesJson,
    audioTracksJson: EMPTY_EPISODE_JSON.audioTracksJson,
    duration: 0,
    cuePointsJson: EMPTY_EPISODE_JSON.cuePointsJson,
    maxResolution: "FHD",
    audioFormatsJson: EMPTY_EPISODE_JSON.audioFormatsJson,
    publicationStatus: "Draft",
    publishAt: "",
    licensingEnd: "",
    geoRestrictionsJson: EMPTY_EPISODE_JSON.geoRestrictionsJson,
    accessLevel: "Free"
  };
}

export function normalizeEpisode(value: unknown): ProgramEpisode | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const episode = value as Partial<ProgramEpisode>;
  const seasonId = isString(episode.seasonId) ? episode.seasonId.trim() : "";
  const seriesId = isString(episode.seriesId) ? episode.seriesId.trim() : "";
  const title = isString(episode.title) ? episode.title.trim().slice(0, 150) : "";
  const shortPlot = isString(episode.shortPlot) ? episode.shortPlot.trim().slice(0, 250) : "";
  const maxResolution = MAX_RESOLUTIONS.includes(episode.maxResolution as typeof MAX_RESOLUTIONS[number])
    ? episode.maxResolution as ProgramEpisode["maxResolution"]
    : "FHD";
  const publicationStatus = PUBLICATION_STATUSES.includes(
    episode.publicationStatus as typeof PUBLICATION_STATUSES[number]
  )
    ? episode.publicationStatus as ProgramEpisode["publicationStatus"]
    : "Draft";
  const accessLevel = ACCESS_LEVELS.includes(episode.accessLevel as typeof ACCESS_LEVELS[number])
    ? episode.accessLevel as ProgramEpisode["accessLevel"]
    : "Free";

  if (!seasonId || !seriesId || !title) {
    return null;
  }

  return {
    id:
      isString(episode.id) && !episode.id.startsWith("temp-")
        ? episode.id
        : undefined,
    episodeCode: isString(episode.episodeCode) ? episode.episodeCode.trim() : "",
    seasonId,
    seriesId,
    episodeNumber: isNumber(episode.episodeNumber)
      ? Math.max(1, Math.round(episode.episodeNumber))
      : 1,
    productionCode: isString(episode.productionCode) ? episode.productionCode.trim() : "",
    title,
    shortPlot,
    longPlot: isString(episode.longPlot) ? episode.longPlot.trim() : "",
    thumbnailUrl: isString(episode.thumbnailUrl) ? episode.thumbnailUrl.trim() : "",
    mezzanineFileUrl: isString(episode.mezzanineFileUrl) ? episode.mezzanineFileUrl.trim() : "",
    trailerUrl: isString(episode.trailerUrl) ? episode.trailerUrl.trim() : "",
    subtitlesJson: normalizeJsonText(episode.subtitlesJson, EMPTY_EPISODE_JSON.subtitlesJson),
    audioTracksJson: normalizeJsonText(episode.audioTracksJson, EMPTY_EPISODE_JSON.audioTracksJson),
    duration: isNumber(episode.duration) ? Math.max(0, Math.round(episode.duration)) : 0,
    cuePointsJson: normalizeJsonText(episode.cuePointsJson, EMPTY_EPISODE_JSON.cuePointsJson),
    maxResolution,
    audioFormatsJson: normalizeJsonText(episode.audioFormatsJson, EMPTY_EPISODE_JSON.audioFormatsJson),
    publicationStatus,
    publishAt: isString(episode.publishAt) ? episode.publishAt : "",
    licensingEnd: isString(episode.licensingEnd) ? episode.licensingEnd : "",
    geoRestrictionsJson: normalizeJsonText(
      episode.geoRestrictionsJson,
      EMPTY_EPISODE_JSON.geoRestrictionsJson
    ),
    accessLevel
  };
}
