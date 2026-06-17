import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const DEFAULT_VAST_URL = "https://adsrv.org/vast.xml";

type VastConfigRecord = {
  id: string;
  vastUrl: string;
};

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function vastDelegate() {
  return (prisma as unknown as {
    vastConfig: {
      findUnique: (args: unknown) => Promise<unknown>;
      upsert: (args: unknown) => Promise<unknown>;
    };
  }).vastConfig;
}

function normalizeVastUrl(value: unknown) {
  return typeof value === "string" ? value.trim() : DEFAULT_VAST_URL;
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const config = await vastDelegate().findUnique({
      where: {
        id: "default"
      }
    }) as VastConfigRecord | null;

    return corsJson(request, {
      config: {
        vastUrl: config?.vastUrl ?? DEFAULT_VAST_URL
      }
    });
  } catch {
    return corsJson(request, {
      config: {
        vastUrl: DEFAULT_VAST_URL
      }
    });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const vastUrl = normalizeVastUrl(
    body && typeof body === "object" && "vastUrl" in body
      ? (body as { vastUrl?: unknown }).vastUrl
      : undefined
  );

  const config = await vastDelegate().upsert({
    where: {
      id: "default"
    },
    update: {
      vastUrl
    },
    create: {
      id: "default",
      vastUrl
    }
  }) as VastConfigRecord;

  return corsJson(request, {
    config: {
      vastUrl: config.vastUrl
    }
  });
}
