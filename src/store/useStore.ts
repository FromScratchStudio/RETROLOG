import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ViewId, AppSettings, Project, Sprint, LogEntry, AppEvent,
  ActionItem, Retrospective, StoreExport,
} from "../types";
import {
  seedSettings, seedProjects, seedSprints, seedLogEntries,
  seedEvents, seedActionItems, seedRetrospectives,
} from "../data/seed";

interface StoreState {
  activeView: ViewId;
  settings: AppSettings;
  projects: Project[];
  sprints: Sprint[];
  logEntries: LogEntry[];
  events: AppEvent[];
  actionItems: ActionItem[];
  retrospectives: Retrospective[];
  teamEnergy: number;
  teamFocus: number;
  teamSatisfaction: number;
  activeProjectFilter: string;
  activeSprintFilter: string;

  // Navigation
  setActiveView: (v: ViewId) => void;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Projects
  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, "id">>) => void;
  removeProject: (id: string) => void;

  // Sprints
  addSprint: (s: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Omit<Sprint, "id">>) => void;
  removeSprint: (id: string) => void;
  setSprintActive: (id: string) => void;

  // Log Entries
  addLogEntry: (e: LogEntry) => void;
  updateLogEntry: (id: string, updates: Partial<Omit<LogEntry, "id">>) => void;
  removeLogEntry: (id: string) => void;

  // Events
  addEvent: (e: AppEvent) => void;
  updateEvent: (id: string, updates: Partial<Omit<AppEvent, "id">>) => void;
  removeEvent: (id: string) => void;
  advanceEventStatus: (id: string) => void;
  archiveEvent: (id: string) => void;
  linkActionToEvent: (eventId: string, actionId: string) => void;
  unlinkActionFromEvent: (eventId: string, actionId: string) => void;

  // Action Items
  addActionItem: (a: ActionItem) => void;
  updateActionItem: (id: string, updates: Partial<Omit<ActionItem, "id">>) => void;
  removeActionItem: (id: string) => void;
  advanceActionStatus: (id: string) => void;
  cancelAction: (id: string) => void;

  // Retrospectives
  addRetrospective: (r: Retrospective) => void;
  updateRetrospective: (id: string, updates: Partial<Omit<Retrospective, "id">>) => void;
  removeRetrospective: (id: string) => void;
  addEventToRetroSection: (retroId: string, eventId: string, section: "wentWell" | "toImprove" | "ideas") => void;
  removeEventFromRetro: (retroId: string, eventId: string) => void;
  addActionToRetro: (retroId: string, actionId: string) => void;
  removeActionFromRetro: (retroId: string, actionId: string) => void;
  completeRetrospective: (id: string) => void;

  // Health
  setTeamEnergy: (v: number) => void;
  setTeamFocus: (v: number) => void;
  setTeamSatisfaction: (v: number) => void;

  // Filters
  setActiveProjectFilter: (id: string) => void;
  setActiveSprintFilter: (id: string) => void;

  // Export / Import
  exportData: () => void;
  importData: (data: StoreExport, mode: "overwrite" | "merge") => number;
  resetAllData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeView: "dashboard",
      settings: seedSettings,
      projects: seedProjects,
      sprints: seedSprints,
      logEntries: seedLogEntries,
      events: seedEvents,
      actionItems: seedActionItems,
      retrospectives: seedRetrospectives,
      teamEnergy: 7,
      teamFocus: 6,
      teamSatisfaction: 7,
      activeProjectFilter: "",
      activeSprintFilter: "",

      // Navigation
      setActiveView: (v) => set({ activeView: v }),

      // Settings
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

      // Projects
      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
      updateProject: (id, updates) =>
        set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...updates } : p) })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          sprints: s.sprints.filter((sp) => sp.projectId !== id),
          logEntries: s.logEntries.filter((l) => l.projectId !== id),
          events: s.events.filter((e) => e.projectId !== id),
          actionItems: s.actionItems.filter((a) => a.projectId !== id),
          retrospectives: s.retrospectives.filter((r) => r.projectId !== id),
        })),

      // Sprints
      addSprint: (s) => set((st) => ({ sprints: [...st.sprints, s] })),
      updateSprint: (id, updates) =>
        set((s) => ({ sprints: s.sprints.map((sp) => sp.id === id ? { ...sp, ...updates } : sp) })),
      removeSprint: (id) =>
        set((s) => ({
          sprints: s.sprints.filter((sp) => sp.id !== id),
          logEntries: s.logEntries.map((l) => l.sprintId === id ? { ...l, sprintId: "" } : l),
          events: s.events.map((e) => e.sprintId === id ? { ...e, sprintId: "" } : e),
          actionItems: s.actionItems.map((a) =>
            a.sprintId === id ? { ...a, sprintId: "" } :
            a.targetSprintId === id ? { ...a, targetSprintId: "" } : a
          ),
          retrospectives: s.retrospectives.filter((r) => r.sprintId !== id),
        })),
      setSprintActive: (id) =>
        set((s) => {
          const sprint = s.sprints.find((sp) => sp.id === id);
          if (!sprint) return {};
          const today = new Date().toISOString().slice(0, 10);
          return {
            sprints: s.sprints.map((sp) => {
              if (sp.id === id) return { ...sp, status: "active" };
              if (sp.projectId === sprint.projectId && sp.status === "active" && sp.endDate < today) {
                return { ...sp, status: "completed" };
              }
              return sp;
            }),
          };
        }),

      // Log Entries
      addLogEntry: (e) => set((s) => ({ logEntries: [...s.logEntries, e] })),
      updateLogEntry: (id, updates) =>
        set((s) => ({ logEntries: s.logEntries.map((l) => l.id === id ? { ...l, ...updates } : l) })),
      removeLogEntry: (id) =>
        set((s) => ({ logEntries: s.logEntries.filter((l) => l.id !== id) })),

      // Events
      addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
      updateEvent: (id, updates) =>
        set((s) => ({ events: s.events.map((e) => e.id === id ? { ...e, ...updates } : e) })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      advanceEventStatus: (id) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== id) return e;
            const next: Record<string, AppEvent["status"]> = {
              raw: "analyzed", analyzed: "actionable", actionable: "resolved",
            };
            return next[e.status] ? { ...e, status: next[e.status] } : e;
          }),
        })),
      archiveEvent: (id) =>
        set((s) => ({ events: s.events.map((e) => e.id === id ? { ...e, status: "archived" } : e) })),
      linkActionToEvent: (eventId, actionId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId && !e.linkedActionIds.includes(actionId)
              ? { ...e, linkedActionIds: [...e.linkedActionIds, actionId] }
              : e
          ),
        })),
      unlinkActionFromEvent: (eventId, actionId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, linkedActionIds: e.linkedActionIds.filter((id) => id !== actionId) }
              : e
          ),
        })),

      // Action Items
      addActionItem: (a) => set((s) => ({ actionItems: [...s.actionItems, a] })),
      updateActionItem: (id, updates) =>
        set((s) => ({ actionItems: s.actionItems.map((a) => a.id === id ? { ...a, ...updates } : a) })),
      removeActionItem: (id) =>
        set((s) => ({ actionItems: s.actionItems.filter((a) => a.id !== id) })),
      advanceActionStatus: (id) =>
        set((s) => ({
          actionItems: s.actionItems.map((a) => {
            if (a.id !== id) return a;
            if (a.status === "open") return { ...a, status: "in-progress" };
            if (a.status === "in-progress") return { ...a, status: "done", resolvedAt: new Date().toISOString().slice(0, 10) };
            return a;
          }),
        })),
      cancelAction: (id) =>
        set((s) => ({
          actionItems: s.actionItems.map((a) => a.id === id ? { ...a, status: "cancelled" } : a),
        })),

      // Retrospectives
      addRetrospective: (r) => set((s) => ({ retrospectives: [...s.retrospectives, r] })),
      updateRetrospective: (id, updates) =>
        set((s) => ({ retrospectives: s.retrospectives.map((r) => r.id === id ? { ...r, ...updates } : r) })),
      removeRetrospective: (id) =>
        set((s) => ({ retrospectives: s.retrospectives.filter((r) => r.id !== id) })),
      addEventToRetroSection: (retroId, eventId, section) =>
        set((s) => ({
          retrospectives: s.retrospectives.map((r) => {
            if (r.id !== retroId) return r;
            const ww = r.wentWellIds.filter((i) => i !== eventId);
            const ti = r.toImproveIds.filter((i) => i !== eventId);
            const id = r.ideasIds.filter((i) => i !== eventId);
            if (section === "wentWell") return { ...r, wentWellIds: [...ww, eventId], toImproveIds: ti, ideasIds: id };
            if (section === "toImprove") return { ...r, wentWellIds: ww, toImproveIds: [...ti, eventId], ideasIds: id };
            return { ...r, wentWellIds: ww, toImproveIds: ti, ideasIds: [...id, eventId] };
          }),
        })),
      removeEventFromRetro: (retroId, eventId) =>
        set((s) => ({
          retrospectives: s.retrospectives.map((r) =>
            r.id !== retroId ? r : {
              ...r,
              wentWellIds: r.wentWellIds.filter((i) => i !== eventId),
              toImproveIds: r.toImproveIds.filter((i) => i !== eventId),
              ideasIds: r.ideasIds.filter((i) => i !== eventId),
            }
          ),
        })),
      addActionToRetro: (retroId, actionId) =>
        set((s) => ({
          retrospectives: s.retrospectives.map((r) =>
            r.id === retroId && !r.actionIds.includes(actionId)
              ? { ...r, actionIds: [...r.actionIds, actionId] }
              : r
          ),
        })),
      removeActionFromRetro: (retroId, actionId) =>
        set((s) => ({
          retrospectives: s.retrospectives.map((r) =>
            r.id === retroId
              ? { ...r, actionIds: r.actionIds.filter((i) => i !== actionId) }
              : r
          ),
        })),
      completeRetrospective: (id) =>
        set((s) => ({
          retrospectives: s.retrospectives.map((r) => r.id === id ? { ...r, status: "completed" } : r),
        })),

      // Health
      setTeamEnergy: (v) => set({ teamEnergy: v }),
      setTeamFocus: (v) => set({ teamFocus: v }),
      setTeamSatisfaction: (v) => set({ teamSatisfaction: v }),

      // Filters
      setActiveProjectFilter: (id) =>
        set((s) => {
          const sprint = s.sprints.find((sp) => sp.id === s.activeSprintFilter);
          const sprintBelongs = sprint && (id === "" || sprint.projectId === id);
          return {
            activeProjectFilter: id,
            activeSprintFilter: sprintBelongs ? s.activeSprintFilter : "",
          };
        }),
      setActiveSprintFilter: (id) => set({ activeSprintFilter: id }),

      // Export / Import
      exportData: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        const payload: StoreExport = {
          exportVersion: 1,
          exportedAt: new Date().toISOString(),
          exportedBy: s.settings.userId || "unknown",
          exportedByName: s.settings.userName || "Unknown",
          settings: s.settings,
          projects: s.projects,
          sprints: s.sprints,
          logEntries: s.logEntries,
          events: s.events,
          actionItems: s.actionItems,
          retrospectives: s.retrospectives,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `retrolog-export-${s.settings.userId || "unknown"}-${today}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importData: (data, mode) => {
        const s = get();
        if (mode === "overwrite") {
          set({
            settings: {
              ...s.settings,
              name: data.settings.name,
              tagline: data.settings.tagline,
              defaultSprintDays: data.settings.defaultSprintDays,
            },
            projects: data.projects,
            sprints: data.sprints,
            logEntries: data.logEntries,
            events: data.events,
            actionItems: data.actionItems,
            retrospectives: data.retrospectives,
            activeProjectFilter: "",
            activeSprintFilter: "",
          });
          return (
            data.projects.length +
            data.sprints.length +
            data.logEntries.length +
            data.events.length +
            data.actionItems.length +
            data.retrospectives.length
          );
        } else {
          // merge
          const origin = {
            userId: data.exportedBy,
            userName: data.exportedByName,
            importedAt: new Date().toISOString(),
          };
          const existingIds = {
            projects: new Set(s.projects.map((p) => p.id)),
            sprints: new Set(s.sprints.map((sp) => sp.id)),
            logEntries: new Set(s.logEntries.map((l) => l.id)),
            events: new Set(s.events.map((e) => e.id)),
            actionItems: new Set(s.actionItems.map((a) => a.id)),
            retrospectives: new Set(s.retrospectives.map((r) => r.id)),
          };
          const newProjects = data.projects.filter((p) => !existingIds.projects.has(p.id)).map((p) => ({ ...p, _origin: origin }));
          const newSprints = data.sprints.filter((sp) => !existingIds.sprints.has(sp.id)).map((sp) => ({ ...sp, _origin: origin }));
          const newLogs = data.logEntries.filter((l) => !existingIds.logEntries.has(l.id)).map((l) => ({ ...l, _origin: origin }));
          const newEvents = data.events.filter((e) => !existingIds.events.has(e.id)).map((e) => ({ ...e, _origin: origin }));
          const newActions = data.actionItems.filter((a) => !existingIds.actionItems.has(a.id)).map((a) => ({ ...a, _origin: origin }));
          const newRetros = data.retrospectives.filter((r) => !existingIds.retrospectives.has(r.id)).map((r) => ({ ...r, _origin: origin }));
          set({
            projects: [...s.projects, ...newProjects],
            sprints: [...s.sprints, ...newSprints],
            logEntries: [...s.logEntries, ...newLogs],
            events: [...s.events, ...newEvents],
            actionItems: [...s.actionItems, ...newActions],
            retrospectives: [...s.retrospectives, ...newRetros],
          });
          return newProjects.length + newSprints.length + newLogs.length + newEvents.length + newActions.length + newRetros.length;
        }
      },

      resetAllData: () =>
        set({
          settings: seedSettings,
          projects: seedProjects,
          sprints: seedSprints,
          logEntries: seedLogEntries,
          events: seedEvents,
          actionItems: seedActionItems,
          retrospectives: seedRetrospectives,
          teamEnergy: 7,
          teamFocus: 6,
          teamSatisfaction: 7,
          activeProjectFilter: "",
          activeSprintFilter: "",
          activeView: "dashboard",
        }),
    }),
    {
      name: "retrolog-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function validateImport(data: unknown): data is StoreExport {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (d.exportVersion !== 1) return false;
  if (typeof d.exportedAt !== "string") return false;
  if (!Array.isArray(d.projects)) return false;
  if (!Array.isArray(d.sprints)) return false;
  if (!Array.isArray(d.logEntries)) return false;
  if (!Array.isArray(d.events)) return false;
  if (!Array.isArray(d.actionItems)) return false;
  if (!Array.isArray(d.retrospectives)) return false;
  return true;
}

export function calcPriority(impact: number, effort: number, urgency: number): number {
  return Math.round((impact * 2 + urgency * 2 + (6 - effort)) / 5);
}
