"use client";

import { useState } from "react";

const PREVIEW_PHOTOS = [
  "/preview-photos/toast.jpg",
  "/preview-photos/lotus.jpg",
  "/preview-photos/window.jpg",
  "/preview-photos/cat.jpg",
  "/preview-photos/papers.jpg",
];

type Props = {
  userId: string;
  initialLatitude: number;
  initialLongitude: number;
  initialPlaceLabel: string | null;
};

export function NewEntryForm({
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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form className="relative flex flex-col gap-6">

      {/* progress */}
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2d2d4e]/20 bg-[#f6f2e9]/85 p-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#2d2d4e]/60">Step {step} of 3</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2d2d4e]/10">
          <div className="h-full bg-[#2d2d4e]/70 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {/* step 1 — choose format */}
      {step === 1 && (
        <section className="mx-auto grid w-full max-w-4xl gap-6 sm:grid-cols-2 items-start">

          {/* postcard */}
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

          {/* letter */}
          <button type="button" onClick={() => { setFormat("letter"); setStep(2); }}
            className="group rounded-2xl border border-[#2d2d4e]/20 bg-[#f8f5ee] p-5 text-left shadow-[0_8px_24px_rgba(45,45,78,0.10)] transition hover:shadow-[0_12px_32px_rgba(45,45,78,0.18)] hover:border-[#2d2d4e]/40 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2d4e]/65 text-center w-full">Letter</p>
            <div className="rounded-xl border border-[#2d2d4e]/20 overflow-hidden px-5 py-6 flex flex-col gap-0" style={{ aspectRatio: "5/7", background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 24px, #d8d2c4 25px)" }}>
              <div className="w-16 h-px bg-[#2d2d4e]/20 mb-4 self-end" />
            </div>
          </button>

        </section>
      )}

      {/* step 2 — write */}
      {step === 2 && (
        <section className="mx-auto w-full max-w-3xl border border-[#2d2d4e]/20 bg-[#f7f3e9] shadow-[0_12px_35px_rgba(45,45,78,0.18)] overflow-hidden rounded-2xl"
          style={format === "letter" ? { background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 34px, #ddd6c8 35px)" } : {}}>

          {format === "postcard" ? (
            <div className="flex min-h-[320px]">
              <div className="w-1/2 bg-[#d8d0c0] flex items-center justify-center border-r border-[#2d2d4e]/20 relative">
                {file ? (
                  <img src={URL.createObjectURL(file)} alt="upload" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-2">
                    <div className="w-10 h-10 rounded-full border border-dashed border-[#2d2d4e]/30 flex items-center justify-center">
                      <span className="text-lg text-[#2d2d4e]/40">+</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/40">add photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                )}
              </div>
              <div className="w-1/2 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <input type="text" value={placeLabel} onChange={(e) => setPlaceLabel(e.target.value)}
                    placeholder="place name"
                    className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/50 bg-transparent border-none outline-none w-32" />
                  <div className="w-10 h-12 border border-[#2d2d4e]/25 rounded-sm bg-[#ede8dc]/60 flex items-center justify-center flex-shrink-0">
                    <span className="text-[7px] text-[#2d2d4e]/30">stamp</span>
                  </div>
                </div>
                <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder="Wish you were here..."
                  className="font-display mt-3 w-full resize-none bg-transparent text-lg leading-relaxed text-[#2d2d4e] outline-none placeholder:text-[#2d2d4e]/30" />
                <div className="mt-3 flex flex-col gap-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-px bg-[#2d2d4e]/15" />)}
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="to..."
                    className="mt-1 text-xs text-[#2d2d4e]/60 bg-transparent outline-none" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 min-h-[500px] flex flex-col gap-4">
              <input type="text" value={placeLabel} onChange={(e) => setPlaceLabel(e.target.value)}
                placeholder="place, date"
                className="text-xs uppercase tracking-widest text-[#2d2d4e]/50 bg-transparent border-none outline-none self-end" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Dear..."
                className="font-display text-2xl text-[#2d2d4e] bg-transparent border-none outline-none" />
              <textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="I wanted to tell you about this place..."
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
      )}

      {/* step 3 — coming soon */}
      {step === 3 && (
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2d2d4e]/20 bg-[#f7f3e9] p-10 text-center shadow-[0_12px_32px_rgba(45,45,78,0.16)]">
          <p className="font-display text-3xl text-[#2d2d4e] mb-3">your custom stamp</p>
          <p className="text-[#2d2d4e]/60 text-sm max-w-sm mx-auto mb-4">
            
          </p>
          <div className="w-full rounded-xl border border-[#2d2d4e]/20 bg-[#e8e3d8] px-5 py-3 text-center text-sm text-[#2d2d4e]/70 tracking-widest uppercase mb-6">
             &nbsp; stamp generator coming soon &nbsp; 
          </div>
          <p className="text-[#2d2d4e]/60 text-sm max-w-sm mx-auto mb-2">
            
          </p>
        </section>
      )}

      {/* nav */}
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
        {step > 1 ? (
          <button type="button" onClick={() => { setError(null); setStep((prev) => (prev > 1 ? (prev - 1) as 1|2|3 : prev)); }}
            className="rounded-full border border-[#2d2d4e]/25 px-4 py-2 text-sm text-[#2d2d4e] hover:bg-[#ede8dc]">
            back
          </button>
        ) : <div />}
        {step === 2 && (
          <button type="button" onClick={() => { setError(null); if (!title.trim() || !body.trim()) { setError("please add a title and message first."); return; } setStep(3); }}
            className="rounded-full bg-[#2d2d4e] px-5 py-2 text-sm text-[#ede8dc] hover:brightness-110">
            continue
          </button>
        )}
      </div>

      {error && <p className="text-center text-sm text-[#8f3f3f]">{error}</p>}

    </form>
  );
}