"use client";

import React, { useState, useEffect } from "react";

interface TypewriterSplashProps {
  /** Text to type out. Defaults to "blogit." */
  text?: string;
  /** Whether the splash animation is enabled. Set to false to disable. */
  enabled?: boolean;
  /** Callback fired when the fade out completes and landing page is fully revealed */
  onComplete?: () => void;
}

export function TypewriterSplash({
  text = "blogit.",
  enabled = true,
  onComplete,
}: TypewriterSplashProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsUnmounted(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    let timer: NodeJS.Timeout;

    // Small initial delay before typing begins
    const startDelay = setTimeout(() => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          currentIndex++;
          setDisplayedText(text.slice(0, currentIndex));
          // Slightly longer cadence before the final period for natural rhythm
          const delay =
            currentIndex === text.length - 1 ? 220 : 110 + Math.random() * 40;
          timer = setTimeout(typeNextChar, delay);
        } else {
          // Finished typing word
          setIsTypingDone(true);
          // Hold for 450ms then start smooth fade out
          timer = setTimeout(() => {
            setIsFadingOut(true);
            // After fade transition (700ms), unmount and trigger onComplete
            timer = setTimeout(() => {
              setIsUnmounted(true);
              onComplete?.();
            }, 700);
          }, 450);
        }
      };

      typeNextChar();
    }, 200);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, [text, enabled, onComplete]);

  if (isUnmounted || !enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-on-surface select-none transition-all duration-700 ease-out ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      aria-hidden="true"
    >
      {/* Subtle ambient warm glow in the center */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

      {/* Centered Typewriter Text */}
      <div className="relative flex items-baseline">
        <span className="font-headline text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-on-surface">
          {displayedText}
        </span>
        {/* Blinking Typewriter Cursor */}
        <span
          className={`inline-block w-[3px] sm:w-[4px] h-[36px] sm:h-[58px] md:h-[72px] bg-primary ml-1 rounded-xs transition-opacity duration-150 ${
            isTypingDone ? "opacity-0" : "animate-pulse"
          }`}
        />
      </div>

      {/* Minimal sub-label that gently hints during entry */}
      <p
        className={`mt-4 text-xs font-mono text-on-surface-variant uppercase tracking-widest transition-opacity duration-500 ${
          displayedText.length > 2 ? "opacity-60" : "opacity-0"
        }`}
      >
        Thoughtful Writing
      </p>
    </div>
  );
}
