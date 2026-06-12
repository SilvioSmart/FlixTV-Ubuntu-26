"use client";

import { CalendarClock } from "lucide-react";

export type EpgProgram = {
  id: string;
  channelId: string;
  title: string;
  description?: string | null;
  startTime: string | Date;
  endTime: string | Date;
};

type EpgGridProps = {
  programs?: EpgProgram[];
  isLoading?: boolean;
  now?: Date;
  channelName?: string;
  emptyMessage?: string;
  className?: string;
};

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function formatProgramTime(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function getProgramProgress(startTime: Date, endTime: Date, now: Date) {
  const startsAt = startTime.getTime();
  const endsAt = endTime.getTime();
  const currentTime = now.getTime();
  const duration = endsAt - startsAt;

  if (duration <= 0 || currentTime < startsAt || currentTime > endsAt) {
    return 0;
  }

  return Math.min(Math.max(((currentTime - startsAt) / duration) * 100, 0), 100);
}

function isProgramLive(startTime: Date, endTime: Date, now: Date) {
  return startTime.getTime() <= now.getTime() && endTime.getTime() >= now.getTime();
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-36 min-w-[240px] animate-pulse rounded-md border border-white/10 bg-white/[0.06] sm:min-w-[300px]"
        />
      ))}
    </div>
  );
}

export default function EpgGrid({
  programs = [],
  isLoading = false,
  now = new Date(),
  channelName,
  emptyMessage = "No upcoming programs available for this channel.",
  className = ""
}: EpgGridProps) {
  const sortedPrograms = [...programs].sort(
    (firstProgram, secondProgram) =>
      toDate(firstProgram.startTime).getTime() - toDate(secondProgram.startTime).getTime()
  );

  return (
    <section
      aria-label={channelName ? `${channelName} TV guide` : "TV guide"}
      className={`rounded-lg border border-white/10 bg-canvas-900 p-4 shadow-rail sm:p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white sm:text-xl">
            TV Guide{channelName ? `: ${channelName}` : ""}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Live timeline and upcoming programs
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55 sm:flex">
          <CalendarClock size={16} />
          EPG
        </div>
      </div>

      {isLoading ? <LoadingSkeleton /> : null}

      {!isLoading && sortedPrograms.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center rounded-md border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center">
          <p className="max-w-md text-sm font-medium text-white/55">{emptyMessage}</p>
        </div>
      ) : null}

      {!isLoading && sortedPrograms.length > 0 ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {sortedPrograms.map((program) => {
              const startTime = toDate(program.startTime);
              const endTime = toDate(program.endTime);
              const isLive = isProgramLive(startTime, endTime, now);
              const progress = getProgramProgress(startTime, endTime, now);

              return (
                <article
                  key={program.id}
                  className="relative flex min-h-40 w-[260px] shrink-0 flex-col justify-between overflow-hidden rounded-md border bg-white/[0.05] p-4 transition duration-200 ease-stream-out hover:-translate-y-0.5 hover:bg-white/[0.08] sm:w-[320px]"
                  style={{
                    borderColor: isLive ? "var(--stream-theme, #e50914)" : "rgba(255,255,255,0.1)"
                  }}
                >
                  {isLive ? (
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1"
                      style={{
                        backgroundColor: "var(--stream-theme, #e50914)"
                      }}
                    />
                  ) : null}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <time className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                        {formatProgramTime(startTime)} - {formatProgramTime(endTime)}
                      </time>
                      {isLive ? (
                        <span
                          className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black"
                          style={{
                            backgroundColor: "var(--stream-accent, #ff6b6b)"
                          }}
                        >
                          On air
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-white">
                        {program.title}
                      </h3>
                      {program.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/55">
                          {program.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/45">
                      <span>{isLive ? "Progress" : "Scheduled"}</span>
                      {isLive ? <span>{Math.round(progress)}%</span> : null}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-stream-out"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: "var(--stream-theme, #e50914)"
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
