import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";
import { ProgressBar } from "../ui/ProgressBar";
import { ScoreBar } from "../ui/ScoreBar";
import { EmptyState } from "../ui/EmptyState";
import { Badge, SeverityBadge } from "../ui/Badge";
import { EVENT_TYPE_META, fmtShort, fmtDueDate } from "../ui/helpers";

export function DashboardView() {
  const {
    settings, projects, sprints, events, actionItems, logEntries,
    teamEnergy, teamFocus, teamSatisfaction,
    setTeamEnergy, setTeamFocus, setTeamSatisfaction,
    setActiveView,
  } = useStore();
  const ac = settings.accentColor;

  // At a glance metrics
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const activeSprints = sprints.filter((s) => s.status === "active");
  const activeSprintIds = new Set(activeSprints.map((s) => s.id));
  const eventsThisSprint = events.filter(
    (e) => e.sprintId && activeSprintIds.has(e.sprintId) && e.status !== "archived"
  ).length;
  const openActions = actionItems.filter(
    (a) => a.status === "open" || a.status === "in-progress"
  ).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const logsThisWeek = logEntries.filter((l) => l.date >= weekAgoStr).length;

  // Events by type
  const totalEvents = events.filter((e) => e.status !== "archived").length;
  const eventsByType = Object.entries(EVENT_TYPE_META).map(([type, meta]) => ({
    type,
    ...meta,
    count: events.filter((e) => e.type === type && e.status !== "archived").length,
  }));

  // Recent events
  const recentEvents = [...events]
    .filter((e) => e.status !== "archived")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Actions due soon
  const dueSoonActions = [...actionItems]
    .filter((a) => a.status !== "done" && a.status !== "cancelled" && a.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const sliderRow = (
    label: string,
    value: number,
    color: string,
    onChange: (v: number) => void
  ) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
      <span style={{ fontFamily: FONT.mono, fontSize: "0.68rem", color: C.textDim, width: 110, flexShrink: 0 }}>
        {label}
      </span>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: color }}
      />
      <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color, fontWeight: "bold", width: 24, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );

  const glanceCard = (
    label: string,
    value: number,
    color: string,
    view: Parameters<typeof setActiveView>[0]
  ) => (
    <Card onClick={() => setActiveView(view)} style={{ textAlign: "center", padding: "1.25rem" }}>
      <div style={{ fontFamily: FONT.mono, fontSize: "1.6rem", fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, textTransform: "uppercase", marginTop: 4 }}>
        {label}
      </div>
    </Card>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.4rem", color: C.text }}>{settings.name}</h2>
        <p style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.textDim, marginTop: 4 }}>{settings.tagline}</p>
      </div>

      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Team Health */}
        <Card>
          <SectionTitle accent={C.green}>Team Health</SectionTitle>
          {sliderRow("Energy", teamEnergy, C.green, setTeamEnergy)}
          {sliderRow("Focus", teamFocus, C.cyan, setTeamFocus)}
          {sliderRow("Satisfaction", teamSatisfaction, C.amber, setTeamSatisfaction)}
        </Card>

        {/* At a Glance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {glanceCard("Active Projects", activeProjects, C.green, "projects")}
          {glanceCard("Events This Sprint", eventsThisSprint, C.cyan, "events")}
          {glanceCard("Open Actions", openActions, C.amber, "actions")}
          {glanceCard("Log Entries This Week", logsThisWeek, C.violet, "logbook")}
        </div>
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Events by Type */}
        <Card>
          <SectionTitle accent={ac}>Events by Type</SectionTitle>
          {totalEvents === 0 ? (
            <p style={{ color: C.textVeryDim, fontFamily: FONT.mono, fontSize: "0.7rem" }}>
              No events captured yet.
            </p>
          ) : (
            eventsByType.map(({ type, icon, label, color, count }) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <span style={{ width: 20, fontSize: "0.9rem" }}>{icon}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textSoft, width: 90, flexShrink: 0 }}>
                  {label}
                </span>
                <ProgressBar value={totalEvents ? (count / totalEvents) * 100 : 0} color={color} />
                <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, width: 20, textAlign: "right" }}>
                  {count}
                </span>
              </div>
            ))
          )}
        </Card>

        {/* Sprint Health */}
        <Card>
          <SectionTitle accent={ac}>Active Sprints</SectionTitle>
          {activeSprints.length === 0 ? (
            <p style={{ color: C.textVeryDim, fontFamily: FONT.mono, fontSize: "0.7rem" }}>No active sprint.</p>
          ) : (
            activeSprints.map((sprint) => {
              const project = projects.find((p) => p.id === sprint.projectId);
              const velPct = sprint.velocityPlanned > 0
                ? Math.round((sprint.velocityActual / sprint.velocityPlanned) * 100)
                : 0;
              const velColor = velPct >= 80 ? C.green : velPct >= 50 ? C.amber : C.red;
              return (
                <div key={sprint.id} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: project?.color ?? C.textDim, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.72rem", color: C.textSoft }}>{project?.name}</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
                      {sprint.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, width: 60 }}>Velocity</span>
                    <ProgressBar value={velPct} color={velColor} />
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim }}>
                      {sprint.velocityActual}/{sprint.velocityPlanned}
                    </span>
                  </div>
                  <ScoreBar value={Math.round(sprint.mood / 2)} color={C.cyan} label="Mood" />
                </div>
              );
            })
          )}
        </Card>
      </div>

      {/* Row 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Recent Events */}
        <Card>
          <SectionTitle accent={ac}>Recent Events</SectionTitle>
          {recentEvents.length === 0 ? (
            <EmptyState message="No events captured yet." />
          ) : (
            <>
              {recentEvents.map((evt) => {
                const meta = EVENT_TYPE_META[evt.type];
                const proj = projects.find((p) => p.id === evt.projectId);
                return (
                  <div key={evt.id} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <span>{meta.icon}</span>
                      <SeverityBadge severity={evt.severity} />
                      <span style={{ fontSize: "0.78rem", color: C.text, flex: 1 }}>{evt.title}</span>
                      {proj && <Badge color={proj.color}>{proj.name}</Badge>}
                    </div>
                    <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textVeryDim, marginTop: 2 }}>
                      {fmtShort(evt.createdAt)}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setActiveView("events")}
                style={{ background: "none", border: "none", color: C.textDim, fontFamily: FONT.mono, fontSize: "0.62rem", cursor: "pointer", padding: 0 }}
              >
                View all →
              </button>
            </>
          )}
        </Card>

        {/* Actions Due Soon */}
        <Card>
          <SectionTitle accent={C.amber}>Actions Due Soon</SectionTitle>
          {dueSoonActions.length === 0 ? (
            <EmptyState message="No pending actions." />
          ) : (
            <>
              {dueSoonActions.map((action) => {
                const due = fmtDueDate(action.dueDate);
                return (
                  <div key={action.id} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <Badge color={action.priority === "high" ? C.red : action.priority === "medium" ? C.amber : C.textDim}>
                        {action.priority}
                      </Badge>
                      <span style={{ fontSize: "0.78rem", color: C.text, flex: 1 }}>{action.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: 2 }}>
                      <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
                        {action.owner}
                      </span>
                      <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: due.color }}>
                        📅 {due.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setActiveView("actions")}
                style={{ background: "none", border: "none", color: C.textDim, fontFamily: FONT.mono, fontSize: "0.62rem", cursor: "pointer", padding: 0 }}
              >
                View all →
              </button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
