import Link from "next/link";

export default async function MySpotsPage() {
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
          href="/spots/new"
          className="bg-[#2d2d4e] text-[#ede8dc] inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors hover:brightness-110"
        >
          new note
        </Link>
      </div>

      <div className="w-full rounded-xl border border-[#2d2d4e]/20 bg-[#e8e3d8] px-5 py-4 text-center text-sm text-[#2d2d4e]/70 tracking-widest uppercase mb-8">
         &nbsp; coming soon &nbsp; 
      </div>

      <div className="rounded-xl border border-[#2d2d4e]/10 bg-[#f5f0e6] p-10 text-center">
        <p className="font-display text-2xl text-[#2d2d4e] mb-3">your memories, pinned.</p>
        <p className="text-[#2d2d4e]/60 text-sm max-w-sm mx-auto mb-6">
          once you write your first postcard or letter, it will live here yours to revisit anytime
        </p>
        <Link
          href="/spots/new"
          className="bg-[#2d2d4e] text-[#ede8dc] inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors hover:brightness-110"
        >
          mark this moment
        </Link>
      </div>
    </main>
  );
}