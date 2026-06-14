"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload
} from "lucide-react";
import {
  getDefaultHomepageSlides,
  normalizeHomepageSlides,
  type HomepageSlideInput,
  type HomepageSlideRecord
} from "@/lib/homepage-slides";
import { buildBackendUrl } from "@/lib/platform-config";

type SaveStatus = "loading" | "idle" | "saving" | "saved" | "error";

type HomepageResponse = {
  slides?: HomepageSlideRecord[];
  error?: string;
};

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSlide(): HomepageSlideInput {
  return {
    id: createTempId(),
    title: "Nuova slide",
    subtitle: "FlixTV",
    notes: "",
    imageUrl: "",
    linkUrl: "#web-live",
    linkLabel: "Guarda",
    imageEffectMs: 6000,
    textEffectMs: 1500,
    sortOrder: 0,
    isActive: true
  };
}

function toInputSlides(slides: HomepageSlideRecord[]): HomepageSlideInput[] {
  return slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    notes: slide.notes,
    imageUrl: slide.imageUrl,
    linkUrl: slide.linkUrl,
    linkLabel: slide.linkLabel,
    imageEffectMs: slide.imageEffectMs,
    textEffectMs: slide.textEffectMs,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive
  }));
}

function reorderSlides(
  slides: HomepageSlideInput[],
  fromIndex: number,
  toIndex: number
) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= slides.length ||
    toIndex >= slides.length
  ) {
    return slides;
  }

  const nextSlides = [...slides];
  const [slide] = nextSlides.splice(fromIndex, 1);

  if (!slide) {
    return slides;
  }

  nextSlides.splice(toIndex, 0, slide);
  return nextSlides;
}

function getPreviewImageUrl(imageUrl: string, version: number) {
  const cleanImageUrl = imageUrl.trim();

  if (!cleanImageUrl) {
    return "";
  }

  const absoluteUrl = cleanImageUrl.startsWith("http")
    ? cleanImageUrl
    : buildBackendUrl(cleanImageUrl);
  const separator = absoluteUrl.includes("?") ? "&" : "?";

  return `${absoluteUrl}${separator}v=${version}`;
}

