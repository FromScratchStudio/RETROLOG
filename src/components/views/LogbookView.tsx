import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { btn, iStyle, genId, todayISO, fmtDate } from "../ui/helpers";
import type { LogEntry } from "../../types";

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: FONT.mono, fontSize: "0.62rem",
  color: C.textDim, marginBottom: 4, letterSpacing: "0.06em",
};

function LogEntryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<LogEntry>;
  onSave: (e: LogEntry) => void;
  onCancel: () => void;
}) {
  const { settings, projects, sprints, activeProjectFilter, activeSprintFilter } = useStore();
  const ac = settings.accentColor;

  const [projectId, setProjectId] = useState(initial?.projectId ?? activeProjectFilter ?? projects[0]?.id ?? "");
  const [sprintId, setSprintId] = useState(initial?.sprintId ?? activeSprintFilter ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [author, setAuthor] = useState(initial?.author ?? settings.userName);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags?.join(", ") ?? "");

  const projectSprints = sprints.filter((s) => s.projectId === projectId);

  function save() {
    if (!title.trim() || !projectId) return;
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    onSave({
      id: initial?.id ?? genId("log"),
      projectId,
      sprintId,
      date,
      author: author.trim(),
      title: title.trim(),
      content: content.trim(),
      tags,
      createdAt: initial?.createdAt ?? todayISO(),
    });
  }

  return (
    <Card style={{ marginBottom: "1rem" }}>
      <SectionTitle accent={ac}>{initial?.id ? "Edit Log Entry" : "New Log Entry"}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
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
          <label style={labelStyle}>Date *</label>
          <input type="date" style={iStyle} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Author</label>
          <input style={iStyle} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Title *</label>
          <input style={iStyle} value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
            placeholder="Entry title" autoFocus />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Content</label>
          <textarea style={{ ...iStyle, resize: "vertical" }} rows={5}
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Write your log entry…" />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Tags (comma separated)</label>
          <input style={iStyle} value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="tag1, tag2, tag3" />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={save}>✓ Save</button>
        <button style={btn(C.textDim)} onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

export function LogbookView() {
  const {
    settings, projects, sprints, logEntries,
    activeProjectFilter, activeSprintFilter,
    addLogEntry, updateLogEntry, removeLogEntry,
  } = useStore();
  const ac = settings.accentColor;

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = logEntries
    .filter((l) => {
      if (activeProjectFilter && l.projectId !== activeProjectFilter) return false;
      if (activeSprintFilter && l.sprintId !== activeSprintFilter) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const byDate: Record<string, LogEntry[]> = {};
  for (const entry of filtered) {
    if (!byDate[entry.date]) byDate[entry.date] = [];
    byDate[entry.date].push(entry);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Logbook</h2>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
          {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
        </span>
        <div style={{ flex: 1 }} />
        {!adding && (
          <button style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold" }} onClick={() => setAdding(true)}>
            + New Entry
          </button>
        )}
      </div>

      <FilterBar />

      {adding && (
        <LogEntryForm
          onSave={(e) => { addLogEntry(e); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {filtered.length === 0 && !adding ? (
        <EmptyState message="No log entries yet." action={{ label: "+ New Entry", onClick: () => setAdding(true) }} />
      ) : (
        Object.entries(byDate).map(([date, entries]) => (
          <div key={date}>
            {/* Date separator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0 0.75rem" }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{
                fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim,
                background: C.bg, padding: "0 0.5rem",
              }}>
                {fmtDate(date)}
              </span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {entries.map((entry) => {
              if (editingId === entry.id) {
                return (
                  <LogEntryForm
                    key={entry.id}
                    initial={entry}
                    onSave={(e) => { updateLogEntry(e.id, e); setEditingId(null); }}
                    onCancel={() => setEditingId(null)}
                  />
                );
              }

              const project = projects.find((p) => p.id === entry.projectId);
              const sprint = sprints.find((s) => s.id === entry.sprintId);
              const isDeleting = confirmDeleteId === entry.id;

              return (
                <div key={entry.id} style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
                  {/* Left: project + sprint chip */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: project?.color ?? C.textDim, flexShrink: 0 }} />
                    {sprint && (
                      <span style={{ fontFamily: FONT.mono, fontSize: "0.55rem", color: C.textDim, writingMode: "vertical-rl" as const }}>
                        {sprint.label}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <Card style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.85rem", color: C.text, marginBottom: "0.4rem" }}>
                      {entry.title}
                    </div>
                    {entry.content && (
                      <div style={{ fontSize: "0.78rem", color: C.textSoft, lineHeight: 1.6, marginBottom: "0.5rem", whiteSpace: "pre-wrap" }}>
                        {entry.content}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      {entry.author && (
                        <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>
                          ↳ {entry.author}
                        </span>
                      )}
                      {entry._origin && (
                        <span style={{ fontFamily: FONT.mono, fontSize: "0.58rem", color: C.textDim }}>
                          ↗ imported
                        </span>
                      )}
                      {entry.tags.map((tag) => (
                        <Badge key={tag} color={C.textDim}>{tag}</Badge>
                      ))}
                      <div style={{ flex: 1 }} />
                      {!isDeleting && (
                        <>
                          <button style={{ ...btn(C.textDim), padding: "0.15rem 0.4rem" }} onClick={() => setEditingId(entry.id)}>✎</button>
                          <button style={{ ...btn(C.red), padding: "0.15rem 0.4rem" }} onClick={() => setConfirmDeleteId(entry.id)}>×</button>
                        </>
                      )}
                      {isDeleting && (
                        <>
                          <button
                            style={{ ...btn(C.red), background: C.red, color: "#fff", fontWeight: "bold" }}
                            onClick={() => { removeLogEntry(entry.id); setConfirmDeleteId(null); }}
                          >Del</button>
                          <button style={btn(C.textDim)} onClick={() => setConfirmDeleteId(null)}>×</button>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
