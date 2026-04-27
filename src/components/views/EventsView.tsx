import { useState } from "react";
import { useStore } from "../../store/useStore";
import { calcPriority } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge, SeverityBadge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { ScoreBar } from "../ui/ScoreBar";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { btn, iStyle, genId, todayISO, fmtShort } from "../ui/helpers";
import { EVENT_TYPE_META, SEVERITY_META, EVENT_STATUS_META } from "../ui/helpers";
import type { AppEvent, EventType, EventSeverity, EventStatus } from "../../types";

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: FONT.mono, fontSize: "0.62rem",
  color: C.textDim, marginBottom: 4, letterSpacing: "0.06em",
};

function EventForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<AppEvent>;
  onSave: (e: AppEvent) => void;
  onCancel: () => void;
}) {
  const { settings, projects, sprints, activeProjectFilter, activeSprintFilter } = useStore();
  const ac = settings.accentColor;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "observation");
  const [severity, setSeverity] = useState<EventSeverity>(initial?.severity ?? "medium");
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? "raw");
  const [projectId, setProjectId] = useState(initial?.projectId ?? activeProjectFilter ?? projects[0]?.id ?? "");
  const [sprintId, setSprintId] = useState(initial?.sprintId ?? activeSprintFilter ?? "");
  const [reportedBy, setReportedBy] = useState(initial?.reportedBy ?? settings.userName);
  const [occurredAt, setOccurredAt] = useState(initial?.occurredAt ?? todayISO());
  const [impact, setImpact] = useState(initial?.impact ?? 3);
  const [effort, setEffort] = useState(initial?.effort ?? 3);
  const [urgency, setUrgency] = useState(initial?.urgency ?? 3);
  const [tagsRaw, setTagsRaw] = useState(initial?.tags?.join(", ") ?? "");

  const projectSprints = sprints.filter((s) => s.projectId === projectId);

  function save() {
    if (!title.trim() || !projectId) return;
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    onSave({
      id: initial?.id ?? genId("evt"),
      projectId,
      sprintId,
      type,
      severity,
      status,
      title: title.trim(),
      description: description.trim(),
      impact,
      effort,
      urgency,
      tags,
      linkedActionIds: initial?.linkedActionIds ?? [],
      reportedBy: reportedBy.trim(),
      occurredAt,
      createdAt: initial?.createdAt ?? todayISO(),
    });
  }

  const scoreSlider = (
    label: string,
    value: number,
    desc: string,
    color: string,
    onChange: (v: number) => void
  ) => (
    <div>
      <label style={labelStyle}>{label}: {value}</label>
      <input type="range" min={1} max={5} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }} />
      <div style={{ fontFamily: FONT.mono, fontSize: "0.58rem", color: C.textDim, marginTop: 2 }}>{desc}</div>
    </div>
  );

  return (
    <Card style={{ marginBottom: "1rem" }}>
      <SectionTitle accent={ac}>{initial?.id ? "Edit Event" : "Capture Event"}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Title *</label>
          <input style={iStyle} value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
            placeholder="Describe the event" autoFocus />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...iStyle, resize: "vertical" }} rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)} placeholder="Additional context…" />
        </div>
        <div>
          <label style={labelStyle}>Type *</label>
          <select style={iStyle} value={type} onChange={(e) => setType(e.target.value as EventType)}>
            {Object.entries(EVENT_TYPE_META).map(([k, m]) => (
              <option key={k} value={k}>{m.icon} {m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Severity *</label>
          <select style={iStyle} value={severity} onChange={(e) => setSeverity(e.target.value as EventSeverity)}>
            {Object.entries(SEVERITY_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={iStyle} value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
            {Object.entries(EVENT_STATUS_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Project *</label>
          <select style={iStyle} value={projectId} onChange={(e) => { setProjectId(e.target.value); setSprintId(""); }}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Sprint</label>
          <select style={iStyle} value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
            <option value="">No sprint</option>
            {projectSprints.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Reported By</label>
          <input style={iStyle} value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Occurred At</label>
          <input type="date" style={iStyle} value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </div>
      </div>

      {/* Scores */}
      <div style={{ margin: "0.75rem 0 0.25rem" }}>
        <SectionTitle accent={C.textDim}>Scores</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          {scoreSlider("Impact", impact, "1 = negligible, 5 = critical", C.red, setImpact)}
          {scoreSlider("Effort to address", effort, "1 = quick fix, 5 = major effort", C.amber, setEffort)}
          {scoreSlider("Urgency", urgency, "1 = can wait, 5 = immediate", C.orange, setUrgency)}
        </div>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <label style={labelStyle}>Tags (comma separated)</label>
        <input style={iStyle} value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="tag1, tag2" />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={save}>✓ Save</button>
        <button style={btn(C.textDim)} onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

function EventCard({
  event,
  compact = false,
  onEdit,
  onDelete,
  extraActions,
}: {
  event: AppEvent;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: React.ReactNode;
}) {
  const { projects, sprints, advanceEventStatus, archiveEvent } = useStore();
  const meta = EVENT_TYPE_META[event.type];
  const statusMeta = EVENT_STATUS_META[event.status];
  const project = projects.find((p) => p.id === event.projectId);
  const sprint = sprints.find((s) => s.id === event.sprintId);
  const priority = calcPriority(event.impact, event.effort, event.urgency);
  const priorityColor = priority >= 4 ? C.red : priority >= 3 ? C.amber : C.green;

  const advanceLabel: Record<string, string> = {
    raw: "→ Analyze", analyzed: "→ Action", actionable: "→ Resolve",
  };

  return (
    <Card style={{ marginBottom: compact ? "0.5rem" : "0.75rem" }}>
      {/* Row 1 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
        <span title={meta.label}>{meta.icon}</span>
        <SeverityBadge severity={event.severity} />
        <div style={{ flex: 1 }} />
        {onEdit && <button style={{ ...btn(C.textDim), padding: "0.15rem 0.4rem" }} onClick={onEdit}>✎</button>}
        {onDelete && <button style={{ ...btn(C.red), padding: "0.15rem 0.4rem" }} onClick={onDelete}>×</button>}
      </div>

      {/* Title */}
      <div style={{ fontSize: "0.78rem", color: C.text, fontWeight: 500, marginBottom: "0.3rem" }}>{event.title}</div>

      {/* Description (compact: 2 lines, full: all) */}
      {event.description && !compact && (
        <div style={{ fontSize: "0.72rem", color: C.textSoft, lineHeight: 1.5, marginBottom: "0.35rem" }}>
          {event.description}
        </div>
      )}
      {event.description && compact && (
        <div style={{
          fontSize: "0.7rem", color: C.textSoft, marginBottom: "0.35rem",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        } as React.CSSProperties}>
          {event.description}
        </div>
      )}

      {/* Badges */}
      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
        {project && <Badge color={project.color}>{project.name}</Badge>}
        {sprint && <Badge color={C.textDim}>{sprint.label}</Badge>}
      </div>

      {!compact && (
        <>
          <ScoreBar value={event.impact} color={C.red} label="Impact" />
          <div style={{ marginTop: 4 }}>
            <ScoreBar value={event.urgency} color={C.orange} label="Urgency" />
          </div>
        </>
      )}

      {/* Priority */}
      <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: priorityColor, marginTop: "0.35rem" }}>
        ⬆ Priority: {priority}/5
      </div>

      {/* Reporter + date */}
      {!compact && (
        <>
          {event.reportedBy && (
            <div style={{ fontSize: "0.58rem", color: C.textDim, marginTop: 4 }}>↳ {event.reportedBy}</div>
          )}
          {event._origin && (
            <div style={{ fontSize: "0.55rem", color: C.textVeryDim }}>↗ {event._origin.userName}</div>
          )}
          <div style={{ fontSize: "0.58rem", color: C.textVeryDim, marginTop: 2 }}>{fmtShort(event.occurredAt)}</div>
        </>
      )}

      {/* Advance / Archive buttons */}
      {!compact && (
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          {advanceLabel[event.status] && (
            <button style={btn(statusMeta.color)} onClick={() => advanceEventStatus(event.id)}>
              {advanceLabel[event.status]}
            </button>
          )}
          {event.status === "resolved" && (
            <button style={btn(C.textDim)} onClick={() => archiveEvent(event.id)}>Archive</button>
          )}
        </div>
      )}

      {extraActions}
    </Card>
  );
}

export function EventsView() {
  const {
    settings, projects, sprints, events,
    activeProjectFilter, activeSprintFilter,
    addEvent, updateEvent, removeEvent,
  } = useStore();
  const ac = settings.accentColor;

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = events.filter((e) => {
    if (activeProjectFilter && e.projectId !== activeProjectFilter) return false;
    if (activeSprintFilter && e.sprintId !== activeSprintFilter) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    return true;
  });

  const filterExtras = (
    <>
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        style={{ ...iStyle, width: "auto", minWidth: 130, color: typeFilter ? C.text : C.textDim }}
      >
        <option value="">All Types</option>
        {Object.entries(EVENT_TYPE_META).map(([k, m]) => (
          <option key={k} value={k}>{m.icon} {m.label}</option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ ...iStyle, width: "auto", minWidth: 130, color: statusFilter ? C.text : C.textDim }}
      >
        <option value="">All Statuses</option>
        {Object.entries(EVENT_STATUS_META).map(([k, m]) => (
          <option key={k} value={k}>{m.label}</option>
        ))}
      </select>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Events</h2>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
          Capture, analyze and act on project events
        </span>
        <div style={{ flex: 1 }} />
        {/* View toggle */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            style={viewMode === "list" ? { ...btn(ac), background: ac + "22", border: `1px solid ${ac}44` } : btn(C.textDim)}
            onClick={() => setViewMode("list")}
          >≡ List</button>
          <button
            style={viewMode === "board" ? { ...btn(ac), background: ac + "22", border: `1px solid ${ac}44` } : btn(C.textDim)}
            onClick={() => setViewMode("board")}
          >⊞ Board</button>
        </div>
        {!adding && (
          <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={() => setAdding(true)}>
            + Capture Event
          </button>
        )}
      </div>

      <FilterBar extras={filterExtras} />

      {adding && (
        <EventForm
          onSave={(e) => { addEvent(e); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {editingId && (
        <EventForm
          initial={events.find((e) => e.id === editingId)}
          onSave={(e) => { updateEvent(e.id, e); setEditingId(null); }}
          onCancel={() => setEditingId(null)}
        />
      )}

      {filtered.length === 0 && !adding ? (
        <EmptyState message="No events match the current filters." action={{ label: "+ Capture Event", onClick: () => setAdding(true) }} />
      ) : viewMode === "board" ? (
        // Board view
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", alignItems: "flex-start", paddingBottom: "1rem" }}>
          {Object.entries(EVENT_STATUS_META).map(([status, meta]) => {
            const colEvents = filtered.filter((e) => e.status === status);
            return (
              <div key={status} style={{ minWidth: 260, flex: "0 0 260px" }}>
                <Card style={{ borderTop: `3px solid ${meta.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: meta.color, flex: 1 }}>
                      {meta.label.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim }}>{colEvents.length}</span>
                  </div>
                  {colEvents.length === 0 ? (
                    <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textVeryDim }}>Empty</p>
                  ) : (
                    colEvents.map((evt) => {
                      if (editingId === evt.id) return null;
                      const isDeleting = confirmDeleteId === evt.id;
                      if (isDeleting) {
                        return (
                          <div key={evt.id} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.4rem" }}>
                            <button
                              style={{ ...btn(C.red), background: C.red, color: "#fff", fontWeight: "bold" }}
                              onClick={() => { removeEvent(evt.id); setConfirmDeleteId(null); }}
                            >Del</button>
                            <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
                          </div>
                        );
                      }
                      return (
                        <EventCard
                          key={evt.id}
                          event={evt}
                          onEdit={() => setEditingId(evt.id)}
                          onDelete={() => setConfirmDeleteId(evt.id)}
                        />
                      );
                    })
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        // List view
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Type","Severity","Title","Project","Sprint","Impact","Urgency","Priority","Status","Date","Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.4rem 0.5rem", textAlign: "left", fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).map((evt, i) => {
                const meta = EVENT_TYPE_META[evt.type];
                const proj = projects.find((p) => p.id === evt.projectId);
                const spr = sprints.find((s) => s.id === evt.sprintId);
                const statusMeta = EVENT_STATUS_META[evt.status];
                const priority = calcPriority(evt.impact, evt.effort, evt.urgency);
                const priorityColor = priority >= 4 ? C.red : priority >= 3 ? C.amber : C.green;
                const isDeleting = confirmDeleteId === evt.id;
                return (
                  <tr key={evt.id} style={{ background: i % 2 === 0 ? C.surface : C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "0.4rem 0.5rem" }}><span title={meta.label}>{meta.icon}</span></td>
                    <td style={{ padding: "0.4rem 0.5rem" }}><SeverityBadge severity={evt.severity} /></td>
                    <td style={{ padding: "0.4rem 0.5rem", maxWidth: 200 }}>{evt.title}</td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>{proj && <Badge color={proj.color}>{proj.name}</Badge>}</td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>{spr?.label ?? "—"}</td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, color: C.red }}>{evt.impact}</td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, color: C.orange }}>{evt.urgency}</td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, color: priorityColor }}>{priority}/5</td>
                    <td style={{ padding: "0.4rem 0.5rem" }}><Badge color={statusMeta.color}>{statusMeta.label}</Badge></td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, whiteSpace: "nowrap" }}>
                      {fmtShort(evt.occurredAt)}
                    </td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>
                      {isDeleting ? (
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button style={{ ...btn(C.red), background: C.red, color: "#fff" }} onClick={() => { removeEvent(evt.id); setConfirmDeleteId(null); }}>Del</button>
                          <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button style={{ ...btn(C.textDim), padding: "0.15rem 0.4rem" }} onClick={() => setEditingId(evt.id)}>✎</button>
                          <button style={{ ...btn(C.red), padding: "0.15rem 0.4rem" }} onClick={() => setConfirmDeleteId(evt.id)}>×</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { EventCard };
