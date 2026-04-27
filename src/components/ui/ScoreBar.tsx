import { C, FONT } from "../../theme";

interface Props {
  value: number; // 1-5
  color: string;
  label?: string;
}

export function ScoreBar({ value, color, label }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      {label && (
        <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, minWidth: 56 }}>
          {label}
        </span>
      )}
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i <= value ? color : C.border,
            }}
          />
        ))}
      </div>
    </div>
  );
}
