export type ViewId =
  | "dashboard"
  | "projects"
  | "sprints"
  | "logbook"
  | "events"
  | "retroboard"
  | "actions"
  | "reports"
  | "userguide"
  | "settings";

export interface AppSettings {
  name: string;
  tagline: string;
  accentColor: string;
  defaultSprintDays: number;
  userId: string;
  userName: string;
}

export type Methodology = "scrum" | "kanban" | "scrumban" | "shape-up" | "other";
export type ProjectStatus = "active" | "paused" | "archived";

export interface Project {
  id: string;
  name: string;
  team: string;
  color: string;
  methodology: Methodology;
  sprintDuration: number;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  _origin?: OriginTag;
}

export type SprintStatus = "planned" | "active" | "completed";

export interface Sprint {
  id: string;
  projectId: string;
  number: number;
  label: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  velocityPlanned: number;
  velocityActual: number;
  mood: number;
  note: string;
  _origin?: OriginTag;
}

export interface LogEntry {
  id: string;
  projectId: string;
  sprintId: string;
  date: string;
  author: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  _origin?: OriginTag;
}

export type EventType =
  | "idea"
  | "problem"
  | "success"
  | "blocker"
  | "risk"
  | "decision"
  | "observation";

export type EventSeverity = "low" | "medium" | "high" | "critical";
export type EventStatus = "raw" | "analyzed" | "actionable" | "resolved" | "archived";

export interface AppEvent {
  id: string;
  projectId: string;
  sprintId: string;
  type: EventType;
  severity: EventSeverity;
  status: EventStatus;
  title: string;
  description: string;
  impact: number;
  effort: number;
  urgency: number;
  tags: string[];
  linkedActionIds: string[];
  reportedBy: string;
  occurredAt: string;
  createdAt: string;
  _origin?: OriginTag;
}

export type ActionStatus = "open" | "in-progress" | "done" | "cancelled";
export type ActionPriority = "low" | "medium" | "high";

export interface ActionItem {
  id: string;
  projectId: string;
  sprintId: string;
  targetSprintId: string;
  title: string;
  description: string;
  owner: string;
  status: ActionStatus;
  priority: ActionPriority;
  linkedEventIds: string[];
  dueDate: string;
  createdAt: string;
  resolvedAt: string;
  _origin?: OriginTag;
}

export type RetroStatus = "draft" | "completed";

export interface Retrospective {
  id: string;
  projectId: string;
  sprintId: string;
  date: string;
  facilitator: string;
  participants: string;
  wentWellIds: string[];
  toImproveIds: string[];
  ideasIds: string[];
  actionIds: string[];
  teamMood: number;
  notes: string;
  status: RetroStatus;
  _origin?: OriginTag;
}

export interface OriginTag {
  userId: string;
  userName: string;
  importedAt: string;
}

export interface StoreExport {
  exportVersion: 1;
  exportedAt: string;
  exportedBy: string;
  exportedByName: string;
  settings: AppSettings;
  projects: Project[];
  sprints: Sprint[];
  logEntries: LogEntry[];
  events: AppEvent[];
  actionItems: ActionItem[];
  retrospectives: Retrospective[];
}
