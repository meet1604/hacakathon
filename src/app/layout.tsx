import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediTriage — AI Symptom Pre-Screener",
  description:
    "Describe your symptoms in plain language and get trusted care guidance in seconds — in your language, any time, anywhere.",
  openGraph: {
    title: "MediTriage — AI Symptom Pre-Screener",
    description: "Instant AI-powered symptom triage. Free, private, multilingual.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full antialiased", inter.variable, instrumentSerif.variable)}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-1">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
