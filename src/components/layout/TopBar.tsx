import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import type { ViewId } from "../../types";

const TABS: { id: ViewId; label: string }[] = [
  { id: "dashboard",  label: "Dashboard" },
  { id: "projects",   label: "Projects" },
  { id: "sprints",    label: "Sprints" },
  { id: "logbook",    label: "Logbook" },
  { id: "events",     label: "Events" },
  { id: "retroboard", label: "RetroBoard" },
  { id: "actions",    label: "Actions" },
  { id: "reports",    label: "Reports" },
  { id: "userguide",  label: "📖 User Guide" },
  { id: "settings",   label: "⚙ Settings" },
];

export function TopBar() {
  const {
    settings, activeView, setActiveView,
    teamEnergy, teamFocus, teamSatisfaction,
  } = useStore();
  const ac = settings.accentColor;

  return (
    <header style={{ background: C.bgDeep, borderBottom: `1px solid ${C.border}` }}>
      {/* Row 1 — Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        padding: "0 1.25rem", height: 52,
      }}>
        {/* Logo */}
        <div style={{
          width: 26, height: 26, borderRadius: 6, flexShrink: 0,
          background: `linear-gradient(135deg, ${ac}, ${C.violet})`,
        }} />
        {/* Name */}
        <span style={{ fontFamily: FONT.display, fontSize: "1.1rem", color: ac }}>
          {settings.name}
        </span>
        {/* Separator */}
        <span style={{ color: C.textVeryDim, fontSize: "1rem" }}>|</span>
        {/* Tagline */}
        <span style={{
          fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          {settings.tagline}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Health indicator */}
        <div
          onClick={() => setActiveView("dashboard")}
          style={{ display: "flex", gap: "0.75rem", cursor: "pointer", alignItems: "center" }}
          title="Team Health — click to view Dashboard"
        >
          {[
            { value: teamEnergy,       color: C.green, label: "E" },
            { value: teamFocus,        color: C.cyan,  label: "F" },
            { value: teamSatisfaction, color: C.amber, label: "S" },
          ].map(({ value, color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontFamily: FONT.mono, fontSize: "0.58rem", color }}>
                {value}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — Navigation */}
      <nav style={{
        display: "flex", gap: 0,
        padding: "0 1.25rem",
        borderTop: `1px solid ${C.border}`,
      }}>
        {TABS.map(({ id, label }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${ac}` : "2px solid transparent",
                color: active ? ac : C.textDim,
                fontFamily: FONT.mono,
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                padding: "0.6rem 0.85rem",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
