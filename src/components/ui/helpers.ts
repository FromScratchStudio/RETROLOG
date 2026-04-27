import React from "react";
import { C, FONT } from "../../theme";

export const EVENT_TYPE_META = {
  idea:        { icon: "💡", label: "Idea",        color: C.cyan      },
  problem:     { icon: "⚠️",  label: "Problem",     color: C.amber     },
  success:     { icon: "✅", label: "Success",     color: C.green     },
  blocker:     { icon: "🚫", label: "Blocker",     color: C.red       },
  risk:        { icon: "🔺", label: "Risk",        color: C.orange    },
  decision:    { icon: "⚡", label: "Decision",    color: C.violet    },
  observation: { icon: "👁",  label: "Observation", color: C.textMuted },
} as const;

export const SEVERITY_META = {
  low:      { label: "Low",      color: C.textDim },
  medium:   { label: "Medium",   color: C.amber   },
  high:     { label: "High",     color: C.orange  },
  critical: { label: "Critical", color: C.red     },
} as const;

export const EVENT_STATUS_META = {
  raw:        { label: "Raw",        color: C.textDim     },
  analyzed:   { label: "Analyzed",   color: C.blue        },
  actionable: { label: "Actionable", color: C.amber       },
  resolved:   { label: "Resolved",   color: C.green       },
  archived:   { label: "Archived",   color: C.textVeryDim },
} as const;

export const ACTION_STATUS_META = {
  "open":        { label: "Open",        color: C.amber   },
  "in-progress": { label: "In Progress", color: C.cyan    },
  "done":        { label: "Done",        color: C.green   },
  "cancelled":   { label: "Cancelled",   color: C.textDim },
} as const;

export const iStyle: React.CSSProperties = {
  background: C.surfaceAlt,
  border: `1px solid ${C.border}`,
  borderRadius: 5,
  padding: "0.35rem 0.55rem",
  fontSize: "0.78rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: C.text,
};

export const btn = (color: string): React.CSSProperties => ({
  background: color + "22",
  border: `1px solid ${color}44`,
  color,
  borderRadius: 5,
  padding: "0.3rem 0.7rem",
  fontSize: "0.72rem",
  fontFamily: FONT.mono,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
});

export function fmtDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtShort(d: string): string {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function fmtDueDate(d: string): { label: string; color: string } {
  if (!d) return { label: "—", color: C.textVeryDim };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d + "T00:00:00");
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: "Overdue", color: C.red };
  if (diff === 0) return { label: "Today", color: C.amber };
  if (diff === 1) return { label: "Tomorrow", color: C.amber };
  return { label: fmtShort(d), color: C.textDim };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function genId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
