import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-ink text-3xl">Join Dear, There</h1>
      <p className="text-ink/65 mt-2 text-sm">
        Create an account to pin letters and postcards to real places.
      </p>
      <div className="bg-linen/90 mt-8 rounded-2xl border border-ink/10 p-6 shadow-sm">
        <SignupForm />
      </div>
      <p className="text-ink/60 mt-6 text-center text-sm">
        Already registered?{" "}
        <Link
          href="/auth/login"
          className="text-terracotta font-medium underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
    </main>
  );
}
