import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "blogit — Where thoughtful writing finds its quiet home",
  description:
    "Don't just think, blog it. A minimalist blog publishing platform built with Sun-Baked Simplicity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ebGaramond.variable} ${manrope.variable} antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[#faf5ee] text-[#3a302a] relative selection:bg-primary/20 selection:text-primary"
      >
        {/* Tactile paper texture micro-grain overlay */}
        <div
          className="fixed inset-0 pointer-events-none -z-10 opacity-[0.045] mix-blend-multiply paper-grain"
          aria-hidden="true"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
