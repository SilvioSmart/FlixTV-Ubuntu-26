import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import {
  DEFAULT_HOME_CONFIG,
  normalizeHomeConfig,
  type HomeConfig
} from "@/lib/home-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONFIG_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(CONFIG_DIR, "home-config.json");

async function readHomeConfig(): Promise<HomeConfig> {
  try {
    const content = await readFile(CONFIG_FILE, "utf8");
    return normalizeHomeConfig(JSON.parse(content));
  } catch {
    return DEFAULT_HOME_CONFIG;
  }
}

async function writeHomeConfig(config: HomeConfig) {
  await mkdir(CONFIG_DIR, {
    recursive: true
  });
  await writeFile(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const config = await readHomeConfig();

  return corsJson(request, {
    config
  });
}

export async function PUT(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
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

  const config = normalizeHomeConfig(
    body && typeof body === "object" && "config" in body
      ? (body as { config: unknown }).config
      : body
  );

  await writeHomeConfig(config);

  return corsJson(request, {
    config
  });
}
