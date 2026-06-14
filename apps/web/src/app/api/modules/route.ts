import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { corsJson, corsOptions } from "@/lib/cors";
import { DEFAULT_HOME_CONFIG } from "@/lib/home-config";
import {
  buildVideoGalleryModule,
  getDefaultModuleConfigs,
  normalizeMediaQuery,
  normalizeModuleConfigs,
  type ModuleConfigRecord,
  type ModuleMediaQuery,
  videoContentToHomeVideoItem
} from "@/lib/modules-config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function serializeModule(module: {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  mediaQuery: Prisma.JsonValue;
  sortOrder: number;
  isActive: boolean;
}): ModuleConfigRecord {
  return {
    id: module.id,
    slug: module.slug,
    title: module.title,
    subtitle: module.subtitle ?? undefined,
    mediaQuery: normalizeMediaQuery(module.mediaQuery),
    sortOrder: module.sortOrder,
    isActive: module.isActive
  };
}

function buildVideoWhere(query: ModuleMediaQuery): Prisma.VideoContentWhereInput {
  const where: Prisma.VideoContentWhereInput = {};
  const conditions: Prisma.VideoContentWhereInput[] = [];

  if (query.category) {
    conditions.push({
      category: query.category as Prisma.EnumVideoCategoryFilter["equals"]
    });
  }

  if (query.search) {
    conditions.push({
      OR: [
        {
          title: {
            contains: query.search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      ]
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

function buildVideoOrderBy(query: ModuleMediaQuery): Prisma.VideoContentOrderByWithRelationInput {
  if (query.orderBy === "oldest") {
    return {
      releaseDate: "asc"
    };
  }

  if (query.orderBy === "title") {
    return {
      title: "asc"
    };
  }

  return {
    releaseDate: "desc"
  };
}

function getFallbackItemsForModule(module: ModuleConfigRecord) {
  const normalizedTitle = module.title.trim().toLowerCase();
  const fallbackModule =
    DEFAULT_HOME_CONFIG.modules.find((defaultModule) => defaultModule.id === module.slug) ??
    DEFAULT_HOME_CONFIG.modules.find(
      (defaultModule) => defaultModule.title.trim().toLowerCase() === normalizedTitle
    ) ??
    DEFAULT_HOME_CONFIG.modules[0];

  return fallbackModule?.items.slice(0, module.mediaQuery.limit) ?? [];
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const includeInactive = request.nextUrl.searchParams.get("scope") === "admin";

  try {
    const records = await prisma.moduleConfig.findMany({
      where: includeInactive
        ? undefined
        : {
            isActive: true
          },
      orderBy: [
        {
          sortOrder: "asc"
        },
        {
          createdAt: "asc"
        }
      ]
    });

    const moduleConfigs =
      records.length > 0 ? records.map(serializeModule) : getDefaultModuleConfigs();

    if (includeInactive) {
      return corsJson(request, {
        modules: moduleConfigs
      });
    }

    const modules = await Promise.all(
      moduleConfigs
        .filter((module) => module.isActive)
        .map(async (module) => {
          const videos = await prisma.videoContent.findMany({
            where: buildVideoWhere(module.mediaQuery),
            orderBy: buildVideoOrderBy(module.mediaQuery),
            take: module.mediaQuery.limit
          });
          const items = videos.length > 0
            ? videos.map(videoContentToHomeVideoItem)
            : getFallbackItemsForModule(module);

          return buildVideoGalleryModule(module, items);
        })
    );

    return corsJson(request, {
      modules
    });
  } catch {
    return corsJson(request, {
      modules: includeInactive ? getDefaultModuleConfigs() : DEFAULT_HOME_CONFIG.modules
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

  const rawModules =
    body && typeof body === "object" && "modules" in body
      ? (body as { modules: unknown }).modules
      : body;
  const modules = normalizeModuleConfigs(rawModules);

  if (modules.length === 0) {
    return corsJson(
      request,
      {
        error: "At least one valid module is required"
      },
      {
        status: 400
      }
    );
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.moduleConfig.deleteMany();

    for (const module of modules) {
      await transaction.moduleConfig.create({
        data: {
          slug: module.slug,
          title: module.title,
          subtitle: module.subtitle,
          mediaQuery: module.mediaQuery,
          sortOrder: module.sortOrder,
          isActive: module.isActive
        }
      });
    }
  });

  const savedModules = await prisma.moduleConfig.findMany({
    orderBy: [
      {
        sortOrder: "asc"
      },
      {
        createdAt: "asc"
      }
    ]
  });

  return corsJson(request, {
    modules: savedModules.map(serializeModule)
  });
}