export default function HomepageCarouselEditor() {
  const [slides, setSlides] = useState<HomepageSlideInput[]>(() =>
    toInputSlides(getDefaultHomepageSlides())
  );
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("Caricamento carousel homepage.");
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [previewVersion, setPreviewVersion] = useState(Date.now());
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(
    () => new Set()
  );

  const activeSlides = useMemo(
    () => slides.filter((slide) => slide.isActive && slide.imageUrl.trim()),
    [slides]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadSlides() {
      try {
        const response = await fetch(buildBackendUrl("/api/homepage?scope=admin"), {
          credentials: "include",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Impossibile caricare il carousel.");
        }

        const data = (await response.json()) as HomepageResponse;

        if (Array.isArray(data.slides)) {
          setSlides(toInputSlides(data.slides));
        }

        setStatus("idle");
        setMessage("Carousel caricato. Le modifiche restano in bozza fino al salvataggio.");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setSlides(toInputSlides(getDefaultHomepageSlides()));
        setStatus("error");
        setMessage("Uso le slide predefinite: verifica database e API homepage.");
      }
    }

    void loadSlides();

    return () => controller.abort();
  }, []);

  function markDirty(nextSlides: HomepageSlideInput[]) {
    setSlides(nextSlides);
    setIsDirty(true);

    if (status !== "saving") {
      setStatus("idle");
      setMessage("Modifiche in bozza: premi Salva per aggiornare la homepage.");
    }
  }

  function updateSlide(index: number, patch: Partial<HomepageSlideInput>) {
    markDirty(
      slides.map((slide, slideIndex) =>
        slideIndex === index
          ? {
              ...slide,
              ...patch
            }
          : slide
      )
    );
  }

  function getSlidePreviewId(slide: HomepageSlideInput, index: number) {
    return slide.id ?? `slide-${index}`;
  }

  async function uploadImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    setUploadingIndex(index);
    setMessage("Caricamento immagine in corso.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(buildBackendUrl("/api/homepage/upload"), {
        method: "POST",
        credentials: "include",
        body: formData
      });

      const data = (await response.json()) as {
        imageUrl?: string;
        error?: string;
        outputType?: string;
        width?: number;
        height?: number;
        sizeBytes?: number;
      };

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || "Upload non riuscito.");
      }

      updateSlide(index, {
        imageUrl: data.imageUrl
      });
      setPreviewVersion(Date.now());
      setBrokenImageIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(getSlidePreviewId(slides[index] ?? createSlide(), index));
        return nextIds;
      });
      setMessage(
        `Immagine convertita in WEBP ${data.width ?? 1920}x${data.height ?? 1080}. Premi Salva per pubblicare la slide.`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload non riuscito.");
    } finally {
      setUploadingIndex(null);
      event.currentTarget.value = "";
    }
  }

  async function saveSlides() {
    const normalizedSlides = normalizeHomepageSlides(slides);

    if (normalizedSlides.length === 0) {
      setStatus("error");
      setMessage("Inserisci almeno una slide con titolo e immagine.");
      return;
    }

    setStatus("saving");
    setMessage("Salvataggio carousel in corso.");

    try {
      const response = await fetch(buildBackendUrl("/api/homepage"), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slides: normalizedSlides
        })
      });

      const data = (await response.json()) as HomepageResponse;

      if (!response.ok || !Array.isArray(data.slides)) {
        throw new Error(data.error || "Salvataggio non riuscito.");
      }

      setSlides(toInputSlides(data.slides));
      setStatus("saved");
      setIsDirty(false);
      setMessage("Carousel salvato e collegato alla homepage.");
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
            <h2 className="text-lg font-black text-white">Carousel homepage</h2>
            <p className="mt-1 text-sm text-white/55">{message}</p>
          </div>
          <button
            type="button"
            onClick={saveSlides}
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
          {slides.map((slide, index) => {
            const previewId = getSlidePreviewId(slide, index);
            const previewImageUrl = getPreviewImageUrl(slide.imageUrl, previewVersion);

            return (
            <article
              key={slide.id ?? index}
              className="grid gap-4 rounded-md border border-white/10 bg-black/35 p-4 lg:grid-cols-[260px_minmax(0,1fr)]"
            >
              <div className="space-y-3">
                <div className="aspect-video overflow-hidden rounded-md border border-white/10 bg-black">
                  {previewImageUrl && !brokenImageIds.has(previewId) ? (
                    <img
                      src={previewImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() =>
                        setBrokenImageIds((currentIds) => {
                          const nextIds = new Set(currentIds);
                          nextIds.add(previewId);
                          return nextIds;
                        })
                      }
                    />
                  ) : (
                    <div className="grid h-full place-items-center p-4 text-center text-white/35">
                      <div>
                        <ImagePlus size={34} className="mx-auto" />
                        {slide.imageUrl ? (
                          <p className="mt-3 text-xs leading-5 text-red-100/75">
                            File convertito ma non raggiungibile via web.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
                <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-white/75 transition hover:bg-white/10 hover:text-white">
                  {uploadingIndex === index ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Carica file
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => uploadImage(index, event)}
                    className="sr-only"
                  />
                </label>
                <p className="text-xs leading-5 text-white/45">
                  Conversione automatica: WEBP 1920x1080, formato 16:9.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Titolo
                    </span>
                    <input
                      value={slide.title}
                      onChange={(event) =>
                        updateSlide(index, {
                          title: event.currentTarget.value
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Sottotitolo
                    </span>
                    <input
                      value={slide.subtitle ?? ""}
                      onChange={(event) =>
                        updateSlide(index, {
                          subtitle: event.currentTarget.value
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    Note
                  </span>
                  <textarea
                    value={slide.notes ?? ""}
                    onChange={(event) =>
                      updateSlide(index, {
                        notes: event.currentTarget.value
                      })
                    }
                    rows={3}
                    className="w-full resize-y rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold leading-6 text-white outline-none"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Link
                    </span>
                    <input
                      value={slide.linkUrl ?? ""}
                      onChange={(event) =>
                        updateSlide(index, {
                          linkUrl: event.currentTarget.value
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Testo pulsante
                    </span>
                    <input
                      value={slide.linkLabel ?? ""}
                      onChange={(event) =>
                        updateSlide(index, {
                          linkLabel: event.currentTarget.value
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Effetto immagine ms
                    </span>
                    <input
                      type="number"
                      min={1000}
                      step={100}
                      value={slide.imageEffectMs}
                      onChange={(event) =>
                        updateSlide(index, {
                          imageEffectMs: Number(event.currentTarget.value)
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                      Text reveal ms
                    </span>
                    <input
                      type="number"
                      min={300}
                      step={100}
                      value={slide.textEffectMs}
                      onChange={(event) =>
                        updateSlide(index, {
                          textEffectMs: Number(event.currentTarget.value)
                        })
                      }
                      className="h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </label>
                  <label className="flex h-full items-end gap-2 pb-2 text-sm font-bold text-white/65">
                    <input
                      type="checkbox"
                      checked={slide.isActive}
                      onChange={(event) =>
                        updateSlide(index, {
                          isActive: event.currentTarget.checked
                        })
                      }
                      className="h-4 w-4 accent-white"
                    />
                    Attiva
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => markDirty(reorderSlides(slides, index, index - 1))}
                    disabled={index === 0}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowUp size={15} />
                    Su
                  </button>
                  <button
                    type="button"
                    onClick={() => markDirty(reorderSlides(slides, index, index + 1))}
                    disabled={index === slides.length - 1}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowDown size={15} />
                    Giu
                  </button>
                  <button
                    type="button"
                    onClick={() => markDirty(slides.filter((_, slideIndex) => slideIndex !== index))}
                    className="ml-auto inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-black uppercase tracking-[0.1em] text-red-100 transition hover:bg-red-500/15"
                  >
                    <Trash2 size={15} />
                    Cancella
                  </button>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
          <button
            type="button"
            onClick={() => markDirty([...slides, createSlide()])}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
          >
            <Plus size={18} />
            Aggiungi immagine
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-canvas-900 p-5 shadow-rail">
          <h2 className="text-lg font-black text-white">Stato carousel</h2>
          <div className="mt-4 space-y-2 text-sm leading-6 text-white/65">
            <p>Immagini totali: {slides.length}</p>
            <p>Immagini attive: {activeSlides.length}</p>
            <p>{isDirty ? "Ci sono modifiche non salvate." : "Homepage allineata all'ultimo salvataggio."}</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
