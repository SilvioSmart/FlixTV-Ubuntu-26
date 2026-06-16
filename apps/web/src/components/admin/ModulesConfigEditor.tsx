"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import {
  Check,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import {
  getDefaultModuleConfigs,
  MODULE_CATEGORY_OPTIONS,
  normalizeModuleConfigs,
  slugifyModuleTitle,
  type ModuleConfigInput,
  type ModuleConfigRecord,
  type ModuleMediaOrderBy
} from "@/lib/modules-config";
import { buildBackendUrl } from "@/lib/platform-config";

type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

type ModulesResponse = {
  modules?: ModuleConfigRecord[];
  error?: string;
};

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createModule(): ModuleConfigInput {
  return {
    id: createTempId(),
    slug: `modulo-${Date.now()}`,
    title: "Nuovo modulo",
    subtitle: "Selezione contenuti",
    buttonLabel: "Guarda tutto",
    buttonUrl: "#",
    mediaQuery: {
      limit: 12,
      orderBy: "newest"
    },
    sortOrder: 0,
    isActive: true
  };
}

function toInputModules(modules: ModuleConfigRecord[]): ModuleConfigInput[] {
  return modules.map((module) => ({
    id: module.id,
    slug: module.slug,
    title: module.title,
    subtitle: module.subtitle,
    buttonLabel: module.buttonLabel,
    buttonUrl: module.buttonUrl,
    mediaQuery: module.mediaQuery,
    sortOrder: module.sortOrder,
    isActive: module.isActive
  }));
}

function reorderModules(
  modules: ModuleConfigInput[],
  fromIndex: number,
  toIndex: number
) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= modules.length ||
    toIndex >= modules.length
  ) {
    return modules;
  }

  const nextModules = [...modules];
  const [module] = nextModules.splice(fromIndex, 1);

  if (!module) {
    return modules;
  }

  nextModules.splice(toIndex, 0, module);
  return nextModules;
}

