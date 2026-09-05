"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuroraShader } from "@/components/AuroraShader";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // App flow: if client is already logged in, redirect immediately to dashboard
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5ee]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#faf5ee]">
      {/* WebGL Aurora Fluid Shader Ambient Background */}
      <AuroraShader />

      <Navbar />

      <main className="w-full flex-1 flex flex-col justify-center items-center relative z-10 px-6 lg:px-12 pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto w-full text-center space-y-8 my-auto">
          <h1 className="font-headline text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-[-0.03em] text-on-surface max-w-3xl mx-auto">
            Don&apos;t just think,{" "}
            <span className="text-primary drop-shadow-sm font-bold">
              blog it
            </span>
            .
          </h1>

          <p className="font-body text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Where thoughtful writing finds its quiet home. A minimalist sanctuary
            designed for essays, ideas, and direct reader resonance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="btn-primary-warm px-8 py-3.5 text-sm"
            >
              <span>Start your blog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="btn-secondary-warm px-8 py-3.5 text-sm"
            >
              <span>Sign in</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Free &amp; open
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Type-safe Go API
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Zero tracking scripts
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
