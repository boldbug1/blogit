"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuroraShader } from "@/components/AuroraShader";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  if (user) {
    return null;
  }

  const handleSuccess = (token: string, author: any) => {
    login(token, author);
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden py-12 px-4 sm:px-6">
      <AuroraShader />

      <div className="absolute -top-16 -left-12 w-64 h-64 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -right-12 w-72 h-72 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top-left Brand Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl text-on-surface font-headline font-bold tracking-tight">
            Create your account
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
            Join the blogit community. Sign up with Google.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-surface/90 backdrop-blur-xl border border-primary/15 shadow-2xl shadow-primary/10 rounded-2xl p-8 md:p-10 relative">
          {error && (
            <div className="mb-5 p-3.5 rounded-md bg-error/10 border border-error/20 flex items-center gap-2.5 text-xs text-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Auth */}
          <div className="w-full">
            <GoogleSignInButton
              text="signup_with"
              onSuccess={handleSuccess}
              onError={(err) => setError(err)}
            />
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold ml-1 transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}