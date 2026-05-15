"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const PREVIEW_PHOTOS = [
  "/preview-photos/toast.jpg",
  "/preview-photos/lotus.jpg",
  "/preview-photos/window.jpg",
  "/preview-photos/cat.jpg",
  "/preview-photos/papers.jpg",
];

const STAMPS = Array.from({ length: 9 }, (_, i) => `/stamps/stamp-${i + 1}.jpg`);

type Sticker = {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type Props = {
  userId: string;
  initialLatitude: number;
  initialLongitude: number;
  initialPlaceLabel: string | null;
};

export function NewEntryForm({
  userId,
  initialLatitude,
  initialLongitude,
  initialPlaceLabel,
}: Props) {
  const [randomPhoto] = useState(() => PREVIEW_PHOTOS[Math.floor(Math.random() * PREVIEW_PHOTOS.length)]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [format, setFormat] = useState<"postcard" | "letter" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [placeLabel, setPlaceLabel] = useState(initialPlaceLabel ?? "");
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [file, setFile] = useState<File | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [envelopePhase, setEnvelopePhase] = useState<"idle" | "open" | "closing" | "sealed" | "fadeout">("idle");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Doodle
  const [doodleMode, setDoodleMode] = useState(false);
  const [doodleColor, setDoodleColor] = useState("#2d2d4e");
  const [doodleSize, setDoodleSize] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const doodleDataRef = useRef<string | null>(null);
  const hasDoodleRef = useRef(false);

  // Stickers
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const stickerFileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; stickerX: number; stickerY: number } | null>(null);

  // Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapPickerRef = useRef<mapboxgl.Map | null>(null);
  const pickerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pendingLat, setPendingLat] = useState<number | null>(null);
  const [pendingLng, setPendingLng] = useState<number | null>(null);
  const [pendingPlace, setPendingPlace] = useState("");

  // Restore canvas after any re-render
  useEffect(() => {
    if (step !== 2) return;
    const canvas = canvasRef.current;
    if (!canvas || !doodleDataRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = doodleDataRef.current;
  });

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!doodleMode) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(e);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!doodleMode || !isDrawingRef.current || !lastPosRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = doodleColor;
    ctx.lineWidth = doodleSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
    hasDoodleRef.current = true;
    doodleDataRef.current = canvas.toDataURL("image/png");
  }

  function endDraw() {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }

  function clearDoodle() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDoodleRef.current = false;
    doodleDataRef.current = null;
  }

  function handleStickerMouseDown(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedStickerId(id);
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    dragStart.current = { x: e.clientX, y: e.clientY, stickerX: sticker.x, stickerY: sticker.y };
    function onMove(e: MouseEvent) {
      if (!dragStart.current || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setStickers(prev => prev.map(s => s.id === id ? {
        ...s,
        x: Math.max(0, Math.min(100, dragStart.current!.stickerX + (dx / rect.width) * 100)),
        y: Math.max(0, Math.min(100, dragStart.current!.stickerY + (dy / rect.height) * 100)),
      } : s));
    }
    function onUp() {
      dragStart.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleStickerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setStickers(prev => [...prev, {
        id: Date.now().toString(),
        src, x: 40, y: 40, size: 80,
        rotation: Math.random() * 10 - 5,
      }]);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  useEffect(() => {
    if (!showLocationPicker || !mapContainerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [longitude, latitude],
      zoom: 10,
      attributionControl: false,
    });
    map.on("load", () => {
      const style = map.getStyle();
      if (style?.layers) {
        for (const layer of style.layers) {
          const id = layer.id.toLowerCase();
          const t = layer.type;
          if (t === "fill-extrusion") { map.setLayoutProperty(layer.id, "visibility", "none"); continue; }
          if (id.includes("land") && t === "fill") map.setPaintProperty(layer.id, "fill-color", "#ede8dc");
          if ((id.includes("water") || id.includes("ocean")) && t === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#9ca8b5");
            map.setPaintProperty(layer.id, "fill-opacity", 0.72);
          }
          if (t === "symbol") {
            const keep = id.includes("country") || id.includes("state") || id.includes("place") || id.includes("city");
            if (!keep) map.setLayoutProperty(layer.id, "visibility", "none");
          }
        }
      }
      if (placeLabel) {
        const el = document.createElement("div");
        el.className = "picker-pin";
        el.innerHTML = `<div class="pin-dot"></div><div class="pin-stem"></div>`;
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([longitude, latitude]).addTo(map);
        pickerMarkerRef.current = marker;
        setPendingLat(latitude);
        setPendingLng(longitude);
        setPendingPlace(placeLabel);
      }
      map.on("click", async (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        pickerMarkerRef.current?.remove();
        const el = document.createElement("div");
        el.className = "picker-pin";
        el.innerHTML = `<div class="pin-dot"></div><div class="pin-stem"></div>`;
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([clickLng, clickLat]).addTo(map);
        pickerMarkerRef.current = marker;
        setPendingLat(clickLat);
        setPendingLng(clickLng);
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${clickLng},${clickLat}.json?types=place,locality,neighborhood&access_token=${token}&limit=1`);
          const data = await res.json();
          setPendingPlace(data.features?.[0]?.place_name ?? "");
        } catch { setPendingPlace(""); }
      });
      map.on("mousemove", () => { map.getCanvas().style.cursor = "crosshair"; });
    });
    mapPickerRef.current = map;
    return () => { map.remove(); mapPickerRef.current = null; pickerMarkerRef.current = null; };
  }, [showLocationPicker]);

  const handlePickerSearch = useCallback(async () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const query = searchRef.current?.value ?? "";
    if (!query.trim() || !mapPickerRef.current || !token) return;
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`);
    const data = await res.json();
    const feature = data.features?.[0];
    if (feature) {
      const [lng, lat] = feature.center;
      mapPickerRef.current.flyTo({ center: [lng, lat], zoom: 12, duration: 1000 });
    }
  }, []);

  function confirmLocation() {
    if (pendingLat !== null && pendingLng !== null) {
      setLatitude(pendingLat);
      setLongitude(pendingLng);
      setPlaceLabel(pendingPlace);
    }
    setShowLocationPicker(false);
  }

  function playEnvelopeAnimation() {
    setShowEnvelope(true);
    setEnvelopePhase("open");
    setTimeout(() => setEnvelopePhase("closing"), 600);
    setTimeout(() => setEnvelopePhase("sealed"), 1200);
    setTimeout(() => setEnvelopePhase("fadeout"), 2000);
    setTimeout(() => { window.location.href = "/"; }, 2600);
  }

  async function handleSave() {
    if (!format) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      let imageUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("entry-photos").upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("entry-photos").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("spots")
        .insert({
          user_id: userId,
          latitude, longitude,
          place_label: placeLabel || null,
          format, title, body,
          is_private: isPrivate,
          image_url: imageUrl,
          stamp_url: selectedStamp,
          doodle_data: doodleDataRef.current,
          stickers: stickers.length > 0 ? stickers.map(s => ({
            src: s.src, x: s.x, y: s.y, size: s.size, rotation: s.rotation
          })) : null,
        });
      if (insertError) throw insertError;
      playEnvelopeAnimation();
    } catch (err: any) {
      setError(err.message ?? "something went wrong.");
      setSaving(false);
    }
  }

  return (
    <>
      {/* Envelope animation */}
      {showEnvelope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ede8dc]"
          style={{ opacity: envelopePhase === "fadeout" ? 0 : 1, transition: envelopePhase === "fadeout" ? "opacity 0.6s ease" : "opacity 0.3s ease" }}>
          <div className="flex flex-col items-center gap-6">
            <div style={{ width: 240, height: 210, position: "relative" }}>
              <svg viewBox="-20 -50 240 210" width="240" height="210" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="50" width="192" height="106" rx="4" fill="#f5f0e6" stroke="#2d2d4e" strokeWidth="1.5" strokeOpacity="0.3"/>
                <path d="M4 156 L100 100 L4 50" fill="#ede8dc" stroke="#2d2d4e" strokeWidth="0.75" strokeOpacity="0.2"/>
                <path d="M196 156 L100 100 L196 50" fill="#e8e3d8" stroke="#2d2d4e" strokeWidth="0.75" strokeOpacity="0.2"/>
                {selectedStamp && <image href={selectedStamp} x="152" y="56" width="36" height="44" preserveAspectRatio="xMidYMid meet"/>}
                <g style={{ transformOrigin: "100px 50px", transform: envelopePhase === "open" ? "rotateX(0deg)" : "rotateX(180deg)", transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <path d="M4 50 L100 105 L196 50 Z" fill="#f7f3e9" stroke="#2d2d4e" strokeWidth="1.5" strokeOpacity="0.3"/>
                </g>
                {(envelopePhase === "sealed" || envelopePhase === "fadeout") && (
                  <circle cx="100" cy="103" r="12" fill="#2d2d4e" opacity="0.85">
                    <animate attributeName="r" from="0" to="12" dur="0.3s" fill="freeze"/>
                    <animate attributeName="opacity" from="0" to="0.85" dur="0.3s" fill="freeze"/>
                  </circle>
                )}
                {(envelopePhase === "sealed" || envelopePhase === "fadeout") && (
                  <text x="100" y="107" textAnchor="middle" fontSize="10" fill="#ede8dc" fontFamily="serif">✦</text>
                )}
              </svg>
            </div>
            <p className="font-display text-xl text-[#2d2d4e]"
              style={{ opacity: envelopePhase === "sealed" || envelopePhase === "fadeout" ? 1 : 0, transition: "opacity 0.4s ease" }}>
              memory pinned ✦
            </p>
          </div>
        </div>
      )}

      {/* Location picker */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2d4e]/40 backdrop-blur-sm p-4">
          <div className="bg-[#f7f3e9] rounded-2xl border border-[#2d2d4e]/20 shadow-[0_16px_48px_rgba(45,45,78,0.25)] w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d4e]/10">
              <p className="font-display text-lg text-[#2d2d4e]">pick a location</p>
              <button onClick={() => setShowLocationPicker(false)} className="text-xs text-[#2d2d4e]/40 hover:text-[#2d2d4e]">✕</button>
            </div>
            <div className="px-5 py-3 border-b border-[#2d2d4e]/10 flex gap-2">
              <input ref={searchRef} type="text" placeholder="search a place..."
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handlePickerSearch(); } }}
                className="flex-1 bg-[#ede8dc]/60 rounded-full px-4 py-2 text-sm text-[#2d2d4e] outline-none placeholder:text-[#2d2d4e]/40" />
              <button onClick={handlePickerSearch} className="rounded-full bg-[#2d2d4e] px-4 py-2 text-xs font-semibold text-[#ede8dc]">search</button>
            </div>
            <div ref={mapContainerRef} className="w-full h-72" />
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#2d2d4e]/10">
              <p className="text-xs text-[#2d2d4e]/50 flex-1 truncate">{pendingPlace || "click the map to drop a pin"}</p>
              <button onClick={confirmLocation} disabled={pendingLat === null}
                className="rounded-full bg-[#2d2d4e] px-5 py-2 text-sm font-semibold text-[#ede8dc] disabled:opacity-40 ml-4">
                confirm location
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="relative flex flex-col gap-6">

        {/* progress */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2d2d4e]/20 bg-[#f6f2e9]/85 p-4">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#2d2d4e]/60">Step {step} of 3</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2d2d4e]/10">
            <div className="h-full bg-[#2d2d4e]/70 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        {/* step 1 */}
        {step === 1 && (
          <section className="mx-auto grid w-full max-w-4xl gap-6 sm:grid-cols-2 items-start">
            <button type="button" onClick={() => { setFormat("postcard"); setStep(2); }}
              className="group rounded-2xl border border-[#2d2d4e]/20 bg-[#f8f5ee] p-5 text-left shadow-[0_8px_24px_rgba(45,45,78,0.10)] transition hover:shadow-[0_12px_32px_rgba(45,45,78,0.18)] hover:border-[#2d2d4e]/40 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2d4e]/65 text-center w-full">Postcard</p>
              <div className="rounded-lg border border-[#2d2d4e]/15 overflow-hidden relative" style={{ aspectRatio: "8/5", filter: "sepia(30%) contrast(0.95) brightness(0.96) saturate(0.85)" }}>
                <img src={randomPhoto} alt="postcard front" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
              </div>
              <div className="rounded-lg border border-[#2d2d4e]/20 overflow-hidden p-2.5" style={{ aspectRatio: "8/5", background: "#f5f0e6" }}>
                <div className="h-full flex gap-2">
                  <div className="flex-1 flex flex-col justify-end gap-1.5 border-r border-[#2d2d4e]/15 pr-2">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-px bg-[#2d2d4e]/15 w-full" />)}
                  </div>
                  <div className="w-2/5 flex flex-col justify-between">
                    <div className="w-7 h-9 border border-[#2d2d4e]/25 rounded-sm self-end" style={{ background: "#e8e0cc" }} />
                    <div className="flex flex-col gap-1.5">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-px bg-[#2d2d4e]/15 w-full" />)}
                    </div>
                  </div>
                </div>
              </div>
            </button>

            <button type="button" onClick={() => { setFormat("letter"); setStep(2); }}
              className="group rounded-2xl border border-[#2d2d4e]/20 bg-[#f8f5ee] p-5 text-left shadow-[0_8px_24px_rgba(45,45,78,0.10)] transition hover:shadow-[0_12px_32px_rgba(45,45,78,0.18)] hover:border-[#2d2d4e]/40 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2d4e]/65 text-center w-full">Letter</p>
              <div className="rounded-xl border border-[#2d2d4e]/20 overflow-hidden px-5 py-6 flex flex-col gap-0" style={{ aspectRatio: "5/7", background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 24px, #d8d2c4 25px)" }}>
                <div className="w-16 h-px bg-[#2d2d4e]/20 mb-4 self-end" />
              </div>
            </button>
          </section>
        )}

        {/* step 2 */}
        {step === 2 && (
          <div className="mx-auto w-full max-w-3xl flex gap-3 items-start">
            <section
              className="flex-1 border border-[#2d2d4e]/20 bg-[#f7f3e9] shadow-[0_12px_35px_rgba(45,45,78,0.18)] overflow-hidden rounded-2xl relative"
              style={format === "letter" ? { background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 34px, #ddd6c8 35px)" } : {}}
            >
              {/* decoration overlay */}
              <div
                ref={cardRef}
                className="absolute inset-0 z-20"
                style={{ pointerEvents: doodleMode || stickers.length > 0 ? "auto" : "none" }}
                onClick={() => setSelectedStickerId(null)}
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full"
                  style={{ pointerEvents: doodleMode ? "auto" : "none", cursor: doodleMode ? "crosshair" : "default" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
                {stickers.map(sticker => (
                  <div key={sticker.id} className="absolute"
                    style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, width: sticker.size, height: sticker.size, transform: `rotate(${sticker.rotation}deg)`, cursor: "move", outline: selectedStickerId === sticker.id ? "2px dashed rgba(45,45,78,0.4)" : "none", borderRadius: 4 }}
                    onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}>
                    <img src={sticker.src} alt="sticker" className="w-full h-full object-contain" draggable={false} />
                    {selectedStickerId === sticker.id && (
                      <>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-[#2d2d4e]/40 rounded-full cursor-se-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startSize = sticker.size;
                            const startX = e.clientX;
                            function onMove(e: MouseEvent) {
                              setStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, size: Math.max(40, startSize + (e.clientX - startX)) } : s));
                            }
                            function onUp() { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }
                            window.addEventListener("mousemove", onMove);
                            window.addEventListener("mouseup", onUp);
                          }} />
                        <button className="absolute -top-2 -right-2 w-4 h-4 bg-[#2d2d4e] text-[#ede8dc] rounded-full text-[8px] flex items-center justify-center"
                          onClick={(e) => { e.stopPropagation(); setStickers(prev => prev.filter(s => s.id !== sticker.id)); setSelectedStickerId(null); }}>✕</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {format === "postcard" ? (
                <div className="flex min-h-[320px]">
                  <div className="w-1/2 bg-[#d8d0c0] flex items-center justify-center border-r border-[#2d2d4e]/20 relative">
                    {file ? (
                      <img src={URL.createObjectURL(file)} alt="upload" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-2" style={{ zIndex: doodleMode ? 0 : 1 }}>
                        <div className="w-10 h-10 rounded-full border border-dashed border-[#2d2d4e]/30 flex items-center justify-center">
                          <span className="text-lg text-[#2d2d4e]/40">+</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/40">add photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                      </label>
                    )}
                  </div>
                  <div className="w-1/2 p-5 flex flex-col justify-between" style={{ pointerEvents: doodleMode ? "none" : "auto" }}>
                    <div className="flex justify-between items-start">
                      <button type="button" onClick={() => setShowLocationPicker(true)}
                        className={`text-[10px] uppercase tracking-widest text-left bg-transparent border-none outline-none w-full max-w-[180px] transition-colors truncate ${placeLabel ? "text-[#2d2d4e]/50 hover:text-[#2d2d4e]" : "text-[#8b6f5e] hover:text-[#2d2d4e]"}`}>
                        {placeLabel || "⊕ pick location"}
                      </button>
                      <div className="w-10 h-12 border border-[#2d2d4e]/25 rounded-sm bg-[#ede8dc]/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {selectedStamp ? <img src={selectedStamp} alt="stamp" className="w-full h-full object-contain p-0.5" /> : <span className="text-[7px] text-[#2d2d4e]/30">stamp</span>}
                      </div>
                    </div>
                    <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Wish you were here..."
                      className="font-display mt-3 w-full resize-none bg-transparent text-lg leading-relaxed text-[#2d2d4e] outline-none placeholder:text-[#2d2d4e]/30" />
                    <div className="mt-3 flex flex-col gap-1">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-px bg-[#2d2d4e]/15" />)}
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="to..."
                        className="mt-1 text-xs text-[#2d2d4e]/60 bg-transparent outline-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 min-h-[500px] flex flex-col gap-4" style={{ pointerEvents: doodleMode ? "none" : "auto" }}>
                  <div className="flex justify-between items-start">
                    <button type="button" onClick={() => setShowLocationPicker(true)}
                      className={`text-xs uppercase tracking-widest bg-transparent border-none outline-none transition-colors ${placeLabel ? "text-[#2d2d4e]/50 hover:text-[#2d2d4e]" : "text-[#8b6f5e] hover:text-[#2d2d4e]"}`}>
                      {placeLabel || "⊕ pick location"}
                    </button>
                    <div className="w-10 h-12 border border-[#2d2d4e]/25 rounded-sm bg-[#ede8dc]/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {selectedStamp ? <img src={selectedStamp} alt="stamp" className="w-full h-full object-contain p-0.5" /> : <span className="text-[7px] text-[#2d2d4e]/30">stamp</span>}
                    </div>
                  </div>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dear..."
                    className="font-display text-2xl text-[#2d2d4e] bg-transparent border-none outline-none" />
                  <textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} placeholder="I wanted to tell you about this place..."
                    className="font-display w-full resize-none bg-transparent text-xl leading-[35px] text-[#2d2d4e] outline-none placeholder:text-[#2d2d4e]/30 flex-1" />
                  <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center gap-2 text-sm text-[#2d2d4e]/70 cursor-pointer">
                      <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
                      keep private
                    </label>
                    <label className="text-xs text-[#2d2d4e]/50 cursor-pointer">
                      + attach photo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                </div>
              )}
            </section>

            {/* toolbar */}
            <div className="flex flex-col gap-2 pt-2">
              <button type="button" onClick={() => setDoodleMode(!doodleMode)} title="draw"
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-all ${doodleMode ? "bg-[#2d2d4e] text-[#ede8dc] border-[#2d2d4e]" : "bg-[#f7f3e9] text-[#2d2d4e]/60 border-[#2d2d4e]/20 hover:border-[#2d2d4e]/40"}`}>
                ✏️
              </button>
              {doodleMode && (
                <>
                  {["#2d2d4e", "#8b6f5e", "#c17f5a", "#4a7c6a", "#9b4a4a"].map(c => (
                    <button key={c} type="button" onClick={() => setDoodleColor(c)}
                      className={`w-6 h-6 rounded-full mx-1.5 border-2 transition-all ${doodleColor === c ? "border-[#2d2d4e] scale-110" : "border-transparent"}`}
                      style={{ background: c }} />
                  ))}
                  <button type="button" onClick={() => setDoodleSize(s => s === 2 ? 5 : s === 5 ? 10 : 2)}
                    className="w-9 h-9 rounded-full border border-[#2d2d4e]/20 bg-[#f7f3e9] flex items-center justify-center text-[10px] text-[#2d2d4e]/60">
                    {doodleSize}px
                  </button>
                  <button type="button" onClick={clearDoodle}
                    className="w-9 h-9 rounded-full border border-[#8f3f3f]/30 bg-[#f7f3e9] flex items-center justify-center text-[10px] text-[#8f3f3f]">
                    clr
                  </button>
                </>
              )}
              <button type="button" onClick={() => stickerFileRef.current?.click()} title="add sticker"
                className="w-9 h-9 rounded-full border border-[#2d2d4e]/20 bg-[#f7f3e9] text-[#2d2d4e]/60 hover:border-[#2d2d4e]/40 flex items-center justify-center text-sm">
                ⭐
              </button>
              <input ref={stickerFileRef} type="file" accept="image/png,image/gif,image/webp" className="hidden" onChange={handleStickerUpload} />
            </div>
          </div>
        )}

        {/* step 3 */}
        {step === 3 && (
          <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2d2d4e]/20 bg-[#f7f3e9] p-8 shadow-[0_12px_32px_rgba(45,45,78,0.16)]">
            <p className="font-display text-3xl text-[#2d2d4e] mb-1 text-center">choose a stamp</p>
            <p className="text-[#2d2d4e]/50 text-sm text-center mb-6">pick one to seal your {format}</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
              {STAMPS.map((stamp) => (
                <button key={stamp} type="button" onClick={() => setSelectedStamp(stamp === selectedStamp ? null : stamp)}
                  className={`rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] ${selectedStamp === stamp ? "border-[#2d2d4e] shadow-[0_4px_12px_rgba(45,45,78,0.25)] scale-105" : "border-transparent hover:border-[#2d2d4e]/30"}`}>
                  <img src={stamp} alt="stamp" className="w-full h-full object-contain p-1" />
                </button>
              ))}
              <button type="button" onClick={() => setSelectedStamp(null)}
                className={`rounded-lg border-2 transition-all aspect-[3/4] flex items-center justify-center ${selectedStamp === null ? "border-[#2d2d4e] bg-[#ede8dc]" : "border-dashed border-[#2d2d4e]/20 hover:border-[#2d2d4e]/40"}`}>
                <span className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/40 text-center px-1">no stamp</span>
              </button>
            </div>
            <div className="rounded-xl border border-[#2d2d4e]/15 bg-[#f5f0e6] p-5 mb-6">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/40 mb-1">{format} · {placeLabel}</p>
                  <p className="font-display text-lg text-[#2d2d4e]">{title}</p>
                  <p className="text-sm text-[#2d2d4e]/70 mt-1 line-clamp-2">{body}</p>
                </div>
                {selectedStamp && <img src={selectedStamp} alt="stamp" className="w-10 h-12 object-contain rounded-sm flex-shrink-0" />}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#2d2d4e]/50 mb-4">{isPrivate ? "kept just for you." : "shared with the community."}</p>
              <button type="button" onClick={handleSave} disabled={saving}
                className="rounded-full bg-[#2d2d4e] px-8 py-3 text-sm font-semibold text-[#ede8dc] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {saving ? "sealing..." : "pin this memory →"}
              </button>
            </div>
          </section>
        )}

        {/* nav */}
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          {step > 1 ? (
            <button type="button"
              onClick={() => { setError(null); setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev)); }}
              className="rounded-full border border-[#2d2d4e]/25 px-4 py-2 text-sm text-[#2d2d4e] hover:bg-[#ede8dc]">
              back
            </button>
          ) : <div />}
          {step === 2 && (
            <button type="button"
              onClick={() => {
                setError(null);
                if (!title.trim() || !body.trim()) { setError("please add a title and message first."); return; }
                if (!placeLabel.trim()) { setError("please pick a location first."); setShowLocationPicker(true); return; }
                setStep(3);
              }}
              className="rounded-full bg-[#2d2d4e] px-5 py-2 text-sm text-[#ede8dc] hover:brightness-110">
              continue
            </button>
          )}
        </div>

        {error && <p className="text-center text-sm text-[#8f3f3f]">{error}</p>}
      </form>

      <style>{`
        .picker-pin { display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 2px 4px rgba(45,45,78,0.35)); }
        .picker-pin .pin-dot { width:14px; height:14px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); background:#2d2d4e; border:2px solid #ede8dc; }
        .picker-pin .pin-stem { width:2px; height:6px; background:#2d2d4e; }
      `}</style>
    </>
  );
}