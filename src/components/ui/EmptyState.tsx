import { C, FONT } from "../../theme";
import { Card } from "./Card";

interface Props {
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ message, action }: Props) {
  const btn = (color: string): React.CSSProperties => ({
    background: color + "22",
    border: `1px solid ${color}44`,
    color,
    borderRadius: 5,
    padding: "0.3rem 0.7rem",
    fontSize: "0.72rem",
    fontFamily: FONT.mono,
    cursor: "pointer",
    marginTop: "0.75rem",
  });

  return (
    <Card style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
      <p style={{ color: C.textVeryDim, fontFamily: FONT.mono, fontSize: "0.7rem" }}>
        {message}
      </p>
      {action && (
        <button style={btn(C.cyan)} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </Card>
  );
}
