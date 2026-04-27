import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { SectionTitle } from "../ui/SectionTitle";
import { ProgressBar } from "../ui/ProgressBar";
import { ScoreBar } from "../ui/ScoreBar";
import { EmptyState as _EmptyState } from "../ui/EmptyState"; // keep for future use
import { btn, iStyle, genId, todayISO, fmtDate } from "../ui/helpers";
import { EVENT_TYPE_META } from "../ui/helpers";
import { ActionForm } from "./ActionsView";
import type { Retrospective } from "../../types";

export function RetroBoardView() {
  const {
    settings, projects, sprints, events, actionItems, retrospectives,
    addRetrospective, updateRetrospective,
    addEventToRetroSection, removeEventFromRetro,
    addActionToRetro, removeActionFromRetro,
    addActionItem,
    completeRetrospective, setActiveView,
  } = useStore();
  const ac = settings.accentColor;

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [currentRetroId, setCurrentRetroId] = useState<string | null>(null);
  const [addingAction, setAddingAction] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const availableSprints = sprints.filter(
    (s) => s.projectId === selectedProjectId && (s.status === "active" || s.status === "completed")
  );

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  void selectedProject; // used for future project-level info
  const currentRetro = retrospectives.find((r) => r.id === currentRetroId);

  function loadRetro() {
    if (!selectedProjectId || !selectedSprintId) return;
    const existing = retrospectives.find(
      (r) => r.projectId === selectedProjectId && r.sprintId === selectedSprintId
    );
    if (existing) {
      setCurrentRetroId(existing.id);
    } else {
      const newRetro: Retrospective = {
        id: genId("retro"),
        projectId: selectedProjectId,
        sprintId: selectedSprintId,
        date: todayISO(),
        facilitator: settings.userName,
        participants: "",
        wentWellIds: [],
        toImproveIds: [],
        ideasIds: [],
        actionIds: [],
        teamMood: 7,
        notes: "",
        status: "draft",
      };
      addRetrospective(newRetro);
      setCurrentRetroId(newRetro.id);
    }
  }

  function autoSave(updates: Partial<Omit<Retrospective, "id">>) {
    if (!currentRetroId) return;
    updateRetrospective(currentRetroId, updates);
  }

  const COLUMNS = [
    { key: "wentWell" as const, label: "Went Well", icon: "✅", color: C.green, ids: currentRetro?.wentWellIds ?? [] },
    { key: "toImprove" as const, label: "To Improve", icon: "🔧", color: C.amber, ids: currentRetro?.toImproveIds ?? [] },
    { key: "ideas" as const, label: "Ideas", icon: "💡", color: C.cyan, ids: currentRetro?.ideasIds ?? [] },
  ];

  const assignedIds = new Set([
    ...(currentRetro?.wentWellIds ?? []),
    ...(currentRetro?.toImproveIds ?? []),
    ...(currentRetro?.ideasIds ?? []),
  ]);

  const unassignedEvents = events.filter(
    (e) => e.sprintId === selectedSprintId && !assignedIds.has(e.id) && e.status !== "archived"
  );

  const retroActions = actionItems.filter((a) => currentRetro?.actionIds.includes(a.id));

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>RetroBoard</h2>
        <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, marginTop: 4 }}>
          Sprint retrospective — assign events into sections
        </p>
      </div>

      {/* Context selectors */}
      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: "block", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginBottom: 4 }}>
              Project *
            </label>
            <select
              style={iStyle}
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedSprintId(""); setCurrentRetroId(null); }}
            >
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: "block", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginBottom: 4 }}>
              Sprint *
            </label>
            <select
              style={iStyle}
              value={selectedSprintId}
              onChange={(e) => { setSelectedSprintId(e.target.value); setCurrentRetroId(null); }}
              disabled={!selectedProjectId}
            >
              <option value="">Select sprint…</option>
              {availableSprints.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <button
            style={{ ...btn(ac), background: ac, color: "#000", fontWeight: "bold", alignSelf: "flex-end" }}
            onClick={loadRetro}
            disabled={!selectedProjectId || !selectedSprintId}
          >
            Load Retro
          </button>
        </div>
      </Card>

      {!selectedProjectId || !selectedSprintId ? (
        <Card style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.textDim }}>
            Select a project and a sprint to start your retrospective.
          </p>
        </Card>
      ) : !currentRetro ? (
        <Card style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.textDim }}>
            Click "Load Retro" to load or create a retrospective for this sprint.
          </p>
        </Card>
      ) : (
        <>
          {/* Sprint info banner */}
          {selectedSprint && (
            <Card style={{ marginBottom: "1rem", background: C.surfaceAlt }}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontFamily: FONT.display, fontSize: "1rem", color: C.text }}>{selectedSprint.label}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>
                  {fmtDate(selectedSprint.startDate)} → {fmtDate(selectedSprint.endDate)}
                </span>
                {selectedSprint.goal && (
                  <span style={{ fontSize: "0.75rem", color: C.textSoft, flex: 1 }}>{selectedSprint.goal}</span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim }}>Velocity</span>
                  <ProgressBar
                    value={selectedSprint.velocityPlanned > 0 ? Math.round((selectedSprint.velocityActual / selectedSprint.velocityPlanned) * 100) : 0}
                    color={C.cyan}
                    height={4}
                  />
                  <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.textDim }}>
                    {selectedSprint.velocityActual}/{selectedSprint.velocityPlanned}
                  </span>
                </div>
                <ScoreBar value={Math.round(selectedSprint.mood / 2)} color={C.cyan} label="Mood" />
              </div>
            </Card>
          )}

          {/* Meta retro */}
          <Card style={{ marginBottom: "1rem" }}>
            <SectionTitle accent={ac}>Retrospective Details</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginBottom: 4 }}>Facilitator</label>
                <input
                  style={iStyle}
                  value={currentRetro.facilitator}
                  onChange={(e) => autoSave({ facilitator: e.target.value })}
                  placeholder="Facilitator name"
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginBottom: 4 }}>Participants</label>
                <input
                  style={iStyle}
                  value={currentRetro.participants}
                  onChange={(e) => autoSave({ participants: e.target.value })}
                  placeholder="Alice, Bob, Carol…"
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginBottom: 4 }}>
                  Team Mood: {currentRetro.teamMood}
                </label>
                <input
                  type="range" min={1} max={10}
                  value={currentRetro.teamMood}
                  onChange={(e) => autoSave({ teamMood: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: C.cyan }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginBottom: 4 }}>General Notes</label>
                <textarea
                  style={{ ...iStyle, resize: "vertical" }} rows={2}
                  value={currentRetro.notes}
                  onBlur={(e) => autoSave({ notes: e.target.value })}
                  onChange={(e) => autoSave({ notes: e.target.value })}
                  placeholder="Facilitator notes…"
                />
              </div>
            </div>
          </Card>

          {/* Board */}
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            {COLUMNS.map(({ key, label, icon, color, ids }) => (
              <div key={key} style={{ minWidth: 280, flex: "0 0 280px" }}>
                <Card style={{ borderTop: `3px solid ${color}` }}>
                  <SectionTitle accent={color}>{icon} {label} ({ids.length})</SectionTitle>
                  {ids.length === 0 ? (
                    <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textVeryDim }}>
                      No events assigned
                    </p>
                  ) : (
                    ids.map((evtId) => {
                      const evt = events.find((e) => e.id === evtId);
                      if (!evt) return null;
                      const meta = EVENT_TYPE_META[evt.type];
                      const expanded = expandedEventId === evtId;
                      return (
                        <Card
                          key={evtId}
                          style={{ marginBottom: "0.5rem", cursor: "pointer", background: C.surfaceAlt }}
                          onClick={() => setExpandedEventId(expanded ? null : evtId)}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span>{meta.icon}</span>
                            <span style={{ fontSize: "0.75rem", color: C.text, flex: 1 }}>{evt.title}</span>
                            <button
                              style={{ ...btn(C.textDim), padding: "0.1rem 0.35rem", fontSize: "0.65rem" }}
                              onClick={(e) => { e.stopPropagation(); removeEventFromRetro(currentRetroId!, evtId); }}
                            >×</button>
                          </div>
                          {expanded && evt.description && (
                            <div style={{ fontSize: "0.72rem", color: C.textSoft, marginTop: "0.4rem", lineHeight: 1.5 }}>
                              {evt.description}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </Card>
              </div>
            ))}

            {/* Actions column */}
            <div style={{ minWidth: 280, flex: "0 0 280px" }}>
              <Card style={{ borderTop: `3px solid ${C.violet}` }}>
                <SectionTitle accent={C.violet}>⚡ Actions ({retroActions.length})</SectionTitle>
                {retroActions.map((action) => (
                  <Card key={action.id} style={{ marginBottom: "0.5rem", background: C.surfaceAlt }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.75rem", color: C.text, flex: 1 }}>{action.title}</span>
                      <Badge color={action.priority === "high" ? C.red : action.priority === "medium" ? C.amber : C.textDim}>
                        {action.priority}
                      </Badge>
                      <button
                        style={{ ...btn(C.textDim), padding: "0.1rem 0.35rem" }}
                        onClick={() => removeActionFromRetro(currentRetroId!, action.id)}
                      >×</button>
                    </div>
                    {action.owner && (
                      <div style={{ fontSize: "0.62rem", color: C.textDim, marginTop: 2 }}>👤 {action.owner}</div>
                    )}
                  </Card>
                ))}

                {addingAction ? (
                  <ActionForm
                    initial={{ projectId: selectedProjectId, sprintId: selectedSprintId }}
                    onSave={(a) => {
                      addActionItem(a);
                      addActionToRetro(currentRetroId!, a.id);
                      setAddingAction(false);
                    }}
                    onCancel={() => setAddingAction(false)}
                  />
                ) : (
                  <button style={{ ...btn(C.violet), width: "100%", marginTop: "0.5rem" }} onClick={() => setAddingAction(true)}>
                    + New Action
                  </button>
                )}
              </Card>
            </div>
          </div>

          {/* Unassigned pool */}
          <div style={{ marginBottom: "1.5rem" }}>
            <SectionTitle accent={C.textDim}>
              Unassigned Sprint Events ({unassignedEvents.length})
            </SectionTitle>
            {unassignedEvents.length === 0 ? (
              <p style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textVeryDim }}>
                All events are assigned to sections.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {unassignedEvents.map((evt) => {
                  const meta = EVENT_TYPE_META[evt.type];
                  return (
                    <Card key={evt.id} style={{ background: C.surfaceAlt }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <span>{meta.icon}</span>
                        <span style={{ fontSize: "0.75rem", color: C.text, flex: 1 }}>{evt.title}</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        <button
                          style={btn(C.green)}
                          onClick={() => addEventToRetroSection(currentRetroId!, evt.id, "wentWell")}
                        >✅ Well</button>
                        <button
                          style={btn(C.amber)}
                          onClick={() => addEventToRetroSection(currentRetroId!, evt.id, "toImprove")}
                        >🔧 Improve</button>
                        <button
                          style={btn(C.cyan)}
                          onClick={() => addEventToRetroSection(currentRetroId!, evt.id, "ideas")}
                        >💡 Idea</button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Generate Report */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              style={{
                ...btn(ac),
                background: currentRetro.status === "completed" ? C.surfaceAlt : ac + "44",
                color: currentRetro.status === "completed" ? C.textDim : ac,
                fontWeight: "bold",
                fontSize: "0.8rem",
                padding: "0.5rem 1.25rem",
                opacity: currentRetro.status === "completed" ? 0.5 : 1,
                cursor: currentRetro.status === "completed" ? "not-allowed" : "pointer",
              }}
              disabled={currentRetro.status === "completed"}
              onClick={() => {
                completeRetrospective(currentRetroId!);
                setActiveView("reports");
              }}
            >
              {currentRetro.status === "completed" ? "Report Generated" : "Generate Report →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
