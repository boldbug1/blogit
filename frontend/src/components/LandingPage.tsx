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
  Check,
  Code2,
  Rss,
  Activity,
  Radio,
} from "lucide-react";
import { api } from "@/lib/api";

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    setNewsletterError("");
    setIsSubmitting(true);

    try {
      await api.newsletter.subscribe(email.trim());
      setIsSubscribed(true);
      setEmail("");
    } catch (err: any) {
      setNewsletterError(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          COMPONENT 2: BENTO GRID SECTION (Visual-First, High-Impact Showcase)
          ========================================================================= */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-24 sm:py-32 max-w-6xl mx-auto w-full text-left">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14 sm:mb-16">
           
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
              Crafted for Focus. Built for Readers.
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mt-2.5 max-w-lg mx-auto leading-relaxed">
              Experience publishing stripped down to its purest form.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1: Distraction-Free Editor (Span 2) */}
          <ScrollReveal animation="fade-up" delayMs={50} className="md:col-span-2">
            <div className="h-full p-6 sm:p-8 rounded-2xl bg-surface/90 backdrop-blur-xl border border-outline-variant/50 shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
              {/* Subtle ambient gradient mesh in background */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full pointer-events-none -z-10" />

              <div className="space-y-3 mb-6">
                <div>
                  <h3 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                    Distraction-Free Editor
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                    Contextual floating formatting, inline code blocks, tables, and instant auto-saving.
                  </p>
                </div>
              </div>

              {/* Rich Visual Editor Mockup */}
              <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3 shadow-inner">
                {/* Floating Glassmorphism Toolbar */}
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-surface border border-outline-variant/50 shadow-xs text-xs font-medium">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold">B</span>
                    <span className="px-2 py-0.5 text-on-surface-variant italic font-serif">I</span>
                    <span className="px-2 py-0.5 text-on-surface-variant line-through">S</span>
                    <span className="h-3 w-px bg-outline-variant/50 mx-0.5" />
                    <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono text-[11px] font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3" />
                      <span>Code</span>
                    </span>
                    <span className="px-2 py-0.5 text-on-surface-variant text-[11px]">Link</span>
                    <span className="px-2 py-0.5 text-on-surface-variant text-[11px]">Table</span>
                  </div>

                 
                </div>

                {/* Simulated Article Body */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-base sm:text-lg font-headline font-bold text-on-surface">
                    <span>The Architecture of Ideas</span>
                    <span className="w-0.5 h-5 bg-primary animate-pulse ml-0.5 inline-block" />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    When words flow without friction, thinking sharpens. Every paragraph connects seamlessly to build coherent mental models.
                  </p>
                </div>

                {/* Inline Syntax-Highlighted Code Pill */}
                <div className="p-3 rounded-lg bg-[#141210] border border-white/10 font-mono text-xs text-[#e6edf3] flex items-center justify-between gap-2 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[#f0883e]">export const</span>
                    <span className="text-[#79c0ff]">dispatch</span>
                    <span className="text-[#d2a8ff]">=</span>
                    <span className="text-[#7ee787]">&quot;instant&quot;</span>;
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-sans">
                    Edge MDX
                  </span>
                </div>

                {/* Telemetry Row */}
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-on-surface-variant/70 border-t border-outline-variant/20">
                  <span>642 words · 3 min read</span>
                  <span>Markdown &amp; MDX Ready</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Bento 2: Personal Publication (Span 1) */}
          <ScrollReveal animation="fade-up" delayMs={150}>
            <div className="h-full p-6 sm:p-8 rounded-2xl bg-surface/90 backdrop-blur-xl border border-outline-variant/50 shadow-sm hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
              <div className="space-y-3 mb-6">
               
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                    Your Publication
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Claim your unique namespace with free custom domain connection.
                  </p>
                </div>
              </div>

              {/* Browser Address Bar & Domain Mockup */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3 shadow-inner">
                {/* Simulated Browser Chrome */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-outline-variant/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="text-[10px] font-mono text-on-surface-variant/60 ml-2">
                    publication.preview
                  </span>
                </div>

                {/* Subdomain Pill */}
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-primary font-semibold truncate">blogit.pub/@you</span>
                  </div>
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
                    Free
                  </span>
                </div>

                {/* Custom Root Domain Pill */}
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-on-surface font-semibold truncate">writings.dev</span>
                  </div>
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shrink-0 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                </div>

                {/* Theme Palette Swatches Preview */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-on-surface-variant border-t border-outline-variant/20">
                  <span>Theme palette:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-600 ring-1 ring-white shadow-2xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-1 ring-white shadow-2xs" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 ring-1 ring-white shadow-2xs" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Bento 3: Zero Algorithms or Ads (Span 1) */}
          <ScrollReveal animation="fade-up" delayMs={250}>
            <div className="h-full p-6 sm:p-8 rounded-2xl bg-surface/90 backdrop-blur-xl border border-outline-variant/50 shadow-sm hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
              <div className="space-y-3 mb-6">
               
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                    Zero Algorithms
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Pure chronological delivery. Direct to reader feeds with RSS.
                  </p>
                </div>
              </div>

              {/* Feed Chronological Stream Visual */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2.5 shadow-inner">
                {/* Timeline Item 1 */}
                <div className="p-2 rounded-lg bg-surface border border-outline-variant/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-on-surface truncate">Modern System Design</span>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant shrink-0">Just now</span>
                </div>

                {/* Timeline Item 2 */}
                <div className="p-2 rounded-lg bg-surface border border-outline-variant/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="font-semibold text-on-surface truncate">Principles of Writing</span>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant shrink-0">1h ago</span>
                </div>

                {/* Timeline Item 3 */}
                <div className="p-2 rounded-lg bg-surface border border-outline-variant/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    <span className="font-semibold text-on-surface truncate">Simplicity in Tech</span>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant shrink-0">Yesterday</span>
                </div>

                {/* Badges */}
                <div className="pt-2 flex items-center justify-between gap-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border-t border-outline-variant/20">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>100% Chronological</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Rss className="w-3 h-3" />
                    <span>RSS Active</span>
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Bento 4: Writing Streaks & Momentum (Span 2) */}
          <ScrollReveal animation="fade-up" delayMs={350} className="md:col-span-2">
            <div className="h-full p-6 sm:p-8 rounded-2xl bg-surface/90 backdrop-blur-xl border border-outline-variant/50 shadow-sm hover:shadow-2xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                 
                 
                </div>
                <div>
                  <h3 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                    Streak Analytics &amp; Momentum
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                    Daily telemetry, GitHub-style contribution heatmaps, and habit reinforcement.
                  </p>
                </div>
              </div>

              {/* Rich Contribution Heatmap Matrix Visual */}
              <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-4 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Visual 4x16 Matrix */}
                  <div className="flex-1 space-y-1.5 overflow-x-auto pb-1">
                    <div className="grid grid-flow-col grid-rows-4 gap-1.5 w-max">
                      {[
                        1, 3, 2, 0, 4, 2, 3, 1, 4, 3, 2, 4, 3, 4, 2, 1,
                        2, 0, 3, 4, 1, 3, 2, 4, 0, 4, 3, 2, 4, 3, 1, 4,
                        3, 4, 0, 2, 3, 4, 1, 3, 4, 2, 4, 3, 2, 4, 3, 2,
                        4, 2, 3, 4, 2, 0, 4, 3, 2, 4, 3, 4, 2, 3, 4, 4,
                      ].map((intensity, idx) => {
                        const bgClass =
                          intensity === 4
                            ? "bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"
                            : intensity === 3
                            ? "bg-primary/75"
                            : intensity === 2
                            ? "bg-primary/45"
                            : intensity === 1
                            ? "bg-primary/20"
                            : "bg-surface-container-high/60";
                        return (
                          <span
                            key={idx}
                            className={`w-3.5 h-3.5 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${bgClass}`}
                            title={`Activity level: ${intensity}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 sm:pl-6 sm:border-l border-outline-variant/30 text-xs shrink-0">
                    <div>
                      <div className="font-mono text-base sm:text-lg font-extrabold text-on-surface">
                        18,420
                      </div>
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Words this month
                      </div>
                    </div>
                    <div className="pt-1">
                      <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Top: 2,410 words/day
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-on-surface-variant border-t border-outline-variant/20">
                  <span>Writing consistency: 94%</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-container-high" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-primary/25" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-primary/60" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-primary" />
                    <span>More</span>
                  </div>
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

           
          </div>
        </ScrollReveal>
      </section>

      {/* Full Modern Footer */}
      <Footer />
    </div>
  );
}
