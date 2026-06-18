import { execFile } from "node:child_process";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const MAX_FILE_BYTES = 20 * 1024 * 1024 * 1024;

const MEDIA_TYPES = new Set(["video", "thumbnail", "subtitles"]);

type ProbeStream = {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  channels?: number;
  channel_layout?: string;
  tags?: {
    language?: string;
  };
};

type ProbeResult = {
  streams?: ProbeStream[];
  format?: {
    duration?: string;
    format_name?: string;
  };
};

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function cleanFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return `${baseName || "media"}${extension}`;
}

function parseFrameRate(value?: string) {
  if (!value) {
    return null;
  }

  const [numerator, denominator] = value.split("/").map(Number);

  if (!numerator || !denominator) {
    return Number(value) || null;
  }

  return numerator / denominator;
}

async function probeFile(filePath: string) {
  try {
    const { stdout } = await execFileAsync(
      process.env.FFPROBE_PATH || "ffprobe",
      [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        filePath
      ],
      {
        maxBuffer: 4 * 1024 * 1024
      }
    );
    const probe = JSON.parse(stdout) as ProbeResult;
    const videoStream = probe.streams?.find((stream) => stream.codec_type === "video");
    const audioStreams = probe.streams?.filter((stream) => stream.codec_type === "audio") ?? [];

    return {
      durationSeconds: probe.format?.duration ? Number(probe.format.duration) : null,
      frameRate: parseFrameRate(videoStream?.avg_frame_rate || videoStream?.r_frame_rate),
      width: videoStream?.width ?? null,
      height: videoStream?.height ?? null,
      videoCodec: videoStream?.codec_name ?? null,
      containerFormat: probe.format?.format_name?.split(",")[0] ?? null,
      audioTracks: audioStreams.map((stream, index) => ({
        index: index + 1,
        codec: stream.codec_name ?? "unknown",
        channels: stream.channels ?? null,
        layout: stream.channel_layout ?? null,
        language: stream.tags?.language ?? null
      }))
    };
  } catch {
    return {
      durationSeconds: null,
      frameRate: null,
      width: null,
      height: null,
      videoCodec: null,
      containerFormat: null,
      audioTracks: []
    };
  }
}

function serializeAsset(asset: {
  id: string;
  mediaType: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: bigint;
  durationSeconds: number | null;
  frameRate: number | null;
  width: number | null;
  height: number | null;
  videoCodec: string | null;
  containerFormat: string | null;
  audioTracks: unknown;
  sourceExists: boolean;
  hlsExists: boolean;
  hlsPath: string | null;
  conversionStatus: string;
  conversionProgress: number;
  conversionError: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...asset,
    sizeBytes: Number(asset.sizeBytes),
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString()
  };
}

async function getStorageConfig() {
  return prisma.mediaStorageConfig.findUnique({
    where: {
      id: "default"
    }
  });
}

function resolveDestination(
  mediaType: string,
  requestedPath: string | null,
  storage: {
    uploadPath: string;
    thumbnailPath: string;
    subtitlesPath: string;
  } | null
) {
  const configuredPath = mediaType === "thumbnail"
    ? storage?.thumbnailPath
    : mediaType === "subtitles"
      ? storage?.subtitlesPath
      : storage?.uploadPath;
  const basePath = path.resolve(configuredPath || path.join(process.cwd(), "storage", mediaType));

  if (!requestedPath?.trim()) {
    return basePath;
  }

  const candidate = path.resolve(requestedPath.trim());
  const allowedRoots = [
    storage?.uploadPath,
    storage?.thumbnailPath,
    storage?.subtitlesPath
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => path.resolve(value));

  if (!allowedRoots.some((root) => candidate === root || candidate.startsWith(`${root}${path.sep}`))) {
    throw new Error("Destination folder is outside configured storage paths");
  }

  return candidate;
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const mediaType = request.nextUrl.searchParams.get("mediaType");
  const assets = await prisma.mediaAsset.findMany({
    where: mediaType && MEDIA_TYPES.has(mediaType) ? { mediaType } : undefined,
    orderBy: {
      createdAt: "desc"
    }
  });
  const verifiedAssets = await Promise.all(
    assets.map(async (asset) => {
      let sourceExists = false;
      let hlsExists = false;

      try {
        sourceExists = (await stat(asset.filePath)).isFile();
      } catch {
        sourceExists = false;
      }

      if (asset.hlsPath) {
        try {
          hlsExists = (await stat(path.join(asset.hlsPath, "index.m3u8"))).isFile();
        } catch {
          hlsExists = false;
        }
      }

      if (asset.sourceExists !== sourceExists || asset.hlsExists !== hlsExists) {
        return prisma.mediaAsset.update({
          where: {
            id: asset.id
          },
          data: {
            sourceExists,
            hlsExists
          }
        });
      }

      return asset;
    })
  );

  return corsJson(request, {
    assets: verifiedAssets.map(serializeAsset)
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const mediaType = String(formData.get("mediaType") || "");
  const requestedPath = formData.get("destinationPath");

  if (!(file instanceof File) || !MEDIA_TYPES.has(mediaType)) {
    return corsJson(request, { error: "File and valid mediaType are required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return corsJson(request, { error: "File exceeds 20 GB" }, { status: 413 });
  }

  const storage = await getStorageConfig();
  let destinationDir: string;

  try {
    destinationDir = resolveDestination(
      mediaType,
      typeof requestedPath === "string" ? requestedPath : null,
      storage
    );
  } catch (error) {
    return corsJson(
      request,
      { error: error instanceof Error ? error.message : "Invalid destination folder" },
      { status: 400 }
    );
  }

  await mkdir(destinationDir, {
    recursive: true
  });

  const storedName = `${Date.now()}-${cleanFileName(file.name)}`;
  const filePath = path.join(destinationDir, storedName);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  const probe = mediaType === "video" ? await probeFile(filePath) : {
    durationSeconds: null,
    frameRate: null,
    width: null,
    height: null,
    videoCodec: null,
    containerFormat: path.extname(file.name).slice(1).toLowerCase() || null,
    audioTracks: []
  };

  const asset = await prisma.mediaAsset.create({
    data: {
      mediaType,
      originalName: file.name,
      fileName: storedName,
      filePath,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: BigInt(file.size),
      ...probe
    }
  });

  return corsJson(request, {
    asset: serializeAsset(asset)
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return corsJson(request, { error: "Media asset id is required" }, { status: 400 });
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id
    }
  });

  if (!asset) {
    return corsJson(request, { error: "Media asset not found" }, { status: 404 });
  }

  await rm(asset.filePath, {
    force: true
  });

  if (asset.hlsPath) {
    await rm(asset.hlsPath, {
      recursive: true,
      force: true
    });
  }

  await prisma.mediaAsset.delete({
    where: {
      id
    }
  });

  return corsJson(request, {
    ok: true
  });
}
