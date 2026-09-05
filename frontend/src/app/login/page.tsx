"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuroraShader } from "@/components/AuroraShader";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    setIsSubmitting(true);

    try {
      const res = await api.auth.login({ email, password });
      login(res.token, res.author);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden py-12 px-4 sm:px-6">
      <AuroraShader />

      {/* Decorative Blur Orbs */}
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
            Welcome back to blogit
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
            Don&apos;t just think, blog it. Pick up right where you left off.
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

          {/* Social Access buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-surface-container-low/80 hover:bg-white border border-primary/10 hover:border-primary/30 text-on-surface text-xs sm:text-sm font-medium shadow-sm transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full h-px bg-outline-variant/40" />
            <span className="absolute px-3 bg-white text-[11px] uppercase tracking-widest text-secondary font-medium">
              or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-4 pr-11 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-xl border border-primary/15 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <label
                htmlFor="passwordInput"
                className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
              >
                Password
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

            <div className="flex items-center justify-between pt-1 pb-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface-variant hover:text-on-surface transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary bg-surface-container-low border border-primary/30 accent-primary focus:ring-0 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
              <span className="text-secondary hover:text-primary cursor-pointer transition-colors">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-warm w-full py-3.5 text-sm font-semibold disabled:opacity-60"
            >
              <span>
                {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footnote */}
        <div className="mt-6 text-center text-xs text-on-surface-variant">
          New to blogit?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-semibold ml-1 transition-all"
          >
            Create an account free
          </Link>
        </div>
      </div>
    </div>
  );
}
