# RETROLOG — Spécification complète d'implémentation

> Ce document est la spécification de référence pour l'implémentation complète de l'application RETROLOG par un système d'agents IA. Il décrit exhaustivement les fonctionnalités, le modèle de données, l'état applicatif, les composants, les vues et la charte graphique.

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Modèle de données](#4-modèle-de-données)
5. [Gestion d'état (Store)](#5-gestion-détat-store)
6. [Composants UI partagés](#6-composants-ui-partagés)
7. [Layout général](#7-layout-général)
8. [Vues — spécifications détaillées](#8-vues--spécifications-détaillées)
   - [Dashboard](#81-dashboard)
   - [Projects](#82-projects)
   - [Sprints](#83-sprints)
   - [Logbook](#84-logbook)
   - [Events](#85-events)
   - [RetroBoard](#86-retroboard)
   - [Actions](#87-actions)
   - [Reports](#88-reports)
   - [Settings](#89-settings)
9. [Charte graphique & design system](#9-charte-graphique--design-system)
10. [Données de seed](#10-données-de-seed)
11. [Logique métier spécifique](#11-logique-métier-spécifique)
12. [Comportements transversaux](#12-comportements-transversaux)
13. [Export & Import des données](#13-export--import-des-données)

---

## 1. Vision produit

RETROLOG est un **journal de bord agile** — une Single Page Application entièrement côté client, sans backend ni base de données distante. Toutes les données sont persistées dans le `localStorage` du navigateur.

### Positionnement
RETROLOG est l'outil complémentaire à STRATEX : là où STRATEX pilote la stratégie (roadmap, KPIs, pipeline), RETROLOG documente le quotidien opérationnel des équipes et structure leurs cérémonies de rétrospective.

### Ce que l'application permet
- **Journal de bord** : consigner des entrées datées par projet et par sprint
- **Capture d'événements** : saisir des idées, problèmes, succès, blocages, risques, décisions et observations
- **Classification** : typer, taguer et qualifier chaque événement (sévérité, impact, effort, urgence)
- **Évaluation et priorisation** : scorer les événements pour identifier ceux à traiter en priorité
- **Tableau de rétrospective (RetroBoard)** : organiser les événements d'un sprint en 4 sections (Went Well / To Improve / Ideas / Actions) pour animer une rétrospective structurée
- **Suivi des actions** : gérer les action items issus des rétrospectives avec statut, responsable et date cible
- **Rapports de rétrospective** : générer et archiver des comptes-rendus par sprint
- **Dashboard** : synthèse de santé d'équipe, activité récente et indicateurs clés

### Concept clé — Pipeline d'événements
Tout événement suit un pipeline de statuts : **Raw → Analyzed → Actionable → Resolved / Archived**

Ce pipeline reflète le cycle de vie d'une observation : capture brute → analyse → décision d'action → résolution ou archivage.

---

## 2. Stack technique

| Élément | Choix |
|---|---|
| Framework UI | React 18 (JSX/TSX) |
| Langage | TypeScript 5 |
| Bundler | Vite 5 |
| State management | Zustand 5 avec middleware `persist` |
| Persistance | `localStorage` via `createJSONStorage` de Zustand |
| Styles | CSS-in-JS inline (objets `React.CSSProperties` exclusivement — aucun framework CSS, aucun fichier `.css` externe sauf `src/index.css` pour le reset global) |
| Fonts | Google Fonts : DM Serif Display (display), JetBrains Mono (mono), system-ui (body) |
| Routing | Aucun — navigation par état Zustand (`activeView`) |
| Tests | Aucun |
| Déploiement | GitHub Pages via GitHub Actions |

---

## 3. Architecture du projet

```
src/
├── main.tsx              # Point d'entrée React (ReactDOM.createRoot)
├── App.tsx               # Shell principal : TopBar + <main> avec vue active
├── theme.ts              # Constantes de couleurs (C) et de polices (FONT)
├── index.css             # Reset CSS minimal
├── types/
│   └── index.ts          # Tous les types TypeScript de l'application
├── data/
│   └── seed.ts           # Données initiales
├── store/
│   └── useStore.ts       # Store Zustand unique avec toutes les actions
└── components/
    ├── layout/
    │   └── TopBar.tsx
    ├── ui/
    │   ├── Badge.tsx
    │   ├── Card.tsx
    │   ├── ProgressBar.tsx
    │   ├── SectionTitle.tsx
    │   ├── ScoreBar.tsx       # Barre de score 1-5 avec points colorés
    │   └── EmptyState.tsx     # Composant état vide réutilisable
    └── views/
        ├── DashboardView.tsx
        ├── ProjectsView.tsx
        ├── SprintsView.tsx
        ├── LogbookView.tsx
        ├── EventsView.tsx
        ├── RetroBoardView.tsx
        ├── ActionsView.tsx
        ├── ReportsView.tsx
        └── SettingsView.tsx
```

### Règles d'architecture
- Aucun composant de vue ne reçoit de props : ils lisent tous directement depuis le store Zustand.
- Toutes les mutations passent par le store.
- Les IDs sont générés avec `${prefix}-${Date.now()}`.
- Chaque vue contient ses sous-composants de formulaire inline dans son propre fichier.
- Les filtres actifs (projet, sprint) sont stockés dans le store et persistent.

---

## 4. Modèle de données

### 4.1 ViewId
```ts
type ViewId =
  | "dashboard"
  | "projects"
  | "sprints"
  | "logbook"
  | "events"
  | "retroboard"
  | "actions"
  | "reports"
  | "settings";
```

### 4.2 AppSettings
```ts
interface AppSettings {
  name: string;               // ex: "RETROLOG"
  tagline: string;            // ex: "Agile Retrospective & Project Diary"
  accentColor: string;        // couleur hex d'accentuation, ex: "#06b6d4"
  defaultSprintDays: number;  // durée de sprint par défaut en jours, ex: 14
  userId: string;             // identifiant de l'utilisateur courant, ex: "alice@team.io"
  userName: string;           // nom affiché de l'utilisateur, ex: "Alice"
}
```

### 4.3 Project
```ts
type Methodology = "scrum" | "kanban" | "scrumban" | "shape-up" | "other";
type ProjectStatus = "active" | "paused" | "archived";

interface Project {
  id: string;               // ex: "proj-1714220000000"
  name: string;             // ex: "Frontend Platform"
  team: string;             // ex: "Platform Team"
  color: string;            // couleur hex associée au projet
  methodology: Methodology;
  sprintDuration: number;   // durée des sprints en jours (0 = pas de sprints)
  description: string;      // description libre du projet
  status: ProjectStatus;
  createdAt: string;        // YYYY-MM-DD
}
```

### 4.4 Sprint
```ts
type SprintStatus = "planned" | "active" | "completed";

interface Sprint {
  id: string;                // ex: "spr-1714220000000"
  projectId: string;         // référence Project.id
  number: number;            // numéro séquentiel du sprint (1, 2, 3…)
  label: string;             // ex: "Sprint 3" ou "Q2-W1"
  goal: string;              // objectif du sprint
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  status: SprintStatus;
  velocityPlanned: number;   // story points planifiés
  velocityActual: number;    // story points livrés
  mood: number;              // 1-10 — moral d'équipe en fin de sprint
  note: string;              // notes libres sur le sprint
}
```

### 4.5 LogEntry
```ts
interface LogEntry {
  id: string;                // ex: "log-1714220000000"
  projectId: string;         // référence Project.id
  sprintId: string;          // référence Sprint.id ou "" si non lié
  date: string;              // YYYY-MM-DD
  author: string;            // nom de l'auteur
  title: string;             // titre de l'entrée
  content: string;           // contenu textuel libre (multi-lignes)
  tags: string[];            // liste de tags libres
  createdAt: string;         // YYYY-MM-DD
}
```

### 4.6 Event
```ts
type EventType =
  | "idea"          // 💡 Idée d'amélioration
  | "problem"       // ⚠️ Problème rencontré
  | "success"       // ✅ Succès / victoire
  | "blocker"       // 🚫 Blocage technique ou organisationnel
  | "risk"          // 🔺 Risque identifié
  | "decision"      // ⚡ Décision prise
  | "observation";  // 👁 Observation neutre

type EventSeverity = "low" | "medium" | "high" | "critical";

type EventStatus = "raw" | "analyzed" | "actionable" | "resolved" | "archived";

interface Event {
  id: string;                // ex: "evt-1714220000000"
  projectId: string;         // référence Project.id
  sprintId: string;          // référence Sprint.id ou ""
  type: EventType;
  severity: EventSeverity;
  status: EventStatus;
  title: string;
  description: string;
  impact: number;            // 1-5 : impact potentiel si non traité
  effort: number;            // 1-5 : effort estimé pour traiter (1 = faible, 5 = élevé)
  urgency: number;           // 1-5 : urgence de traitement
  tags: string[];
  linkedActionIds: string[]; // références ActionItem.id
  reportedBy: string;        // nom du rapporteur
  occurredAt: string;        // YYYY-MM-DD — date à laquelle l'événement s'est produit
  createdAt: string;         // YYYY-MM-DD — date de saisie
}
```

**Calcul du score de priorité (read-only, calculé à l'affichage) :**
```
priorityScore = Math.round((impact * 2 + urgency * 2 + (6 - effort)) / 5)
```
Ce score donne une valeur entière entre 1 et 5. Il est calculé à la volée et n'est pas persisté.

### 4.7 ActionItem
```ts
type ActionStatus = "open" | "in-progress" | "done" | "cancelled";
type ActionPriority = "low" | "medium" | "high";

interface ActionItem {
  id: string;                  // ex: "act-1714220000000"
  projectId: string;           // référence Project.id
  sprintId: string;            // sprint où l'action a été créée, ou ""
  targetSprintId: string;      // sprint cible pour réalisation, ou ""
  title: string;
  description: string;
  owner: string;               // responsable de l'action
  status: ActionStatus;
  priority: ActionPriority;
  linkedEventIds: string[];    // références Event.id
  dueDate: string;             // YYYY-MM-DD ou ""
  createdAt: string;           // YYYY-MM-DD
  resolvedAt: string;          // YYYY-MM-DD ou ""
}
```

### 4.8 Retrospective
```ts
type RetroStatus = "draft" | "completed";

interface Retrospective {
  id: string;                  // ex: "retro-1714220000000"
  projectId: string;           // référence Project.id
  sprintId: string;            // référence Sprint.id
  date: string;                // YYYY-MM-DD — date de la rétrospective
  facilitator: string;         // nom du facilitateur
  participants: string;        // participants (texte libre, séparé par virgules)
  wentWellIds: string[];       // Event.id classés "Went Well"
  toImproveIds: string[];      // Event.id classés "To Improve"
  ideasIds: string[];          // Event.id classés "Ideas"
  actionIds: string[];         // ActionItem.id créés dans cette retro
  teamMood: number;            // 1-10 — moral d'équipe post-retro
  notes: string;               // notes libres du facilitateur
  status: RetroStatus;
}
```

### 4.9 Métriques de santé d'équipe (scalaires dans le store)
```ts
teamEnergy: number;        // 1-10
teamFocus: number;         // 1-10
teamSatisfaction: number;  // 1-10
```

### 4.10 Filtres actifs (persistés dans le store)
```ts
activeProjectFilter: string;  // Project.id ou "" (tous les projets)
activeSprintFilter: string;   // Sprint.id ou "" (tous les sprints)
```

### 4.11 StoreExport

Enveloppe JSON générée lors d'un export. Elle encapsule l'intégralité des données du store avec des métadonnées d'identification de l'auteur de l'export.

```ts
interface StoreExport {
  exportVersion: 1;           // numéro de version du format — permet la compatibilité ascendante
  exportedAt: string;         // ISO 8601, ex: "2026-04-27T14:32:00.000Z"
  exportedBy: string;         // settings.userId de l'exportateur
  exportedByName: string;     // settings.userName de l'exportateur
  settings: AppSettings;
  projects: Project[];
  sprints: Sprint[];
  logEntries: LogEntry[];
  events: Event[];
  actionItems: ActionItem[];
  retrospectives: Retrospective[];
}
```

**Champ `_origin` sur les entités importées en mode merge :**

Lors d'un import en mode merge, chaque entité importée se voit attacher un champ `_origin` (non affiché dans l'UI, utilisé uniquement pour la traçabilité et le déduplication) :
```ts
type OriginTag = {
  userId: string;    // userId de l'exportateur
  userName: string;  // userName de l'exportateur
  importedAt: string; // ISO 8601
};
```
Ce champ est ajouté sur les interfaces `Project`, `Sprint`, `LogEntry`, `Event`, `ActionItem` et `Retrospective` comme propriété optionnelle :
```ts
_origin?: OriginTag;
```
Il n'est pas affiché dans l'UI mais est conservé dans le store pour savoir à quel utilisateur appartient chaque entité importée. Les entités créées localement n'ont pas ce champ (ou le champ est `undefined`).

---

## 5. Gestion d'état (Store)

Le store est un singleton Zustand persisté dans `localStorage` sous la clé `"retrolog-store"`.

### État complet
```ts
interface StoreState {
  activeView: ViewId;
  settings: AppSettings;        // inclut userId et userName
  projects: Project[];
  sprints: Sprint[];
  logEntries: LogEntry[];
  events: Event[];
  actionItems: ActionItem[];
  retrospectives: Retrospective[];
  teamEnergy: number;
  teamFocus: number;
  teamSatisfaction: number;
  activeProjectFilter: string;
  activeSprintFilter: string;
}
```

### Actions — Navigation
- `setActiveView(v: ViewId): void`

### Actions — Settings
- `updateSettings(updates: Partial<AppSettings>): void`

### Actions — Projects
- `addProject(p: Project): void`
- `updateProject(id: string, updates: Partial<Omit<Project, "id">>): void`
- `removeProject(id: string): void` — supprime également tous les sprints, log entries, events, actions, retros liés

### Actions — Sprints
- `addSprint(s: Sprint): void`
- `updateSprint(id: string, updates: Partial<Omit<Sprint, "id">>): void`
- `removeSprint(id: string): void` — met à jour les log entries, events, actions, retros qui référencent ce sprint (sprintId → "")
- `setSprintActive(id: string): void` — passe le sprint en "active", passe les autres sprints du même projet en "completed" si leur endDate est passée

### Actions — Log Entries
- `addLogEntry(e: LogEntry): void`
- `updateLogEntry(id: string, updates: Partial<Omit<LogEntry, "id">>): void`
- `removeLogEntry(id: string): void`

### Actions — Events
- `addEvent(e: Event): void`
- `updateEvent(id: string, updates: Partial<Omit<Event, "id">>): void`
- `removeEvent(id: string): void`
- `advanceEventStatus(id: string): void` — raw → analyzed → actionable → resolved (sans effet si archived)
- `archiveEvent(id: string): void` — status → "archived"
- `linkActionToEvent(eventId: string, actionId: string): void` — ajoute actionId dans linkedActionIds si non présent
- `unlinkActionFromEvent(eventId: string, actionId: string): void`

### Actions — Action Items
- `addActionItem(a: ActionItem): void`
- `updateActionItem(id: string, updates: Partial<Omit<ActionItem, "id">>): void`
- `removeActionItem(id: string): void`
- `advanceActionStatus(id: string): void` — open → in-progress → done (sans effet si cancelled ou done)
- `cancelAction(id: string): void` — status → "cancelled"

### Actions — Retrospectives
- `addRetrospective(r: Retrospective): void`
- `updateRetrospective(id: string, updates: Partial<Omit<Retrospective, "id">>): void`
- `removeRetrospective(id: string): void`
- `addEventToRetroSection(retroId: string, eventId: string, section: "wentWell" | "toImprove" | "ideas"): void` — ajoute l'eventId dans la section correspondante (wentWellIds, toImproveIds ou ideasIds). Retire l'eventId des deux autres sections si présent (un event ne peut être que dans une section à la fois).
- `removeEventFromRetro(retroId: string, eventId: string): void` — retire l'eventId de toutes les sections
- `addActionToRetro(retroId: string, actionId: string): void`
- `removeActionFromRetro(retroId: string, actionId: string): void`
- `completeRetrospective(id: string): void` — status → "completed"

### Actions — Health
- `setTeamEnergy(v: number): void`
- `setTeamFocus(v: number): void`
- `setTeamSatisfaction(v: number): void`

### Actions — Filters
- `setActiveProjectFilter(id: string): void`
- `setActiveSprintFilter(id: string): void`

### Actions — Export & Import
- `exportData(): void` — construit un objet `StoreExport` à partir de l'état courant et déclenche le téléchargement d'un fichier JSON dans le navigateur (voir section 13.1)
- `importData(data: StoreExport, mode: "overwrite" | "merge"): void` — importe les données du fichier JSON (voir section 13.2 et 13.3)

---

## 6. Composants UI partagés

### Card
Identique à STRATEX.  
Props : `children`, `style?: React.CSSProperties`, `onClick?: () => void`.  
Style : `background: C.surface`, `border: 1px solid C.border`, `borderRadius: 10px`, `padding: 1rem`.  
Curseur `pointer` si `onClick` fourni.

### SectionTitle
Identique à STRATEX.  
Props : `children`, `accent: string`.  
Style : `fontFamily: FONT.mono`, `fontSize: 0.62rem`, `letterSpacing: 0.12em`, `textTransform: uppercase`, `color: accent`, `marginBottom: 0.75rem`.

### ProgressBar
Identique à STRATEX.  
Props : `value: number` (0-100), `color: string`, `height?: number` (défaut : 6).  
Structure : fond `C.border` + barre intérieure `color`.

### Badge
Identique à STRATEX.  
Props : `children`, `color: string`.  
Style : fond `color15` (hex + "26"), bordure `color40` (hex + "66"), texte `color`, `fontFamily: FONT.mono`, `fontSize: 0.58rem`, `borderRadius: 4px`, `padding: 0.1rem 0.45rem`.

### ScoreBar
Barre de score visuelle 1 à 5 représentée par 5 points colorés.  
Props : `value: number` (1-5), `color: string`, `label?: string`.  
Structure : rangée de 5 cercles (8×8px, `borderRadius: 50%`). Les cercles `<= value` sont colorés (`background: color`), les autres sont `C.border`.  
Label optionnel affiché à gauche (`FONT.mono`, `0.6rem`, `C.textDim`).

### EmptyState
Message d'état vide pour listes vides.  
Props : `message: string`, `action?: { label: string; onClick: () => void }`.  
Structure : `Card` centré, texte en `C.textVeryDim`, `FONT.mono`, `0.7rem`, bouton d'action optionnel en style `btn(accentColor)`.

---

## 7. Layout général

### Structure globale (App.tsx)
```
<div style="minHeight:100vh; background:C.bg; color:C.text; display:flex; flexDirection:column; fontFamily:FONT.body">
  <TopBar />
  <main style="flex:1; maxWidth:1440px; margin:0 auto; padding:1.5rem 1.25rem 3rem; width:100%; boxSizing:border-box">
    {VIEW_COMPONENTS[activeView]}
  </main>
</div>
```

### TopBar
Structure identique à STRATEX — deux lignes :

**Ligne 1 — Brand (hauteur 52px)**
- Carré gradient (`accentColor → C.violet`, 26×26px, `borderRadius:6px`)
- Nom de l'app (`FONT.display`, `1.1rem`, `color: accentColor`)
- Séparateur `|` en `C.textVeryDim`
- Tagline (`FONT.mono`, `0.62rem`, `C.textDim`, uppercase, `letterSpacing:0.12em`)
- **Indicateur de santé d'équipe** (côté droit) : 3 petits cercles colorés représentant teamEnergy (vert), teamFocus (cyan), teamSatisfaction (amber), chacun avec sa valeur/10 en `FONT.mono`, `0.58rem`. Cliquer sur cet indicateur → navigue vers "dashboard".

**Ligne 2 — Navigation (tabs)**
- 9 onglets : Dashboard, Projects, Sprints, Logbook, Events, RetroBoard, Actions, Reports, ⚙ Settings
- Style actif : `borderBottom: 2px solid accentColor`, `color: accentColor`
- Style inactif : `borderBottom: 2px solid transparent`, `color: C.textDim`
- Font : `FONT.mono`, `0.65rem`, `letterSpacing:0.08em`
- Fond : `C.bgDeep`, bordure basse : `C.border`

### Sélecteur de filtre global (FilterBar)
Un composant `FilterBar` est affiché sous le titre de chaque vue qui supporte les filtres (Logbook, Events, Sprints, Actions, Reports).  
Structure : rangée horizontale `display:flex; gap:0.75rem; marginBottom:1.25rem; alignItems:center`.  
Contient :
- Sélecteur "Project" : `<select>` avec option "All Projects" + liste des projets (chaque option affiche le nom du projet, la valeur est `project.id`). Connecté à `activeProjectFilter`.
- Sélecteur "Sprint" : `<select>` avec option "All Sprints" + liste des sprints du projet sélectionné (ou tous si "All Projects"). Connecté à `activeSprintFilter`. Si `activeProjectFilter === ""`, affiche tous les sprints triés par date décroissante.
- Style des `<select>` : identique au style `iStyle` standard.

---

## 8. Vues — spécifications détaillées

### 8.1 Dashboard

**Objectif** : Vue de synthèse — santé d'équipe, activité récente et indicateurs clés.

---

**Bloc titre**
- `h2` : nom de l'app (`FONT.display`, `1.4rem`, `C.text`)
- `p` : tagline (`FONT.mono`, `0.72rem`, `C.textDim`)

---

**Grille 2 colonnes — ligne 1**

**Colonne gauche — Team Health (Card)**
- `SectionTitle` avec `C.green` : "Team Health"
- 3 sliders range (1–10) :
  - Energy → couleur `C.green`
  - Focus → couleur `C.cyan`
  - Satisfaction → couleur `C.amber`
- Chaque slider : label (`FONT.mono`, `0.68rem`, `C.textDim`, largeur 110px), `<input type="range" min=1 max=10>` flex, valeur numérique bold à droite (couleur correspondante)
- Les sliders sont bidirectionnellement connectés aux valeurs `teamEnergy`, `teamFocus`, `teamSatisfaction` du store

**Colonne droite — At a Glance (grille 2×2 de Cards cliquables)**
Chaque card : grande valeur numérique (`FONT.mono`, `1.6rem`, bold, couleur), label dessous (`FONT.mono`, `0.6rem`, `C.textDim`, uppercase)
- Active Projects : nombre de projets avec `status === "active"` → couleur `C.green` → navigate vers "projects"
- Events This Sprint : nombre total d'events liés aux sprints actifs (toutes projets confondus) → couleur `C.cyan` → navigate vers "events"
- Open Actions : nombre d'actions avec `status === "open" || status === "in-progress"` → couleur `C.amber` → navigate vers "actions"
- Log Entries This Week : nombre d'entrées de logbook dont `date >= aujourd'hui - 7 jours` → couleur `C.violet` → navigate vers "logbook"

---

**Grille 2 colonnes — ligne 2**

**Events by Type (Card)**
- `SectionTitle` avec `accentColor` : "Events by Type"
- Pour chaque `EventType`, une ligne horizontale :
  - Icône de l'EventType (voir section 11), label du type, barre de proportion, compteur
  - La barre de proportion (`ProgressBar`) montre le % d'événements de ce type sur le total
  - Couleur de chaque ligne : voir métadonnées EventType en section 11
- Si aucun événement : `EmptyState` avec message "No events captured yet."

**Sprint Health (Card)**
- `SectionTitle` avec `accentColor` : "Active Sprints"
- Pour chaque sprint avec `status === "active"`, une ligne :
  - Chip coloré avec couleur du projet (`8×8px, borderRadius:50%`)
  - Nom du projet (`0.72rem`, `C.textSoft`, `FONT.body`)
  - Label du sprint (`0.65rem`, `C.textDim`, `FONT.mono`)
  - `ProgressBar` de vélocité : `Math.round((velocityActual / velocityPlanned) * 100)` ou 0 si `velocityPlanned === 0` → couleur de la phase selon avancement (≥80% → `C.green`, ≥50% → `C.amber`, <50% → `C.red`)
  - Score mood : `ScoreBar` (value: `Math.round(sprint.mood / 2)` arrondi sur 5) couleur `C.cyan`
- Si aucun sprint actif : message "No active sprint." en `C.textVeryDim`

---

**Grille 2 colonnes — ligne 3**

**Recent Events (Card)**
- `SectionTitle` avec `accentColor` : "Recent Events"
- Liste des 5 événements les plus récents (`createdAt` décroissant) :
  - Icône EventType + Badge severity + titre (`0.78rem`, `C.text`) + Badge projet (couleur du projet)
  - Date en `C.textVeryDim`, `FONT.mono`, `0.6rem`
- Lien "View all →" en bas (`C.textDim`, `FONT.mono`, `0.62rem`) → navigate vers "events"
- Si vide : `EmptyState`

**Actions Due Soon (Card)**
- `SectionTitle` avec `C.amber` : "Actions Due Soon"
- Actions avec `status !== "done" && status !== "cancelled"` triées par `dueDate` croissant, affichage des 5 premières
- Chaque ligne : Badge priorité + titre (`0.78rem`) + `owner` (`0.65rem`, `C.textDim`) + date due (`0.6rem`, rouge si passée, amber si dans les 3 jours, sinon `C.textDim`)
- Lien "View all →" → navigate vers "actions"
- Si vide : `EmptyState` avec message "No pending actions."

---

### 8.2 Projects

**Objectif** : CRUD de la liste des projets / équipes.

**En-tête** : titre "Projects" (`FONT.display`, `1.2rem`), compteur "(n projects)", bouton "+ New Project" (`btn(accentColor)`)

**Grille auto-fill `minmax(340px, 1fr)`** :

**Card de projet** (`borderLeft: 3px solid project.color`) :
- Ligne 1 : point coloré + nom (`FONT.display`, `1rem`, `C.text`) + badge statut (active/paused/archived) + boutons ✎ et ×
- Ligne 2 : nom de l'équipe (`0.72rem`, `C.textSoft`) + Badge méthodologie (couleur `C.textDim`, style badge standard)
- Ligne 3 : description (`0.75rem`, `C.textSoft`, `lineHeight:1.5`, tronquée à 2 lignes via `display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden`)
- Ligne 4 : compteur de sprints, compteur d'événements, compteur d'actions ouvertes — chaque compteur avec icône emoji et valeur en `FONT.mono`, `0.65rem`, `C.textDim`
  - Sprints : "📅 n sprints"
  - Events : "⚡ n events"
  - Open actions : "🎯 n open"
- Indicateur sprint actif : si un sprint `status === "active"` existe pour ce projet → ligne "🟢 Sprint n — label" en `C.green`, `FONT.mono`, `0.65rem`. Sinon "No active sprint" en `C.textVeryDim`.
- Ligne `createdAt` : "Since YYYY-MM-DD" en `C.textVeryDim`, `FONT.mono`, `0.58rem`

**Métadonnées de statut de projet :**
- active → `C.green` "Active"
- paused → `C.amber` "Paused"
- archived → `C.textDim` "Archived"

**Métadonnées de méthodologie :**
- scrum → `C.cyan` "Scrum"
- kanban → `C.violet` "Kanban"
- scrumban → `C.blue` "Scrumban"
- shape-up → `C.pink` "Shape-Up"
- other → `C.textDim` "Other"

**Formulaire de projet (ProjectForm) :**
Affiché inline en haut de la grille (mode ajout) ou remplace la card (mode édition).  
Champs :
- name* (input)
- team (input, placeholder "Team name")
- description (textarea, 3 lignes)
- methodology (select : Scrum / Kanban / Scrumban / Shape-Up / Other)
- sprintDuration (input type number, min 0, placeholder "Sprint duration in days (0 = no sprints)")
- status (select : Active / Paused / Archived)
- color picker + affichage hex
- Boutons : ✓ Save, Cancel

**Suppression de projet :**
Confirmation inline (pattern standard "Del" / "×"). Afficher une note d'avertissement en `C.amber` : "This will also delete all sprints, events, log entries and actions for this project."

---

### 8.3 Sprints

**Objectif** : Gestion des sprints par projet.

**En-tête** : titre "Sprints", sous-titre descriptif, bouton "+ New Sprint" (`btn(accentColor)`)

**FilterBar** : sélecteur de projet uniquement (pas de filtre sprint ici).

**Affichage** : si un projet est sélectionné, liste ses sprints triés par `number` décroissant. Si "All Projects", liste tous les sprints groupés par projet (titre de groupe = nom du projet avec sa couleur).

**Card de sprint** (`borderLeft: 3px solid` couleur du projet) :
- Ligne 1 : badge statut + label (`FONT.display`, `1rem`, `C.text`) + boutons ✎ et ×
- Ligne 2 : dates formatées "DD/MM/YYYY → DD/MM/YYYY" (`FONT.mono`, `0.65rem`, `C.textDim`)
- Goal : texte du goal en `0.78rem`, `C.textSoft`, si vide → "No goal defined" en italique `C.textVeryDim`
- Vélocité : label "Velocity" + ProgressBar + fraction `velocityActual / velocityPlanned` (`FONT.mono`, `0.65rem`)
- Mood : label "Mood" + `ScoreBar` (value: `Math.round(mood / 2)`, couleur `C.cyan`) + valeur numérique
- Note si non vide : texte en `0.72rem`, `C.textSoft`, fond `C.surfaceAlt`, `borderRadius:6px`, `padding:0.5rem`
- Compteurs en ligne : events liés + actions liées + log entries liées (`0.62rem`, `C.textDim`, `FONT.mono`)

**Métadonnées de statut sprint :**
- planned → `C.textDim` "Planned"
- active → `C.green` "Active"
- completed → `C.blue` "Completed"

**Formulaire de sprint (SprintForm) :**
Champs :
- projectId* (select parmi les projets actifs)
- label* (input, placeholder "e.g. Sprint 3")
- goal (textarea, 2 lignes)
- startDate* (input type date)
- endDate* (input type date)
- status (select : Planned / Active / Completed)
- velocityPlanned (input type number, min 0)
- velocityActual (input type number, min 0)
- mood (slider range 1-10, couleur `C.cyan`, affichage valeur)
- note (textarea, 2 lignes)
- Boutons : ✓ Save, Cancel

**Règle** : `number` est calculé automatiquement à la création = (nombre de sprints du même projet) + 1.

---

### 8.4 Logbook

**Objectif** : Journal de bord chronologique par projet et sprint.

**En-tête** : titre "Logbook", compteur "n entries", bouton "+ New Entry" (`btn(accentColor)`)

**FilterBar** : sélecteurs projet + sprint.

**Formulaire d'ajout** : affiché inline en haut de la liste si le bouton "+ New Entry" a été cliqué.

**Formulaire LogEntry (LogEntryForm) :**
Champs :
- projectId* (select)
- sprintId (select "No sprint" + liste des sprints du projet sélectionné)
- date* (input type date, valeur par défaut = aujourd'hui)
- author (input, placeholder "Author name")
- title* (input)
- content (textarea, 5 lignes, placeholder "Write your log entry…")
- tags (input, placeholder "tag1, tag2, tag3 — séparés par virgules", parsé en array au save)
- Boutons : ✓ Save, Cancel

**Affichage — vue timeline** :
Entrées triées par `date` décroissant. Chaque fois que la date change, afficher un **séparateur de date** :
- Ligne horizontale `C.border` + chip centré avec la date formatée `DD MMM YYYY` en `FONT.mono`, `0.65rem`, `C.textDim`, fond `C.bg`

**Carte d'entrée de log :**
Structure : `display:flex; gap:1rem; alignItems:flex-start`
- Côté gauche : chip de projet (couleur `project.color`, `8×8px`, arrondi) + indicateur de sprint (`0.58rem`, `C.textDim`, `FONT.mono`, ex: "Sprint 3") empilés verticalement
- Corps :
  - Titre (`0.85rem`, `C.text`, `fontWeight:500`)
  - Contenu : texte plein (pas de troncature), `0.78rem`, `C.textSoft`, `lineHeight:1.6`
  - Rangée du bas : auteur (`↳ author`, `0.62rem`, `C.textDim`, `FONT.mono`) + tags (Badges couleur `C.textDim`) + boutons ✎ et ×

**Mode édition** : remplace la card par un formulaire `LogEntryForm` pré-rempli.

---

### 8.5 Events

**Objectif** : Capture, classification et pipeline de statut des événements.

**En-tête** : titre "Events", sous-titre "Capture, analyze and act on project events", bouton "+ Capture Event" (`btn(accentColor)`)

**FilterBar** : projet + sprint + deux selects supplémentaires :
- Type filter : select "All Types" + liste des types
- Status filter : select "All Statuses" + Raw / Analyzed / Actionable / Resolved / Archived

**Toggle de vue** : deux boutons à droite de l'en-tête :
- "≡ List" et "⊞ Board"
- Bouton actif : fond `accentColor22`, bordure `accentColor44`, couleur `accentColor`
- Bouton inactif : style `btn(C.textDim)`
- État local (`useState`) : `viewMode: "list" | "board"`, défaut `"board"`

---

#### Vue Board (Kanban vertical par statut)

5 colonnes : Raw | Analyzed | Actionable | Resolved | Archived  
Layout : `display:flex; gap:1rem; overflowX:auto; alignItems:flex-start`  
Chaque colonne : `minWidth:260px; flex:0 0 260px`  
Card de colonne avec `borderTop: 3px solid` couleur du statut (voir section 11).

**En-tête de colonne** : label du statut (couleur du statut), compteur d'items

**Card d'événement (EventCard)** :
- Ligne 1 : icône EventType + Badge sévérité + boutons ✎ et ×
- Titre (`0.78rem`, `C.text`)
- Description si non vide (tronquée à 2 lignes)
- Badge projet (couleur du projet) + Badge sprint si lié
- ScoreBar impact (couleur `C.red`, label "Impact")
- ScoreBar urgency (couleur `C.orange`, label "Urgency")
- Score de priorité calculé : `⬆ Priority: n/5` en `FONT.mono`, `0.62rem`, couleur selon score (≥4 → `C.red`, ≥3 → `C.amber`, <3 → `C.green`)
- `reportedBy` : "↳ name" en `0.58rem`, `C.textDim`
- `occurredAt` en `0.58rem`, `C.textVeryDim`
- Bouton "→ Advance" : avance le statut d'un cran (sauf si archived/resolved). Style `btn(statusColor)`. Texte : `"→ Analyze"` si raw, `"→ Action"` si analyzed, `"→ Resolve"` si actionable.
- Bouton "Archive" (si resolved) : style `btn(C.textDim)`

#### Vue List (tableau)

Tableau complet avec colonnes : Type (icône) | Severity | Title | Project | Sprint | Impact | Urgency | Priority | Status | Date | Actions  
Triable par `occurredAt` décroissant par défaut.  
Lignes alternées : fond `C.surface` / `C.surfaceAlt`.  
Chaque ligne : hauteur auto, toutes les données inline, boutons ✎ et × à droite.

---

**Formulaire d'événement (EventForm) :**
Affiché dans une Card inline en haut de la vue (ajout) ou remplace la card (édition).  
Champs :
- title* (input)
- description (textarea, 3 lignes)
- type* (select : 7 options avec icône + label)
- severity* (select : Low / Medium / High / Critical)
- status (select : Raw / Analyzed / Actionable / Resolved / Archived)
- projectId* (select)
- sprintId (select "No sprint" + liste)
- reportedBy (input)
- occurredAt (input type date, défaut = aujourd'hui)
- Sous-section "Scores" (grille 3 colonnes) :
  - impact : slider 1-5 avec label "Impact" + valeur + description "1 = negligible, 5 = critical"
  - effort : slider 1-5 avec label "Effort to address" + valeur + description "1 = quick fix, 5 = major effort"
  - urgency : slider 1-5 avec label "Urgency" + valeur + description "1 = can wait, 5 = immediate"
- tags (input, comma-separated)
- Boutons : ✓ Save, Cancel

---

### 8.6 RetroBoard

**Objectif** : Animer et structurer une rétrospective de sprint en organisant les événements en 4 sections.

**En-tête** : titre "RetroBoard" (`FONT.display`), sous-titre "Sprint retrospective — drag events into sections"

**Sélecteurs de contexte** (en haut, avant le board) :
- Select "Project*" → filtre les sprints disponibles
- Select "Sprint*" → sélectionne le sprint à rétrospectiver. Liste uniquement les sprints `status === "completed" || status === "active"`.
- Bouton "Load Retro" → charge ou crée la rétrospective pour ce sprint (vérifie si une Retrospective existe déjà pour ce `projectId + sprintId` ; si oui, charge-la ; si non, crée-la avec `status: "draft"` et l'ajoute au store)
- Affichage conditionnel : si aucun projet ou sprint sélectionné → card de guidance "Select a project and a sprint to start your retrospective."

**Bandeau d'info sprint** (si sprint chargé) :
Card avec : label du sprint + dates + goal + vélocité + mood. Fond `C.surfaceAlt`.

**Zone de la rétro** (si retro chargée) :

**Méta-rétro** (Card condensée au-dessus du board) :
- facilitator (input inline) : "Facilitator"
- participants (input inline) : "Participants"
- teamMood (slider 1-10, couleur `C.cyan`) : "Team Mood"
- notes (textarea 2 lignes) : "General Notes"
- Ces champs appellent `updateRetrospective` à chaque modification (pas de bouton Save séparé — auto-save)

**Board 4 colonnes** : `display:flex; gap:1rem; alignItems:flex-start; overflowX:auto`

| Colonne | Couleur | Icône | Label |
|---|---|---|---|
| wentWell | `C.green` | ✅ | Went Well |
| toImprove | `C.amber` | 🔧 | To Improve |
| ideas | `C.cyan` | 💡 | Ideas |
| actions | `C.violet` | ⚡ | Actions |

Chaque colonne : `minWidth:280px; flex:0 0 280px`. Card avec `borderTop: 3px solid couleur`.

**Colonnes wentWell / toImprove / ideas :**
- Contenu : EventCards compactes (titre + type + projet + bouton "×" pour retirer de la section)
- Chaque card est cliquable pour voir le détail de l'événement (inline expand avec description complète)

**Colonne Actions :**
- Contenu : ActionCards (titre + owner + priority + status + bouton "×")
- Bouton "+ New Action" en bas de colonne → `ActionMiniForm` inline (champs : title*, owner, priority, dueDate)

**Pool d'événements non assignés** (en dessous du board) :
- `SectionTitle` avec `C.textDim` : "Unassigned Sprint Events"
- Grille auto-fill `minmax(220px, 1fr)`
- Événements du sprint sélectionné qui ne sont pas dans wentWellIds / toImproveIds / ideasIds
- Chaque card : EventCard compacte avec 3 boutons d'assignation : "✅ Well", "🔧 Improve", "💡 Idea"
- Cliquer un bouton → appelle `addEventToRetroSection(retroId, eventId, section)`

**Bouton "Generate Report"** (en bas de page, aligné à droite) :
- Style `btn(accentColor)` mais avec un fond plus opaque (`accentColor44`)
- Action : `completeRetrospective(retroId)` + `setActiveView("reports")`
- Désactivé et grisé si `retro.status === "completed"`

---

### 8.7 Actions

**Objectif** : Suivi de toutes les action items issues des rétrospectives et du travail quotidien.

**En-tête** : titre "Actions", sous-titre descriptif, bouton "+ New Action" (`btn(accentColor)`)

**FilterBar** : projet + sprint + select "Priority" (All / High / Medium / Low) + select "Owner" (All + liste des owners distincts présents dans le store)

**Toggle de vue** : "≡ List" / "⊞ Board" (identique à Events)

---

#### Vue Board (Kanban par statut d'action)

4 colonnes : Open | In Progress | Done | Cancelled  
Couleurs des colonnes :
- open → `C.amber`
- in-progress → `C.cyan`
- done → `C.green`
- cancelled → `C.textDim`

**Card d'action :**
- Badge priorité (high → `C.red`, medium → `C.amber`, low → `C.textDim`)
- Titre (`0.78rem`, `C.text`)
- Owner : "👤 owner" en `0.65rem`, `C.textDim`
- Badge projet + badge sprint cible si défini
- Due date : "📅 date" (rouge si passée et non done)
- Compteur events liés : "⚡ n events" en `0.6rem`, `C.textDim`
- Bouton "→ Advance" (si open → "→ Start", si in-progress → "→ Complete"). Style `btn(statusColor)`.
- Bouton "✕ Cancel" (si open ou in-progress). Style `btn(C.textDim)`.
- Boutons ✎ et ×

#### Vue List

Tableau : Priority | Title | Owner | Project | Target Sprint | Due Date | Linked Events | Status | Actions

---

**Formulaire d'action (ActionForm) :**
Champs :
- title* (input)
- description (textarea, 3 lignes)
- owner (input)
- priority (select : High / Medium / Low)
- status (select : Open / In Progress / Done / Cancelled)
- projectId* (select)
- sprintId (select "No sprint" — sprint de création)
- targetSprintId (select "No sprint" — sprint cible)
- dueDate (input type date)
- resolvedAt (input type date — optionnel, affiché seulement si status === "done")
- Boutons : ✓ Save, Cancel

---

### 8.8 Reports

**Objectif** : Liste et consultation des rapports de rétrospective par sprint.

**En-tête** : titre "Reports", sous-titre "Retrospective archives"

**FilterBar** : projet uniquement.

**Liste des rétrospectives** (triées par `date` décroissant) :

**Card de rétrospective dans la liste :**
- Badge statut (draft → `C.amber` "Draft", completed → `C.green` "Completed")
- Nom du projet (couleur du projet) + Label du sprint
- Date de la rétro + Facilitateur
- Compteurs : "✅ n" + "🔧 n" + "💡 n" + "⚡ n" (nombre d'items dans chaque section)
- teamMood : `ScoreBar` (value: `Math.round(teamMood/2)`, couleur `C.cyan`)
- Bouton "Open Report →" → ouvre la vue détail inline (expand)

**Vue détail d'un rapport (expand inline, remplace la card de liste) :**

Structure verticale :

1. **En-tête du rapport**
   - Label du sprint, projet (couleur), dates du sprint, goal
   - Facilitateur, participants, date de la retro
   - teamMood en grand (`FONT.mono`, `1.4rem`, `C.cyan`, bold) + label "Team Mood"
   - Statut avec bouton "Complete Report" si draft (appelle `completeRetrospective`)

2. **Section "✅ Went Well" (fond `C.green` 5%)**
   - SectionTitle en `C.green`
   - Liste des événements (wentWellIds) : EventCard compacte (icône, titre, type badge)
   - Si vide : "Nothing recorded." en `C.textVeryDim`

3. **Section "🔧 To Improve" (fond `C.amber` 5%)**
   - Idem, avec toImproveIds

4. **Section "💡 Ideas & Suggestions" (fond `C.cyan` 5%)**
   - Idem, avec ideasIds

5. **Section "⚡ Action Items"**
   - SectionTitle en `C.violet`
   - Liste des actions (actionIds) : titre, owner, priority badge, statut badge, due date
   - Si vide : "No actions defined."

6. **Notes générales**
   - SectionTitle en `accentColor` : "Facilitator Notes"
   - Texte en `0.82rem`, `C.textSoft`, `lineHeight:1.65`
   - Si vide : "No notes." en `C.textVeryDim`

7. **Bouton "← Close"** retourne à la liste

---

### 8.9 Settings

**Objectif** : Personnalisation globale de l'application.

**Titre** : "Settings" (`FONT.display`, `1.2rem`)

**Bloc App Settings (Card) :**
- App Name (input)
- Tagline (input)
- Accent Color (color picker + hex + barre de gradient `accentColor22 → accentColor`)
- Default Sprint Duration : slider range (1–28 jours) + valeur en jours + label "days" (`FONT.mono`)
- Bouton "Save Changes" (fond plein `accentColor`, texte `#000`)
- Après save : texte → "✓ Saved!" pendant 1,5s

**Bloc User Identity (Card) :**
- `SectionTitle` avec `accentColor` : "User Identity"
- Description : `"Each local store is tied to a user identity. This identifier is embedded in exports to track data provenance."` en `0.72rem`, `C.textDim`
- userId (input, label "User ID", placeholder "e.g. alice@team.io", description `0.62rem` `C.textDim` sous le champ : "Used as the owner identifier in exports and imports.")
- userName (input, label "Display Name", placeholder "e.g. Alice")
- Bouton "Save Identity" (fond plein `accentColor`, texte `#000`). Après save : "✓ Identity saved!" pendant 1,5s.
- Appelle `updateSettings({ userId, userName })`

---

**Bloc Export / Import (Card) :**
- `SectionTitle` avec `C.violet` : "Data Export & Import"

**Sous-section Export :**
- Description : `"Download a full JSON backup of your store. The file includes your user identity for traceability."` en `0.72rem`, `C.textDim`
- Bouton "⬇ Export Data as JSON" : style `btn(C.violet)`. Appelle `exportData()`. Déclenche immédiatement le téléchargement sans confirmation.
- Nom du fichier téléchargé : `retrolog-export-${userId}-${YYYY-MM-DD}.json`

**Sous-section Import :**
- Description : `"Import a JSON file previously exported from RETROLOG. Choose how to merge the data."` en `0.72rem`, `C.textDim`
- Input file : `<input type="file" accept=".json">` — stylé avec `iStyle`, label "Select JSON file"
- Aperçu du fichier sélectionné : une fois un fichier parsé sans erreur, afficher une Card de prévisualisation :
  - "Exported by: {exportedByName} ({exportedBy})" en `FONT.mono`, `0.68rem`
  - "Exported at: {exportedAt}" en `0.65rem`, `C.textDim`
  - Compteurs : `{n} projects, {n} sprints, {n} events, {n} log entries, {n} actions, {n} retros` en `0.65rem`, `C.textSoft`
  - Si le fichier est invalide (non parsable ou `exportVersion` absent) : message d'erreur en `C.red` "Invalid RETROLOG export file."
- Sélecteur de mode : deux boutons radio-style :
  - **Overwrite** (fond `C.red22`, bordure `C.red44`, label rouge si sélectionné) : "Replace all local data with imported data"
  - **Merge** (fond `C.cyan22`, bordure `C.cyan44`, label cyan si sélectionné) : "Add imported data alongside local data"
  - Défaut : "Merge"
- Message d'avertissement contextuel :
  - Si Overwrite sélectionné : Card `borderLeft: 3px solid C.red` — `"⚠ This will permanently replace all your local projects, events, and actions with the imported data. Your current data will be lost."`
  - Si Merge sélectionné : Card `borderLeft: 3px solid C.cyan` — `"ℹ Imported data will be added to your existing store. Duplicate IDs will be skipped. Imported items will be tagged with the source user identity."`
- Bouton "⬆ Import" : fond plein `accentColor`, texte `#000`, bold. Désactivé si aucun fichier valide sélectionné. Appelle `importData(parsedData, mode)`.
- Après import réussi : message de succès `"✓ Import completed. {n} items added."` (mode merge) ou `"✓ Store replaced with imported data."` (mode overwrite) en `C.green`, `FONT.mono`, `0.72rem`.

---

**Bloc Danger Zone (Card avec `borderLeft: 3px solid C.red`) :**
- SectionTitle en `C.red` : "Danger Zone"
- Bouton "Reset All Data" : style `btn(C.red)`. Confirmation inline : "This will permanently delete all projects, sprints, events, and actions. Type RESET to confirm." + input de confirmation + bouton "Confirm Reset" (fond `C.red`, texte blanc) qui appelle une action `resetAllData()` qui réinitialise le store avec les données de seed.

---

## 9. Charte graphique & design system

### 9.1 Identité visuelle

RETROLOG partage le **design system** de STRATEX — même palette, mêmes règles typographiques, mêmes patterns de composants. Cette cohérence permet aux deux applications de fonctionner ensemble visuellement.

**Différenciation** : la couleur d'accentuation par défaut est `#06b6d4` (cyan) au lieu de `#c9a84c` (or) pour STRATEX. Le gradient du logo est `accentColor → C.violet` au lieu de `accentColor → #f97316`.

### 9.2 Palette de couleurs complète

Identique à STRATEX — utiliser exactement les mêmes valeurs :

```ts
export const C = {
  bg:           "#0a0c10",
  bgDeep:       "#06080c",
  surface:      "#0d1118",
  surfaceAlt:   "#141820",
  surfaceHover: "#1a2030",
  border:       "#1f2535",
  borderLight:  "#2d3449",
  gold:         "#c9a84c",   // non utilisé comme accent par défaut dans RETROLOG
  goldLight:    "#e0c070",
  goldDim:      "#8a6e30",
  text:         "#e8e4dc",
  textSoft:     "#c4c0b5",
  textMuted:    "#8a8fa8",
  textDim:      "#555b70",
  textVeryDim:  "#3a3f52",
  green:        "#10b981",
  greenDark:    "#064e3b",
  red:          "#ef4444",
  redDark:      "#450a0a",
  amber:        "#f59e0b",
  orange:       "#f97316",
  cyan:         "#06b6d4",   // ← accent par défaut de RETROLOG
  violet:       "#8b5cf6",
  pink:         "#ec4899",
  blue:         "#4c7fc9",
} as const;
```

### 9.3 Typographie

Identique à STRATEX :
```ts
export const FONT = {
  display: "'DM Serif Display', Georgia, serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
  body:    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;
```

Même hiérarchie de tailles (0.58rem → 1.6rem).

### 9.4 Métadonnées d'EventType

```ts
const EVENT_TYPE_META: Record<EventType, { icon: string; label: string; color: string }> = {
  idea:        { icon: "💡", label: "Idea",        color: C.cyan   },
  problem:     { icon: "⚠️", label: "Problem",     color: C.amber  },
  success:     { icon: "✅", label: "Success",     color: C.green  },
  blocker:     { icon: "🚫", label: "Blocker",     color: C.red    },
  risk:        { icon: "🔺", label: "Risk",        color: C.orange },
  decision:    { icon: "⚡", label: "Decision",    color: C.violet },
  observation: { icon: "👁",  label: "Observation", color: C.textMuted },
};
```

### 9.5 Métadonnées d'EventSeverity

```ts
const SEVERITY_META: Record<EventSeverity, { label: string; color: string }> = {
  low:      { label: "Low",      color: C.textDim },
  medium:   { label: "Medium",   color: C.amber   },
  high:     { label: "High",     color: C.orange  },
  critical: { label: "Critical", color: C.red     },
};
```

### 9.6 Métadonnées d'EventStatus (couleurs colonnes kanban)

```ts
const EVENT_STATUS_META: Record<EventStatus, { label: string; color: string }> = {
  raw:        { label: "Raw",        color: C.textDim },
  analyzed:   { label: "Analyzed",   color: C.blue    },
  actionable: { label: "Actionable", color: C.amber   },
  resolved:   { label: "Resolved",   color: C.green   },
  archived:   { label: "Archived",   color: C.textVeryDim },
};
```

### 9.7 Règles de composants

Identiques à STRATEX :
- Cards : `background: C.surface`, `border: 1px solid C.border`, `borderRadius: 10px`, `padding: 1rem`
- Boutons secondaires `btn(color)` : `background: ${color}22`, `border: 1px solid ${color}44`
- Boutons primaires (save) : fond plein, `color: "#000"`, bold
- Inputs `iStyle` : `background: C.surfaceAlt`, `border: 1px solid C.border`, `borderRadius: 5px`, `padding: 0.35rem 0.55rem`, `fontSize: 0.78rem`, `outline: none`, `width: 100%`, `boxSizing: border-box`

### 9.8 Pattern de confirmation de suppression

Identique à STRATEX : bouton × → état de confirmation → "Del" (rouge) + "×" (annuler). Pas de modale.

### 9.9 Responsive

Desktop-first, `maxWidth: 1440px`. Grilles `auto-fill` adaptables. Kanban boards avec `overflowX: auto`. Aucun media query.

---

## 10. Données de seed

### AppSettings
```json
{
  "name": "RETROLOG",
  "tagline": "Agile Retrospective & Project Diary",
  "accentColor": "#06b6d4",
  "defaultSprintDays": 14,
  "userId": "",
  "userName": ""
}
```

> `userId` et `userName` sont vides par défaut. L'utilisateur est invité à les renseigner dans Settings → User Identity lors du premier lancement.

### Métriques initiales
```ts
teamEnergy: 7, teamFocus: 6, teamSatisfaction: 7
```

### Filtres initiaux
```ts
activeProjectFilter: "", activeSprintFilter: ""
```

### Projects (3)
```ts
[
  {
    id: "proj-001",
    name: "Frontend Platform",
    team: "Platform Team",
    color: "#06b6d4",
    methodology: "scrum",
    sprintDuration: 14,
    description: "Web application frontend infrastructure, design system and core user-facing features.",
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "proj-002",
    name: "Mobile App",
    team: "Mobile Squad",
    color: "#8b5cf6",
    methodology: "scrum",
    sprintDuration: 14,
    description: "Cross-platform mobile application (iOS & Android) built with React Native.",
    status: "active",
    createdAt: "2026-02-01",
  },
  {
    id: "proj-003",
    name: "API Gateway",
    team: "Backend Core",
    color: "#10b981",
    methodology: "kanban",
    sprintDuration: 0,
    description: "Central API gateway — routing, auth, rate limiting, and observability.",
    status: "paused",
    createdAt: "2026-01-05",
  },
]
```

### Sprints (5)
```ts
[
  {
    id: "spr-001",
    projectId: "proj-001",
    number: 1,
    label: "Sprint 1",
    goal: "Set up CI/CD pipeline and establish component library baseline.",
    startDate: "2026-01-20",
    endDate: "2026-02-02",
    status: "completed",
    velocityPlanned: 30,
    velocityActual: 26,
    mood: 7,
    note: "Good start. CI took longer than expected but team adapted well.",
  },
  {
    id: "spr-002",
    projectId: "proj-001",
    number: 2,
    label: "Sprint 2",
    goal: "Deliver authentication flow and dashboard skeleton.",
    startDate: "2026-02-03",
    endDate: "2026-02-16",
    status: "completed",
    velocityPlanned: 35,
    velocityActual: 38,
    mood: 9,
    note: "Exceeded velocity. Auth delivered ahead of schedule.",
  },
  {
    id: "spr-003",
    projectId: "proj-001",
    number: 3,
    label: "Sprint 3",
    goal: "Billing integration and onboarding flow v1.",
    startDate: "2026-02-17",
    endDate: "2026-03-02",
    status: "active",
    velocityPlanned: 40,
    velocityActual: 18,
    mood: 6,
    note: "",
  },
  {
    id: "spr-004",
    projectId: "proj-002",
    number: 1,
    label: "Sprint 1",
    goal: "Core navigation, authentication and offline mode foundation.",
    startDate: "2026-02-10",
    endDate: "2026-02-23",
    status: "completed",
    velocityPlanned: 25,
    velocityActual: 22,
    mood: 8,
    note: "Offline sync proved complex — deferred to Sprint 2.",
  },
  {
    id: "spr-005",
    projectId: "proj-002",
    number: 2,
    label: "Sprint 2",
    goal: "Offline sync, push notifications and profile screens.",
    startDate: "2026-02-24",
    endDate: "2026-03-09",
    status: "active",
    velocityPlanned: 30,
    velocityActual: 12,
    mood: 5,
    note: "Blocked by third-party push notification SDK migration.",
  },
]
```

### LogEntries (5)
```ts
[
  {
    id: "log-001",
    projectId: "proj-001",
    sprintId: "spr-003",
    date: "2026-02-19",
    author: "Alice",
    title: "Billing sprint kickoff",
    content: "Team aligned on Stripe integration scope. Breaking down the work into 3 sub-tasks: webhook handling, subscription management, and invoice UI. Complexity higher than estimated.",
    tags: ["billing", "kickoff", "stripe"],
    createdAt: "2026-02-19",
  },
  {
    id: "log-002",
    projectId: "proj-001",
    sprintId: "spr-003",
    date: "2026-02-22",
    author: "Bob",
    title: "Stripe webhook issues",
    content: "Spent 2 days debugging webhook signature verification. Root cause: timezone mismatch in event timestamps. Fix deployed, tests green.",
    tags: ["stripe", "bug", "resolved"],
    createdAt: "2026-02-22",
  },
  {
    id: "log-003",
    projectId: "proj-002",
    sprintId: "spr-005",
    date: "2026-02-26",
    author: "Clara",
    title: "Push SDK migration blocker",
    content: "Firebase Cloud Messaging v9 SDK is incompatible with our current build toolchain. Migration to v9 requires Xcode 15+ which blocks our iOS support matrix. Escalated to tech lead.",
    tags: ["mobile", "push", "blocker", "firebase"],
    createdAt: "2026-02-26",
  },
  {
    id: "log-004",
    projectId: "proj-001",
    sprintId: "spr-002",
    date: "2026-02-14",
    author: "Alice",
    title: "Sprint 2 retro notes",
    content: "Great sprint overall. Team energy high. Auth delivered clean. Identified that our PR review cycle is too slow — averaging 48h. Agreed on a 24h SLA for reviews going forward.",
    tags: ["retro", "process", "improvement"],
    createdAt: "2026-02-14",
  },
  {
    id: "log-005",
    projectId: "proj-003",
    sprintId: "",
    date: "2026-02-01",
    author: "Dev",
    title: "API Gateway paused — context note",
    content: "Project paused due to resource constraints. Core routing and auth middleware are functional. Rate limiting is 60% complete. Resume expected in Q3 once Platform team bandwidth frees up.",
    tags: ["pause", "status", "context"],
    createdAt: "2026-02-01",
  },
]
```

### Events (10)
```ts
[
  {
    id: "evt-001",
    projectId: "proj-001",
    sprintId: "spr-003",
    type: "blocker",
    severity: "high",
    status: "actionable",
    title: "Stripe webhook signature verification failing in staging",
    description: "HMAC signature mismatch due to timezone inconsistency between server and Stripe's UTC timestamps. Blocks end-to-end billing tests.",
    impact: 4, effort: 2, urgency: 5,
    tags: ["stripe", "staging", "billing"],
    linkedActionIds: ["act-001"],
    reportedBy: "Bob",
    occurredAt: "2026-02-21",
    createdAt: "2026-02-21",
  },
  {
    id: "evt-002",
    projectId: "proj-001",
    sprintId: "spr-002",
    type: "success",
    severity: "low",
    status: "resolved",
    title: "Authentication flow delivered 2 days ahead of schedule",
    description: "JWT + refresh token flow complete with full test coverage. Onboarding integration started earlier than planned.",
    impact: 4, effort: 3, urgency: 1,
    tags: ["auth", "delivery", "win"],
    linkedActionIds: [],
    reportedBy: "Alice",
    occurredAt: "2026-02-11",
    createdAt: "2026-02-11",
  },
  {
    id: "evt-003",
    projectId: "proj-001",
    sprintId: "spr-002",
    type: "problem",
    severity: "medium",
    status: "analyzed",
    title: "PR review cycle averaging 48 hours — slowing delivery",
    description: "Team identified that pull request reviews are taking too long. Average time from PR open to first review is 48h, creating bottlenecks in the delivery pipeline.",
    impact: 3, effort: 2, urgency: 3,
    tags: ["process", "code-review", "bottleneck"],
    linkedActionIds: ["act-002"],
    reportedBy: "Alice",
    occurredAt: "2026-02-14",
    createdAt: "2026-02-14",
  },
  {
    id: "evt-004",
    projectId: "proj-002",
    sprintId: "spr-005",
    type: "blocker",
    severity: "critical",
    status: "raw",
    title: "Firebase Cloud Messaging v9 incompatible with current build toolchain",
    description: "FCM SDK v9 requires Xcode 15+ which conflicts with our iOS 14 minimum support requirement. Cannot proceed with push notifications implementation.",
    impact: 5, effort: 5, urgency: 5,
    tags: ["firebase", "push", "ios", "sdk"],
    linkedActionIds: [],
    reportedBy: "Clara",
    occurredAt: "2026-02-25",
    createdAt: "2026-02-25",
  },
  {
    id: "evt-005",
    projectId: "proj-002",
    sprintId: "spr-001",
    type: "decision",
    severity: "medium",
    status: "resolved",
    title: "Defer offline sync to Sprint 2 — too complex for Sprint 1 scope",
    description: "After 3 days of investigation, team decided to defer full offline sync implementation. Core caching layer will be done in Sprint 1, full sync in Sprint 2.",
    impact: 3, effort: 4, urgency: 2,
    tags: ["architecture", "offline", "scope"],
    linkedActionIds: [],
    reportedBy: "Clara",
    occurredAt: "2026-02-13",
    createdAt: "2026-02-13",
  },
  {
    id: "evt-006",
    projectId: "proj-001",
    sprintId: "spr-003",
    type: "idea",
    severity: "low",
    status: "analyzed",
    title: "Add automated billing smoke tests to CI pipeline",
    description: "After the Stripe webhook issues, we should have automated smoke tests that run against Stripe's test environment on every PR merge to catch integration issues early.",
    impact: 4, effort: 3, urgency: 2,
    tags: ["ci", "billing", "quality"],
    linkedActionIds: [],
    reportedBy: "Bob",
    occurredAt: "2026-02-23",
    createdAt: "2026-02-23",
  },
  {
    id: "evt-007",
    projectId: "proj-001",
    sprintId: "spr-001",
    type: "problem",
    severity: "medium",
    status: "resolved",
    title: "CI setup took 3 days instead of 1 — Docker layer caching not configured",
    description: "GitHub Actions runner was rebuilding Docker layers from scratch on every run due to missing cache configuration. Fixed with proper layer caching strategy.",
    impact: 2, effort: 2, urgency: 3,
    tags: ["ci", "docker", "performance"],
    linkedActionIds: [],
    reportedBy: "Bob",
    occurredAt: "2026-01-23",
    createdAt: "2026-01-23",
  },
  {
    id: "evt-008",
    projectId: "proj-002",
    sprintId: "spr-004",
    type: "success",
    severity: "low",
    status: "resolved",
    title: "Core navigation architecture well-received by design team",
    description: "Tab-based navigation with bottom sheet modals approved by design. No significant rework needed. Saves ~3 days of potential refactoring.",
    impact: 3, effort: 1, urgency: 1,
    tags: ["navigation", "design", "mobile"],
    linkedActionIds: [],
    reportedBy: "Clara",
    occurredAt: "2026-02-16",
    createdAt: "2026-02-16",
  },
  {
    id: "evt-009",
    projectId: "proj-001",
    sprintId: "spr-003",
    type: "risk",
    severity: "high",
    status: "analyzed",
    title: "Billing complexity may push Sprint 3 into scope reduction",
    description: "Current velocity (18 pts at mid-sprint) suggests we will not deliver full billing scope by sprint end. Risk of carrying over onboarding flow to Sprint 4.",
    impact: 4, effort: 1, urgency: 4,
    tags: ["velocity", "risk", "scope"],
    linkedActionIds: ["act-003"],
    reportedBy: "Alice",
    occurredAt: "2026-02-24",
    createdAt: "2026-02-24",
  },
  {
    id: "evt-010",
    projectId: "proj-001",
    sprintId: "spr-002",
    type: "observation",
    severity: "low",
    status: "analyzed",
    title: "Team prefers async standups over synchronous daily meetings",
    description: "Informal survey showed 4/5 team members prefer text-based async standups over daily video calls. Consider switching format starting Sprint 3.",
    impact: 2, effort: 1, urgency: 2,
    tags: ["process", "team", "async"],
    linkedActionIds: [],
    reportedBy: "Alice",
    occurredAt: "2026-02-15",
    createdAt: "2026-02-15",
  },
]
```

### ActionItems (4)
```ts
[
  {
    id: "act-001",
    projectId: "proj-001",
    sprintId: "spr-003",
    targetSprintId: "spr-003",
    title: "Fix Stripe webhook timezone handling in staging environment",
    description: "Normalize timestamps to UTC before HMAC verification. Add regression test.",
    owner: "Bob",
    status: "in-progress",
    priority: "high",
    linkedEventIds: ["evt-001"],
    dueDate: "2026-02-28",
    createdAt: "2026-02-21",
    resolvedAt: "",
  },
  {
    id: "act-002",
    projectId: "proj-001",
    sprintId: "spr-002",
    targetSprintId: "spr-003",
    title: "Establish 24h PR review SLA and add to team working agreement",
    description: "Add rule to team charter: all PRs must receive first review within 24h of opening. Track compliance weekly.",
    owner: "Alice",
    status: "open",
    priority: "medium",
    linkedEventIds: ["evt-003"],
    dueDate: "2026-03-01",
    createdAt: "2026-02-14",
    resolvedAt: "",
  },
  {
    id: "act-003",
    projectId: "proj-001",
    sprintId: "spr-003",
    targetSprintId: "spr-003",
    title: "Mid-sprint scope review — decide on onboarding flow deferral",
    description: "Sync with PO to decide whether to carry onboarding flow to Sprint 4 or reduce billing scope. Decision needed by Feb 27.",
    owner: "Alice",
    status: "open",
    priority: "high",
    linkedEventIds: ["evt-009"],
    dueDate: "2026-02-27",
    createdAt: "2026-02-24",
    resolvedAt: "",
  },
  {
    id: "act-004",
    projectId: "proj-001",
    sprintId: "spr-002",
    targetSprintId: "spr-003",
    title: "Add Docker layer caching to GitHub Actions CI config",
    description: "Configure BuildKit cache mounts and layer caching in workflow YAML. Target: reduce build time from 8min to <2min.",
    owner: "Bob",
    status: "done",
    priority: "medium",
    linkedEventIds: ["evt-007"],
    dueDate: "2026-02-20",
    createdAt: "2026-02-03",
    resolvedAt: "2026-02-18",
  },
]
```

### Retrospectives (1)
```ts
[
  {
    id: "retro-001",
    projectId: "proj-001",
    sprintId: "spr-002",
    date: "2026-02-16",
    facilitator: "Alice",
    participants: "Alice, Bob, Carol, Dev",
    wentWellIds: ["evt-002"],
    toImproveIds: ["evt-003", "evt-010"],
    ideasIds: [],
    actionIds: ["act-002", "act-004"],
    teamMood: 8,
    notes: "Strong sprint. Main focus for Sprint 3: keep the momentum on billing and address the review cycle bottleneck. Team suggested trying async standups.",
    status: "completed",
  },
]
```

---

## 11. Logique métier spécifique

### 11.1 Pipeline de statut des événements

Le statut d'un événement suit le pipeline : **raw → analyzed → actionable → resolved**

- `advanceEventStatus` incrémente d'un cran. Sans effet si `status === "resolved"` ou `status === "archived"`.
- `archiveEvent` passe directement en `"archived"` depuis n'importe quel statut.
- Un événement `"archived"` n'est pas inclus dans les compteurs du Dashboard.
- Un événement `"resolved"` est inclus dans les compteurs mais affiché en atténué.

### 11.2 Calcul du score de priorité

```ts
function calcPriority(impact: number, effort: number, urgency: number): number {
  return Math.round((impact * 2 + urgency * 2 + (6 - effort)) / 5);
}
```

Ce score est calculé à l'affichage uniquement, jamais persisté.  
Affichage : "⬆ Priority: n/5" — couleur : ≥4 → `C.red`, 3 → `C.amber`, ≤2 → `C.green`.

### 11.3 Gestion des rétrospectives dans le RetroBoard

**Chargement / création :**
```
onLoadRetro(projectId, sprintId):
  1. Cherche dans le store une Retrospective avec projectId + sprintId
  2. Si trouvée → charger (stocker retroId courant dans useState local)
  3. Si non trouvée → créer une nouvelle Retrospective avec status: "draft" et tous les arrays vides, l'ajouter au store, stocker son id
```

**Assignation d'un événement à une section :**
- Un événement ne peut être que dans une seule section à la fois (wentWell, toImprove, ou ideas).
- `addEventToRetroSection` doit retirer l'eventId des deux autres sections avant d'ajouter.
- `removeEventFromRetro` retire de toutes les sections.

**Pool d'événements non assignés :**
```ts
const assignedIds = new Set([...retro.wentWellIds, ...retro.toImproveIds, ...retro.ideasIds]);
const pool = events.filter(e => e.sprintId === sprintId && !assignedIds.has(e.id) && e.status !== "archived");
```

**Finalisation :**
- "Generate Report" appelle `completeRetrospective(retroId)` (status → "completed") puis `setActiveView("reports")`.
- Un rapport "completed" est en lecture seule dans la vue Reports (boutons d'édition masqués).

### 11.4 Cascade de suppression de projet

```
removeProject(id):
  1. Filter projects: remove id
  2. Filter sprints: remove all with projectId === id
  3. Filter logEntries: remove all with projectId === id
  4. Filter events: remove all with projectId === id
  5. Filter actionItems: remove all with projectId === id
  6. Filter retrospectives: remove all with projectId === id
```

### 11.5 Cascade de suppression de sprint

```
removeSprint(id):
  1. Filter sprints: remove id
  2. LogEntries with sprintId === id → set sprintId: ""
  3. Events with sprintId === id → set sprintId: ""
  4. ActionItems with sprintId === id → set sprintId: ""
  5. ActionItems with targetSprintId === id → set targetSprintId: ""
  6. Retrospectives with sprintId === id → remove (retro without sprint has no meaning)
```

### 11.6 Numérotation automatique des sprints

À la création d'un sprint, `number` est calculé comme suit :
```ts
const existingCount = sprints.filter(s => s.projectId === newSprint.projectId).length;
newSprint.number = existingCount + 1;
```

### 11.7 Filtre global persisté

`activeProjectFilter` et `activeSprintFilter` sont utilisés par toutes les vues qui supportent le filtre (Logbook, Events, Sprints, Actions, Reports, RetroBoard).

Règle de cohérence : si `activeProjectFilter` change, vérifier que `activeSprintFilter` appartient encore à ce projet. Si non → réinitialiser `activeSprintFilter: ""`.

Ce contrôle est fait dans l'action `setActiveProjectFilter` :
```ts
setActiveProjectFilter(id): void {
  set(state => {
    const sprint = state.sprints.find(s => s.id === state.activeSprintFilter);
    const sprintBelongs = sprint && (id === "" || sprint.projectId === id);
    return {
      activeProjectFilter: id,
      activeSprintFilter: sprintBelongs ? state.activeSprintFilter : "",
    };
  });
}
```

### 11.8 Liaison événement ↔ action

- Quand une ActionItem est créée depuis le RetroBoard (`ActionMiniForm`), elle est automatiquement ajoutée à `retro.actionIds` via `addActionToRetro`.
- La liaison bidirectionnelle (`event.linkedActionIds` ↔ `action.linkedEventIds`) est gérée manuellement dans le formulaire d'action via `linkedEventIds` (multi-select ou input texte). La vue de détail d'un événement affiche ses actions liées via `event.linkedActionIds`.

---

## 12. Comportements transversaux

### Persistance
- Clé localStorage : `"retrolog-store"`.
- Middleware Zustand `persist` avec `createJSONStorage(() => localStorage)`.
- Données de seed utilisées uniquement lors de la première initialisation.

### Génération d'IDs
Pattern : `${prefix}-${Date.now()}`  
Préfixes : `proj-`, `spr-`, `log-`, `evt-`, `act-`, `retro-`

### Confirmation de suppression
Pattern identique à STRATEX — tout inline, pas de modal.  
Pour la suppression de projet uniquement : ajouter un message d'avertissement en amber avant les boutons de confirmation.

### Formulaires inline
- Ajout : formulaire affiché en haut de la liste / grille via un état `adding: boolean`.
- Édition : remplace l'affichage de l'élément via un état `editingId: string | null`.
- Cancel = réinitialise l'état local sans appeler le store.
- Enter = submit sur les inputs monoligne (via `onKeyDown`).
- Escape = cancel sur les inputs (via `onKeyDown`).

### Dates — formatage à l'affichage
Toutes les dates sont stockées en `YYYY-MM-DD`. À l'affichage :
- Format long : "15 Feb 2026" (pour les entrées de logbook, dates de sprint)
- Format court : "Feb 15" (pour les chips de date dans les cards compactes)
- Format relatif pour "due date" : "Overdue" (en rouge si passée), "Today" (en amber), "Tomorrow" (en amber), sinon date courte

### État vide (`EmptyState`)
Toutes les listes et colonnes kanban affichent le composant `EmptyState` lorsqu'elles ne contiennent aucun élément, avec un message contextuel et éventuellement un bouton d'action.

### Whitelabel
`settings.name`, `settings.tagline` et `settings.accentColor` sont lus depuis le store dans TopBar et DashboardView. Toutes les modifications sont appliquées immédiatement après "Save Changes".

### Auto-save (RetroBoard uniquement)
Les champs `facilitator`, `participants`, `teamMood` et `notes` du formulaire de métadonnées de rétro appellent `updateRetrospective` directement dans leur handler `onChange` / `onBlur`. Pas de bouton Save séparé pour ces champs.

---

## 13. Export & Import des données

### 13.1 Export — algorithme

```
exportData():
  1. Lire l'état courant du store
  2. Construire l'objet StoreExport :
     {
       exportVersion: 1,
       exportedAt: new Date().toISOString(),
       exportedBy: settings.userId,
       exportedByName: settings.userName,
       settings,
       projects,
       sprints,
       logEntries,
       events,
       actionItems,
       retrospectives,
     }
  3. Sérialiser en JSON (JSON.stringify avec indentation 2)
  4. Créer un Blob de type "application/json"
  5. Créer un lien <a> temporaire avec href = URL.createObjectURL(blob)
  6. Attribuer download = `retrolog-export-${settings.userId || "unknown"}-${today}.json`
     où today = new Date().toISOString().slice(0, 10)
  7. Déclencher click() puis URL.revokeObjectURL()
```

Aucune validation ni confirmation n'est nécessaire pour l'export — l'action est immédiate et non destructive.

---

### 13.2 Import — mode Overwrite

```
importData(data, "overwrite"):
  1. Valider le fichier (voir section 13.4)
  2. Conserver les settings locaux actuels (userId, userName, accentColor) — ne pas les écraser
     → Fusionner : garder settings locaux mais remplacer name, tagline, defaultSprintDays depuis data.settings
  3. Remplacer dans le store :
       projects       ← data.projects
       sprints        ← data.sprints
       logEntries     ← data.logEntries
       events         ← data.events
       actionItems    ← data.actionItems
       retrospectives ← data.retrospectives
  4. Réinitialiser les filtres : activeProjectFilter: "", activeSprintFilter: ""
  5. Conserver teamEnergy, teamFocus, teamSatisfaction locaux (non écrasés)
```

> **Raison de la conservation des settings utilisateur** : l'identité locale (userId, userName, accentColor) est propre à l'instance. Écraser avec l'identité de l'exportateur serait une source de confusion.

---

### 13.3 Import — mode Merge

```
importData(data, "merge"):
  1. Valider le fichier (voir section 13.4)
  2. Préparer le tag d'origine :
     origin = { userId: data.exportedBy, userName: data.exportedByName, importedAt: new Date().toISOString() }
  3. Pour chaque collection (projects, sprints, logEntries, events, actionItems, retrospectives) :
     Pour chaque entité importée :
       a. Si un item avec le même id existe déjà dans le store local → SKIP (ne pas écraser)
       b. Si l'id n'existe pas localement :
          - Attacher _origin = origin à l'entité
          - Ajouter au store
  4. Ne pas modifier settings, filtres, ni métriques de santé
  5. Retourner le nombre d'items ajoutés (pour le message de succès)
```

**Règle de déduplication** : la comparaison se fait **uniquement sur l'`id`**. Deux items avec le même `id` mais des contenus différents → l'item local prime, l'item importé est ignoré.

**Intégrité référentielle après merge** : les IDs de relations (projectId, sprintId, etc.) dans les entités importées peuvent référencer des entités également importées. Comme les items sont ajoutés par collection complète dans l'ordre naturel (projects d'abord, puis sprints, puis le reste), les références seront cohérentes.

---

### 13.4 Validation du fichier importé

Avant tout traitement, le fichier JSON est validé :

```ts
function validateImport(data: unknown): data is StoreExport {
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
```

Si la validation échoue → afficher le message d'erreur dans la vue Settings, ne pas appeler `importData`.

---

### 13.5 Traçabilité — affichage du champ `_origin`

Bien que `_origin` ne soit pas affiché dans les cards principales, les vues suivantes affichent un indicateur discret pour les entités importées :

- **Projects** : badge "↗ imported" en `C.textDim`, `FONT.mono`, `0.55rem` à côté du nom si `_origin` est défini, avec tooltip au survol `"Imported from {_origin.userName} ({_origin.userId})"`
- **Events** et **ActionItems** : ligne supplémentaire dans la card en mode Board : "↗ {_origin.userName}" en `0.55rem`, `C.textVeryDim`
- **LogEntries** : indicateur `↗ imported` dans la rangée du bas, même style

Le tooltip est implémenté avec l'attribut HTML natif `title` sur l'élément (pas de composant Tooltip custom).
