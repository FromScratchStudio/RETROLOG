import { useStore } from "../../store/useStore";
import { C } from "../../theme";
import { iStyle } from "./helpers";

interface Props {
  showSprint?: boolean;
  extras?: React.ReactNode;
}

export function FilterBar({ showSprint = true, extras }: Props) {
  const {
    projects, sprints,
    activeProjectFilter, activeSprintFilter,
    setActiveProjectFilter, setActiveSprintFilter,
  } = useStore();

  const sprintOptions = activeProjectFilter
    ? sprints.filter((s) => s.projectId === activeProjectFilter)
    : [...sprints].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div style={{
      display: "flex", gap: "0.75rem", marginBottom: "1.25rem", alignItems: "center",
      flexWrap: "wrap",
    }}>
      <select
        value={activeProjectFilter}
        onChange={(e) => setActiveProjectFilter(e.target.value)}
        style={{ ...iStyle, width: "auto", minWidth: 160, color: activeProjectFilter ? C.text : C.textDim }}
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {showSprint && (
        <select
          value={activeSprintFilter}
          onChange={(e) => setActiveSprintFilter(e.target.value)}
          style={{ ...iStyle, width: "auto", minWidth: 160, color: activeSprintFilter ? C.text : C.textDim }}
        >
          <option value="">All Sprints</option>
          {sprintOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      )}

      {extras}
    </div>
  );
}
