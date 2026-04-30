"use client";

import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="bg-mist/60 flex min-h-[420px] w-full items-center justify-center rounded-lg ring-1 ring-ink/10">
      <p className="text-ink/50 text-sm">Unfolding the map...</p>
    </div>
  ),
});

type MapSectionProps = {
  className?: string;
};

export function MapSection({ className }: MapSectionProps) {
  return <MapCanvas className={className} />;
}
