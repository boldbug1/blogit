"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";

type StrengthLevel = "Weak" | "Medium" | "Fine" | "Strong";

interface PasswordStrength {
  score: number;
  label: StrengthLevel | "";
  colorClass: string;
  badgeBgClass: string;
  barColorClass: string;
}

function evaluatePasswordStrength(pass: string): PasswordStrength {
  if (!pass) {
    return {
      score: 0,
      label: "",
      colorClass: "",
      badgeBgClass: "",
      barColorClass: "",
    };
  }

  let score = 0;
  if (pass.length >= 8) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;

  if (pass.length < 6) {
    score = 1;
  } else if (pass.length >= 10 && score >= 3) {
    score = 4;
  }

  if (score <= 1) {
    return {
      score: 1,
      label: "Weak",
      colorClass: "text-red-600",
      badgeBgClass: "bg-red-50 text-red-700 border-red-200",
      barColorClass: "bg-red-500",
    };
  } else if (score === 2) {
    return {
      score: 2,
      label: "Medium",
      colorClass: "text-amber-600",
      badgeBgClass: "bg-amber-50 text-amber-700 border-amber-200",
      barColorClass: "bg-amber-500",
    };
  } else if (score === 3) {
    return {
      score: 3,
      label: "Fine",
      colorClass: "text-emerald-600",
      badgeBgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      barColorClass: "bg-emerald-500",
    };
  } else {
    return {
      score: 4,
      label: "Strong",
      colorClass: "text-emerald-800",
      badgeBgClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      barColorClass: "bg-emerald-700",
    };
  }
}

export default function SignUpPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const { mode, toggleMode } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  // Live check username availability with debounce
  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setUsernameStatus("idle");
      setUsernameMsg(null);
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await api.auth.checkUsername(trimmed);
        if (res.available) {
          setUsernameStatus("available");
          setUsernameMsg("Username is available");
        } else {
          setUsernameStatus("taken");
          setUsernameMsg(
            res.message || "Username is already taken. Please choose another."
          );
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [name]);

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (usernameStatus === "taken") {
      setError("Username is already taken. Please choose another.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Register author
      await api.auth.register({ name: name.trim(), email, password });

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

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden py-12 px-4 sm:px-6 bg-background text-on-surface transition-colors duration-200">
      {/* Top-left Brand Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20">
        <Logo size="lg" />
      </div>

      {/* Top-right Dark Mode Toggle */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-20">
        <button
          type="button"
          onClick={toggleMode}
          className="p-2.5 rounded-lg text-on-surface-variant hover:text-on-surface bg-surface border border-outline-variant/40 shadow-xs hover:bg-surface-container-low transition-colors"
          aria-label="Toggle dark mode"
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mode === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-secondary" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl text-on-surface font-headline font-bold tracking-tight">
            Create your account
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
            Don&apos;t just think, blog it.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-surface border border-outline-variant/50 shadow-xl rounded-lg p-8 md:p-10 relative transition-colors duration-200">
          {error && (
            <div className="mb-5 p-3.5 rounded-md bg-error/10 border border-error/20 flex items-center gap-2.5 text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <div className="relative">
                <input
                  id="nameInput"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  className={`peer w-full px-4 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-md border ${
                    usernameStatus === "taken"
                      ? "border-error focus:border-error focus:ring-error/20"
                      : usernameStatus === "available"
                      ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                      : "border-outline-variant/50 focus:border-primary focus:ring-primary/20"
                  } focus:outline-none focus:bg-surface focus:ring-2 transition-all duration-200`}
                />
                <label
                  htmlFor="nameInput"
                  className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
                >
                  Username
                </label>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {usernameStatus === "checking" && (
                    <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                  )}
                  {usernameStatus === "available" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  {usernameStatus === "taken" && (
                    <AlertCircle className="w-4 h-4 text-error" />
                  )}
                </div>
              </div>

              {/* Username status message */}
              {usernameStatus === "taken" && usernameMsg && (
                <p className="text-[11px] text-error flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{usernameMsg}</span>
                </p>
              )}
              {usernameStatus === "available" && usernameMsg && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{usernameMsg}</span>
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                id="emailInput"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-md border border-outline-variant/50 focus:outline-none focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              <label
                htmlFor="emailInput"
                className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
              >
                Email address
              </label>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <input
                  id="passwordInput"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full pl-4 pr-11 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-md border border-outline-variant/50 focus:outline-none focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-secondary font-medium">
                      Password strength:
                    </span>
                    <span className={`font-semibold ${strength.colorClass}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= strength.score
                            ? strength.barColorClass
                            : "bg-outline-variant/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative">
                <input
                  id="confirmPasswordInput"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  className={`peer w-full pl-4 pr-11 pt-5 pb-2 text-sm bg-surface-container-low/60 text-on-surface rounded-md border ${
                    confirmPassword && confirmPassword !== password
                      ? "border-error focus:border-error focus:ring-error/20"
                      : confirmPassword && confirmPassword === password
                      ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                      : "border-outline-variant/50 focus:border-primary focus:ring-primary/20"
                  } focus:outline-none focus:bg-surface focus:ring-2 transition-all duration-200`}
                />
                <label
                  htmlFor="confirmPasswordInput"
                  className="absolute text-xs text-secondary duration-200 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary pointer-events-none font-medium"
                >
                  Confirm password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Confirm password status message */}
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-error flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Passwords do not match</span>
                </p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Passwords match</span>
                </p>
              )}
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
              disabled={
                isSubmitting ||
                usernameStatus === "taken" ||
                (confirmPassword !== "" && confirmPassword !== password)
              }
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
