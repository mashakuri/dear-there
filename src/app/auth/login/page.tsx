import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/") ? next : "/my-spots";

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-ink text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-ink/65">
        Log in to continue writing and sharing your memories.
      </p>
      <div className="mt-8 rounded-2xl border border-ink/10 bg-linen/90 p-6 shadow-sm">
        <LoginForm nextPath={nextPath} />
      </div>
      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-terracotta underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </main>
  );
}
