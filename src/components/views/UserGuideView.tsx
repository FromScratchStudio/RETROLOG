import { useState } from "react";
import { useStore } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";

/* ─── Types ─────────────────────────────────────────────────── */
interface Section {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

/* ─── Helper sub-components ─────────────────────────────────── */
function Step({ n, text }: { n: number; text: string }) {
  const ac = useStore((s) => s.settings.accentColor);
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.6rem" }}>
      <div style={{
        flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
        background: ac, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT.mono, fontSize: "0.65rem", color: C.bgDeep, fontWeight: 700,
      }}>
        {n}
      </div>
      <span style={{ color: C.textSoft, fontSize: "0.875rem", lineHeight: 1.55, paddingTop: 2 }}>{text}</span>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div style={{
      background: C.surfaceAlt, border: `1px solid ${C.borderLight}`,
      borderRadius: 8, padding: "0.6rem 0.9rem", marginTop: "0.75rem",
      display: "flex", gap: "0.5rem", alignItems: "flex-start",
    }}>
      <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>💡</span>
      <span style={{ color: C.textMuted, fontSize: "0.82rem", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "0.15rem 0.55rem", borderRadius: 999,
      background: color + "22", color, border: `1px solid ${color}55`,
      fontFamily: FONT.mono, fontSize: "0.65rem", marginRight: 4, marginBottom: 4,
    }}>
      {label}
    </span>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: FONT.display, fontSize: "1rem", color: C.text,
      margin: "1.1rem 0 0.4rem",
    }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: C.textSoft, fontSize: "0.875rem", lineHeight: 1.65, margin: "0 0 0.6rem" }}>
      {children}
    </p>
  );
}

