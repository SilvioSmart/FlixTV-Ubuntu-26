import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChannelResponse = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
};

export async function GET() {
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

  return NextResponse.json({
    channels
  });
}
