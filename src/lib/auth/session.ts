import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { hasValidSupabaseEnv } from "@/lib/supabase/env";

export async function getSessionUser(): Promise<User | null> {
  if (!hasValidSupabaseEnv()) {
    return null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
