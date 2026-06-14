import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "homepage");
const PUBLIC_UPLOAD_PATH = "/uploads/homepage";
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
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

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return corsJson(
      request,
      {
        error: "Image file is required"
      },
      {
        status: 400
      }
    );
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    return corsJson(
      request,
      {
        error: "Only JPG, PNG, WEBP and GIF images are supported"
      },
      {
        status: 400
      }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return corsJson(
      request,
      {
        error: "Image exceeds 8 MB"
      },
      {
        status: 413
      }
    );
  }

  const fileBytes = Buffer.from(await file.arrayBuffer());
  const baseName = cleanFileName(file.name) || "homepage-slide";
  const storedFileName = `${Date.now()}-${baseName}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, storedFileName);

  await mkdir(UPLOAD_DIR, {
    recursive: true
  });
  await writeFile(filePath, fileBytes);

  return corsJson(request, {
    imageUrl: `${PUBLIC_UPLOAD_PATH}/${storedFileName}`,
    fileName: storedFileName
  });
}
