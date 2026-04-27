import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { btn, fmtDate } from "../ui/helpers";
import { EVENT_TYPE_META, ACTION_STATUS_META } from "../ui/helpers";

export function ReportsView() {
  const { settings, projects, sprints, events, actionItems, retrospectives, activeProjectFilter } = useStore();
  const ac = settings.accentColor;
  const [selectedRetroId, setSelectedRetroId] = useState<string | null>(null);

  const filtered = retrospectives
    .filter((r) => {
      if (activeProjectFilter && r.projectId !== activeProjectFilter) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  if (selectedRetroId) {
    const retro = retrospectives.find((r) => r.id === selectedRetroId);
    if (!retro) return null;
    const project = projects.find((p) => p.id === retro.projectId);
    const sprint = sprints.find((s) => s.id === retro.sprintId);

    const renderEventsList = (ids: string[], emptyMsg: string) => (
      ids.length === 0 ? (
        <p style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.textVeryDim }}>{emptyMsg}</p>
      ) : (
        ids.map((id) => {
          const evt = events.find((e) => e.id === id);
          if (!evt) return null;
          const meta = EVENT_TYPE_META[evt.type];
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span>{meta.icon}</span>
              <span style={{ fontSize: "0.78rem", color: C.text, flex: 1 }}>{evt.title}</span>
              <Badge color={meta.color}>{meta.label}</Badge>
            </div>
          );
        })
      )
    );

    return (
      <div>
        {/* Back */}
        <button
          style={{ ...btn(C.textDim), marginBottom: "1.25rem" }}
          onClick={() => setSelectedRetroId(null)}
        >
          ← Close
        </button>

        {/* Header */}
        <Card style={{ marginBottom: "1rem", background: C.surfaceAlt }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
            <div>
              <span style={{ fontFamily: FONT.display, fontSize: "1.1rem", color: C.text }}>
                {sprint?.label ?? "Retrospective"}
              </span>
              {project && (
                <Badge color={project.color} >{project.name}</Badge>
              )}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>
                {fmtDate(sprint?.startDate ?? "")} → {fmtDate(sprint?.endDate ?? "")}
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginTop: 2 }}>
                Retro date: {fmtDate(retro.date)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
              Facilitator: <span style={{ color: C.textSoft }}>{retro.facilitator || "—"}</span>
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
              Participants: <span style={{ color: C.textSoft }}>{retro.participants || "—"}</span>
            </span>
          </div>
          <div>
            <span style={{ fontFamily: FONT.mono, fontSize: "1.4rem", fontWeight: "bold", color: C.cyan }}>
              {retro.teamMood}
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, marginLeft: 6 }}>
              Team Mood /10
            </span>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <Badge color={retro.status === "completed" ? C.green : C.amber}>
              {retro.status === "completed" ? "Completed" : "Draft"}
            </Badge>
          </div>
        </Card>

        {/* Went Well */}
        <Card style={{ background: C.green + "0d", marginBottom: "1rem" }}>
          <SectionTitle accent={C.green}>✅ Went Well</SectionTitle>
          {renderEventsList(retro.wentWellIds, "Nothing recorded.")}
        </Card>

        {/* To Improve */}
        <Card style={{ background: C.amber + "0d", marginBottom: "1rem" }}>
          <SectionTitle accent={C.amber}>🔧 To Improve</SectionTitle>
          {renderEventsList(retro.toImproveIds, "Nothing recorded.")}
        </Card>

        {/* Ideas */}
        <Card style={{ background: C.cyan + "0d", marginBottom: "1rem" }}>
          <SectionTitle accent={C.cyan}>💡 Ideas & Suggestions</SectionTitle>
          {renderEventsList(retro.ideasIds, "Nothing recorded.")}
        </Card>

        {/* Action Items */}
        <Card style={{ marginBottom: "1rem" }}>
          <SectionTitle accent={C.violet}>⚡ Action Items</SectionTitle>
          {retro.actionIds.length === 0 ? (
            <p style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.textVeryDim }}>No actions defined.</p>
          ) : (
            retro.actionIds.map((id) => {
              const action = actionItems.find((a) => a.id === id);
              if (!action) return null;
              const statusMeta = ACTION_STATUS_META[action.status];
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.78rem", color: C.text, flex: 1 }}>{action.title}</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>{action.owner}</span>
                  <Badge color={action.priority === "high" ? C.red : action.priority === "medium" ? C.amber : C.textDim}>
                    {action.priority}
                  </Badge>
                  <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
                  {action.dueDate && (
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim }}>
                      {fmtDate(action.dueDate)}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </Card>

        {/* Notes */}
        <Card style={{ marginBottom: "1rem" }}>
          <SectionTitle accent={ac}>Facilitator Notes</SectionTitle>
          {retro.notes ? (
            <p style={{ fontSize: "0.82rem", color: C.textSoft, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {retro.notes}
            </p>
          ) : (
            <p style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.textVeryDim }}>No notes.</p>
          )}
        </Card>

        <button style={{ ...btn(C.textDim) }} onClick={() => setSelectedRetroId(null)}>← Close</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Reports</h2>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
          {filtered.length} retrospective{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <FilterBar showSprint={false} />

      {filtered.length === 0 ? (
        <EmptyState message="No retrospective reports yet. Use the RetroBoard to generate reports." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {filtered.map((retro) => {
            const project = projects.find((p) => p.id === retro.projectId);
            const sprint = sprints.find((s) => s.id === retro.sprintId);
            return (
              <Card
                key={retro.id}
                onClick={() => setSelectedRetroId(retro.id)}
                style={{ cursor: "pointer", borderLeft: `3px solid ${project?.color ?? C.textDim}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FONT.display, fontSize: "1rem", color: C.text, flex: 1 }}>
                    {sprint?.label ?? "Retrospective"}
                  </span>
                  <Badge color={retro.status === "completed" ? C.green : C.amber}>
                    {retro.status}
                  </Badge>
                </div>
                {project && <Badge color={project.color}>{project.name}</Badge>}
                <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginTop: "0.4rem" }}>
                  {fmtDate(retro.date)} · Facilitator: {retro.facilitator || "—"}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>
                  <span>✅ {retro.wentWellIds.length}</span>
                  <span>🔧 {retro.toImproveIds.length}</span>
                  <span>💡 {retro.ideasIds.length}</span>
                  <span>⚡ {retro.actionIds.length} actions</span>
                  <span style={{ color: C.cyan, marginLeft: "auto" }}>Mood: {retro.teamMood}/10</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
