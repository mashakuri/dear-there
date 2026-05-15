import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navClass =
  "text-ink/60 hover:text-ink transition-colors text-sm font-medium tracking-wide";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-black/6 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-ink text-xl tracking-tight sm:text-2xl"
        >
          Dear, There
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7">
          <Link href="/" className={navClass}>Map</Link>
          <Link href="/my-spots" className={navClass}>My Spots</Link>
          <Link href="/spots/new" className={navClass}>New note</Link>
          {user ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/auth/login" className={navClass}>Log in</Link>
              <Link
                href="/auth/signup"
                className="bg-ink text-white hover:bg-ink/85 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}