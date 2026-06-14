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
import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";
import {
  DEFAULT_HOME_MENU,
  normalizeMenuForSave,
  slugifyMenuLabel,
  type MenuNode,
  type MenuSaveItem
} from "@/lib/menu-config";
import { buildBackendUrl } from "@/lib/platform-config";

type DragState = {
  parentId: string | null;
  index: number;
};

type SaveStatus = "idle" | "loading" | "saving" | "saved" | "error";

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createMenuItem(label = "nuova voce"): MenuSaveItem {
  const slug = slugifyMenuLabel(label) || "nuova-voce";

  return {
    id: createTempId(),
    label,
    slug,
    href: `#${slug}`,
    sortOrder: 0,
    isActive: true,
    children: []
  };
}

function toSaveItems(items: MenuNode[]): MenuSaveItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    slug: item.slug,
    href: item.href,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    children: toSaveItems(item.children)
  }));
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (!movedItem) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export default function MenuConfigPage() {
  const [items, setItems] = useState<MenuSaveItem[]>(() =>
    toSaveItems(DEFAULT_HOME_MENU)
  );
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento menu homepage.");
  const [isDirty, setIsDirty] = useState(false);

  const activeItemsCount = useMemo(
    () => items.filter((item) => item.isActive).length,
    [items]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadMenu() {
      try {
        const response = await fetch(buildBackendUrl("/api/menu?scope=admin"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Menu non disponibile.");
        }

        const data = (await response.json()) as { menu?: MenuNode[] };

        if (Array.isArray(data.menu)) {
          setItems(toSaveItems(data.menu));
        }

        setStatus("idle");
        setMessage("Modifica il menu e premi Salva per pubblicarlo in homepage.");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setItems(toSaveItems(DEFAULT_HOME_MENU));
        setStatus("error");
        setMessage("Uso il menu predefinito: verifica connessione database e tabella menu.");
      }
    }

    void loadMenu();

    return () => controller.abort();
  }, []);

  function markDirty(nextItems: MenuSaveItem[]) {
    setItems(nextItems);
    setIsDirty(true);

    if (status !== "saving") {
      setStatus("idle");
      setMessage("Modifiche in bozza: premi Salva per applicarle alla homepage.");
    }
  }

  function updateItem(index: number, patch: Partial<MenuSaveItem>) {
    markDirty(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch
            }
          : item
      )
    );
  }

  function updateChild(
    parentIndex: number,
    childIndex: number,
    patch: Partial<MenuSaveItem>
  ) {
    markDirty(
      items.map((item, itemIndex) =>
        itemIndex === parentIndex
          ? {
              ...item,
              children: item.children.map((child, currentChildIndex) =>
                currentChildIndex === childIndex
                  ? {
                      ...child,
                      ...patch
                    }
                  : child
              )
            }
          : item
      )
    );
  }

  function addItem() {
    markDirty([...items, createMenuItem()]);
  }

  function addChild(parentIndex: number) {
    markDirty(
      items.map((item, itemIndex) =>
        itemIndex === parentIndex
          ? {
              ...item,
              children: [...item.children, createMenuItem("nuovo sottomenu")]
            }
          : item
      )
    );
  }

  function deleteItem(index: number) {
    markDirty(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function deleteChild(parentIndex: number, childIndex: number) {
    markDirty(
      items.map((item, itemIndex) =>
        itemIndex === parentIndex
          ? {
              ...item,
              children: item.children.filter(
                (_, currentChildIndex) => currentChildIndex !== childIndex
              )
            }
          : item
      )
    );
  }

  function handleDrop(targetParentId: string | null, targetIndex: number) {
    if (!dragState || dragState.parentId !== targetParentId) {
      setDragState(null);
      return;
    }

    if (targetParentId === null) {
      markDirty(reorderItems(items, dragState.index, targetIndex));
      setDragState(null);
      return;
    }

    markDirty(
      items.map((item) =>
        item.id === targetParentId
          ? {
              ...item,
              children: reorderItems(item.children, dragState.index, targetIndex)
            }
          : item
      )
    );
    setDragState(null);
  }

  async function saveMenu() {
    setStatus("saving");
    setMessage("Salvataggio del menu homepage in corso.");

    const menu = normalizeMenuForSave(items);

    try {
      const response = await fetch(buildBackendUrl("/api/menu"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          menu
        })
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio.");
      }

      const data = (await response.json()) as { menu?: MenuSaveItem[] };
      setItems(data.menu ?? menu);
      setIsDirty(false);
      setStatus("saved");
      setMessage("Menu salvato: la homepage usera questa sequenza.");
    } catch {
      setStatus("error");
      setMessage("Salvataggio non riuscito. Controlla login admin e database.");
    }
  }

  return (
    <AdminShell
      title="menu cfg"
      description="Crea le voci del menu, gestisci i sottomenu e definisci l'ordine con drag and drop."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminCard
          title="Menu homepage"
          description="Le modifiche restano in bozza finche non premi Salva."
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black/40 p-3">
            <div className="text-sm font-semibold text-white/70">{message}</div>
            <button
              type="button"
              onClick={saveMenu}
              disabled={!isDirty || status === "saving"}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/30"
            >
              {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salva
            </button>
          </div>

          <div className="space-y-3">
            {status === "loading" ? (
              <div className="grid min-h-44 place-items-center rounded-md border border-white/10 bg-black/30 text-white/55">
                <Loader2 size={28} className="animate-spin" />
              </div>
            ) : null}

            {items.map((item, index) => (
              <div
                key={item.id ?? item.slug}
                draggable
                onDragStart={() => setDragState({ parentId: null, index })}
                onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                onDrop={() => handleDrop(null, index)}
                className="rounded-md border border-white/10 bg-black/35 p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[28px_minmax(0,1fr)_minmax(180px,240px)_120px_44px]">
                  <button
                    type="button"
                    aria-label="Trascina voce menu"
                    className="grid h-10 w-7 cursor-grab place-items-center text-white/35 active:cursor-grabbing"
                  >
                    <GripVertical size={18} />
                  </button>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Voce menu
                    </span>
                    <input
                      value={item.label}
                      onChange={(event) => {
                        const label = event.currentTarget.value;
                        const slug = slugifyMenuLabel(label);
                        updateItem(index, {
                          label,
                          slug,
                          href: slug ? `#${slug}` : item.href
                        });
                      }}
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Link
                    </span>
                    <input
                      value={item.href ?? ""}
                      onChange={(event) =>
                        updateItem(index, {
                          href: event.currentTarget.value
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                  <label className="flex h-full items-end gap-2 pb-2 text-sm font-bold text-white/65">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(event) =>
                        updateItem(index, {
                          isActive: event.currentTarget.checked
                        })
                      }
                      className="h-4 w-4 accent-white"
                    />
                    Attiva
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteItem(index)}
                    aria-label="Cancella voce menu"
                    className="mt-5 grid h-10 w-10 place-items-center rounded-md text-white/55 transition hover:bg-red-500/15 hover:text-red-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
                      Sottomenu
                    </div>
                    <button
                      type="button"
                      onClick={() => addChild(index)}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      <Plus size={15} />
                      Aggiungi
                    </button>
                  </div>

                  <div className="space-y-2">
                    {item.children.length === 0 ? (
                      <div className="rounded-md border border-dashed border-white/10 px-3 py-3 text-sm text-white/35">
                        Nessun sottomenu.
                      </div>
                    ) : null}

                    {item.children.map((child, childIndex) => (
                      <div
                        key={child.id ?? child.slug}
                        draggable
                        onDragStart={() =>
                          setDragState({
                            parentId: item.id ?? item.slug,
                            index: childIndex
                          })
                        }
                        onDragOver={(event: DragEvent<HTMLDivElement>) =>
                          event.preventDefault()
                        }
                        onDrop={() => handleDrop(item.id ?? item.slug, childIndex)}
                        className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[24px_minmax(0,1fr)_minmax(180px,240px)_44px]"
                      >
                        <button
                          type="button"
                          aria-label="Trascina sottomenu"
                          className="grid h-10 w-6 cursor-grab place-items-center text-white/30 active:cursor-grabbing"
                        >
                          <GripVertical size={16} />
                        </button>
                        <input
                          value={child.label}
                          onChange={(event) => {
                            const label = event.currentTarget.value;
                            const slug = slugifyMenuLabel(label);
                            updateChild(index, childIndex, {
                              label,
                              slug,
                              href: slug ? `#${slug}` : child.href
                            });
                          }}
                          className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                        />
                        <input
                          value={child.href ?? ""}
                          onChange={(event) =>
                            updateChild(index, childIndex, {
                              href: event.currentTarget.value
                            })
                          }
                          className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => deleteChild(index, childIndex)}
                          aria-label="Cancella sottomenu"
                          className="grid h-10 w-10 place-items-center rounded-md text-white/55 transition hover:bg-red-500/15 hover:text-red-200"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard
          title="Azioni"
          description="Aggiungi voci e pubblica solo quando la sequenza e corretta."
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
            >
              <Plus size={18} />
              Aggiungi voce
            </button>

            <div className="rounded-md border border-white/10 bg-black/35 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-white">
                <Check size={17} />
                Stato menu
              </div>
              <div className="space-y-2 text-sm text-white/60">
                <p>Voci totali: {items.length}</p>
                <p>Voci attive: {activeItemsCount}</p>
                <p>Sottomenu: {items.reduce((total, item) => total + item.children.length, 0)}</p>
                <p>{isDirty ? "Ci sono modifiche non salvate." : "Homepage allineata all'ultimo salvataggio."}</p>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
