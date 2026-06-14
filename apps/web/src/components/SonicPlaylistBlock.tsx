"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import type { VideoGalleryModuleConfig } from "@/lib/home-config";

type SonicPlaylistBlockProps = {
  module: VideoGalleryModuleConfig;
};

export default function SonicPlaylistBlock({ module }: SonicPlaylistBlockProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const initialVideo = useMemo(() => {
    return (
      module.items.find((item) => item.id === module.defaultVideoId) ??
      module.items[0]
    );
  }, [module.defaultVideoId, module.items]);

  const [selectedVideoId, setSelectedVideoId] = useState(initialVideo?.id);
  const selectedVideo =
    module.items.find((item) => item.id === selectedVideoId) ?? initialVideo;

  function scrollRail(direction: "previous" | "next") {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction === "next" ? rail.clientWidth * 0.82 : -rail.clientWidth * 0.82,
      behavior: "smooth"
    });
  }

  if (!selectedVideo) {
    return null;
  }

  return (
    <section
      id={module.id}
      className="sonicPlaylistBlock scroll-mt-28"
      aria-labelledby={`${module.id}-heading`}
    >
      <div className="sonicPlaylistBlock__inner">
        <div className="sonicPlaylistBlock__header">
          <div>
            <h2 id={`${module.id}-heading`} className="sonicPlaylistBlock__title">
              {module.title}
            </h2>
            {module.subtitle ? (
              <p className="sonicPlaylistBlock__subtitle">{module.subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="sonicPlaylistBlock__layout">
          <div className="sonicPlaylistBlock__player">
            <VideoPlayer
              key={`${module.id}-${selectedVideo.id}`}
              src={selectedVideo.videoUrl}
              type="vod"
              title={selectedVideo.title}
              poster={selectedVideo.thumbnailUrl}
              videoId={selectedVideo.id}
              className="sonicPlaylistBlock__video"
            />
            <div className="sonicPlaylistBlock__nowPlaying">
              <div className="sonicPlaylistBlock__kicker">{selectedVideo.category}</div>
              <h3>{selectedVideo.title}</h3>
              <p>{selectedVideo.description}</p>
            </div>
          </div>

          <div className="carousel carousel--sonicPlaylist sonicPlaylistBlock__carousel">
            <button
              type="button"
              aria-label="Video precedenti"
              className="sonicPlaylist-swiper-prev swiper-navigation"
              onClick={() => scrollRail("previous")}
            >
              <ChevronLeft size={30} />
            </button>

            <div ref={railRef} className="sonicPlaylistBlock__rail">
              {module.items.map((item) => {
                const isSelected = item.id === selectedVideo.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedVideoId(item.id)}
                    className={`sonicPlaylistBlock__card ${isSelected ? "sonicPlaylistBlock__card--active" : ""}`}
                  >
                    <span className="sonicPlaylistBlock__thumb">
                      <img src={item.thumbnailUrl} alt="" loading="lazy" />
                      <span className="sonicPlaylistBlock__play">
                        <Play size={16} fill="currentColor" />
                      </span>
                    </span>
                    <span className="sonicPlaylistBlock__meta">
                      <span className="sonicPlaylistBlock__cardCategory">{item.category}</span>
                      <span className="sonicPlaylistBlock__cardTitle">{item.title}</span>
                      <span className="sonicPlaylistBlock__duration">{item.duration}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-label="Video successivi"
              className="sonicPlaylist-swiper-next swiper-navigation"
              onClick={() => scrollRail("next")}
            >
              <ChevronRight size={30} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
