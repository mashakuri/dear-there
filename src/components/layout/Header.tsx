import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navClass =
  "text-ink/80 hover:text-terracotta transition-colors text-sm font-medium tracking-wide";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="border-ink/10 bg-linen/90 supports-[backdrop-filter]:bg-linen/75 sticky top-0 z-20 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-ink text-xl tracking-tight sm:text-2xl"
        >
          Dear, There
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7">
          <Link href="/" className={navClass}>
            Map
          </Link>
          <Link href="/my-spots" className={navClass}>
            My Spots
          </Link>
          <Link href="/spots/new" className={navClass}>
            New note
          </Link>
          {user ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/auth/login" className={navClass}>
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="bg-dusty-blue text-linen hover:bg-sage rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
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
