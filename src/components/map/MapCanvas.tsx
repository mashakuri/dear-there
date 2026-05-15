"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createClient } from "@/lib/supabase/client";

type Spot = {
  id: string;
  latitude: number;
  longitude: number;
  place_label: string | null;
  format: "postcard" | "letter" | null;
};

type MapCanvasProps = {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
};

export default function MapCanvas({
  className = "",
  initialCenter = [-98.5795, 39.8283],
  initialZoom = 4,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const spotsRef = useRef<Spot[]>([]);
  const pendingMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pendingPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [filter, setFilter] = useState<"all" | "postcard" | "letter">("all");
  const [mapReady, setMapReady] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchingRef = useRef(false);

  const addSpotMarkers = useCallback((map: mapboxgl.Map, spots: Spot[]) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      const el = document.createElement("div");
      el.className = "dear-there-pin";
      el.setAttribute("data-format", spot.format ?? "");
      el.innerHTML = `<div class="pin-dot"></div><div class="pin-stem"></div>`;

      const popup = new mapboxgl.Popup({
        offset: 28,
        closeButton: false,
        maxWidth: "220px",
        className: "dear-there-popup",
      }).setHTML(`
        <div class="popup-inner">
          <span class="popup-format">${spot.format ?? ""}</span>
          <p class="popup-place">${spot.place_label || "pinned memory"}</p>
          <a href="/spots/${spot.id}" class="popup-link">read →</a>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  const handleSearch = useCallback(async () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const query = searchRef.current?.value ?? "";
    const map = mapRef.current;
    if (!query.trim() || !map || !token) return;
    searchingRef.current = true;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
      );
      const data = await res.json();
      const feature = data.features?.[0];
      if (feature) {
        const [lng, lat] = feature.center;
        map.flyTo({ center: [lng, lat], zoom: 12, duration: 1500 });
      }
    } finally {
      searchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
    });

    mapRef.current = map;

    const supabase = createClient();

    map.on("load", async () => {
      const style = map.getStyle();
      if (!style?.layers) return;

      // Force background to soft green
      try { map.setPaintProperty("background", "background-color", "#d4e4d4"); } catch {}

      for (const layer of style.layers) {
        const id = layer.id.toLowerCase();
        const layerType = layer.type;

        if (layerType === "fill-extrusion") {
          map.setLayoutProperty(layer.id, "visibility", "none");
          continue;
        }

        // All land-type fills — soft green
        if (layerType === "fill") {
          const isWater = id.includes("water") || id.includes("ocean") || id.includes("river") || id.includes("lake") || id.includes("sea");
          const isBuilding = id.includes("building");
          if (isWater) {
            map.setPaintProperty(layer.id, "fill-color", "#c5d8e8");
            map.setPaintProperty(layer.id, "fill-opacity", 0.9);
          } else if (!isBuilding) {
            map.setPaintProperty(layer.id, "fill-color", "#d4e4d4");
          }
        }

        // Roads — light gray
        if ((id.includes("road") || id.includes("street") || id.includes("path") || id.includes("tunnel") || id.includes("bridge")) && layerType === "line") {
          map.setPaintProperty(layer.id, "line-color", "#b8c4cc");
          map.setPaintProperty(layer.id, "line-width", ["interpolate", ["linear"], ["zoom"], 5, 0.3, 10, 0.6, 15, 1.0]);
          map.setPaintProperty(layer.id, "line-opacity", 0.5);
        }

        // Admin borders
        if (id.includes("admin") && layerType === "line") {
          map.setPaintProperty(layer.id, "line-color", "#a8b8b8");
          map.setPaintProperty(layer.id, "line-opacity", 0.4);
        }

        // Labels
        if (layerType === "symbol") {
          const keepLabel = id.includes("country") || id.includes("state");
          if (!keepLabel) {
            map.setLayoutProperty(layer.id, "visibility", "none");
            continue;
          }
          if ("text-color" in (layer.paint ?? {})) {
            map.setPaintProperty(layer.id, "text-color", "#5a6472");
            map.setPaintProperty(layer.id, "text-opacity", 0.8);
          }
          if ("text-halo-color" in (layer.paint ?? {})) {
            map.setPaintProperty(layer.id, "text-halo-color", "#ffffff");
            map.setPaintProperty(layer.id, "text-halo-width", 0.5);
          }
        }
      }

      const { data: spots } = await supabase
        .from("spots")
        .select("id, latitude, longitude, place_label, format")
        .order("created_at", { ascending: false })
        .limit(200);

      spotsRef.current = (spots as Spot[]) ?? [];
      setMapReady(true);

      map.on("click", (e) => {
        const target = e.originalEvent.target as HTMLElement;
        if (target.closest(".dear-there-pin") || target.closest(".mapboxgl-popup")) return;

        pendingMarkerRef.current?.remove();
        pendingPopupRef.current?.remove();

        const { lng, lat } = e.lngLat;

        const el = document.createElement("div");
        el.className = "dear-there-pin pending";
        el.innerHTML = `<div class="pin-dot"></div><div class="pin-stem"></div>`;

        const popup = new mapboxgl.Popup({
          offset: 28,
          closeButton: true,
          maxWidth: "220px",
          className: "dear-there-popup",
        }).setHTML(`
          <div class="popup-inner">
            <p class="popup-place" style="margin-bottom:8px">pin a memory here?</p>
            <button onclick="window.__dearTherePin(${lat}, ${lng})" class="popup-pin-btn">
              mark this moment →
            </button>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        marker.togglePopup();
        pendingMarkerRef.current = marker;
        pendingPopupRef.current = popup;

        popup.on("close", () => {
          marker.remove();
          pendingMarkerRef.current = null;
          pendingPopupRef.current = null;
        });
      });

      (window as any).__dearTherePin = (lat: number, lng: number) => {
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,locality,neighborhood&access_token=${token}&limit=1`
        )
          .then((r) => r.json())
          .then((geo) => {
            const place = geo.features?.[0]?.place_name ?? "";
            const params = new URLSearchParams({
              lat: lat.toFixed(6),
              lng: lng.toFixed(6),
              ...(place && { place }),
            });
            window.location.href = `/spots/new?${params.toString()}`;
          })
          .catch(() => {
            window.location.href = `/spots/new?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`;
          });
      };

      map.on("mousemove", () => { map.getCanvas().style.cursor = "crosshair"; });
    });

    const channel = supabase
      .channel("spots-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "spots" },
        (payload) => {
          const newSpot = payload.new as Spot;
          if (newSpot.latitude && newSpot.longitude && mapRef.current) {
            spotsRef.current = [...spotsRef.current, newSpot];
            addSpotMarkers(mapRef.current, spotsRef.current);
          }
        }
      )
      .subscribe();

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), "bottom-right");

    return () => {
      channel.unsubscribe();
      map.remove();
      mapRef.current = null;
      delete (window as any).__dearTherePin;
    };
  }, [initialCenter, initialZoom, addSpotMarkers]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const filtered = filter === "all"
      ? spotsRef.current
      : spotsRef.current.filter((s) => s.format === filter);
    addSpotMarkers(mapRef.current, filtered);
  }, [filter, mapReady, addSpotMarkers]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="h-full w-full min-h-[420px] rounded-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
        role="presentation"
      />

      {/* Search */}
      <div className="absolute top-3 left-4 z-10">
        <div className="flex items-center gap-2 rounded-full bg-white/90 border border-black/8 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <input
            ref={searchRef}
            type="text"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
            placeholder="search a place..."
            className="bg-transparent text-[11px] text-gray-600 placeholder:text-gray-400 outline-none w-40"
          />
          <button onClick={handleSearch} className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
            →
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="absolute top-3 right-4 flex items-center gap-1 rounded-full bg-white/90 border border-black/8 px-2 py-1.5 shadow-sm backdrop-blur-sm z-10">
        {(["all", "postcard", "letter"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-all ${
              filter === f ? "bg-slate-600 text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      

      <style>{`
        .dear-there-pin { display:flex; flex-direction:column; align-items:center; cursor:pointer; transition:transform 0.15s ease; }
.dear-there-pin:hover { transform:translateY(-2px) scale(1.15); }
.pin-dot { width:12px; height:12px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); background:#2d3748; }
.dear-there-pin.pending .pin-dot { background:#9b8ea0; }
.pin-stem { width:2px; height:5px; background:#2d3748; }
.dear-there-pin.pending .pin-stem { background:#9b8ea0; }
.dear-there-popup .mapboxgl-popup-content { background:white; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px; padding:0; box-shadow:0 8px 24px rgba(0,0,0,0.1); }
.dear-there-popup .mapboxgl-popup-tip { border-top-color:white !important; }
.popup-inner { padding:12px 14px; display:flex; flex-direction:column; gap:3px; font-family:inherit; }
.popup-format { font-size:9px; text-transform:uppercase; letter-spacing:0.15em; color:rgba(0,0,0,0.35); font-weight:600; }
.popup-place { font-size:12px; font-weight:600; color:#1a202c; margin:0; }
.popup-link { font-size:11px; font-weight:600; color:#4a5568; text-decoration:none; align-self:flex-end; }
.popup-link:hover { text-decoration:underline; }
.popup-pin-btn { font-size:11px; font-weight:600; color:white; background:#4a5568; border:none; border-radius:99px; padding:5px 12px; cursor:pointer; width:100%; }
.popup-pin-btn:hover { background:#2d3748; }
      `}</style>
    </div>
  );
}