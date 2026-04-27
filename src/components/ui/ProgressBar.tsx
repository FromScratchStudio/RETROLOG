import { C } from "../../theme";

interface Props {
  value: number; // 0-100
  color: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 6 }: Props) {
  return (
    <div style={{
      background: C.border,
      borderRadius: height,
      height,
      overflow: "hidden",
      flex: 1,
    }}>
      <div style={{
        background: color,
        borderRadius: height,
        height: "100%",
        width: `${Math.max(0, Math.min(100, value))}%`,
        transition: "width 0.3s ease",
      }} />
    </div>
  );
}
