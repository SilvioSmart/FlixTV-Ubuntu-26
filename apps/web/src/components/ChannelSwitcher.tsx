"use client";

import { useEffect, useMemo, useState } from "react";

export type NetworkId = "nove" | "real-time" | "dmax";

export type NetworkOption = {
  id: NetworkId;
  label: string;
  description: string;
  themeColor: string;
  accentColor: string;
};

type ChannelSwitcherProps = {
  activeNetwork?: NetworkId;
  onNetworkChange?: (network: NetworkOption) => void;
  className?: string;
};

export const NETWORK_OPTIONS: NetworkOption[] = [
  {
    id: "nove",
    label: "Nove",
    description: "Entertainment and prime time",
    themeColor: "#e50914",
    accentColor: "#ff6b6b"
  },
  {
    id: "real-time",
    label: "Real Time",
    description: "Lifestyle, stories, and factual",
    themeColor: "#e4519a",
    accentColor: "#f8a5c8"
  },
  {
    id: "dmax",
    label: "DMAX",
    description: "Motors, discovery, and action",
    themeColor: "#f6b445",
    accentColor: "#ffe08a"
  }
];

const DEFAULT_NETWORK = NETWORK_OPTIONS[0] as NetworkOption;

export default function ChannelSwitcher({
  activeNetwork = "nove",
  onNetworkChange,
  className = ""
}: ChannelSwitcherProps) {
  const [selectedNetworkId, setSelectedNetworkId] = useState<NetworkId>(activeNetwork);

  const selectedNetwork = useMemo(
    () =>
      NETWORK_OPTIONS.find((network) => network.id === selectedNetworkId) ??
      DEFAULT_NETWORK,
    [selectedNetworkId]
  );

  useEffect(() => {
    setSelectedNetworkId(activeNetwork);
  }, [activeNetwork]);

  useEffect(() => {
    document.documentElement.dataset.streamNetwork = selectedNetwork.id;
    document.documentElement.style.setProperty("--stream-theme", selectedNetwork.themeColor);
    document.documentElement.style.setProperty("--stream-accent", selectedNetwork.accentColor);
    onNetworkChange?.(selectedNetwork);
  }, [onNetworkChange, selectedNetwork]);

  return (
    <nav
      aria-label="Network channels"
      className={`sticky top-0 z-header border-b border-white/10 bg-canvas-950/90 backdrop-blur-xl ${className}`}
    >
      <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="hidden min-w-0 pr-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50 sm:block">
          Network
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto">
          {NETWORK_OPTIONS.map((network) => {
            const isActive = network.id === selectedNetwork.id;

            return (
              <button
                key={network.id}
                type="button"
                onClick={() => setSelectedNetworkId(network.id)}
                aria-pressed={isActive}
                className="group relative flex min-w-[136px] shrink-0 flex-col items-start rounded-md border px-4 py-3 text-left transition duration-200 ease-stream-out hover:-translate-y-0.5 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/60 sm:min-w-[168px]"
                style={{
                  borderColor: isActive ? network.themeColor : "rgba(255,255,255,0.12)",
                  backgroundColor: isActive ? `${network.themeColor}22` : "rgba(255,255,255,0.04)"
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 top-2 h-0.5 rounded-full opacity-0 transition-opacity group-hover:opacity-60"
                  style={{
                    backgroundColor: network.themeColor,
                    opacity: isActive ? 1 : undefined
                  }}
                />
                <span className="text-base font-black uppercase leading-none text-white sm:text-lg">
                  {network.label}
                </span>
                <span className="mt-1 max-w-full truncate text-xs font-medium text-white/55">
                  {network.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
