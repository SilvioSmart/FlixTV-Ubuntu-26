import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json(
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
    return NextResponse.json(
      {
        error: "Invalid JSON body"
      },
      {
        status: 400
      }
    );
  }

  if (typeof body.videoId !== "string" || body.videoId.length === 0) {
    return NextResponse.json(
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
    return NextResponse.json(
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
    return NextResponse.json(
      {
        error: "User not found"
      },
      {
        status: 404
      }
    );
  }

  if (!video) {
    return NextResponse.json(
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

  return NextResponse.json({
    watchHistory: {
      ...watchHistory,
      updatedAt: watchHistory.updatedAt.toISOString()
    }
  });
}
