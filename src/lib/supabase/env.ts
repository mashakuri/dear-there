function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

export function getSupabaseEnv() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  const validUrl =
    Boolean(url) &&
    /^https?:\/\//.test(url as string) &&
    !(url as string).includes("placeholder");
  const validKey = Boolean(key) && !(key as string).includes("placeholder");

  return {
    url,
    key,
    isValid: validUrl && validKey,
  };
}

export function hasValidSupabaseEnv() {
  return getSupabaseEnv().isValid;
}
