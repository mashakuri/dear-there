"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName.trim() || undefined,
          },
        },
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      setMessage(
        "Check your email to confirm your account, then log in. You can close this tab."
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Display name
        <input
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="border-ink/15 bg-mist/40 focus:ring-terracotta/30 rounded-lg border px-3 py-2 text-base font-normal outline-none focus:ring-2"
          placeholder="How we'll greet you"
        />
      </label>
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
          autoComplete="new-password"
          required
          minLength={8}
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
      {message ? (
        <p className="text-sage text-sm" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="bg-terracotta text-linen hover:bg-terracotta/90 mt-1 rounded-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
