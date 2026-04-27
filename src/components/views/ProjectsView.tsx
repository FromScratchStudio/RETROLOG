import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { EmptyState } from "../ui/EmptyState";
import { btn, iStyle, genId, todayISO } from "../ui/helpers";
import type { Project, Methodology, ProjectStatus } from "../../types";

const METHODOLOGY_META = {
  scrum:     { label: "Scrum",    color: "#06b6d4" },
  kanban:    { label: "Kanban",   color: "#8b5cf6" },
  scrumban:  { label: "Scrumban", color: "#4c7fc9" },
  "shape-up":{ label: "Shape-Up", color: "#ec4899" },
  other:     { label: "Other",    color: "#555b70" },
} as const;

const STATUS_META = {
  active:   { label: "Active",   color: "#10b981" },
  paused:   { label: "Paused",   color: "#f59e0b" },
  archived: { label: "Archived", color: "#555b70" },
} as const;

const DEFAULT_COLORS = ["#06b6d4","#8b5cf6","#10b981","#f59e0b","#ef4444","#ec4899","#4c7fc9","#f97316"];

function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Project>;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const ac = useStore((s) => s.settings.accentColor);
  const [name, setName] = useState(initial?.name ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [methodology, setMethodology] = useState<Methodology>(initial?.methodology ?? "scrum");
  const [sprintDuration, setSprintDuration] = useState(initial?.sprintDuration ?? 14);
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "active");
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLORS[0]);

  function save() {
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? genId("proj"),
      name: name.trim(),
      team: team.trim(),
      description: description.trim(),
      methodology,
      sprintDuration: Number(sprintDuration),
      status,
      color,
      createdAt: initial?.createdAt ?? todayISO(),
    });
  }

  return (
    <Card style={{ marginBottom: "1rem" }}>
      <SectionTitle accent={ac}>{initial?.id ? "Edit Project" : "New Project"}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={{ ...labelStyle }}>Name *</label>
          <input style={iStyle} value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }}
            placeholder="Project name" autoFocus />
        </div>
        <div>
          <label style={{ ...labelStyle }}>Team</label>
          <input style={iStyle} value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team name" />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ ...labelStyle }}>Description</label>
          <textarea style={{ ...iStyle, resize: "vertical" }} rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)} placeholder="Brief project description" />
        </div>
        <div>
          <label style={{ ...labelStyle }}>Methodology</label>
          <select style={iStyle} value={methodology} onChange={(e) => setMethodology(e.target.value as Methodology)}>
            <option value="scrum">Scrum</option>
            <option value="kanban">Kanban</option>
            <option value="scrumban">Scrumban</option>
            <option value="shape-up">Shape-Up</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={{ ...labelStyle }}>Sprint Duration (days, 0 = no sprints)</label>
          <input type="number" min={0} style={iStyle} value={sprintDuration}
            onChange={(e) => setSprintDuration(Number(e.target.value))} />
        </div>
        <div>
          <label style={{ ...labelStyle }}>Status</label>
          <select style={iStyle} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label style={{ ...labelStyle }}>Color</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              style={{ width: 36, height: 30, padding: 2, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 5, cursor: "pointer" }} />
            <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.textDim }}>{color}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={save}>✓ Save</button>
        <button style={btn(C.textDim)} onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: FONT.mono, fontSize: "0.62rem",
  color: C.textDim, marginBottom: 4, letterSpacing: "0.06em",
};

