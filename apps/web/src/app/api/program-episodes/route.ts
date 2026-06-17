import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import {
  generateEpisodeCode,
  generateProgramCode,
  normalizeEpisode,
  type ProgramEpisode
} from "@/lib/programs-config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";

type StoredEpisode = {
  id: string;
  episodeCode: string | null;
  seasonId: string;
  seriesId: string;
  episodeNumber: number;
  productionCode: string | null;
  title: string;
  shortPlot: string | null;
  longPlot: string | null;
  thumbnailUrl: string | null;
  mezzanineFileUrl: string | null;
  trailerUrl: string | null;
  subtitles: unknown;
  audioTracks: unknown;
  duration: number;
  cuePoints: unknown;
  maxResolution: string;
  audioFormats: unknown;
  publicationStatus: string;
  publishAt: Date | string | null;
  licensingEnd: Date | string | null;
  geoRestrictions: unknown;
  accessLevel: string;
  season?: {
    programma: string;
    stagione: string;
    programCode: string;
  };
};

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function jsonText(value: unknown, fallback: string) {
  try {
    return JSON.stringify(value ?? JSON.parse(fallback), null, 2);
  } catch {
    return fallback;
  }
}

function dateValue(value: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function jsonValue(value: string) {
  return JSON.parse(value);
}

function nullableDate(value: string) {
  return value ? new Date(value) : null;
}

function serializeEpisode(episode: StoredEpisode): ProgramEpisode {
  return {
    id: episode.id,
    episodeCode: episode.episodeCode ?? "",
    seasonId: episode.seasonId,
    seriesId: episode.seriesId,
    episodeNumber: episode.episodeNumber,
    productionCode: episode.productionCode ?? "",
    title: episode.title,
    shortPlot: episode.shortPlot ?? "",
    longPlot: episode.longPlot ?? "",
    thumbnailUrl: episode.thumbnailUrl ?? "",
    mezzanineFileUrl: episode.mezzanineFileUrl ?? "",
    trailerUrl: episode.trailerUrl ?? "",
    subtitlesJson: jsonText(episode.subtitles, "[]"),
    audioTracksJson: jsonText(episode.audioTracks, "[]"),
    duration: episode.duration,
    cuePointsJson: jsonText(episode.cuePoints, "{}"),
    maxResolution: episode.maxResolution as ProgramEpisode["maxResolution"],
    audioFormatsJson: jsonText(episode.audioFormats, "[]"),
    publicationStatus: episode.publicationStatus as ProgramEpisode["publicationStatus"],
    publishAt: dateValue(episode.publishAt),
    licensingEnd: dateValue(episode.licensingEnd),
    geoRestrictionsJson: jsonText(episode.geoRestrictions, "[]"),
    accessLevel: episode.accessLevel as ProgramEpisode["accessLevel"]
  };
}

async function resolveEpisodeCode(episode: ProgramEpisode) {
  const season = await prisma.programDetail.findUnique({
    where: {
      id: episode.seasonId
    },
    select: {
      programma: true,
      stagione: true,
      programCode: true
    }
  });

  const programCode = season?.programCode || generateProgramCode(season?.programma ?? episode.seriesId);
  return generateEpisodeCode(programCode, season?.stagione ?? "Stagione 1", episode.episodeNumber);
}

function episodeDelegate() {
  return (prisma as unknown as {
    programEpisode: {
      findMany: (args: unknown) => Promise<unknown>;
      create: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
      delete: (args: unknown) => Promise<unknown>;
    };
  }).programEpisode;
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const seasonId = request.nextUrl.searchParams.get("seasonId");
    const where = seasonId ? { seasonId } : undefined;
    const episodes = await episodeDelegate().findMany({
      where,
      include: {
        season: {
          select: {
            programma: true,
            stagione: true,
            programCode: true
          }
        }
      },
      orderBy: [
        {
          episodeNumber: "asc"
        },
        {
          title: "asc"
        }
      ]
    }) as StoredEpisode[];
    const normalizedEpisodes = await Promise.all(
      episodes.map(async (episode) => {
        const programCode = episode.season?.programCode ||
          generateProgramCode(episode.season?.programma ?? episode.seriesId);
        const episodeCode = generateEpisodeCode(
          programCode,
          episode.season?.stagione ?? "Stagione 1",
          episode.episodeNumber
        );

        if (episode.episodeCode !== episodeCode) {
          await episodeDelegate().update({
            where: {
              id: episode.id
            },
            data: {
              episodeCode
            }
          });
        }

        return {
          ...episode,
          episodeCode
        };
      })
    );

    return corsJson(request, {
      episodes: normalizedEpisodes.map(serializeEpisode)
    });
  } catch {
    return corsJson(request, {
      episodes: []
    });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const episode = normalizeEpisode(await request.json().catch(() => null));

  if (!episode) {
    return corsJson(request, { error: "Episode payload is invalid" }, { status: 400 });
  }

  const episodeCode = await resolveEpisodeCode(episode);
  const createdEpisode = await episodeDelegate().create({
    data: {
      episodeCode,
      seasonId: episode.seasonId,
      seriesId: episode.seriesId,
      episodeNumber: episode.episodeNumber,
      productionCode: episode.productionCode || null,
      title: episode.title,
      shortPlot: episode.shortPlot || null,
      longPlot: episode.longPlot || null,
      thumbnailUrl: episode.thumbnailUrl || null,
      mezzanineFileUrl: episode.mezzanineFileUrl || null,
      trailerUrl: episode.trailerUrl || null,
      subtitles: jsonValue(episode.subtitlesJson),
      audioTracks: jsonValue(episode.audioTracksJson),
      duration: episode.duration,
      cuePoints: jsonValue(episode.cuePointsJson),
      maxResolution: episode.maxResolution,
      audioFormats: jsonValue(episode.audioFormatsJson),
      publicationStatus: episode.publicationStatus,
      publishAt: nullableDate(episode.publishAt),
      licensingEnd: nullableDate(episode.licensingEnd),
      geoRestrictions: jsonValue(episode.geoRestrictionsJson),
      accessLevel: episode.accessLevel
    }
  }) as StoredEpisode;

  return corsJson(request, {
    episode: serializeEpisode(createdEpisode)
  });
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const episode = normalizeEpisode(body);
  const id = body && typeof body === "object" && "id" in body
    ? (body as { id?: unknown }).id
    : undefined;

  if (!episode || typeof id !== "string") {
    return corsJson(request, { error: "Episode payload is invalid" }, { status: 400 });
  }

  const episodeCode = await resolveEpisodeCode(episode);
  const updatedEpisode = await episodeDelegate().update({
    where: {
      id
    },
    data: {
      episodeCode,
      seasonId: episode.seasonId,
      seriesId: episode.seriesId,
      episodeNumber: episode.episodeNumber,
      productionCode: episode.productionCode || null,
      title: episode.title,
      shortPlot: episode.shortPlot || null,
      longPlot: episode.longPlot || null,
      thumbnailUrl: episode.thumbnailUrl || null,
      mezzanineFileUrl: episode.mezzanineFileUrl || null,
      trailerUrl: episode.trailerUrl || null,
      subtitles: jsonValue(episode.subtitlesJson),
      audioTracks: jsonValue(episode.audioTracksJson),
      duration: episode.duration,
      cuePoints: jsonValue(episode.cuePointsJson),
      maxResolution: episode.maxResolution,
      audioFormats: jsonValue(episode.audioFormatsJson),
      publicationStatus: episode.publicationStatus,
      publishAt: nullableDate(episode.publishAt),
      licensingEnd: nullableDate(episode.licensingEnd),
      geoRestrictions: jsonValue(episode.geoRestrictionsJson),
      accessLevel: episode.accessLevel
    }
  }) as StoredEpisode;

  return corsJson(request, {
    episode: serializeEpisode(updatedEpisode)
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return corsJson(request, { error: "Episode id is required" }, { status: 400 });
  }

  await episodeDelegate().delete({
    where: {
      id
    }
  });

  return corsJson(request, {
    ok: true
  });
}
