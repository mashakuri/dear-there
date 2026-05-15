"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
export const dynamic = "force-dynamic";

export function DeleteSpotButton({ spotId }: { spotId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("spots").delete().eq("id", spotId);
    console.log("delete result:", error);
    window.location.href = "/my-spots";
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#2d2d4e]/60">are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-semibold text-[#8f3f3f] hover:underline disabled:opacity-50"
        >
          {deleting ? "deleting..." : "yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#2d2d4e]/50 hover:text-[#2d2d4e]"
        >
          cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[#2d2d4e]/40 hover:text-[#8f3f3f] transition-colors"
    >
      delete
    </button>
  );
}