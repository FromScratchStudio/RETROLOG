import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { ProgressBar } from "../ui/ProgressBar";
import { ScoreBar } from "../ui/ScoreBar";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { btn, iStyle, genId, todayISO, fmtDate } from "../ui/helpers";
import type { Sprint, SprintStatus } from "../../types";

const SPRINT_STATUS_META = {
  planned:   { label: "Planned",   color: "#555b70" },
  active:    { label: "Active",    color: "#10b981" },
  completed: { label: "Completed", color: "#4c7fc9" },
} as const;

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: FONT.mono, fontSize: "0.62rem",
  color: C.textDim, marginBottom: 4, letterSpacing: "0.06em",
};

function SprintForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Sprint>;
  onSave: (s: Sprint) => void;
  onCancel: () => void;
}) {
  const { settings, projects, sprints } = useStore();
  const ac = settings.accentColor;
  const activeProjects = projects.filter((p) => p.status !== "archived");

  const [projectId, setProjectId] = useState(initial?.projectId ?? activeProjects[0]?.id ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO());
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [status, setStatus] = useState<SprintStatus>(initial?.status ?? "planned");
  const [velocityPlanned, setVelocityPlanned] = useState(initial?.velocityPlanned ?? 0);
  const [velocityActual, setVelocityActual] = useState(initial?.velocityActual ?? 0);
  const [mood, setMood] = useState(initial?.mood ?? 7);
  const [note, setNote] = useState(initial?.note ?? "");

  function save() {
    if (!label.trim() || !projectId) return;
    const existingCount = sprints.filter((s) => s.projectId === projectId).length;
    onSave({
      id: initial?.id ?? genId("spr"),
      projectId,
      number: initial?.number ?? existingCount + 1,
      label: label.trim(),
      goal: goal.trim(),
      startDate,
      endDate,
      status,
      velocityPlanned: Number(velocityPlanned),
      velocityActual: Number(velocityActual),
      mood: Number(mood),
      note: note.trim(),
    });
  }

  return (
    <Card style={{ marginBottom: "1rem" }}>
      <SectionTitle accent={ac}>{initial?.id ? "Edit Sprint" : "New Sprint"}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Project *</label>
          <select style={iStyle} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Label *</label>
          <input style={iStyle} value={label} onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }}
            placeholder="e.g. Sprint 3" autoFocus />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Goal</label>
          <textarea style={{ ...iStyle, resize: "vertical" }} rows={2} value={goal}
            onChange={(e) => setGoal(e.target.value)} placeholder="Sprint goal…" />
        </div>
        <div>
          <label style={labelStyle}>Start Date *</label>
          <input type="date" style={iStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>End Date *</label>
          <input type="date" style={iStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={iStyle} value={status} onChange={(e) => setStatus(e.target.value as SprintStatus)}>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Velocity Planned</label>
          <input type="number" min={0} style={iStyle} value={velocityPlanned} onChange={(e) => setVelocityPlanned(Number(e.target.value))} />
        </div>
        <div>
          <label style={labelStyle}>Velocity Actual</label>
          <input type="number" min={0} style={iStyle} value={velocityActual} onChange={(e) => setVelocityActual(Number(e.target.value))} />
        </div>
        <div>
          <label style={labelStyle}>Mood (1–10): {mood}</label>
          <input type="range" min={1} max={10} value={mood} onChange={(e) => setMood(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.cyan }} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Note</label>
          <textarea style={{ ...iStyle, resize: "vertical" }} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={save}>✓ Save</button>
        <button style={btn(C.textDim)} onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

export function SprintsView() {
  const {
    settings, projects, sprints, events, actionItems, logEntries,
    activeProjectFilter,
    addSprint, updateSprint, removeSprint,
  } = useStore();
  const ac = settings.accentColor;
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = activeProjectFilter
    ? sprints.filter((s) => s.projectId === activeProjectFilter).sort((a, b) => b.number - a.number)
    : [...sprints].sort((a, b) => b.startDate.localeCompare(a.startDate));

  const grouped: Record<string, Sprint[]> = {};
  if (!activeProjectFilter) {
    for (const s of filtered) {
      if (!grouped[s.projectId]) grouped[s.projectId] = [];
      grouped[s.projectId].push(s);
    }
  }

  function renderSprint(sprint: Sprint) {
    if (editingId === sprint.id) {
      return (
        <SprintForm
          key={sprint.id}
          initial={sprint}
          onSave={(s) => { updateSprint(s.id, s); setEditingId(null); }}
          onCancel={() => setEditingId(null)}
        />
      );
    }

    const project = projects.find((p) => p.id === sprint.projectId);
    const statusMeta = SPRINT_STATUS_META[sprint.status];
    const velPct = sprint.velocityPlanned > 0
      ? Math.round((sprint.velocityActual / sprint.velocityPlanned) * 100)
      : 0;
    const velColor = velPct >= 80 ? C.green : velPct >= 50 ? C.amber : C.red;
    const evtCount = events.filter((e) => e.sprintId === sprint.id).length;
    const actCount = actionItems.filter((a) => a.sprintId === sprint.id || a.targetSprintId === sprint.id).length;
    const logCount = logEntries.filter((l) => l.sprintId === sprint.id).length;
    const isDeleting = confirmDeleteId === sprint.id;

    return (
      <Card key={sprint.id} style={{ borderLeft: `3px solid ${project?.color ?? C.border}`, marginBottom: "0.75rem" }}>
        {/* Row 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
          <span style={{ fontFamily: FONT.display, fontSize: "1rem", color: C.text, flex: 1 }}>{sprint.label}</span>
          {!isDeleting && (
            <>
              <button style={{ ...btn(C.textDim), padding: "0.2rem 0.45rem" }} onClick={() => setEditingId(sprint.id)}>✎</button>
              <button style={{ ...btn(C.red), padding: "0.2rem 0.45rem" }} onClick={() => setConfirmDeleteId(sprint.id)}>×</button>
            </>
          )}
        </div>
        {/* Dates */}
        <div style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, marginBottom: "0.4rem" }}>
          {fmtDate(sprint.startDate)} → {fmtDate(sprint.endDate)}
        </div>
        {/* Goal */}
        <div style={{ fontSize: "0.78rem", color: sprint.goal ? C.textSoft : C.textVeryDim, fontStyle: sprint.goal ? undefined : "italic", marginBottom: "0.5rem" }}>
          {sprint.goal || "No goal defined"}
        </div>
        {/* Velocity */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, width: 65, flexShrink: 0 }}>Velocity</span>
          <ProgressBar value={velPct} color={velColor} />
          <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>
            {sprint.velocityActual}/{sprint.velocityPlanned}
          </span>
        </div>
        {/* Mood */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, width: 65, flexShrink: 0 }}>Mood</span>
          <ScoreBar value={Math.round(sprint.mood / 2)} color={C.cyan} />
          <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.cyan }}>{sprint.mood}/10</span>
        </div>
        {/* Note */}
        {sprint.note && (
          <div style={{ fontSize: "0.72rem", color: C.textSoft, background: C.surfaceAlt, borderRadius: 6, padding: "0.5rem", marginBottom: "0.4rem" }}>
            {sprint.note}
          </div>
        )}
        {/* Counters */}
        <div style={{ display: "flex", gap: "0.75rem", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>
          <span>⚡ {evtCount} events</span>
          <span>🎯 {actCount} actions</span>
          <span>📋 {logCount} log entries</span>
        </div>
        {/* Delete confirm */}
        {isDeleting && (
          <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${C.border}`, paddingTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button
              style={{ ...btn(C.red), background: C.red, color: "#fff", fontWeight: "bold" }}
              onClick={() => { removeSprint(sprint.id); setConfirmDeleteId(null); }}
            >Del</button>
            <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Sprints</h2>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
          Manage sprints by project
        </span>
        <div style={{ flex: 1 }} />
        {!adding && (
          <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={() => setAdding(true)}>
            + New Sprint
          </button>
        )}
      </div>

      <FilterBar showSprint={false} />

      {adding && (
        <SprintForm
          onSave={(s) => { addSprint(s); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {filtered.length === 0 && !adding ? (
        <EmptyState message="No sprints yet." action={{ label: "+ New Sprint", onClick: () => setAdding(true) }} />
      ) : activeProjectFilter ? (
        filtered.map(renderSprint)
      ) : (
        Object.entries(grouped).map(([projId, sprs]) => {
          const project = projects.find((p) => p.id === projId);
          return (
            <div key={projId} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: project?.color ?? C.textDim }} />
                <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: project?.color ?? C.textDim }}>
                  {project?.name ?? projId}
                </span>
              </div>
              {sprs.map(renderSprint)}
            </div>
          );
        })
      )}
    </div>
  );
}
