"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuroraShader } from "@/components/AuroraShader";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Register author
      await api.auth.register({ name, email, password });

      // 2. Automatically log in to retrieve JWT token
      const loginRes = await api.auth.login({ email, password });
      login(loginRes.token, loginRes.author);

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden py-12 px-4 sm:px-6">
      <AuroraShader />

      <div className="absolute -top-16 -left-12 w-64 h-64 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -right-12 w-72 h-72 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-primary/20 shadow-[0_8px_20px_rgba(194,101,42,0.12)] animate-float">
            <Logo showText={false} className="h-10 w-10" />
          </div>
          <span className="text-xs uppercase tracking-[0.25em] font-medium text-secondary mb-1">
            blogit
          </span>
          <h1 className="text-3xl sm:text-4xl text-on-surface font-headline font-bold tracking-tight">
            Create your account
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
            Don&apos;t just think, blog it. A calm sanctuary for your thoughts and
            writing.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/85 backdrop-blur-xl border border-primary/15 shadow-2xl shadow-primary/10 rounded-2xl p-8 md:p-10 relative">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="nameInput"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-xl border border-primary/15 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <label
                htmlFor="nameInput"
                className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
              >
                Full name or pseudonym
              </label>
            </div>

            <div className="relative">
              <input
                id="emailInput"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-xl border border-primary/15 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <label
                htmlFor="emailInput"
                className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
              >
                Email address
              </label>
            </div>

            <div className="relative">
              <input
                id="passwordInput"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-4 pr-11 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-xl border border-primary/15 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <label
                htmlFor="passwordInput"
                className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
              >
                Password (min. 8 characters)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="py-2 space-y-1.5 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Instant personal blog link</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Zero algorithms or ads</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-warm w-full py-3.5 text-sm font-semibold disabled:opacity-60"
            >
              <span>
                {isSubmitting ? "Creating Account..." : "Get Started"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold ml-1 transition-all"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
