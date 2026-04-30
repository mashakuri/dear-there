"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type MapCanvasProps = {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
};

export default function MapCanvas({
  className = "",
  initialCenter = [-98.5795, 39.8283],
  initialZoom = 3.5,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
    });

    map.on("load", () => {
      const style = map.getStyle();
      if (!style?.layers) return;

      for (const layer of style.layers) {
        const id = layer.id.toLowerCase();
        const layerType = layer.type;

        // Keep the map flat and paper-like.
        if (layerType === "fill-extrusion") {
          map.setLayoutProperty(layer.id, "visibility", "none");
          continue;
        }

        // Aged paper land tone.
        if (id.includes("land") && layerType === "fill") {
          map.setPaintProperty(layer.id, "fill-color", "#ede8dc");
        }

        // Dusty blue-gray water.
        if (
          (id.includes("water") || id.includes("ocean") || id.includes("river")) &&
          layerType === "fill"
        ) {
          map.setPaintProperty(layer.id, "fill-color", "#9ca8b5");
          map.setPaintProperty(layer.id, "fill-opacity", 0.72);
        }

        // Thin, dark navy roads.
        if (
          (id.includes("road") || id.includes("street") || id.includes("path")) &&
          layerType === "line"
        ) {
          map.setPaintProperty(layer.id, "line-color", "#2d2d4e");
          map.setPaintProperty(layer.id, "line-width", [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            0.35,
            10,
            0.7,
            15,
            1.1,
          ]);
          map.setPaintProperty(layer.id, "line-opacity", 0.55);
        }

        // Minimal labels for a hand-drawn atlas feel.
        if (layerType === "symbol") {
          const keepLabel = id.includes("country") || id.includes("state");
          if (!keepLabel) {
            map.setLayoutProperty(layer.id, "visibility", "none");
            continue;
          }

          if ("text-color" in (layer.paint ?? {})) {
            map.setPaintProperty(layer.id, "text-color", "#2d2d4e");
            map.setPaintProperty(layer.id, "text-opacity", 0.72);
          }
          if ("text-halo-color" in (layer.paint ?? {})) {
            map.setPaintProperty(layer.id, "text-halo-color", "#ede8dc");
            map.setPaintProperty(layer.id, "text-halo-width", 0.5);
          }
        }
      }
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter, initialZoom]);

  return (
    <div
      ref={containerRef}
      className={`min-h-[420px] w-full rounded-lg shadow-[0_12px_40px_-12px_rgba(62,58,52,0.35)] ring-1 ring-ink/10 ${className}`}
      role="presentation"
    />
  );
}