/* ─── Section definitions ───────────────────────────────────── */
const SECTIONS: Section[] = [
  {
    id: "overview",
    icon: "🗺",
    title: "Overview",
    subtitle: "What RETROLOG does and how it fits together",
    content: (
      <>
        <P>
          RETROLOG is a fully client-side agile retrospective tool. All your data lives in your
          browser's local storage — nothing is ever sent to a server.
        </P>
        <P>The application follows a simple loop:</P>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "0.4rem", margin: "0.75rem 0",
          alignItems: "center",
        }}>
          {["Projects", "→", "Sprints", "→", "Events", "→", "RetroBoard", "→", "Actions", "→", "Reports"].map((t, i) => (
            t === "→"
              ? <span key={i} style={{ color: C.textDim, fontSize: "0.9rem" }}>→</span>
              : <Badge key={i} label={t} color={C.cyan} />
          ))}
        </div>
        <P>
          You create <strong style={{ color: C.text }}>Projects</strong>, run{" "}
          <strong style={{ color: C.text }}>Sprints</strong> inside them, capture{" "}
          <strong style={{ color: C.text }}>Events</strong> as things happen, then during the
          retrospective you organise those events on the{" "}
          <strong style={{ color: C.text }}>RetroBoard</strong>, create{" "}
          <strong style={{ color: C.text }}>Actions</strong>, and generate a{" "}
          <strong style={{ color: C.text }}>Report</strong>.
        </P>
        <Tip text="The top bar always shows the team health indicators (Energy · Focus · Satisfaction). Click them to go straight to the Dashboard." />
      </>
    ),
  },
  {
    id: "dashboard",
    icon: "📊",
    title: "Dashboard",
    subtitle: "Your at-a-glance team health view",
    content: (
      <>
        <P>The Dashboard is your home screen. It shows the current state of the team and active work at a glance.</P>
        <H3>Team Health</H3>
        <P>
          Three sliders — <strong style={{ color: C.text }}>Energy</strong>,{" "}
          <strong style={{ color: C.text }}>Focus</strong>, and{" "}
          <strong style={{ color: C.text }}>Satisfaction</strong> — represent the team's
          subjective state. Drag each slider to update the value. These scores are reflected in
          the coloured dots in the top bar at all times.
        </P>
        <H3>Metrics strip</H3>
        <P>Quick counts of active projects, running sprints, open actions, and unresolved events.</P>
        <H3>Sprint health bar</H3>
        <P>Shows velocity completion (actual vs. planned) for the currently active sprint.</P>
        <H3>Recent activity</H3>
        <P>A feed of the most recently created events and actions across all projects.</P>
        <Tip text="Update health sliders at the start and end of each sprint to build a trend you can reference in Reports." />
      </>
    ),
  },
  {
    id: "projects",
    icon: "📁",
    title: "Projects",
    subtitle: "Create and manage your team's projects",
    content: (
      <>
        <P>A Project is the top-level container. Everything else (sprints, events, actions…) belongs to a project.</P>
        <H3>Creating a project</H3>
        <Step n={1} text='Click « New Project » in the top right of the Projects page.' />
        <Step n={2} text="Enter a name, team name, and optional description." />
        <Step n={3} text="Choose a colour to visually distinguish the project." />
        <Step n={4} text="Select the agile methodology your team uses (Scrum, Kanban, Scrumban, Shape Up, or Other)." />
        <Step n={5} text="Set the default sprint duration in days." />
        <Step n={6} text='Click « Save ».' />
        <H3>Project statuses</H3>
        <div style={{ marginBottom: "0.75rem" }}>
          <Badge label="active" color={C.green} />
          <Badge label="paused" color={C.amber} />
          <Badge label="archived" color={C.textMuted} />
        </div>
        <P>Archived projects are hidden from active views but their data is retained.</P>
        <H3>Deleting a project</H3>
        <P>
          Deleting a project permanently removes all its sprints, log entries, events, and actions.
          This action cannot be undone — export your data first if you want a backup.
        </P>
        <Tip text="Use the project colour to create a visual identity that carries through all views, making it easy to spot items at a glance." />
      </>
    ),
  },
  {
    id: "sprints",
    icon: "⚡",
    title: "Sprints",
    subtitle: "Track iterations and velocity",
    content: (
      <>
        <P>Sprints are time-boxed iterations inside a project. They track planned vs. actual velocity and team mood.</P>
        <H3>Creating a sprint</H3>
        <Step n={1} text='Select a project in the filter bar, then click « New Sprint ».' />
        <Step n={2} text="Enter the sprint number, a short label, and a goal statement." />
        <Step n={3} text="Set start and end dates." />
        <Step n={4} text="Enter the planned velocity (story points or task count)." />
        <Step n={5} text='Click « Save ».' />
        <H3>Sprint statuses</H3>
        <div style={{ marginBottom: "0.75rem" }}>
          <Badge label="planned" color={C.blue} />
          <Badge label="active" color={C.green} />
          <Badge label="completed" color={C.textMuted} />
        </div>
        <H3>Setting the active sprint</H3>
        <P>
          Only one sprint can be active at a time. Click the <strong style={{ color: C.text }}>Set Active</strong> button
          to mark a sprint as the current one. This feeds the Dashboard health bar and pre-selects
          the sprint on the RetroBoard.
        </P>
        <H3>Updating actual velocity</H3>
        <P>At the end of the sprint, open it and fill in the actual velocity and mood score (1–10). This data appears in Reports.</P>
        <Tip text="Write a concrete goal for each sprint. The goal is displayed on the RetroBoard to keep the team focused during the retrospective." />
      </>
    ),
  },
  {
    id: "logbook",
    icon: "📓",
    title: "Logbook",
    subtitle: "A chronological diary for your project",
    content: (
      <>
        <P>The Logbook is a free-form diary for anything that does not fit the structured event system — meeting notes, decisions, context, observations.</P>
        <H3>Adding an entry</H3>
        <Step n={1} text="Select a project and optionally a sprint in the filter bar." />
        <Step n={2} text='Click « New Entry ».' />
        <Step n={3} text="Fill in the title, content, author, and optional tags." />
        <Step n={4} text="The date defaults to today but can be changed." />
        <Step n={5} text='Click « Save ».' />
        <H3>Browsing entries</H3>
        <P>Entries are grouped by date, most recent first. Use the search bar to filter by keyword or tag.</P>
        <Tip text="Tags make cross-cutting topics (e.g. #performance, #ux, #infra) easy to track across multiple entries and sprints." />
      </>
    ),
  },
  {
    id: "events",
    icon: "⚠",
    title: "Events",
    subtitle: "Capture everything that happens during a sprint",
    content: (
      <>
        <P>Events are the raw material of retrospectives. Capture them as they happen so nothing is forgotten by retro day.</P>
        <H3>Event types</H3>
        <div style={{ marginBottom: "0.75rem" }}>
          <Badge label="problem" color={C.red} />
          <Badge label="success" color={C.green} />
          <Badge label="blocker" color={C.orange} />
          <Badge label="risk" color={C.amber} />
          <Badge label="decision" color={C.blue} />
          <Badge label="idea" color={C.violet} />
          <Badge label="observation" color={C.cyan} />
        </div>
        <H3>Creating an event</H3>
        <Step n={1} text='Select a project and sprint, then click « New Event ».' />
        <Step n={2} text="Choose the type and severity." />
        <Step n={3} text="Write a clear title and description." />
        <Step n={4} text="Rate impact, effort, and urgency from 1 to 10." />
        <Step n={5} text='Add tags if useful, then click « Save ».' />
        <H3>Event status pipeline</H3>
        <div style={{ marginBottom: "0.75rem" }}>
          {["raw", "analysed", "actionable", "resolved", "archived"].map((s, i) => (
            <span key={i}>
              <Badge label={s} color={C.textSoft} />
              {i < 4 && <span style={{ color: C.textDim, marginRight: 4 }}>→</span>}
            </span>
          ))}
        </div>
        <P>Use the « Advance » button to move an event forward in the pipeline. Archive events that are no longer relevant.</P>
        <H3>Board vs. List view</H3>
        <P><strong style={{ color: C.text }}>Board view</strong> groups events into columns by type. <strong style={{ color: C.text }}>List view</strong> shows a sortable table. Switch using the toggle in the top right.</P>
        <Tip text="Capture events in real time during the sprint rather than trying to recall everything on retro day. Even a two-word title is enough — you can fill in the description later." />
      </>
    ),
  },
  {
    id: "retroboard",
    icon: "🔄",
    title: "RetroBoard",
    subtitle: "Run your sprint retrospective",
    content: (
      <>
        <P>The RetroBoard is where the team reflects on the sprint. It organises events into three columns and produces a set of actions.</P>
        <H3>Setting up the board</H3>
        <Step n={1} text="Select the project and sprint you want to retro on." />
        <Step n={2} text='Click « New Retrospective » (or open an existing draft).' />
        <Step n={3} text="The event pool on the right shows all unassigned events for this sprint." />
        <H3>Using the three columns</H3>
        <div style={{ marginBottom: "0.5rem" }}>
          <Badge label="✅ Went Well" color={C.green} />
          <Badge label="⚠ To Improve" color={C.amber} />
          <Badge label="💡 Ideas" color={C.violet} />
        </div>
        <P>Drag events from the pool into the appropriate column. Discuss each one with the team.</P>
        <H3>Creating actions</H3>
        <Step n={1} text='Click « + Action » inside any column to add a follow-up action.' />
        <Step n={2} text="Assign it an owner, due date, and priority." />
        <Step n={3} text="The action is automatically linked to the retro and the event." />
        <H3>Completing the retrospective</H3>
        <P>Click <strong style={{ color: C.text }}>« Complete Retro »</strong> to lock the board. A completed retro cannot be edited and becomes available in Reports.</P>
        <Tip text="Time-box your retro: 5 min per column, 10 min for actions. The board auto-saves, so you can pause and come back." />
      </>
    ),
  },
  {
    id: "actions",
    icon: "✅",
    title: "Actions",
    subtitle: "Track follow-ups to completion",
    content: (
      <>
        <P>Actions are the commitments that come out of retrospectives. The Actions view gives you a dedicated tracker for all of them.</P>
        <H3>Action pipeline</H3>
        <div style={{ marginBottom: "0.75rem" }}>
          <Badge label="open" color={C.blue} />
          <span style={{ color: C.textDim, marginRight: 4 }}>→</span>
          <Badge label="in-progress" color={C.amber} />
          <span style={{ color: C.textDim, marginRight: 4 }}>→</span>
          <Badge label="done" color={C.green} />
          <span style={{ color: C.textDim, marginRight: 4 }}>·</span>
          <Badge label="cancelled" color={C.textMuted} />
        </div>
        <H3>Kanban view</H3>
        <P>Cards are arranged in columns by status. Click <strong style={{ color: C.text }}>« Advance »</strong> on a card to move it to the next stage.</P>
        <H3>List view</H3>
        <P>A compact table sorted by due date. Useful for a quick overview across all projects.</P>
        <H3>Creating an action manually</H3>
        <Step n={1} text='Click « New Action ».' />
        <Step n={2} text="Fill in the title, owner, due date, priority, and link it to a project and sprint." />
        <Step n={3} text='Click « Save ».' />
        <Tip text="Review open actions at the start of every sprint stand-up. Actions that slip more than two sprints are a signal the task needs to be broken down or reassigned." />
      </>
    ),
  },
  {
    id: "reports",
    icon: "📋",
    title: "Reports",
    subtitle: "Read and share retrospective summaries",
    content: (
      <>
        <P>Reports are read-only summaries generated from completed retrospectives. They are designed for async sharing and archival.</P>
        <H3>What a report contains</H3>
        <P>Each report includes:</P>
        <ul style={{ color: C.textSoft, fontSize: "0.875rem", lineHeight: 1.8, paddingLeft: "1.25rem" }}>
          <li>Sprint context (goal, dates, velocity comparison)</li>
          <li>Events organised by column (Went Well / To Improve / Ideas)</li>
          <li>Actions created during the retro</li>
          <li>Mood score and team health at time of retro</li>
        </ul>
        <H3>Printing or sharing</H3>
        <P>Use your browser's <strong style={{ color: C.text }}>Print</strong> function (Ctrl/Cmd + P) to export a report as PDF. The layout is optimised for A4 paper.</P>
        <Tip text="A retrospective only appears here once it has been marked « Complete » on the RetroBoard." />
      </>
    ),
  },
  {
    id: "settings",
    icon: "⚙",
    title: "Settings",
    subtitle: "Personalise the app and manage your data",
    content: (
      <>
        <H3>App identity</H3>
        <P>Change the application name, tagline, and accent colour. These are purely cosmetic and have no effect on your data.</P>
        <H3>User identity</H3>
        <P>Set your name and user ID. Your name is used as the default author on new log entries and events.</P>
        <H3>Exporting data</H3>
        <Step n={1} text='Click « Export JSON » in the Data section.' />
        <Step n={2} text="A file named retrolog-export-[date].json is downloaded to your computer." />
        <Step n={3} text="Store it somewhere safe — it is your only backup." />
        <H3>Importing data</H3>
        <Step n={1} text='Click « Choose file » and select a previously exported JSON file.' />
        <Step n={2} text="Choose Merge (adds records that don't exist yet) or Overwrite (full replace)." />
        <Step n={3} text='Click « Import ».' />
        <H3>Resetting all data</H3>
        <P>
          The reset button wipes everything and reloads the demo seed data.
          You must type <strong style={{ color: C.red }}>RESET</strong> in the confirmation box to proceed.
          This cannot be undone.
        </P>
        <Tip text="Export before importing in Overwrite mode — there is no undo." />
      </>
    ),
  },
  {
    id: "tips",
    icon: "🚀",
    title: "Quick-start checklist",
    subtitle: "Get up and running in 5 minutes",
    content: (
      <>
        <P>Follow these steps the first time you use RETROLOG with a real project:</P>
        <Step n={1} text="Go to Settings → enter your name under User Identity → Save." />
        <Step n={2} text="Go to Projects → create your first project with the right methodology and sprint duration." />
        <Step n={3} text='Go to Sprints → create your current sprint, set dates and planned velocity, then click « Set Active ».' />
        <Step n={4} text="During the sprint, go to Events and log problems, successes, and blockers as they happen." />
        <Step n={5} text='On retro day, go to RetroBoard → create a new retrospective → drag events into columns → create actions → click « Complete Retro ».' />
        <Step n={6} text="Go to Actions and track progress on the committed items throughout the next sprint." />
        <Step n={7} text="Go to Reports to review and share the completed retrospective." />
        <Step n={8} text="Go to Settings → Export to back up your data." />
        <Tip text="RETROLOG works best when used continuously — logging events as they happen gives you richer retrospectives than trying to recall everything at the end." />
      </>
    ),
  },
];

