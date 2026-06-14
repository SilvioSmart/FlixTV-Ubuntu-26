import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import {
  DEFAULT_HOME_MENU,
  getMenuHref,
  normalizeMenuForSave,
  sortMenuNodes,
  type MenuNode,
  type MenuSaveItem
} from "@/lib/menu-config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const HOME_MENU_LOCATION = "homepage";

type FlatMenuRecord = {
  id: string;
  label: string;
  slug: string;
  href: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
};

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function buildMenuTree(records: FlatMenuRecord[], includeInactive: boolean) {
  const nodesById = new Map<string, MenuNode>();
  const roots: MenuNode[] = [];

  for (const record of records) {
    if (!includeInactive && !record.isActive) {
      continue;
    }

    nodesById.set(record.id, {
      id: record.id,
      label: record.label,
      slug: record.slug,
      href: getMenuHref(record.slug, record.href),
      sortOrder: record.sortOrder,
      isActive: record.isActive,
      children: []
    });
  }

  for (const record of records) {
    const node = nodesById.get(record.id);

    if (!node) {
      continue;
    }

    if (record.parentId) {
      const parent = nodesById.get(record.parentId);

      if (parent) {
        parent.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  for (const node of nodesById.values()) {
    node.children = sortMenuNodes(node.children);
  }

  return sortMenuNodes(roots);
}

async function createMenuItems(
  client: Pick<typeof prisma, "menuItem">,
  items: MenuSaveItem[],
  parentId: string | null = null
) {
  for (const item of items) {
    const createdItem = await client.menuItem.create({
      data: {
        label: item.label,
        slug: item.slug,
        href: item.href,
        parentId,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        location: HOME_MENU_LOCATION
      },
      select: {
        id: true
      }
    });

    await createMenuItems(client, item.children, createdItem.id);
  }
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const includeInactive = request.nextUrl.searchParams.get("scope") === "admin";

  try {
    const records = await prisma.menuItem.findMany({
      where: {
        location: HOME_MENU_LOCATION
      },
      orderBy: [
        {
          sortOrder: "asc"
        },
        {
          label: "asc"
        }
      ]
    });

    const menu = buildMenuTree(records, includeInactive);

    return corsJson(request, {
      menu: menu.length > 0 ? menu : DEFAULT_HOME_MENU
    });
  } catch {
    return corsJson(request, {
      menu: DEFAULT_HOME_MENU
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

  const rawItems =
    body && typeof body === "object" && "menu" in body
      ? (body as { menu: unknown }).menu
      : body;

  if (!Array.isArray(rawItems)) {
    return corsJson(
      request,
      {
        error: "Menu payload must be an array"
      },
      {
        status: 400
      }
    );
  }

  const menu = normalizeMenuForSave(rawItems as MenuSaveItem[]);

  await prisma.$transaction(async (transaction) => {
    await transaction.menuItem.deleteMany({
      where: {
        location: HOME_MENU_LOCATION
      }
    });

    await createMenuItems(transaction, menu);
  });

  return corsJson(request, {
    menu
  });
}
