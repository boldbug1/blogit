"use client";

import React, { useMemo, useState } from "react";
import { BlogSummary } from "@/lib/api";
import { Flame, Trophy, Calendar, Sparkles } from "lucide-react";

interface ContributionStreakProps {
  blogs: BlogSummary[];
}

export function ContributionStreak({ blogs }: ContributionStreakProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    count: number;
    formattedDate: string;
  } | null>(null);

  // Compute posts by date, streaks, and heatmap grid
  const {
    weeks,
    monthLabels,
    currentStreak,
    longestStreak,
    totalPostsThisYear,
  } = useMemo(() => {
    // 1. Tally posts per YYYY-MM-DD
    const postsByDate: Record<string, number> = {};
    blogs.forEach((b) => {
      if (!b.created_at) return;
      const d = new Date(b.created_at);
      if (isNaN(d.getTime())) return;
      // Format as YYYY-MM-DD in local time
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      postsByDate[key] = (postsByDate[key] || 0) + 1;
    });

    // 2. Generate 52 weeks ending today (364 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the end date: end of current week (Saturday)
    const endDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = 6 - endDayOfWeek;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilSaturday);

    // 52 weeks = 364 days
    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    const generatedWeeks: Array<
      Array<{
        date: Date;
        key: string;
        count: number;
        isToday: boolean;
        isFuture: boolean;
        formattedDate: string;
      }>
    > = [];

    const monthLabelsList: Array<{ label: string; weekIndex: number }> = [];
    let lastMonth = -1;

    let curr = new Date(startDate);
    let currentWeek: Array<{
      date: Date;
      key: string;
      count: number;
      isToday: boolean;
      isFuture: boolean;
      formattedDate: string;
    }> = [];

    let totalThisYear = 0;

    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(curr);
      const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;
      const count = postsByDate[key] || 0;
      const isToday = dayDate.getTime() === today.getTime();
      const isFuture = dayDate.getTime() > today.getTime();

      if (!isFuture && count > 0) {
        totalThisYear += count;
      }

      // Check month change for header label
      const monthIndex = dayDate.getMonth();
      if (monthIndex !== lastMonth && dayDate.getDate() <= 7) {
        const weekIdx = Math.floor(i / 7);
        const monthShort = dayDate.toLocaleString("default", { month: "short" });
        monthLabelsList.push({ label: monthShort, weekIndex: weekIdx });
        lastMonth = monthIndex;
      }

      const formattedDate = dayDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      currentWeek.push({
        date: dayDate,
        key,
        count: isFuture ? 0 : count,
        isToday,
        isFuture,
        formattedDate,
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    // 3. Compute Current Streak & Longest Streak
    let currStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Check from today backwards for current streak
    const checkDate = new Date(today);
    const todayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    
    // If today has posts, start counting today. Otherwise check yesterday.
    let started = false;
    if ((postsByDate[todayKey] || 0) > 0) {
      started = true;
      currStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      if ((postsByDate[yesterdayKey] || 0) > 0) {
        started = true;
        currStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    if (started) {
      while (true) {
        const k = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
        if ((postsByDate[k] || 0) > 0) {
          currStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Compute longest streak in the whole dataset
    const sortedKeys = Object.keys(postsByDate).sort();
    if (sortedKeys.length > 0) {
      tempStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < sortedKeys.length; i++) {
        const prev = new Date(sortedKeys[i - 1]);
        const currDate = new Date(sortedKeys[i]);
        const diffTime = currDate.getTime() - prev.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    if (currStreak > maxStreak) {
      maxStreak = currStreak;
    }

    return {
      weeks: generatedWeeks,
      monthLabels: monthLabelsList,
      currentStreak: currStreak,
      longestStreak: maxStreak,
      totalPostsThisYear: totalThisYear,
    };
  }, [blogs]);

  // Color mapping based on activity level
  const getCellColor = (count: number, isFuture: boolean) => {
    if (isFuture) return "bg-transparent opacity-0 cursor-default";
    if (count === 0) return "bg-surface-container-high/60 hover:bg-surface-container-highest border border-outline-variant/20";
    if (count === 1) return "bg-primary/25 hover:bg-primary/35 border border-primary/30";
    if (count === 2) return "bg-primary/60 hover:bg-primary/70 border border-primary/50 text-white";
    return "bg-primary hover:bg-primary/90 border border-primary/70";
  };

  return (
    <div className="p-6 sm:p-7 rounded-lg bg-surface border border-outline-variant/40 shadow-sm space-y-6">
      {/* Header & Streak Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/25">
        <div>
          <h2 className="font-headline text-2xl text-on-surface font-bold tracking-tight flex items-center gap-2">
            <span>Writing Activity &amp; Streaks</span>
            {currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/15 text-primary border border-primary/25 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-primary" /> Active Streak
              </span>
            )}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {totalPostsThisYear} {totalPostsThisYear === 1 ? "post" : "posts"} published across the past year
          </p>
        </div>

        {/* 3 Metric Badges */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container-low border border-outline-variant/30">
            <Flame className="w-4 h-4 text-primary shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-mono">
                Current Streak
              </div>
              <div className="font-bold text-on-surface text-sm">
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container-low border border-outline-variant/30">
            <Trophy className="w-4 h-4 text-secondary shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-mono">
                Longest Streak
              </div>
              <div className="font-bold text-on-surface text-sm">
                {longestStreak} {longestStreak === 1 ? "day" : "days"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid (Scrollable horizontally on smaller screens) */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="min-w-[720px] space-y-2">
          {/* Month labels row */}
          <div className="flex text-[10px] font-mono text-on-surface-variant pl-7 h-4 relative">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                style={{
                  position: "absolute",
                  left: `${m.weekIndex * 14 + 28}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid with Day-of-week labels */}
          <div className="flex gap-1.5">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-on-surface-variant/80 pr-1 h-[98px] py-0.5 select-none">
              <span className="leading-none">Sun</span>
              <span className="leading-none">Wed</span>
              <span className="leading-none">Sat</span>
            </div>

            {/* 52 Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() =>
                        !day.isFuture &&
                        setHoveredDay({
                          dateStr: day.key,
                          count: day.count,
                          formattedDate: day.formattedDate,
                        })
                      }
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[11px] h-[11px] rounded-[2.5px] transition-all duration-150 ${getCellColor(
                        day.count,
                        day.isFuture
                      )} ${
                        day.isToday
                          ? "ring-1 ring-primary ring-offset-1 ring-offset-surface"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Tooltip info + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant font-mono">
        <div className="min-h-[20px]">
          {hoveredDay ? (
            <span className="inline-flex items-center gap-1.5 text-on-surface font-sans font-medium text-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>
                <strong>{hoveredDay.count}</strong>{" "}
                {hoveredDay.count === 1 ? "post published" : "posts published"} on{" "}
                {hoveredDay.formattedDate}
              </span>
            </span>
          ) : (
            <span className="text-on-surface-variant/70 text-[11px]">
              Hover over a square to view writing activity
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-container-high/60 border border-outline-variant/20" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-primary/25 border border-primary/30" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-primary/60 border border-primary/50" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-primary border border-primary/70" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
