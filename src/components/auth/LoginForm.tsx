"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  nextPath: string;
};

export function LoginForm({ nextPath }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      router.refresh();
      router.push(nextPath.startsWith("/") ? nextPath : "/my-spots");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-ink/15 bg-mist/40 focus:ring-terracotta/30 rounded-lg border px-3 py-2 text-base font-normal outline-none focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-ink/15 bg-mist/40 focus:ring-terracotta/30 rounded-lg border px-3 py-2 text-base font-normal outline-none focus:ring-2"
        />
      </label>
      {error ? (
        <p className="text-terracotta text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="bg-dusty-blue text-linen hover:bg-sage mt-1 rounded-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Log in"}
      </button>
    </form>
  );
}
