import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  const response = corsJson(request, {
    ok: true
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/"
  });

  return response;
}
