import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import {
  DEFAULT_MEDIA_CONFIG,
  normalizeMediaConfig,
  type MediaConfig
} from "@/lib/media-config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const CONFIG_ID = "default";

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const [storage, fieldOptions] = await Promise.all([
      prisma.mediaStorageConfig.findUnique({
        where: {
          id: CONFIG_ID
        }
      }),
      prisma.mediaFieldOption.findMany({
        orderBy: [
          {
            fieldName: "asc"
          },
          {
            sortOrder: "asc"
          },
          {
            label: "asc"
          }
        ]
      })
    ]);

    return corsJson(request, {
      config: normalizeMediaConfig({
        storage: storage
          ? {
              uploadPath: storage.uploadPath,
              convertedPath: storage.convertedPath,
              thumbnailPath: storage.thumbnailPath,
              subtitlesPath: storage.subtitlesPath
            }
          : DEFAULT_MEDIA_CONFIG.storage,
        fieldOptions:
          fieldOptions.length > 0
            ? fieldOptions.map((option) => ({
                id: option.id,
                fieldName: option.fieldName,
                label: option.label,
                value: option.value,
                sortOrder: option.sortOrder,
                isActive: option.isActive
              }))
            : DEFAULT_MEDIA_CONFIG.fieldOptions
      })
    });
  } catch {
    return corsJson(request, {
      config: DEFAULT_MEDIA_CONFIG
    });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(
      request,
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    );
  }

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

  const config = normalizeMediaConfig(
    body && typeof body === "object" && "config" in body
      ? (body as { config: unknown }).config
      : body
  );

  await prisma.$transaction(async (transaction) => {
    await transaction.mediaStorageConfig.upsert({
      where: {
        id: CONFIG_ID
      },
      create: {
        id: CONFIG_ID,
        uploadPath: config.storage.uploadPath,
        convertedPath: config.storage.convertedPath,
        thumbnailPath: config.storage.thumbnailPath,
        subtitlesPath: config.storage.subtitlesPath
      },
      update: {
        uploadPath: config.storage.uploadPath,
        convertedPath: config.storage.convertedPath,
        thumbnailPath: config.storage.thumbnailPath,
        subtitlesPath: config.storage.subtitlesPath
      }
    });

    await transaction.mediaFieldOption.deleteMany();

    for (const option of config.fieldOptions) {
      await transaction.mediaFieldOption.create({
        data: {
          fieldName: option.fieldName,
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder,
          isActive: option.isActive
        }
      });
    }
  });

  return corsJson(request, {
    config
  });
}
