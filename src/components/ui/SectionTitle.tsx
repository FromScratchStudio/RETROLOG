import React from "react";
import { FONT } from "../../theme";

interface Props {
  children: React.ReactNode;
  accent: string;
}

export function SectionTitle({ children, accent }: Props) {
  return (
    <div style={{
      fontFamily: FONT.mono,
      fontSize: "0.62rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: accent,
      marginBottom: "0.75rem",
    }}>
      {children}
    </div>
  );
}
