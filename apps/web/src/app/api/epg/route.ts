import { NextRequest, NextResponse } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProgramScheduleResponse = {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
};

const DEFAULT_PROGRAM_LIMIT = 48;
const MAX_PROGRAM_LIMIT = 100;

function parseLimit(value: string | null) {
  if (!value) {
    return DEFAULT_PROGRAM_LIMIT;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_PROGRAM_LIMIT;
  }

  return Math.min(parsedValue, MAX_PROGRAM_LIMIT);
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return corsJson(
      request,
      {
        error: "channelId query parameter is required"
      },
      {
        status: 400
      }
    );
  }

  const channel = await prisma.liveChannel.findFirst({
    where: {
      id: channelId,
      isActive: true
    },
    select: {
      id: true
    }
  });

  if (!channel) {
    return corsJson(
      request,
      {
        error: "Active channel not found"
      },
      {
        status: 404
      }
    );
  }

  const now = new Date();
  const limit = parseLimit(searchParams.get("limit"));

  const programs = await prisma.programSchedule.findMany({
    where: {
      channelId,
      endTime: {
        gte: now
      }
    },
    orderBy: {
      startTime: "asc"
    },
    take: limit,
    select: {
      id: true,
      channelId: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true
    }
  });

  const epg: ProgramScheduleResponse[] = programs.map((program) => ({
    ...program,
    startTime: program.startTime.toISOString(),
    endTime: program.endTime.toISOString()
  }));

  return corsJson(request, {
    channelId,
    generatedAt: now.toISOString(),
    programs: epg
  });
}
