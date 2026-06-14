"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { FormEvent, useState } from "react";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { buildBackendUrl } from "@/lib/platform-config";

const ALLOWED_NEXT_ROUTES = new Set([
  "/admin",
  "/admin/menu-cfg",
  "/admin/homepage-cfg",
  "/admin/moduli-cfg",
  "/admin/media-load-conv",
  "/admin/live-epg-cfg"
]);

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(buildBackendUrl("/api/admin/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password
        })
      });

      if (!response.ok) {
        throw new Error("Password non valida");
      }

      const nextRoute = searchParams.get("next");
      const targetRoute = nextRoute && ALLOWED_NEXT_ROUTES.has(nextRoute)
        ? nextRoute
        : "/admin";

      router.replace(targetRoute as Route);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Errore di accesso");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-viewport place-items-center bg-canvas-950 px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-white/10 bg-canvas-900 p-6 shadow-player"
      >
        <div className="mb-6">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-white text-black">
            <Lock size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
            admin.flixtv.it
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">Accesso backoffice</h1>
        </div>

        <label htmlFor="admin-password" className="text-sm font-bold uppercase tracking-[0.12em] text-white/55">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/50 px-3 text-white outline-none transition focus:border-white/35"
          autoComplete="current-password"
        />

        {error ? (
          <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 h-12 w-full rounded-md bg-white text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Accesso..." : "Entra"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-viewport place-items-center bg-canvas-950 px-4 text-white">
          <div className="rounded-lg border border-white/10 bg-canvas-900 p-6 text-sm font-bold uppercase tracking-[0.14em] text-white/55">
            Caricamento login
          </div>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
