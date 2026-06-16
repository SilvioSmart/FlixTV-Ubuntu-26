import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { corsJson, corsOptions } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CAROUSEL_WIDTH = 1920;
const CAROUSEL_HEIGHT = 1080;
const WEBP_QUALITY = 82;
const UPLOAD_PATH_SEGMENTS = ["uploads", "homepage"];
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

async function getUploadDir() {
  const monorepoWebPackage = path.join(process.cwd(), "apps", "web", "package.json");

  try {
    await access(monorepoWebPackage);
    return path.join(process.cwd(), "apps", "web", "public", ...UPLOAD_PATH_SEGMENTS);
  } catch {
    return path.join(process.cwd(), "public", ...UPLOAD_PATH_SEGMENTS);
  }
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

  const sourceExtension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!sourceExtension) {
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

  const sourceBytes = Buffer.from(await file.arrayBuffer());
  const baseName = cleanFileName(file.name) || "homepage-slide";
  const storedFileName = `${Date.now()}-${baseName}.webp`;
  const uploadDir = await getUploadDir();
  const filePath = path.join(uploadDir, storedFileName);

  let convertedImage: Buffer;

  try {
    convertedImage = await sharp(sourceBytes, {
      animated: false,
      limitInputPixels: 32_000_000
    })
      .rotate()
      .resize(CAROUSEL_WIDTH, CAROUSEL_HEIGHT, {
        background: {
          alpha: 1,
          b: 0,
          g: 0,
          r: 0
        },
        fit: "contain",
        withoutEnlargement: false
      })
      .webp({
        quality: WEBP_QUALITY,
        effort: 5,
        smartSubsample: true
      })
      .toBuffer();
  } catch {
    return corsJson(
      request,
      {
        error: "Image conversion failed"
      },
      {
        status: 422
      }
    );
  }

  await mkdir(uploadDir, {
    recursive: true
  });
  await writeFile(filePath, convertedImage);

  const imageUrl = `${PUBLIC_UPLOAD_PATH}/${storedFileName}`;
  const previewUrl = new URL(imageUrl, request.nextUrl.origin).toString();

  return corsJson(request, {
    imageUrl,
    previewUrl,
    fileName: storedFileName,
    originalFileName: file.name,
    originalType: file.type,
    outputType: "image/webp",
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    sizeBytes: convertedImage.byteLength
  });
}
