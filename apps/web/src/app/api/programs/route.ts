import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import {
  DEFAULT_PROGRAMS,
  normalizeProgram,
  type ProgramDetail
} from "@/lib/programs-config";
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

function serializeProgram(program: {
  id: string;
  categoria: string;
  programma: string;
  serie: string;
  stagione: string;
  numeroPuntate: number;
}): ProgramDetail {
  return {
    id: program.id,
    categoria: program.categoria,
    programma: program.programma,
    serie: program.serie,
    stagione: program.stagione,
    numeroPuntate: program.numeroPuntate
  };
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const programs = await prisma.programDetail.findMany({
      orderBy: [
        {
          categoria: "asc"
        },
        {
          programma: "asc"
        },
        {
          serie: "asc"
        },
        {
          stagione: "asc"
        }
      ]
    });

    return corsJson(request, {
      programs: programs.length > 0 ? programs.map(serializeProgram) : DEFAULT_PROGRAMS
    });
  } catch {
    return corsJson(request, {
      programs: DEFAULT_PROGRAMS
    });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const program = normalizeProgram(await request.json().catch(() => null));

  if (!program) {
    return corsJson(request, { error: "Program payload is invalid" }, { status: 400 });
  }

  const createdProgram = await prisma.programDetail.create({
    data: {
      categoria: program.categoria,
      programma: program.programma,
      serie: program.serie,
      stagione: program.stagione,
      numeroPuntate: program.numeroPuntate
    }
  });

  return corsJson(request, {
    program: serializeProgram(createdProgram)
  });
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const program = normalizeProgram(body);
  const id = body && typeof body === "object" && "id" in body
    ? (body as { id?: unknown }).id
    : undefined;

  if (!program || typeof id !== "string") {
    return corsJson(request, { error: "Program payload is invalid" }, { status: 400 });
  }

  const updatedProgram = await prisma.programDetail.update({
    where: {
      id
    },
    data: {
      categoria: program.categoria,
      programma: program.programma,
      serie: program.serie,
      stagione: program.stagione,
      numeroPuntate: program.numeroPuntate
    }
  });

  return corsJson(request, {
    program: serializeProgram(updatedProgram)
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(request, { error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return corsJson(request, { error: "Program id is required" }, { status: 400 });
  }

  await prisma.programDetail.delete({
    where: {
      id
    }
  });

  return corsJson(request, {
    ok: true
  });
}
