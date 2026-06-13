import { NextRequest, NextResponse } from "next/server";
import { FRONTEND_ORIGIN } from "@/lib/platform-config";

const ALLOWED_ORIGINS = new Set([
  FRONTEND_ORIGIN,
  "https://flixtv.it",
  "http://localhost:3000"
]);

export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : FRONTEND_ORIGIN;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin"
  };
}

export function corsJson<TBody>(
  request: NextRequest,
  body: TBody,
  init?: ResponseInit
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...getCorsHeaders(request),
      ...init?.headers
    }
  });
}

export function corsOptions(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}
