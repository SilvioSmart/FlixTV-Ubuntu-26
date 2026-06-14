"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import type { VideoGalleryModuleConfig } from "@/lib/home-config";

type VideoGalleryModuleProps = {
  module: VideoGalleryModuleConfig;
};

export default function VideoGalleryModule({ module }: VideoGalleryModuleProps) {
  const initialVideo = useMemo(() => {
    return (
      module.items.find((item) => item.id === module.defaultVideoId) ??
      module.items[0]
    );
  }, [module.defaultVideoId, module.items]);

  const [selectedVideoId, setSelectedVideoId] = useState(initialVideo?.id);
  const selectedVideo =
    module.items.find((item) => item.id === selectedVideoId) ?? initialVideo;

  if (!selectedVideo) {
    return null;
  }

  return (
    <section
      id={module.id}
      className="scroll-mt-28 rounded-lg border border-white/10 bg-canvas-900 p-4 shadow-rail sm:p-5"
      aria-labelledby={`${module.id}-heading`}
    >
      <div className="reveal-from-left mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${module.id}-heading`} className="text-2xl font-black text-white sm:text-3xl">
            {module.title}
          </h2>
          {module.subtitle ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
              {module.subtitle}
            </p>
          ) : null}
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
          Modulo video
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <VideoPlayer
          key={`${module.id}-${selectedVideo.id}`}
          src={selectedVideo.videoUrl}
          type="vod"
          title={selectedVideo.title}
          poster={selectedVideo.thumbnailUrl}
          videoId={selectedVideo.id}
          className="aspect-video"
        />

        <aside className="rounded-md border border-white/10 bg-black/25 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            In riproduzione
          </div>
          <h3 className="mt-2 text-xl font-black leading-tight text-white">
            {selectedVideo.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {selectedVideo.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em]">
            <span className="rounded bg-white px-2 py-1 text-black">{selectedVideo.category}</span>
            <span className="rounded border border-white/10 px-2 py-1 text-white/55">
              {selectedVideo.duration}
            </span>
          </div>
        </aside>
      </div>

      <div className="mt-4 snap-x overflow-x-auto scroll-smooth pb-2">
        <div className="flex min-w-max gap-3">
          {module.items.map((item) => {
            const isSelected = item.id === selectedVideo.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedVideoId(item.id)}
                className="group w-[210px] shrink-0 snap-start overflow-hidden rounded-md border bg-white/[0.05] text-left transition duration-200 ease-stream-out hover:-translate-y-1 hover:bg-white/[0.08] sm:w-[260px]"
                style={{
                  borderColor: isSelected ? "var(--stream-theme)" : "rgba(255,255,255,0.1)"
                }}
              >
                <div className="relative aspect-video overflow-hidden bg-canvas-800">
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 ease-stream-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                    <Play size={14} fill="currentColor" />
                  </span>
                  <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-bold text-white">
                    {item.duration}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                    {item.category}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-white">
                    {item.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
