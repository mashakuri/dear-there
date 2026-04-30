import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

type SpotEmbed = {
  id: string;
  latitude: number;
  longitude: number;
  place_label: string | null;
};

type EntryWithSpot = {
  id: string;
  title: string;
  is_private: boolean;
  created_at: string;
  spots: SpotEmbed | SpotEmbed[] | null;
};

export default async function MySpotsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login?next=/my-spots");
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("entries")
    .select(
      `
      id,
      title,
      is_private,
      created_at,
      spots (
        id,
        latitude,
        longitude,
        place_label
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-terracotta text-sm">
          Could not load your spots. Check Supabase env and the database migration.
        </p>
      </main>
    );
  }

  const entries = (rows ?? []) as EntryWithSpot[];

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">My Spots</h1>
          <p className="text-ink/65 mt-1 text-sm">
            Every note you have saved, private or shared.
          </p>
        </div>
        <Link
          href="/spots/new"
          className="bg-dusty-blue text-linen hover:bg-sage inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors"
        >
          New note
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-mist/40 rounded-xl border border-ink/10 p-10 text-center">
          <p className="text-ink/70">No entries yet.</p>
          <Link
            href="/spots/new"
            className="text-terracotta mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
          >
            Write your first postcard
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const spot = Array.isArray(entry.spots)
              ? entry.spots[0]
              : entry.spots;
            const when = new Date(entry.created_at).toLocaleDateString(
              undefined,
              { dateStyle: "medium" }
            );
            const where =
              spot?.place_label ??
              (spot
                ? `${spot.latitude.toFixed(2)}, ${spot.longitude.toFixed(2)}`
                : "Unknown place");

            return (
              <li key={entry.id}>
                <Link
                  href={`/spots/${spot?.id ?? ""}`}
                  className="bg-linen/80 hover:border-terracotta/40 group flex h-full flex-col rounded-xl border border-ink/10 p-5 shadow-sm transition-colors"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="text-ink group-hover:text-terracotta font-semibold leading-snug transition-colors">
                      {entry.title}
                    </h2>
                    {entry.is_private ? (
                      <span className="bg-lavender/25 text-ink/80 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                        Private
                      </span>
                    ) : (
                      <span className="bg-sage/25 text-ink/80 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="text-ink/55 mt-auto text-xs">{when}</p>
                  <p className="text-ink/60 text-xs">{where}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
