import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { BackButton } from "@/components/auth/BackButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account — MediTriage",
};

type Props = Readonly<{
  searchParams: Promise<{ next?: string }>;
}>;

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-[400px]">
        <BackButton />

        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary font-serif text-[15px] font-bold text-white">
            M
          </div>
          <span className="text-base font-semibold tracking-[-0.3px] text-text-1">
            MediTriage
          </span>
        </Link>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-serif text-[28px] text-text-1">Create your account</h1>
          <p className="mt-1 text-[15px] text-text-2">
            Free forever. No credit card required.
          </p>
        </div>

        <SignupForm next={next ?? "/dashboard?welcome=1"} />

        <p className="mt-6 text-center text-[12px] leading-[1.6] text-text-3">
          By creating an account you agree to our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-text-2">
            Privacy Policy
          </Link>
          . This tool provides informational guidance only — not medical advice.
        </p>
      </div>
    </div>
  );
}
