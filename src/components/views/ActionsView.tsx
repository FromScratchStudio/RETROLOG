import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge, PriorityBadge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { btn, iStyle, genId, todayISO, fmtDueDate } from "../ui/helpers";
import { ACTION_STATUS_META } from "../ui/helpers";
import type { ActionItem, ActionStatus, ActionPriority } from "../../types";

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: FONT.mono, fontSize: "0.62rem",
  color: C.textDim, marginBottom: 4, letterSpacing: "0.06em",
};

function ActionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<ActionItem>;
  onSave: (a: ActionItem) => void;
  onCancel: () => void;
}) {
  const { settings, projects, sprints, activeProjectFilter, activeSprintFilter } = useStore();
  const ac = settings.accentColor;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [owner, setOwner] = useState(initial?.owner ?? settings.userName);
  const [priority, setPriority] = useState<ActionPriority>(initial?.priority ?? "medium");
  const [status, setStatus] = useState<ActionStatus>(initial?.status ?? "open");
  const [projectId, setProjectId] = useState(initial?.projectId ?? activeProjectFilter ?? projects[0]?.id ?? "");
  const [sprintId, setSprintId] = useState(initial?.sprintId ?? activeSprintFilter ?? "");
  const [targetSprintId, setTargetSprintId] = useState(initial?.targetSprintId ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [resolvedAt, setResolvedAt] = useState(initial?.resolvedAt ?? "");

  const projectSprints = sprints.filter((s) => s.projectId === projectId);

  function save() {
    if (!title.trim() || !projectId) return;
    onSave({
      id: initial?.id ?? genId("act"),
      projectId,
      sprintId,
      targetSprintId,
      title: title.trim(),
      description: description.trim(),
      owner: owner.trim(),
      priority,
      status,
      linkedEventIds: initial?.linkedEventIds ?? [],
      dueDate,
      createdAt: initial?.createdAt ?? todayISO(),
      resolvedAt: status === "done" ? (resolvedAt || todayISO()) : "",
    });
  }

  return (
    <Card style={{ marginBottom: "1rem" }}>
      <SectionTitle accent={ac}>{initial?.id ? "Edit Action" : "New Action"}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Title *</label>
          <input style={iStyle} value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
            placeholder="Action title" autoFocus />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...iStyle, resize: "vertical" }} rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Owner</label>
          <input style={iStyle} value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select style={iStyle} value={priority} onChange={(e) => setPriority(e.target.value as ActionPriority)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={iStyle} value={status} onChange={(e) => setStatus(e.target.value as ActionStatus)}>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Project *</label>
          <select style={iStyle} value={projectId} onChange={(e) => { setProjectId(e.target.value); setSprintId(""); setTargetSprintId(""); }}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Sprint (created in)</label>
          <select style={iStyle} value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
            <option value="">No sprint</option>
            {projectSprints.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Target Sprint</label>
          <select style={iStyle} value={targetSprintId} onChange={(e) => setTargetSprintId(e.target.value)}>
            <option value="">No sprint</option>
            {projectSprints.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input type="date" style={iStyle} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        {status === "done" && (
          <div>
            <label style={labelStyle}>Resolved At</label>
            <input type="date" style={iStyle} value={resolvedAt} onChange={(e) => setResolvedAt(e.target.value)} />
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={save}>✓ Save</button>
        <button style={btn(C.textDim)} onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

function ActionCard({
  action,
  compact = false,
  onEdit,
  onDelete,
  extraActions,
}: {
  action: ActionItem;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: React.ReactNode;
}) {
  const { projects, sprints, events, advanceActionStatus, cancelAction } = useStore();
  const statusMeta = ACTION_STATUS_META[action.status];
  const project = projects.find((p) => p.id === action.projectId);
  const targetSprint = sprints.find((s) => s.id === action.targetSprintId);
  const linkedEventsCount = action.linkedEventIds.filter((id) => events.some((e) => e.id === id)).length;
  const due = fmtDueDate(action.dueDate);
  const isOverdue = action.dueDate && action.dueDate < new Date().toISOString().slice(0, 10)
    && action.status !== "done" && action.status !== "cancelled";

  const advanceLabel: Record<string, string> = {
    open: "→ Start",
    "in-progress": "→ Complete",
  };

  return (
    <Card style={{ marginBottom: compact ? "0.5rem" : "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
        <PriorityBadge priority={action.priority} />
        <div style={{ flex: 1 }} />
        {onEdit && <button style={{ ...btn(C.textDim), padding: "0.15rem 0.4rem" }} onClick={onEdit}>✎</button>}
        {onDelete && <button style={{ ...btn(C.red), padding: "0.15rem 0.4rem" }} onClick={onDelete}>×</button>}
      </div>

      <div style={{ fontSize: "0.78rem", color: C.text, fontWeight: 500, marginBottom: "0.3rem" }}>{action.title}</div>

      {!compact && (
        <>
          {action.owner && (
            <div style={{ fontSize: "0.65rem", color: C.textDim, marginBottom: "0.3rem" }}>👤 {action.owner}</div>
          )}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
            {project && <Badge color={project.color}>{project.name}</Badge>}
            {targetSprint && <Badge color={C.textDim}>{targetSprint.label}</Badge>}
          </div>
          {action.dueDate && (
            <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: isOverdue ? C.red : due.color, marginBottom: "0.3rem" }}>
              📅 {due.label}
            </div>
          )}
          {linkedEventsCount > 0 && (
            <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, marginBottom: "0.3rem" }}>
              ⚡ {linkedEventsCount} event{linkedEventsCount !== 1 ? "s" : ""}
            </div>
          )}
          {action._origin && (
            <div style={{ fontSize: "0.55rem", color: C.textVeryDim }}>↗ {action._origin.userName}</div>
          )}
        </>
      )}

      {!compact && (
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          {advanceLabel[action.status] && (
            <button style={btn(statusMeta.color)} onClick={() => advanceActionStatus(action.id)}>
              {advanceLabel[action.status]}
            </button>
          )}
          {(action.status === "open" || action.status === "in-progress") && (
            <button style={btn(C.textDim)} onClick={() => cancelAction(action.id)}>✕ Cancel</button>
          )}
        </div>
      )}

      {extraActions}
    </Card>
  );
}

export function ActionsView() {
  const {
    settings, projects, sprints, actionItems,
    activeProjectFilter, activeSprintFilter,
    addActionItem, updateActionItem, removeActionItem,
  } = useStore();
  const ac = settings.accentColor;

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  const distinctOwners = [...new Set(actionItems.map((a) => a.owner).filter(Boolean))].sort();

  const filtered = actionItems.filter((a) => {
    if (activeProjectFilter && a.projectId !== activeProjectFilter) return false;
    if (activeSprintFilter && a.sprintId !== activeSprintFilter && a.targetSprintId !== activeSprintFilter) return false;
    if (priorityFilter && a.priority !== priorityFilter) return false;
    if (ownerFilter && a.owner !== ownerFilter) return false;
    return true;
  });

  const filterExtras = (
    <>
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        style={{ ...iStyle, width: "auto", minWidth: 120, color: priorityFilter ? C.text : C.textDim }}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        value={ownerFilter}
        onChange={(e) => setOwnerFilter(e.target.value)}
        style={{ ...iStyle, width: "auto", minWidth: 130, color: ownerFilter ? C.text : C.textDim }}
      >
        <option value="">All Owners</option>
        {distinctOwners.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Actions</h2>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
          Track and manage action items
        </span>
        <div style={{ flex: 1 }} />
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
            + New Action
          </button>
        )}
      </div>

      <FilterBar extras={filterExtras} />

      {adding && (
        <ActionForm
          onSave={(a) => { addActionItem(a); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {editingId && (
        <ActionForm
          initial={actionItems.find((a) => a.id === editingId)}
          onSave={(a) => { updateActionItem(a.id, a); setEditingId(null); }}
          onCancel={() => setEditingId(null)}
        />
      )}

      {filtered.length === 0 && !adding ? (
        <EmptyState message="No actions match the current filters." action={{ label: "+ New Action", onClick: () => setAdding(true) }} />
      ) : viewMode === "board" ? (
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", alignItems: "flex-start", paddingBottom: "1rem" }}>
          {Object.entries(ACTION_STATUS_META).map(([status, meta]) => {
            const colActions = filtered.filter((a) => a.status === status);
            return (
              <div key={status} style={{ minWidth: 260, flex: "0 0 260px" }}>
                <Card style={{ borderTop: `3px solid ${meta.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: meta.color, flex: 1 }}>
                      {meta.label.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim }}>{colActions.length}</span>
                  </div>
                  {colActions.length === 0 ? (
                    <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textVeryDim }}>Empty</p>
                  ) : (
                    colActions.map((action) => {
                      if (editingId === action.id) return null;
                      const isDeleting = confirmDeleteId === action.id;
                      if (isDeleting) {
                        return (
                          <div key={action.id} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.4rem" }}>
                            <button style={{ ...btn(C.red), background: C.red, color: "#fff", fontWeight: "bold" }}
                              onClick={() => { removeActionItem(action.id); setConfirmDeleteId(null); }}>Del</button>
                            <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
                          </div>
                        );
                      }
                      return (
                        <ActionCard
                          key={action.id}
                          action={action}
                          onEdit={() => setEditingId(action.id)}
                          onDelete={() => setConfirmDeleteId(action.id)}
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
        // List
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Priority","Title","Owner","Project","Target Sprint","Due Date","Linked Events","Status","Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.4rem 0.5rem", textAlign: "left", fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim, fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((action, i) => {
                const proj = projects.find((p) => p.id === action.projectId);
                const targetSpr = sprints.find((s) => s.id === action.targetSprintId);
                const statusMeta = ACTION_STATUS_META[action.status];
                const due = fmtDueDate(action.dueDate);
                const isDeleting = confirmDeleteId === action.id;
                return (
                  <tr key={action.id} style={{ background: i % 2 === 0 ? C.surface : C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "0.4rem 0.5rem" }}><PriorityBadge priority={action.priority} /></td>
                    <td style={{ padding: "0.4rem 0.5rem", maxWidth: 200 }}>{action.title}</td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, fontSize: "0.65rem" }}>{action.owner}</td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>{proj && <Badge color={proj.color}>{proj.name}</Badge>}</td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>{targetSpr?.label ?? "—"}</td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, fontSize: "0.6rem", color: due.color, whiteSpace: "nowrap" }}>
                      {action.dueDate ? due.label : "—"}
                    </td>
                    <td style={{ padding: "0.4rem 0.5rem", fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim }}>
                      {action.linkedEventIds.length}
                    </td>
                    <td style={{ padding: "0.4rem 0.5rem" }}><Badge color={statusMeta.color}>{statusMeta.label}</Badge></td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>
                      {isDeleting ? (
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button style={{ ...btn(C.red), background: C.red, color: "#fff" }}
                            onClick={() => { removeActionItem(action.id); setConfirmDeleteId(null); }}>Del</button>
                          <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button style={{ ...btn(C.textDim), padding: "0.15rem 0.4rem" }} onClick={() => setEditingId(action.id)}>✎</button>
                          <button style={{ ...btn(C.red), padding: "0.15rem 0.4rem" }} onClick={() => setConfirmDeleteId(action.id)}>×</button>
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

export { ActionCard, ActionForm };
