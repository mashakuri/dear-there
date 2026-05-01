export default async function SpotPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[#2d2d4e]">this spot</h1>
        <p className="text-[#2d2d4e]/65 mt-1 text-sm">
          memories left here by others.
        </p>
      </div>

      <div className="w-full rounded-xl border border-[#2d2d4e]/20 bg-[#e8e3d8] px-5 py-4 text-center text-sm text-[#2d2d4e]/70 tracking-widest uppercase mb-8">
        ✦ &nbsp; community pins coming soon &nbsp; ✦
      </div>

      <div className="rounded-xl border border-[#2d2d4e]/10 bg-[#f5f0e6] p-10 text-center">
        <p className="font-display text-2xl text-[#2d2d4e] mb-3">others have been here too.</p>
        <p className="text-[#2d2d4e]/60 text-sm max-w-sm mx-auto">
          soon you'll be able to see every memory left at this spot — anonymously shared by people who were here.
        </p>
      </div>
    </main>
  );
}