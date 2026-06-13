export const FRONTEND_ORIGIN =
  process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ?? "https://www.flixtv.it";

export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "https://admin.flixtv.it";

export const VAST_SERVER_ORIGIN =
  process.env.NEXT_PUBLIC_VAST_SERVER_ORIGIN ?? "https://adsrv.org";

export function buildBackendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, BACKEND_ORIGIN).toString();
}

export function buildVastTagUrl(params: Record<string, string>) {
  const url = new URL("/vast", VAST_SERVER_ORIGIN);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}
