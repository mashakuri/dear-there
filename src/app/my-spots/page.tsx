import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function MySpotsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?next=/my-spots");

  const supabase = await createClient();
  const { data: spots } = await supabase
    .from("spots")
    .select("id, title, body, format, place_label, image_url, is_private, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#2d2d4e]">my spots</h1>
          <p className="text-[#2d2d4e]/65 mt-1 text-sm">
            every note you've saved, private or shared.
          </p>
        </div>
        <Link
          href="/"
          className="bg-[#2d2d4e] text-[#ede8dc] inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors hover:brightness-110"
        >
          + new note
        </Link>
      </div>

      {!spots?.length ? (
        <div className="rounded-xl border border-[#2d2d4e]/10 bg-[#f5f0e6] p-16 text-center">
          <p className="font-display text-2xl text-[#2d2d4e] mb-3">your memories, pinned.</p>
          <p className="text-[#2d2d4e]/60 text-sm max-w-sm mx-auto mb-6">
            once you write your first postcard or letter, it will live here — yours to revisit anytime.
          </p>
          <Link
            href="/"
            className="bg-[#2d2d4e] text-[#ede8dc] inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors hover:brightness-110"
          >
            mark this moment
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="group block rounded-2xl border border-[#2d2d4e]/15 bg-[#f8f5ee] overflow-hidden shadow-[0_4px_16px_rgba(45,45,78,0.08)] hover:shadow-[0_8px_28px_rgba(45,45,78,0.16)] hover:border-[#2d2d4e]/30 transition-all"
            >
              {spot.format === "postcard" ? (
                <PostcardCard spot={spot} />
              ) : (
                <LetterCard spot={spot} />
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function PostcardCard({ spot }: { spot: any }) {
  return (
    <div className="flex flex-col">
      <div className="w-full bg-[#d8d0c0] flex items-center justify-center relative" style={{ aspectRatio: "8/5" }}>
        {spot.image_url ? (
          <img src={spot.image_url} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "sepia(20%) contrast(0.95) brightness(0.96) saturate(0.85)" }} />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-25">
            <div className="w-8 h-8 rounded-full border border-dashed border-[#2d2d4e]" />
          </div>
        )}
        <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest bg-[#f7f3e9]/90 text-[#2d2d4e]/60 px-2 py-0.5 rounded-full">postcard</span>
        {spot.is_private && (
          <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest bg-[#2d2d4e]/80 text-[#ede8dc] px-2 py-0.5 rounded-full">private</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/45">{spot.place_label}</p>
        <p className="font-display text-base text-[#2d2d4e] line-clamp-1">{spot.title || "untitled"}</p>
        <p className="text-xs text-[#2d2d4e]/55 line-clamp-2 leading-relaxed">{spot.body}</p>
      </div>
    </div>
  );
}

function LetterCard({ spot }: { spot: any }) {
  return (
    <div className="p-5 flex flex-col gap-2 min-h-[200px]"
      style={{ background: "repeating-linear-gradient(to bottom, #f9f9f7, #f9f9f7 24px, #e0e4e8 25px)" }}>
      <div className="flex justify-between items-start">
        <span className="text-[9px] uppercase tracking-widest bg-[#f7f3e9]/90 text-[#2d2d4e]/50 px-2 py-0.5 rounded-full">letter</span>
        {spot.is_private && (
          <span className="text-[9px] uppercase tracking-widest bg-[#2d2d4e]/80 text-[#ede8dc] px-2 py-0.5 rounded-full">private</span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-[#2d2d4e]/45 self-end">{spot.place_label}</p>
      <p className="font-display text-lg text-[#2d2d4e]">{spot.title || "untitled"}</p>
      <p className="text-sm text-[#2d2d4e]/65 line-clamp-3 leading-relaxed">{spot.body}</p>
    </div>
  );
}