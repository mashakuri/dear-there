import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteSpotButton } from "@/components/spots/DeleteSpotButton";

type Props = {
  params: Promise<{ spotId: string }>;
};

export default async function SpotPage({ params }: Props) {
  const { spotId } = await params;
  const supabase = await createClient();

  const { data: spot } = await supabase
    .from("spots")
    .select("*")
    .eq("id", spotId)
    .single();

  if (!spot) notFound();

  if (!spot.format) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-xs uppercase tracking-widest text-ink/50 hover:text-ink">
            ← back to map
          </Link>
          <DeleteSpotButton spotId={spot.id} />
        </div>
        <div className="rounded-xl border border-black/8 bg-white p-10 text-center">
          <p className="font-display text-2xl text-ink mb-2">this memory is incomplete</p>
          <p className="text-ink/50 text-sm">it was saved before the full format was added.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-xs uppercase tracking-widest text-ink/50 hover:text-ink">
          ← back to map
        </Link>
        <DeleteSpotButton spotId={spot.id} />
      </div>

      {spot.format === "postcard" ? (
        <PostcardView spot={spot} />
      ) : (
        <LetterView spot={spot} />
      )}
    </main>
  );
}

function PostcardView({ spot }: { spot: any }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#f7f3e9] shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden relative">
      {/* photo top */}
      <div className="w-full relative" style={{ aspectRatio: "8/5" }}>
        {spot.image_url ? (
          <img
            src={spot.image_url}
            alt="postcard photo"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "sepia(20%) contrast(0.95) brightness(0.96) saturate(0.85)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#d8d0c0] flex flex-col items-center justify-center gap-2 opacity-60">
            <div className="w-10 h-10 rounded-full border border-dashed border-[#2d2d4e]/40" />
            <span className="text-[10px] uppercase tracking-widest text-[#2d2d4e]">no photo</span>
          </div>
        )}
      </div>

      {/* writing */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <p className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/50 leading-relaxed flex-1">
            {spot.place_label}
          </p>
          {spot.stamp_url && (
            <div className="w-16 h-20 flex-shrink-0">
              <img src={spot.stamp_url} alt="stamp" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <p className="font-display text-lg leading-relaxed text-[#2d2d4e]">{spot.body}</p>

        <div className="flex flex-col gap-1.5 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-px bg-[#2d2d4e]/15" />
          ))}
          <p className="mt-1 text-xs text-[#2d2d4e]/60">{spot.title}</p>
        </div>
      </div>

      {/* doodle overlay */}
      {spot.doodle_data && (
        <img
          src={spot.doodle_data}
          alt="doodle"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: "multiply" }}
        />
      )}

      {/* stickers */}
      {spot.stickers?.map((sticker: any, i: number) => (
        <div key={i} className="absolute pointer-events-none"
          style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, width: sticker.size, height: sticker.size, transform: `rotate(${sticker.rotation}deg)` }}>
          <img src={sticker.src} alt="sticker" className="w-full h-full object-contain" />
        </div>
      ))}
    </div>
  );
}

function LetterView({ spot }: { spot: any }) {
  return (
    <div className="relative">
      <div
        className="relative rounded-2xl border border-black/8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden p-8 flex flex-col gap-4"
        style={{
          background: "repeating-linear-gradient(to bottom, #f7f3e9, #f7f3e9 34px, #ddd6c8 35px)",
          minHeight: "560px",
        }}
      >
        <div className="flex justify-between items-start gap-4">
          <p className="text-xs uppercase tracking-widest text-[#2d2d4e]/50">
            {spot.place_label}
          </p>
          {spot.stamp_url && (
            <div className="w-16 h-20 flex-shrink-0">
              <img src={spot.stamp_url} alt="stamp" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <p className="font-display text-2xl text-[#2d2d4e]">{spot.title}</p>
        <p className="font-display text-xl leading-[35px] text-[#2d2d4e] whitespace-pre-wrap flex-1">
          {spot.body}
        </p>

        {/* doodle overlay */}
        {spot.doodle_data && (
          <img
            src={spot.doodle_data}
            alt="doodle"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: "multiply" }}
          />
        )}

        {/* stickers */}
        {spot.stickers?.map((sticker: any, i: number) => (
          <div key={i} className="absolute pointer-events-none"
            style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, width: sticker.size, height: sticker.size, transform: `rotate(${sticker.rotation}deg)` }}>
            <img src={sticker.src} alt="sticker" className="w-full h-full object-contain" />
          </div>
        ))}
      </div>

      {/* polaroid for letter */}
      {spot.image_url && (
        <div className="absolute -bottom-4 left-8 z-10">
          <div className="relative inline-block" style={{ transform: "rotate(-3deg)" }}>
            <div className="bg-white shadow-[0_4px_20px_rgba(45,45,78,0.2)] pt-2 px-2 pb-7">
              <img
                src={spot.image_url}
                alt="memory photo"
                className="w-44 h-44 object-cover block"
                style={{ filter: "sepia(10%) contrast(0.95) brightness(0.98) saturate(0.9)" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}