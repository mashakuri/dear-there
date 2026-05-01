import Link from "next/link";
import { MapSection } from "@/components/map/MapSection";

export default function HomePage() {
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="flex flex-col gap-3">
        <p className="font-display text-[#2d2d4e] text-2xl sm:text-3xl">
          Dear, There
        </p>
        <h1 className="text-[#2d2d4e] max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          pin a memory to the places that stayed with you.
        </h1>
        <p className="text-[#2d2d4e]/65 max-w-xl text-base leading-relaxed">
          write a postcard or letter, attach it to a spot on the map, and share it anonymously — or keep it just for you.
        </p>
      </section>

      <section className="flex flex-1 flex-col gap-4">
        {hasMapbox ? (
          <MapSection className="min-h-[min(70vh,560px)] flex-1" />
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#2d2d4e]/20 p-8 text-center">
            <p className="text-[#2d2d4e] font-medium">map loading...</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/spots/new"
            className="bg-[#2d2d4e] text-[#ede8dc] rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:brightness-110"
          >
            mark this moment
          </Link>
        </div>
      </section>
    </main>
  );
}