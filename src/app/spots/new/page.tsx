import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { NewEntryForm } from "@/components/spots/NewEntryForm";

type Props = {
  searchParams: Promise<{ lat?: string; lng?: string; place?: string }>;
};

export default async function NewSpotPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login?next=/spots/new");
  }

  const { lat, lng, place } = await searchParams;
  const latitude = lat ? parseFloat(lat) : 37.7749;
  const longitude = lng ? parseFloat(lng) : -122.4194;
  const placeLabel = place ?? null;

  return (
    <main className="flex-1 bg-[#ede8dc] px-4 py-10 text-[#2d2d4e] sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-center text-4xl font-semibold text-[#2d2d4e] sm:text-5xl">
          Write a new note
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#2d2d4e]/75 sm:text-base">
        choose your format
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-5xl">
        <NewEntryForm
          userId={user.id}
          initialLatitude={Number.isFinite(latitude) ? latitude : 37.7749}
          initialLongitude={Number.isFinite(longitude) ? longitude : -122.4194}
          initialPlaceLabel={placeLabel}
        />
      </div>
    </main>
  );
}
