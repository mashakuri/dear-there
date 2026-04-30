"use client";

import { useState } from "react";

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [format, setFormat] = useState<"postcard" | "letter" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [memoryVibe, setMemoryVibe] = useState<"joyful" | "bittersweet" | "peaceful" | "adventurous" | null>(null);
  const [memoryType, setMemoryType] = useState<"food" | "nature" | "people" | "a moment" | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [latitude] = useState(String(initialLatitude));
  const [longitude] = useState(String(initialLongitude));
  const [placeLabel, setPlaceLabel] = useState(initialPlaceLabel ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingAnimation, setSendingAnimation] = useState(false);
  const [sent, setSent] = useState(false);

  const stampPalette: Record<NonNullable<typeof memoryVibe>, { fill: string; accent: string }> = {
    joyful: { fill: "#d88f5b", accent: "#8f3f22" },
    bittersweet: { fill: "#9f8aa9", accent: "#54455e" },
    peaceful: { fill: "#8da59c", accent: "#3d5a54" },
    adventurous: { fill: "#9b8762", accent: "#5e4f33" },
  };

  function renderStampIcon(accent: string) {
    if (memoryType === "food") return <path d="M44 43c0-6 4-11 10-11s10 5 10 11v11h-4V43c0-4-2-7-6-7s-6 3-6 7v11h-4V43Zm18 0h4v11h-4V43Z" fill={accent} />;
    if (memoryType === "nature") return <path d="M54 30c10 0 18 8 18 18 0 2-1 4-3 4H39c-2 0-3-2-3-4 0-10 8-18 18-18Zm0 7c-6 0-11 4-13 10h26c-2-6-7-10-13-10Z" fill={accent} />;
    if (memoryType === "people") return <path d="M48 42a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm12 0a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM38 60c0-6 5-11 10-11h12c5 0 10 5 10 11v2H38v-2Z" fill={accent} />;
    return <path d="M54 29c9 0 16 6 16 14 0 10-16 21-16 21S38 53 38 43c0-8 7-14 16-14Zm0 6c-5 0-9 3-9 8 0 4 5 9 9 12 4-3 9-8 9-12 0-5-4-8-9-8Z" fill={accent} />;
  }

  function stampLocation() {
    return (placeLabel.trim() || "DEAR, THERE").toUpperCase().slice(0, 20);
  }

  const activePalette = memoryVibe ? stampPalette[memoryVibe] : stampPalette.peaceful;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError("Please add a title and message."); return; }
    setSendingAnimation(true);
    await new Promise((r) => setTimeout(r, 2200));
    setSendingAnimation(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg text-center py-20">
        <p className="font-display text-4xl text-[#2d2d4e]">sealed & saved.</p>
        <p className="mt-3 text-sm text-[#2d2d4e]/70">your memory has been pinned to this place.</p>
        <button onClick={() => { setStep(1); setFormat(null); setTitle(""); setBody(""); setMemoryVibe(null); setMemoryType(null); setSent(false); }} className="mt-8 rounded-full border border-[#2d2d4e]/25 px-5 py-2 text-sm text-[#2d2d4e] hover:bg-[#ede8dc]">
          write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="relative flex flex-col gap-6">

      {/* progress */}
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2d2d4e]/20 bg-[#f6f2e9]/85 p-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#2d2d4e]/60">Step {step} of 4</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2d2d4e]/10">
          <div className="h-full bg-[#2d2d4e]/70 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* step 1 — choose format */}
      {step === 1 && (
        <section className="mx-auto grid w-full max-w-4xl gap-6 sm:grid-cols-2">

          {/* postcard */}
          <button type="button" onClick={() => { setFormat("postcard"); setStep(2); }}
            className="group rounded-2xl border border-[#2d2d4e]/20 bg-[#f8f5ee] p-5 text-left shadow-[0_8px_24px_rgba(45,45,78,0.10)] transition hover:shadow-[0_12px_32px_rgba(45,45,78,0.18)] hover:border-[#2d2d4e]/40">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2d4e]/65 mb-3">Postcard</p>
            {/* realistic postcard — two sides */}
            <div className="aspect-[8/5] rounded-xl border border-[#2d2d4e]/20 bg-[#f2ece0] overflow-hidden flex shadow-inner">
              {/* photo side */}
              <div className="w-1/2 bg-[#d8d0c0] flex items-center justify-center border-r border-[#2d2d4e]/15 relative">
                <div className="absolute inset-2 rounded border border-dashed border-[#2d2d4e]/20 flex items-center justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-[#2d2d4e]/40">photo</span>
                </div>
              </div>
              {/* write side */}
              <div className="w-1/2 p-2 flex flex-col justify-between">
                <div className="flex justify-end">
                  <div className="w-7 h-9 border border-[#2d2d4e]/25 rounded-sm bg-[#ede8dc] flex items-center justify-center">
                    <span className="text-[7px] text-[#2d2d4e]/40">stamp</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-px bg-[#2d2d4e]/15 w-full" />)}
                </div>
                <div className="mt-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-px bg-[#2d2d4e]/10 w-full mb-1" />)}
                </div>
              </div>
            </div>
    
          </button>

          {/* letter */}
          <button type="button" onClick={() => { setFormat("letter"); setStep(2); }}
            className="group rounded-2xl border border-[#2d2d4e]/20 bg-[#f8f5ee] p-5 text-left shadow-[0_8px_24px_rgba(45,45,78,0.10)] transition hover:shadow-[0_12px_32px_rgba(45,45,78,0.18)] hover:border-[#2d2d4e]/40">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2d4e]/65 mb-3">Letter</p>
            {/* realistic letter paper */}
            <div className="aspect-[5/7] rounded-xl border border-[#2d2d4e]/20 bg-[#f7f3e9] overflow-hidden shadow-inner px-4 py-5 flex flex-col gap-0"
              style={{ background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 24px, #d8d2c4 25px)" }}>
              <div className="w-16 h-px bg-[#2d2d4e]/20 mb-4 self-end" />
            </div>
            
          </button>

        </section>
      )}

      {/* step 2 — write */}
      {step === 2 && (
        <section className={`mx-auto w-full max-w-3xl border border-[#2d2d4e]/20 bg-[#f7f3e9] shadow-[0_12px_35px_rgba(45,45,78,0.18)] overflow-hidden
          ${format === "postcard" ? "rounded-2xl" : "rounded-2xl"}`}
          style={format === "letter" ? { background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 34px, #ddd6c8 35px)" } : {}}>

          {format === "postcard" ? (
            /* postcard layout — two sides */
            <div className="flex min-h-[320px]">
              {/* photo side */}
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
              {/* write side */}
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
            /* letter layout */
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

      {/* step 3 — stamp generator */}
      {step === 3 && (
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2d2d4e]/20 bg-[#f7f3e9] p-8 shadow-[0_12px_32px_rgba(45,45,78,0.16)]">
          <p className="font-display text-2xl text-[#2d2d4e] mb-1">design your stamp</p>
          <p className="text-sm text-[#2d2d4e]/60 mb-6">every memory gets its own seal.</p>
          <div className="flex gap-10 flex-wrap">
            <div className="flex-1 flex flex-col gap-5 min-w-[200px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d2d4e]/65 mb-2">memory vibe</p>
                <div className="flex flex-wrap gap-2">
                  {(["joyful", "bittersweet", "peaceful", "adventurous"] as const).map((vibe) => (
                    <button key={vibe} type="button" onClick={() => setMemoryVibe(vibe)}
                      className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${memoryVibe === vibe ? "bg-[#2d2d4e] text-[#ede8dc]" : "bg-[#ede8dc] text-[#2d2d4e] hover:bg-[#2d2d4e]/10"}`}>
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d2d4e]/65 mb-2">memory type</p>
                <div className="flex flex-wrap gap-2">
                  {(["food", "nature", "people", "a moment"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setMemoryType(type)}
                      className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${memoryType === type ? "bg-[#2d2d4e] text-[#ede8dc]" : "bg-[#ede8dc] text-[#2d2d4e] hover:bg-[#2d2d4e]/10"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* stamp preview */}
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 108 108" className="h-44 w-44">
                <circle cx="54" cy="54" r="49" fill={activePalette.fill} />
                <circle cx="54" cy="54" r="43" fill="none" stroke={activePalette.accent} strokeWidth="2.5" />
                <circle cx="54" cy="54" r="28" fill="#ede8dc" opacity="0.9" />
                {renderStampIcon(activePalette.accent)}
                <text x="54" y="19" textAnchor="middle" fontSize="6" letterSpacing="1.1" fill={activePalette.accent}>
                  {stampLocation()}
                </text>
                <circle cx="54" cy="54" r="47" fill="none" stroke={activePalette.accent} strokeDasharray="2.5 3.5" />
              </svg>
              <p className="text-xs text-[#2d2d4e]/50">your stamp</p>
            </div>
          </div>
        </section>
      )}

      {/* step 4 — seal */}
      {step === 4 && (
        <section className="mx-auto w-full max-w-sm rounded-2xl border border-[#2d2d4e]/25 bg-[#f7f3e9] p-10 text-center shadow-[0_12px_28px_rgba(45,45,78,0.16)]">
          <p className="font-display text-3xl text-[#2d2d4e] mb-2">ready to seal?</p>
          <p className="text-sm text-[#2d2d4e]/60 mb-8">your {format} will be folded, sealed, and pinned to this place.</p>
          <button type="submit" disabled={sendingAnimation}
            className="mx-auto inline-flex min-h-16 min-w-16 items-center justify-center rounded-full border-2 border-[#5c0f18] bg-gradient-to-b from-[#8a1f2a] to-[#66121c] px-8 py-3 text-sm font-semibold tracking-[0.08em] text-[#f3d8a5] shadow-[inset_0_3px_6px_rgba(255,255,255,0.22),0_8px_20px_rgba(45,45,78,0.28)] transition hover:scale-[1.02] disabled:opacity-60">
            {sendingAnimation ? "sealing..." : "seal & send"}
          </button>
        </section>
      )}

      {/* nav */}
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
        {step > 1 ? (
          <button type="button" onClick={() => { setError(null); setStep((prev) => (prev > 1 ? (prev - 1) as 1|2|3|4 : prev)); }}
            className="rounded-full border border-[#2d2d4e]/25 px-4 py-2 text-sm text-[#2d2d4e] hover:bg-[#ede8dc]">
            back
          </button>
        ) : <div />}
        {step > 1 && step < 4 && (
          <button type="button" onClick={() => { setError(null); if (step === 2 && (!title.trim() || !body.trim())) { setError("please add a title and message first."); return; } setStep((step + 1) as 2|3|4); }}
            className="rounded-full bg-[#2d2d4e] px-5 py-2 text-sm text-[#ede8dc] hover:brightness-110">
            continue
          </button>
        )}
      </div>

      {error && <p className="text-center text-sm text-[#8f3f3f]">{error}</p>}

      {/* envelope animation */}
      {sendingAnimation && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-[#ede8dc]/80 backdrop-blur-[1px]">
          <div className="scene">
            <div className="folded-letter" />
            <div className="envelope" />
            <div className="flap" />
            <div className="wax-seal" />
          </div>
        </div>
      )}

      <style jsx>{`
        .scene { position: relative; width: 250px; height: 190px; }
        .folded-letter { position: absolute; left: 35px; top: 10px; width: 180px; height: 120px; border: 1px solid rgba(45,45,78,0.28); background: #f7f3e9; border-radius: 8px; animation: fold-slide 1.4s ease-in-out forwards; }
        .envelope { position: absolute; left: 20px; bottom: 25px; width: 210px; height: 105px; background: #e2dbc9; border: 1px solid rgba(45,45,78,0.24); border-radius: 8px; }
        .flap { position: absolute; left: 20px; bottom: 77px; width: 210px; height: 70px; clip-path: polygon(0 0, 100% 0, 50% 100%); background: #d7cfbc; transform-origin: 50% 0%; animation: close-flap 1.4s ease-in-out forwards; }
        .wax-seal { position: absolute; left: 112px; bottom: 88px; width: 28px; height: 28px; border-radius: 999px; background: radial-gradient(circle at 30% 30%, #b33742, #7a1a25); box-shadow: 0 3px 10px rgba(45,45,78,0.35); transform: scale(0); animation: seal-drop 0.45s ease-out 1.35s forwards; }
        @keyframes fold-slide { 0% { transform: translateY(0) scaleY(1); } 45% { transform: translateY(0) scaleY(0.68); } 100% { transform: translateY(68px) scale(0.75); } }
        @keyframes close-flap { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(178deg); } }
        @keyframes seal-drop { 0% { transform: translateY(-35px) scale(0.4); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </form>
  );
}