export default function ModulesConfigEditor() {
  const [modules, setModules] = useState<ModuleConfigInput[]>(() =>
    toInputModules(getDefaultModuleConfigs())
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento moduli homepage.");
  const [isDirty, setIsDirty] = useState(false);

  const activeModules = useMemo(
    () => modules.filter((module) => module.isActive),
    [modules]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadModules() {
      try {
        const response = await fetch(buildBackendUrl("/api/modules?scope=admin"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Impossibile caricare i moduli.");
        }

        const data = (await response.json()) as ModulesResponse;

        if (Array.isArray(data.modules)) {
          setModules(toInputModules(data.modules));
        }

        setStatus("idle");
        setMessage("Moduli caricati. Le modifiche restano in bozza fino al salvataggio.");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setModules(toInputModules(getDefaultModuleConfigs()));
        setStatus("error");
        setMessage("Uso i moduli predefiniti: verifica database e API moduli.");
      }
    }

    void loadModules();

    return () => controller.abort();
  }, []);

  function markDirty(nextModules: ModuleConfigInput[]) {
    setModules(nextModules);
    setIsDirty(true);

    if (status !== "saving") {
      setStatus("idle");
      setMessage("Modifiche in bozza: premi Salva per aggiornare il body.");
    }
  }

  function updateModule(index: number, patch: Partial<ModuleConfigInput>) {
    markDirty(
      modules.map((module, moduleIndex) =>
        moduleIndex === index
          ? {
              ...module,
              ...patch
            }
          : module
      )
    );
  }

  function updateQuery(
    index: number,
    patch: Partial<ModuleConfigInput["mediaQuery"]>
  ) {
    const module = modules[index];

    if (!module) {
      return;
    }

    updateModule(index, {
      mediaQuery: {
        ...module.mediaQuery,
        ...patch
      }
    });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null) {
      return;
    }

    markDirty(reorderModules(modules, dragIndex, targetIndex));
    setDragIndex(null);
  }

  async function saveModules() {
    const normalizedModules = normalizeModuleConfigs(modules);

    if (normalizedModules.length === 0) {
      setStatus("error");
      setMessage("Inserisci almeno un modulo con titolo valido.");
      return;
    }

    setStatus("saving");
    setMessage("Salvataggio moduli in corso.");

    try {
      const response = await fetch(buildBackendUrl("/api/modules"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          modules: normalizedModules
        })
      });

      const data = (await response.json()) as ModulesResponse;

      if (!response.ok || !Array.isArray(data.modules)) {
        throw new Error(data.error || "Salvataggio non riuscito.");
      }

      setModules(toInputModules(data.modules));
      setStatus("saved");
      setIsDirty(false);
      setMessage("Moduli salvati e collegati al body della homepage.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito.");
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg border border-white/10 bg-canvas-900 p-4 shadow-rail">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">Body moduli</h2>
            <p className="mt-1 text-sm text-white/55">{message}</p>
          </div>
          <button
            type="button"
            onClick={saveModules}
            disabled={!isDirty || status === "saving"}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/30"
          >
            {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salva
          </button>
        </div>

        {status === "loading" ? (
          <div className="grid min-h-48 place-items-center rounded-md border border-white/10 bg-black/30 text-white/55">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : null}

        <div className="space-y-4">
          {modules.map((module, index) => (
            <article
              key={module.id ?? module.slug}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="rounded-md border border-white/10 bg-black/35 p-4"
            >
              <div className="grid gap-3 lg:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_120px_44px]">
                <button
                  type="button"
                  aria-label="Trascina modulo"
                  className="grid h-10 w-7 cursor-grab place-items-center text-white/35 active:cursor-grabbing"
                >
                  <GripVertical size={18} />
                </button>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Titolo
                  </span>
                  <input
                    value={module.title}
                    onChange={(event) => {
                      const title = event.currentTarget.value;
                      updateModule(index, {
                        title,
                        slug: slugifyModuleTitle(title) || module.slug
                      });
                    }}
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Sottotitolo
                  </span>
                  <input
                    value={module.subtitle ?? ""}
                    onChange={(event) =>
                      updateModule(index, {
                        subtitle: event.currentTarget.value
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  />
                </label>

                <label className="flex h-full items-end gap-2 pb-2 text-sm font-bold text-white/65">
                  <input
                    type="checkbox"
                    checked={module.isActive}
                    onChange={(event) =>
                      updateModule(index, {
                        isActive: event.currentTarget.checked
                      })
                    }
                    className="h-4 w-4 accent-white"
                  />
                  Attivo
                </label>

                <button
                  type="button"
                  onClick={() => markDirty(modules.filter((_, moduleIndex) => moduleIndex !== index))}
                  aria-label="Cancella modulo"
                  className="mt-5 grid h-10 w-10 place-items-center rounded-md text-white/55 transition hover:bg-red-500/15 hover:text-red-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[180px_minmax(0,1fr)_120px_160px]">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Categoria media
                  </span>
                  <select
                    value={module.mediaQuery.category ?? ""}
                    onChange={(event) =>
                      updateQuery(index, {
                        category: event.currentTarget.value || undefined
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  >
                    <option value="">Tutte</option>
                    {MODULE_CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Ricerca titolo/note
                  </span>
                  <input
                    value={module.mediaQuery.search ?? ""}
                    onChange={(event) =>
                      updateQuery(index, {
                        search: event.currentTarget.value || undefined
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Quantita
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={module.mediaQuery.limit}
                    onChange={(event) =>
                      updateQuery(index, {
                        limit: Number(event.currentTarget.value)
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Ordina media
                  </span>
                  <select
                    value={module.mediaQuery.orderBy}
                    onChange={(event) =>
                      updateQuery(index, {
                        orderBy: event.currentTarget.value as ModuleMediaOrderBy
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  >
                    <option value="newest">Piu recenti</option>
                    <option value="oldest">Meno recenti</option>
                    <option value="title">Titolo A-Z</option>
                  </select>
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Testo pulsante modulo
                  </span>
                  <input
                    value={module.buttonLabel ?? ""}
                    onChange={(event) =>
                      updateModule(index, {
                        buttonLabel: event.currentTarget.value
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Link pulsante modulo
                  </span>
                  <input
                    value={module.buttonUrl ?? ""}
                    onChange={(event) =>
                      updateModule(index, {
                        buttonUrl: event.currentTarget.value
                      })
                    }
                    className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                  />
                </label>
              </div>

              <pre className="mt-3 overflow-x-auto rounded-md border border-white/10 bg-black/50 p-3 text-xs leading-5 text-white/50">
                {JSON.stringify(module.mediaQuery, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
          <button
            type="button"
            onClick={() => markDirty([...modules, createModule()])}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
          >
            <Plus size={18} />
            Aggiungi modulo
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
          <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-white">
            <Check size={17} />
            Stato moduli
          </div>
          <div className="space-y-2 text-sm leading-6 text-white/65">
            <p>Moduli totali: {modules.length}</p>
            <p>Moduli attivi: {activeModules.length}</p>
            <p>{isDirty ? "Ci sono modifiche non salvate." : "Homepage allineata all'ultimo salvataggio."}</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
