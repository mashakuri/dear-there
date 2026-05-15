import { MapSection } from "@/components/map/MapSection";

export default function HomePage() {
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 min-h-screen">
      <section className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="font-display text-[#2d2d4e] text-2xl sm:text-3xl">Dear, There</p>
          <h1 className="text-[#2d2d4e] max-w-2xl text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            pin a memory to the places that stayed with you.
          </h1>
          <p className="text-[#2d2d4e]/60 max-w-xl text-sm leading-relaxed">
            write a postcard or letter, and attach it to a spot on the map.
          </p>
        </div>
        <img
          src="/stamps/stamp-3.jpg"
          alt=""
          aria-hidden="true"
          className="w-14 h-18 object-contain opacity-70 rotate-6 flex-shrink-0 mt-1"
        />
      </section>

      <section className="flex flex-1 flex-col gap-3">
  {hasMapbox ? (
    <MapSection className="h-[70vh] w-full" />
  ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#2d2d4e]/20 p-8 text-center">
            <p className="text-[#2d2d4e] font-medium">map loading...</p>
          </div>
        )}
      </section>
    </main>
  );
}