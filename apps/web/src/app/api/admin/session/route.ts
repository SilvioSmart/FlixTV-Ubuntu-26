import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  return corsJson(request, {
    authenticated: cookieValue === getAdminToken()
  });
}
