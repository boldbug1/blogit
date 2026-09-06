"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuroraShader } from "@/components/AuroraShader";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { TypewriterSplash } from "@/components/TypewriterSplash";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  ArrowRight,
  Sparkles,
  PenTool,
  Globe,
  ShieldCheck,
  Flame,
  Lock,
  ChevronDown,
  Mail,
  CheckCircle2,
} from "lucide-react";

/**
 * FEATURE TOGGLE: Typewriter Intro Splash
 * Change to `false` if you want to turn off the typewriter splash animation.
 */
const ENABLE_TYPEWRITER_SPLASH = true;

export function LandingPage() {
  const [splashFinished, setSplashFinished] = useState(!ENABLE_TYPEWRITER_SPLASH);

  // Newsletter state
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    setNewsletterError("");
    setIsSubmitting(true);

    // Simulate subscription process
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-on-surface scroll-smooth">
      {/* Typewriter Splash Screen (Modular component, can be disabled above) */}
      {ENABLE_TYPEWRITER_SPLASH && (
        <TypewriterSplash
          text="blogit."
          enabled={ENABLE_TYPEWRITER_SPLASH}
          onComplete={() => setSplashFinished(true)}
        />
      )}

      {/* Signature WebGL Aurora Waveform Background */}
      <AuroraShader opacity={0.88} />

      {/* Ambient Peach & Terracotta Depth Glows (GPU composited) */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary-fixed/35 rounded-full blur-3xl pointer-events-none -z-10 transform-gpu will-change-transform" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-tertiary-fixed/25 rounded-full blur-3xl pointer-events-none -z-10 transform-gpu will-change-transform" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10 transform-gpu will-change-transform" />

      {/* Top Header Navigation - Light & Subtle so Hero commands all visual weight */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <Logo size="lg" />

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-surface-container/60"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* =========================================================================
          COMPONENT 1: HERO VIEWPORT (Full Screen - Zero Bento Grid Above the Fold)
          ========================================================================= */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-6 py-12 max-w-5xl mx-auto w-full">
      

        {/* Hero Title */}
        <h1
          className={`font-headline text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-on-surface leading-[1.06] max-w-4xl transition-all duration-700 delay-100 ${
            splashFinished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Don&apos;t just think, <br />
          <span className="text-primary italic">blog it.</span>
        </h1>

        {/* Focused Subtitle */}
        <p
          className={`font-body text-base sm:text-lg md:text-xl text-on-surface-variant mt-6 max-w-2xl leading-relaxed transition-all duration-700 delay-200 ${
            splashFinished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          The modern, distraction-free publishing platform for writers and thinkers.
          No algorithms, no invasive ads — just your words and your readers.
        </p>

        {/* Dominant Hero CTA: Maximum Visual Weight */}
        <div
          className={`mt-10 sm:mt-12 transition-all duration-700 delay-300 ${
            splashFinished ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-3.5 px-10 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold text-white shadow-2xl shadow-primary/35 hover:shadow-primary/50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 overflow-hidden ring-4 ring-primary/25 hover:ring-primary/40"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, #b8541a 100%)",
            }}
          >
            {/* Smooth shimmer highlight effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            <span className="relative font-sans tracking-wide">Start reading</span>
            <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

        {/* Scroll down indicator for natural transition */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-on-surface-variant/60 animate-bounce pointer-events-none">
          <span>Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* =========================================================================
          COMPONENT 2: BENTO GRID SECTION (Full Viewport Stage - Dedicated Screen)
          ========================================================================= */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-24 sm:py-32 max-w-6xl mx-auto w-full text-left">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14 sm:mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
              Everything you need to write and publish
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mt-2.5 max-w-lg mx-auto leading-relaxed">
              Crafted with care to keep you in flow and connect you directly with your audience.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1: Distraction-Free Editor (Span 2) */}
          <ScrollReveal animation="fade-up" delayMs={50} className="md:col-span-2">
            <div className="h-full p-6 sm:p-8 rounded-xl bg-surface/85 backdrop-blur-md border border-outline-variant/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <PenTool className="w-5 h-5" />
                </div>
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                  Distraction-Free Editor
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Focus on writing with contextual floating formatting, complete markdown support,
                  syntax-highlighted code blocks, and interactive table rendering.
                </p>
              </div>

              {/* Editor Mockup Visual */}
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2.5 font-mono text-xs text-on-surface-variant">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 text-[11px]">
                  <span className="font-sans font-semibold text-on-surface">
                    Floating Selection Toolbar
                  </span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-outline-variant/40 text-[10px]">
                    <span className="font-bold">B</span>
                    <span className="italic">I</span>
                    <span>Link</span>
                    <span>Code</span>
                  </div>
                </div>
                <div className="text-sm font-headline text-on-surface font-bold">
                  The Architecture of Ideas
                </div>
                <p className="text-[11px] text-on-surface-variant/80 font-sans line-clamp-2">
                  When words flow without friction, thinking sharpens. Every paragraph connects seamlessly.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Bento 2: Personal Publication (Span 1) */}
          <ScrollReveal animation="fade-up" delayMs={150}>
            <div className="h-full p-6 sm:p-8 rounded-xl bg-surface/85 backdrop-blur-md border border-outline-variant/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  Your Publication
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Claim your clean URL at <span className="font-mono font-semibold text-primary">blogit.pub/@you</span> with custom domain support and themes.
                </p>
              </div>

              {/* Domain Badge Mockup */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2 text-xs font-mono text-on-surface">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">blogit.pub/@author</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Bento 3: Zero Algorithms or Ads (Span 1) */}
          <ScrollReveal animation="fade-up" delayMs={250}>
            <div className="h-full p-6 sm:p-8 rounded-xl bg-surface/85 backdrop-blur-md border border-outline-variant/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface">
                  Zero Algorithms
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Pure chronological delivery. No engagement traps or sponsored noise—your stories reach readers directly.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2 text-xs font-medium text-secondary">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>100% Chronological Feed</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Bento 4: Writing Streaks & Momentum (Span 2) */}
          <ScrollReveal animation="fade-up" delayMs={350} className="md:col-span-2">
            <div className="h-full p-6 sm:p-8 rounded-xl bg-surface/85 backdrop-blur-md border border-outline-variant/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                  Streak Analytics &amp; Momentum
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Build consistent daily writing habits with GitHub-style contribution heatmaps, word telemetry, and streak rewards.
                </p>
              </div>

              {/* Heatmap Preview Row */}
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 rounded-[2.5px] ${
                        i % 3 === 0
                          ? "bg-primary"
                          : i % 2 === 0
                          ? "bg-primary/50"
                          : "bg-surface-container-high"
                      }`}
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/15 text-primary text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>14 Day Active Streak</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          COMPONENT 3: NEWSLETTER SUBSCRIPTION (Follow Development & Dispatches)
          ========================================================================= */}
      <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 max-w-4xl mx-auto w-full text-center">
        <ScrollReveal animation="zoom-in" className="w-full">
          <div className="w-full p-8 sm:p-14 rounded-2xl bg-surface/90 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 text-center space-y-8">
           

            {/* Title & Description */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <h3 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                Follow our development
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
                Receive monthly updates on new writing tools, engineering deep dives, feature rollouts,
                and the evolution of Blogit. No spam, ever.
              </p>
            </div>

            {/* Interactive Subscription Form */}
            {isSubscribed ? (
              <div className="p-6 rounded-xl bg-primary/10 border border-primary/30 max-w-md mx-auto space-y-2 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-headline font-bold text-lg text-on-surface">
                  You&apos;re in the loop!
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Thanks for following along. We&apos;ll deliver our latest engineering dispatch straight to your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubscribed(false)}
                  className="text-xs text-primary underline hover:text-primary-container pt-2"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative w-full">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      required
                      className="w-full px-4 py-3 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-warm w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-full shadow-md shadow-primary/20 shrink-0 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>{isSubmitting ? "Joining..." : "Subscribe"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-xs text-error text-left pl-2">{newsletterError}</p>
                )}
              </form>
            )}

            {/* Minimal Reassurance */}
            <p className="text-[11px] font-mono text-on-surface-variant/60 pt-3 border-t border-outline-variant/30">
              Zero algorithms · Zero marketing spam · Unsubscribe anytime with 1-click
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Full Modern Footer */}
      <Footer />
    </div>
  );
}
