import { NextRequest, NextResponse } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";
const DEFAULT_ADMIN_PASSWORD = "change-me-now";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type LoginRequestBody = {
  password?: unknown;
};

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
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

  if (typeof body.password !== "string" || body.password !== getAdminPassword()) {
    return corsJson(
      request,
      {
        error: "Credenziali non valide"
      },
      {
        status: 401
      }
    );
  }

  const response = corsJson(request, {
    ok: true
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: getAdminToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/"
  });

  return response;
}
