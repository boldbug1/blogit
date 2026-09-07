import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

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
  title: "blogit",
  description:
    "Don't just think, blog it. A minimalist blog publishing platform built with Sun-Baked Simplicity.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/blogit-logo.png", type: "image/png" },
      { url: "/blogit-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/blogit-logo.png",
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
      suppressHydrationWarning
      className={`${ebGaramond.variable} ${manrope.variable} antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-surface text-on-surface relative selection:bg-primary/20 selection:text-primary transition-colors duration-300"
      >
        {/* Tactile paper texture micro-grain overlay (GPU composited without blend mode) */}
        <div
          className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03] paper-grain transform-gpu"
          aria-hidden="true"
        />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
