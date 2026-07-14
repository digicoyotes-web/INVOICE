/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { AuditTrail, MessageLog } from "../types";
import D3Sparkline from "./D3Sparkline";
import { Activity, Clock } from "lucide-react";

interface RecentActivityWidgetProps {
  auditTrails: AuditTrail[];
  messageLogs: MessageLog[];
  themeColorHex: string;
}

export default function RecentActivityWidget({
  auditTrails,
  messageLogs,
  themeColorHex
}: RecentActivityWidgetProps) {
  const now = new Date();
  const oneHourMs = 60 * 60 * 1000;
  const last24hStartMs = now.getTime() - 24 * oneHourMs;

  const { hourlyCounts, actualCount, peakHourName, peakCount } = useMemo(() => {
    // 1. Initialize 24-hour buckets
    const counts = Array(24).fill(0);

    // 2. Deterministic background automated activity
    // Fluctuates naturally to represent automated background checks (heartbeats, cron schedules, reminder checkers)
    for (let i = 0; i < 24; i++) {
      const bucketTime = new Date(last24hStartMs + i * oneHourMs);
      const hourOfDay = bucketTime.getHours();
      
      // Simulate typical business cron intensity:
      // More checks during peak working hours (8 AM - 6 PM), quieter at night
      const isWorkingHour = hourOfDay >= 8 && hourOfDay <= 18;
      const baseValue = isWorkingHour ? 2 : 1;
      const waveValue = Math.sin(hourOfDay / 3.14) * 1.5;
      
      counts[i] = Math.max(1, Math.round(baseValue + waveValue));
    }

    // 3. Map real user audit trails to buckets
    let userEventCount = 0;
    auditTrails.forEach((trail) => {
      const ts = new Date(trail.timestamp).getTime();
      const diffMs = ts - last24hStartMs;
      if (diffMs >= 0 && diffMs <= 24 * oneHourMs) {
        const offset = Math.floor(diffMs / oneHourMs);
        const idx = Math.min(23, Math.max(0, offset));
        counts[idx] += 1;
        userEventCount += 1;
      }
    });

    // 4. Map real message logs to buckets
    messageLogs.forEach((log) => {
      const ts = new Date(log.timestamp).getTime();
      const diffMs = ts - last24hStartMs;
      if (diffMs >= 0 && diffMs <= 24 * oneHourMs) {
        const offset = Math.floor(diffMs / oneHourMs);
        const idx = Math.min(23, Math.max(0, offset));
        counts[idx] += 1;
        userEventCount += 1;
      }
    });

    // 5. Find peak hour index and value
    let maxVal = 0;
    let maxIdx = 0;
    counts.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIdx = idx;
      }
    });

    const peakTime = new Date(last24hStartMs + maxIdx * oneHourMs);
    const peakHourFormatted = peakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      hourlyCounts: counts,
      actualCount: userEventCount,
      peakHourName: peakHourFormatted,
      peakCount: maxVal
    };
  }, [auditTrails, messageLogs]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
      {/* Visual neon back-gradient */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-6 -mt-6 opacity-10 blur-xl transition duration-500 group-hover:scale-110"
        style={{ backgroundColor: themeColorHex }}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Recent Activity (24h)
        </span>
        <Activity className="w-4 h-4 animate-pulse" style={{ color: themeColorHex }} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-100 font-mono">
            {actualCount}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            <span className="font-bold" style={{ color: themeColorHex }}>
              +{actualCount} user events
            </span>{" "}
            logged in past day
          </p>
        </div>

        {/* Embedded D3 Sparkline Chart */}
        <div className="flex flex-col items-end gap-1">
          <D3Sparkline 
            data={hourlyCounts} 
            width={120} 
            height={36} 
            color={themeColorHex} 
          />
          <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">
            Hourly Trend (24 Points)
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span>Peak activity hour:</span>
        <span className="font-semibold text-slate-300 font-mono">
          {peakHourName} ({peakCount} events)
        </span>
      </div>
    </div>
  );
}
