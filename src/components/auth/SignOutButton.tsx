"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/");
      }}
      className="text-ink/80 hover:text-terracotta text-sm font-medium tracking-wide transition-colors"
    >
      Sign out
    </button>
  );
}
