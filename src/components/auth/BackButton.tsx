"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-6 flex items-center gap-1.5 text-[14px] text-text-2 transition-colors hover:text-text-1"
      aria-label="Go back"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
