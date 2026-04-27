import React from "react";
import { C, FONT } from "../../theme";

interface Props {
  children: React.ReactNode;
  color: string;
}

export function Badge({ children, color }: Props) {
  return (
    <span style={{
      background: color + "26",
      border: `1px solid ${color}66`,
      color,
      fontFamily: FONT.mono,
      fontSize: "0.58rem",
      borderRadius: 4,
      padding: "0.1rem 0.45rem",
      whiteSpace: "nowrap" as const,
      letterSpacing: "0.04em",
    }}>
      {children}
    </span>
  );
}

// Convenience helpers for common badge types
export function SeverityBadge({ severity }: { severity: string }) {
  const meta: Record<string, { label: string; color: string }> = {
    low:      { label: "Low",      color: C.textDim },
    medium:   { label: "Medium",   color: C.amber   },
    high:     { label: "High",     color: C.orange  },
    critical: { label: "Critical", color: C.red     },
  };
  const m = meta[severity] ?? { label: severity, color: C.textDim };
  return <Badge color={m.color}>{m.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const meta: Record<string, { label: string; color: string }> = {
    high:   { label: "High",   color: C.red     },
    medium: { label: "Medium", color: C.amber   },
    low:    { label: "Low",    color: C.textDim },
  };
  const m = meta[priority] ?? { label: priority, color: C.textDim };
  return <Badge color={m.color}>{m.label}</Badge>;
}
