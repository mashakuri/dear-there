import Link from "next/link";
import { MapSection } from "@/components/map/MapSection";

export default function HomePage() {
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="flex flex-col gap-3">
        <p className="font-display text-terracotta text-2xl sm:text-3xl">
          Dear, there -
        </p>
        <h1 className="text-ink max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          Leave a postcard on the map, or keep a private letter in your pocket.
        </h1>
        <p className="text-ink/70 max-w-xl text-base leading-relaxed">
          Shared spots show up for everyone anonymously. Your private notes stay
          on{" "}
          <Link href="/my-spots" className="text-terracotta font-medium underline-offset-2 hover:underline">
            My Spots
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-1 flex-col gap-4">
        {hasMapbox ? (
          <MapSection className="min-h-[min(70vh,560px)] flex-1" />
        ) : (
          <div className="bg-mist/50 border-dusty-blue/30 flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <p className="text-ink font-medium">Mapbox token missing</p>
            <p className="text-ink/65 max-w-md text-sm leading-relaxed">
              Add{" "}
              <code className="bg-linen rounded px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              </code>{" "}
              to <code className="text-xs">.env.local</code> to render the
              interactive map.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/spots/new"
            className="bg-terracotta text-linen hover:bg-terracotta/90 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors"
          >
            Drop a new note
          </Link>
          <span className="text-ink/50 text-sm">
            Pins and community feed wiring come next; schema and auth are ready.
          </span>
        </div>
      </section>
    </main>
  );
}
