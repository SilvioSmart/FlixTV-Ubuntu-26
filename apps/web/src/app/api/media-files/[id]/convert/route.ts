import { spawn } from "node:child_process";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const activeConversions = new Map<string, ReturnType<typeof spawn>>();
const startingConversions = new Set<string>();
const cancelledConversions = new Set<string>();

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function parseProgressTime(value: string) {
  const microseconds = Number(value);
  return Number.isFinite(microseconds) ? microseconds / 1_000_000 : 0;
}

async function startConversion(id: string) {
  if (activeConversions.has(id)) {
    startingConversions.delete(id);
    return;
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id
    }
  });

  if (!asset || asset.mediaType !== "video") {
    startingConversions.delete(id);
    return;
  }

  try {
    await stat(asset.filePath);
  } catch {
    startingConversions.delete(id);
    await prisma.mediaAsset.update({
      where: {
        id
      },
      data: {
        sourceExists: false,
        conversionStatus: "error",
        conversionError: "Source file not found"
      }
    });
    return;
  }

  const storage = await prisma.mediaStorageConfig.findUnique({
    where: {
      id: "default"
    }
  });
  const outputRoot = path.resolve(
    storage?.convertedPath || path.join(process.cwd(), "storage", "hls")
  );
  const outputDir = path.join(outputRoot, id);
  const playlistPath = path.join(outputDir, "index.m3u8");

  await rm(outputDir, {
    recursive: true,
    force: true
  });
  await mkdir(outputDir, {
    recursive: true
  });
  await prisma.mediaAsset.update({
    where: {
      id
    },
    data: {
      hlsPath: outputDir,
      hlsExists: false,
      conversionStatus: "queued",
      conversionProgress: 0,
      conversionError: null
    }
  });

  if (cancelledConversions.has(id)) {
    startingConversions.delete(id);
    cancelledConversions.delete(id);
    await prisma.mediaAsset.update({
      where: {
        id
      },
      data: {
        conversionStatus: "cancelled",
        conversionError: null
      }
    });
    return;
  }

  const ffmpeg = spawn(
    process.env.FFMPEG_PATH || "ffmpeg",
    [
      "-y",
      "-i",
      asset.filePath,
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "21",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-hls_time",
      "6",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      path.join(outputDir, "segment-%05d.ts"),
      "-progress",
      "pipe:1",
      "-nostats",
      playlistPath
    ],
    {
      windowsHide: true
    }
  );
  startingConversions.delete(id);
  activeConversions.set(id, ffmpeg);

  let errorOutput = "";
  let lastProgress = -1;

  await prisma.mediaAsset.update({
    where: {
      id
    },
    data: {
      conversionStatus: "converting"
    }
  });

  ffmpeg.stdout.setEncoding("utf8");
  ffmpeg.stdout.on("data", (chunk: string) => {
    for (const line of chunk.split(/\r?\n/)) {
      if (!line.startsWith("out_time_ms=")) {
        continue;
      }

      const currentSeconds = parseProgressTime(line.slice("out_time_ms=".length));
      const duration = asset.durationSeconds || 0;
      const progress = duration > 0
        ? Math.max(0, Math.min(99, Math.round((currentSeconds / duration) * 100)))
        : 0;

      if (progress === lastProgress) {
        continue;
      }

      lastProgress = progress;
      void prisma.mediaAsset.update({
        where: {
          id
        },
        data: {
          conversionProgress: progress
        }
      });
    }
  });

  ffmpeg.stderr.setEncoding("utf8");
  ffmpeg.stderr.on("data", (chunk: string) => {
    errorOutput = `${errorOutput}${chunk}`.slice(-4000);
  });

  ffmpeg.on("error", (error) => {
    activeConversions.delete(id);

    if (cancelledConversions.has(id)) {
      return;
    }

    void prisma.mediaAsset.update({
      where: {
        id
      },
      data: {
        conversionStatus: "error",
        conversionError: error.message
      }
    });
  });

  ffmpeg.on("close", (code) => {
    activeConversions.delete(id);
    const wasCancelled = cancelledConversions.delete(id);

    if (wasCancelled) {
      return;
    }

    const succeeded = code === 0;
    void prisma.mediaAsset.update({
      where: {
        id
      },
      data: {
        hlsExists: succeeded,
        conversionStatus: succeeded ? "completed" : "error",
        conversionProgress: succeeded ? 100 : lastProgress > 0 ? lastProgress : 0,
        conversionError: succeeded ? null : errorOutput || `FFmpeg exited with code ${code}`
      }
    });
  });
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id
    }
  });

  if (!asset || asset.mediaType !== "video") {
    return corsJson(request, { error: "Video asset not found" }, { status: 404 });
  }

  if (
    activeConversions.has(id) ||
    startingConversions.has(id) ||
    asset.conversionStatus === "converting"
  ) {
    return corsJson(request, {
      ok: true,
      status: "converting"
    });
  }

  cancelledConversions.delete(id);
  startingConversions.add(id);
  void startConversion(id).catch((error) => {
    startingConversions.delete(id);
    activeConversions.delete(id);
    void prisma.mediaAsset.update({
      where: {
        id
      },
      data: {
        conversionStatus: "error",
        conversionError: error instanceof Error ? error.message : "Conversion failed"
      }
    });
  });

  return corsJson(request, {
    ok: true,
    status: "queued"
  });
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id
    }
  });

  if (!asset || asset.mediaType !== "video") {
    return corsJson(request, { error: "Video asset not found" }, { status: 404 });
  }

  const ffmpeg = activeConversions.get(id);
  const isStarting = startingConversions.has(id);

  if (!ffmpeg && !isStarting && !["queued", "converting"].includes(asset.conversionStatus)) {
    return corsJson(request, {
      ok: true,
      status: asset.conversionStatus
    });
  }

  cancelledConversions.add(id);

  if (ffmpeg) {
    ffmpeg.kill("SIGTERM");
  }

  await prisma.mediaAsset.update({
    where: {
      id
    },
    data: {
      conversionStatus: "cancelled",
      conversionError: null,
      hlsExists: false
    }
  });

  return corsJson(request, {
    ok: true,
    status: "cancelled"
  });
}
