import { useStore } from "./store/useStore";
import { TopBar } from "./components/layout/TopBar";
import { DashboardView } from "./components/views/DashboardView";
import { ProjectsView } from "./components/views/ProjectsView";
import { SprintsView } from "./components/views/SprintsView";
import { LogbookView } from "./components/views/LogbookView";
import { EventsView } from "./components/views/EventsView";
import { RetroBoardView } from "./components/views/RetroBoardView";
import { ActionsView } from "./components/views/ActionsView";
import { ReportsView } from "./components/views/ReportsView";
import { SettingsView } from "./components/views/SettingsView";
import { UserGuideView } from "./components/views/UserGuideView";
import { C } from "./theme";

export default function App() {
  const activeView = useStore((s) => s.activeView);

  const views: Record<string, React.ReactNode> = {
    dashboard:  <DashboardView />,
    projects:   <ProjectsView />,
    sprints:    <SprintsView />,
    logbook:    <LogbookView />,
    events:     <EventsView />,
    retroboard: <RetroBoardView />,
    actions:    <ActionsView />,
    reports:    <ReportsView />,
    userguide:  <UserGuideView />,
    settings:   <SettingsView />,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <TopBar />
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
        {views[activeView] ?? <DashboardView />}
      </main>
    </div>
  );
}
