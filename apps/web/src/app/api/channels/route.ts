import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChannelResponse = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
};

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const channels: ChannelResponse[] = await prisma.liveChannel.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      name: "asc"
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      streamUrl: true
    }
  });

  return corsJson(request, {
    channels
  });
}
