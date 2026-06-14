import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_PATH_SEGMENTS = ["uploads", "homepage"];
const MIME_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

type RouteContext = {
  params: Promise<{
    fileName: string;
  }>;
};

function isSafeFileName(fileName: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(gif|jpe?g|png|webp)$/i.test(fileName);
}

async function getUploadDirs() {
  const candidates = [];
  const monorepoWebPackage = path.join(process.cwd(), "apps", "web", "package.json");

  try {
    await access(monorepoWebPackage);
    candidates.push(
      path.join(process.cwd(), "apps", "web", "public", ...UPLOAD_PATH_SEGMENTS)
    );
  } catch {
    candidates.push(path.join(process.cwd(), "public", ...UPLOAD_PATH_SEGMENTS));
  }

  candidates.push(
    path.join(process.cwd(), "public", ...UPLOAD_PATH_SEGMENTS),
    path.join(process.cwd(), "apps", "web", "public", ...UPLOAD_PATH_SEGMENTS)
  );

  return [...new Set(candidates)];
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { fileName } = await context.params;

  if (!isSafeFileName(fileName)) {
    return NextResponse.json(
      {
        error: "Invalid file name"
      },
      {
        status: 400
      }
    );
  }

  for (const uploadDir of await getUploadDirs()) {
    const filePath = path.join(uploadDir, fileName);

    try {
      const fileStats = await stat(filePath);

      if (!fileStats.isFile()) {
        continue;
      }

      const file = await readFile(filePath);
      const extension = path.extname(fileName).toLowerCase();

      return new NextResponse(file, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": String(file.byteLength),
          "Content-Type": MIME_TYPES[extension] ?? "application/octet-stream"
        }
      });
    } catch {
      // Try the next possible upload directory.
    }
  }

  return NextResponse.json(
    {
      error: "File not found"
    },
    {
      status: 404
    }
  );
}