export function ProjectsView() {
  const { settings, projects, sprints, events, actionItems, addProject, updateProject, removeProject } = useStore();
  const ac = settings.accentColor;
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Projects</h2>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
          ({projects.length} project{projects.length !== 1 ? "s" : ""})
        </span>
        <div style={{ flex: 1 }} />
        {!adding && (
          <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={() => setAdding(true)}>
            + New Project
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <ProjectForm
          onSave={(p) => { addProject(p); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Grid */}
      {projects.length === 0 && !adding ? (
        <EmptyState
          message="No projects yet."
          action={{ label: "+ New Project", onClick: () => setAdding(true) }}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {projects.map((project) => {
            if (editingId === project.id) {
              return (
                <ProjectForm
                  key={project.id}
                  initial={project}
                  onSave={(p) => { updateProject(p.id, p); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              );
            }

            const sprintCount = sprints.filter((s) => s.projectId === project.id).length;
            const eventCount = events.filter((e) => e.projectId === project.id).length;
            const openActionCount = actionItems.filter(
              (a) => a.projectId === project.id && (a.status === "open" || a.status === "in-progress")
            ).length;
            const activeSprint = sprints.find((s) => s.projectId === project.id && s.status === "active");
            const statusMeta = STATUS_META[project.status];
            const methMeta = METHODOLOGY_META[project.methodology];
            const isDeleting = confirmDeleteId === project.id;

            return (
              <Card key={project.id} style={{ borderLeft: `3px solid ${project.color}`, position: "relative" }}>
                {/* Row 1 */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: project.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT.display, fontSize: "1rem", color: C.text, flex: 1 }}>
                    {project.name}
                    {project._origin && (
                      <span
                        title={`Imported from ${project._origin.userName} (${project._origin.userId})`}
                        style={{ fontFamily: FONT.mono, fontSize: "0.55rem", color: C.textDim, marginLeft: 6 }}
                      >
                        ↗ imported
                      </span>
                    )}
                  </span>
                  <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
                  {!isDeleting && (
                    <>
                      <button style={{ ...btn(C.textDim), padding: "0.2rem 0.45rem" }} onClick={() => setEditingId(project.id)}>✎</button>
                      <button style={{ ...btn(C.red), padding: "0.2rem 0.45rem" }} onClick={() => setConfirmDeleteId(project.id)}>×</button>
                    </>
                  )}
                </div>

                {/* Row 2 */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.72rem", color: C.textSoft }}>{project.team}</span>
                  <Badge color={methMeta.color}>{methMeta.label}</Badge>
                </div>

                {/* Row 3 - description */}
                <p style={{
                  fontSize: "0.75rem", color: C.textSoft, lineHeight: 1.5, marginBottom: "0.5rem",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                } as React.CSSProperties}>
                  {project.description || <em style={{ color: C.textVeryDim }}>No description</em>}
                </p>

                {/* Row 4 - counters */}
                <div style={{ display: "flex", gap: "0.75rem", fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, marginBottom: "0.4rem" }}>
                  <span>📅 {sprintCount} sprint{sprintCount !== 1 ? "s" : ""}</span>
                  <span>⚡ {eventCount} event{eventCount !== 1 ? "s" : ""}</span>
                  <span>🎯 {openActionCount} open</span>
                </div>

                {/* Active sprint indicator */}
                {activeSprint ? (
                  <div style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.green, marginBottom: "0.4rem" }}>
                    🟢 Sprint {activeSprint.number} — {activeSprint.label}
                  </div>
                ) : (
                  <div style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textVeryDim, marginBottom: "0.4rem" }}>
                    No active sprint
                  </div>
                )}

                {/* Since */}
                <div style={{ fontFamily: FONT.mono, fontSize: "0.58rem", color: C.textVeryDim }}>
                  Since {project.createdAt}
                </div>

                {/* Delete confirmation */}
                {isDeleting && (
                  <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${C.border}`, paddingTop: "0.75rem" }}>
                    <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.amber, marginBottom: "0.5rem" }}>
                      ⚠ This will also delete all sprints, events, log entries and actions for this project.
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        style={{ ...btn(C.red), background: C.red, color: "#fff", fontWeight: "bold" }}
                        onClick={() => { removeProject(project.id); setConfirmDeleteId(null); }}
                      >
                        Del
                      </button>
                      <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