/* ─── Main component ─────────────────────────────────────────── */
export function UserGuideView() {
  const ac = useStore((s) => s.settings.accentColor);
  const [activeId, setActiveId] = useState("overview");

  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: ac, margin: "0 0 0.25rem 0" }}>
          User Guide
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: C.textMuted, margin: 0 }}>
          Everything you need to know about RETROLOG — step by step
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
        {/* ── Sidebar nav ── */}
        <nav style={{
          flexShrink: 0, width: 210,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "0.5rem",
          position: "sticky", top: "1rem",
        }}>
          {SECTIONS.map((s) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.55rem 0.75rem", borderRadius: 8, border: "none",
                  background: isActive ? ac + "22" : "transparent",
                  borderLeft: isActive ? `2px solid ${ac}` : "2px solid transparent",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>{s.icon}</span>
                <span style={{
                  fontFamily: FONT.mono, fontSize: "0.7rem",
                  color: isActive ? ac : C.textMuted,
                  fontWeight: isActive ? 700 : 400,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Content panel ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card>
            {/* Section header */}
            <div style={{ marginBottom: "1.25rem", paddingBottom: "0.9rem", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{
                  fontSize: "1.6rem", width: 44, height: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: ac + "18", borderRadius: 10,
                }}>
                  {active.icon}
                </span>
                <div>
                  <h2 style={{
                    fontFamily: FONT.display, fontSize: "1.35rem",
                    color: C.text, margin: 0,
                  }}>
                    {active.title}
                  </h2>
                  <p style={{
                    fontFamily: FONT.mono, fontSize: "0.65rem",
                    color: C.textDim, margin: "0.15rem 0 0",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    {active.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Section body */}
            <div>{active.content}</div>

            {/* Prev / Next navigation */}
            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: "1.75rem",
              paddingTop: "1rem", borderTop: `1px solid ${C.border}`,
            }}>
              {(() => {
                const idx = SECTIONS.findIndex((s) => s.id === activeId);
                const prev = SECTIONS[idx - 1];
                const next = SECTIONS[idx + 1];
                return (
                  <>
                    <div>
                      {prev && (
                        <button
                          onClick={() => setActiveId(prev.id)}
                          style={{
                            background: "transparent", border: `1px solid ${C.border}`,
                            color: C.textMuted, borderRadius: 7, padding: "0.45rem 0.9rem",
                            fontFamily: FONT.mono, fontSize: "0.72rem", cursor: "pointer",
                          }}
                        >
                          ← {prev.title}
                        </button>
                      )}
                    </div>
                    <div>
                      {next && (
                        <button
                          onClick={() => setActiveId(next.id)}
                          style={{
                            background: ac, border: "none",
                            color: C.bgDeep, borderRadius: 7, padding: "0.45rem 0.9rem",
                            fontFamily: FONT.mono, fontSize: "0.72rem", cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          {next.title} →
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
