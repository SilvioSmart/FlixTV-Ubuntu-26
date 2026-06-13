import { NextRequest, NextResponse } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WatchHistoryRequestBody = {
  videoId?: unknown;
  currentTime?: unknown;
};

function getAuthenticatedUserId(request: NextRequest) {
  return request.headers.get("x-user-id");
}

function parsePlaybackTime(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return corsJson(
      request,
      {
        error: "Authentication required"
      },
      {
        status: 401
      }
    );
  }

  let body: WatchHistoryRequestBody;

  try {
    body = (await request.json()) as WatchHistoryRequestBody;
  } catch {
    return corsJson(
      request,
      {
        error: "Invalid JSON body"
      },
      {
        status: 400
      }
    );
  }

  if (typeof body.videoId !== "string" || body.videoId.length === 0) {
    return corsJson(
      request,
      {
        error: "videoId is required"
      },
      {
        status: 400
      }
    );
  }

  const currentPlaybackTime = parsePlaybackTime(body.currentTime);

  if (currentPlaybackTime === null) {
    return corsJson(
      request,
      {
        error: "currentTime must be a finite number"
      },
      {
        status: 400
      }
    );
  }

  const [user, video] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true
      }
    }),
    prisma.videoContent.findUnique({
      where: {
        id: body.videoId
      },
      select: {
        id: true,
        duration: true
      }
    })
  ]);

  if (!user) {
    return corsJson(
      request,
      {
        error: "User not found"
      },
      {
        status: 404
      }
    );
  }

  if (!video) {
    return corsJson(
      request,
      {
        error: "Video content not found"
      },
      {
        status: 404
      }
    );
  }

  const boundedPlaybackTime = Math.min(currentPlaybackTime, video.duration);

  const watchHistory = await prisma.watchHistory.upsert({
    where: {
      userId_videoId: {
        userId,
        videoId: video.id
      }
    },
    create: {
      userId,
      videoId: video.id,
      currentPlaybackTime: boundedPlaybackTime
    },
    update: {
      currentPlaybackTime: boundedPlaybackTime
    },
    select: {
      userId: true,
      videoId: true,
      currentPlaybackTime: true,
      updatedAt: true
    }
  });

  return corsJson(request, {
    watchHistory: {
      ...watchHistory,
      updatedAt: watchHistory.updatedAt.toISOString()
    }
  });
}
