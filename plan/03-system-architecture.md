# SliceTask — System Architecture

> **Version:** 1.0 | **Updated:** 2026-04-12

---

## 1. Architecture Overview

SliceTask is a **100% client-side Single Page Application** with no backend. All logic runs in the browser. External communication is limited to two outbound API calls:

1. **AI Provider API** (Gemini / Groq) — task decomposition
2. **Google Drive API** — cloud backup/restore

```
┌─ Browser ─────────────────────────────────────────────────────┐
│                                                               │
│  ┌─ React App ─────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  ┌─ UI Layer ──────────────────────────────────────┐    │  │
│  │  │  Components · Hooks · Drag-and-Drop · Theming   │    │  │
│  │  └──────────────────────┬──────────────────────────┘    │  │
│  │                         │                               │  │
│  │  ┌─ State Layer ────────┴──────────────────────────┐    │  │
│  │  │  Zustand Store (tasks, ui, pomodoro, settings)  │    │  │
│  │  └──────────────────────┬──────────────────────────┘    │  │
│  │                         │                               │  │
│  │  ┌─ Service Layer ──────┴──────────────────────────┐    │  │
│  │  │  AIService · DriveService · NotificationService │    │  │
│  │  │  DeadlineScheduler · PomodoroEngine             │    │  │
│  │  └──────────────────────┬──────────────────────────┘    │  │
│  │                         │                               │  │
│  │  ┌─ Persistence Layer ──┴──────────────────────────┐    │  │
│  │  │  Dexie.js (IndexedDB wrapper)                   │    │  │
│  │  │  localStorage (API keys, preferences)           │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─ Service Worker ───────────────────────────────────────┐   │
│  │  Workbox (asset caching, offline shell)                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
  ┌─────────────┐              ┌──────────────────┐
  │ AI Provider │              │ Google Drive API  │
  │ (Gemini /   │              │ (appDataFolder)   │
  │  Groq)      │              │                   │
  └─────────────┘              └──────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React 18+ (Vite) | Fast HMR, tree-shaking, massive ecosystem. Vite for near-instant dev builds. |
| **Language** | TypeScript (strict mode) | Type safety across the entire codebase. |
| **State Management** | Zustand | Minimal boilerplate, no providers, built-in middleware for persistence. |
| **Routing** | React Router v6 | Lightweight; only needed if settings/pomodoro get dedicated routes (optional — can use modal-based navigation). |
| **Styling** | Vanilla CSS with CSS Custom Properties | Zero runtime cost, full design token control, native `@media` and `@container` queries. |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Accessible, performant, touch-friendly, keyboard-navigable. |
| **IndexedDB** | Dexie.js v4 | Promise-based, typed, supports live queries and migrations. |
| **Icons** | Lucide React | Tree-shakeable, consistent 24px grid. |
| **Notifications** | Web Notifications API + `tone.js` (lightweight) | Browser-native push + customizable sounds. |
| **Google Auth** | Google Identity Services (GIS) | Modern OAuth 2.0 flow; replaces deprecated `gapi.auth2`. |
| **Drive API** | `gapi.client.drive` or raw `fetch` | Direct REST calls to Drive v3 for appDataFolder. |
| **PWA** | Workbox (via `vite-plugin-pwa`) | Service worker generation, precaching, offline shell. |
| **Build / Deploy** | Vite → Vercel / Cloudflare Pages | Zero-config static deployment. |
| **Testing** | Vitest + React Testing Library + Playwright | Unit, integration, and E2E coverage. |
| **Linting** | ESLint + Prettier | Consistent code style. |

---

## 3. IndexedDB Schema (Dexie.js)

### 3.1 Database Definition

```
Database: SliceTaskDB
Version: 1

Tables:
  tasks:
    Primary Key: id (auto-generated UUID)
    Indexes: [status], [dueDate], [createdAt], [columnOrder]

  promptHistory:
    Primary Key: id (auto-generated UUID)
    Indexes: [createdAt]

  pomodoroSessions:
    Primary Key: id (auto-generated UUID)
    Indexes: [date], [taskId]

  syncMeta:
    Primary Key: key (string)
    (key-value store for sync timestamps, Drive file IDs, etc.)
```

### 3.2 Table Schemas (TypeScript Interfaces)

```typescript
// tasks table
interface Task {
  id: string;                // UUID v4
  title: string;
  description: string;       // Markdown content
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high' | null;
  dueDate: number | null;    // Unix timestamp (ms)
  columnOrder: number;        // Sort position within column
  pomodoroCount: number;      // Sessions spent on this task
  sourcePromptId: string | null; // Links to promptHistory entry
  createdAt: number;          // Unix timestamp (ms)
  updatedAt: number;          // Unix timestamp (ms)
  completedAt: number | null; // When moved to 'done'
}

// promptHistory table
interface PromptHistoryEntry {
  id: string;
  prompt: string;             // User's original input
  provider: 'gemini' | 'groq';
  response: string;           // Raw AI response (JSON string)
  generatedTaskIds: string[]; // IDs of tasks created from this prompt
  createdAt: number;
}

// pomodoroSessions table
interface PomodoroSession {
  id: string;
  taskId: string | null;      // Optional linked task
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;           // Planned duration in seconds
  actualDuration: number;     // Actual elapsed time
  completedAt: number;
  date: string;               // YYYY-MM-DD for daily grouping
}

// syncMeta table (key-value)
interface SyncMetaEntry {
  key: string;                // e.g., 'lastSyncTimestamp', 'driveFileId'
  value: string;              // JSON-serializable value
}
```

### 3.3 Migration Strategy

Dexie.js handles schema migrations via version bumps:

```
Version 1: Initial schema (tasks, promptHistory, pomodoroSessions, syncMeta)
Version 2+: Add new indexes or tables as features evolve
```

Each version upgrade includes a migration function that transforms existing data if needed. Dexie handles this automatically for additive changes (new indexes, new tables).

---

## 4. State Management (Zustand)

### 4.1 Store Slices

```
rootStore
├── taskSlice
│   ├── tasks: Task[]
│   ├── addTask(task)
│   ├── updateTask(id, partial)
│   ├── deleteTask(id)
│   ├── moveTask(id, newStatus, newOrder)
│   ├── reorderTask(id, newOrder)
│   └── bulkAddTasks(tasks[])  // For AI-generated batch
│
├── uiSlice
│   ├── sidebarOpen: boolean
│   ├── activePanel: 'board' | 'history' | 'pomodoro' | 'settings'
│   ├── selectedTaskId: string | null
│   ├── theme: 'dark' | 'light'
│   ├── toggleSidebar()
│   ├── setActivePanel(panel)
│   ├── selectTask(id)
│   └── toggleTheme()
│
├── pomodoroSlice
│   ├── state: 'idle' | 'working' | 'shortBreak' | 'longBreak'
│   ├── timeRemaining: number (seconds)
│   ├── sessionsCompleted: number
│   ├── linkedTaskId: string | null
│   ├── settings: PomodoroSettings
│   ├── start() / pause() / reset() / skip()
│   └── updateSettings(partial)
│
├── aiSlice
│   ├── isLoading: boolean
│   ├── error: string | null
│   ├── history: PromptHistoryEntry[]
│   ├── submitPrompt(prompt)
│   ├── regenerate(promptId)
│   └── clearHistory()
│
└── syncSlice
    ├── isAuthenticated: boolean
    ├── isSyncing: boolean
    ├── lastSyncTimestamp: number | null
    ├── error: string | null
    ├── signIn() / signOut()
    ├── syncNow()
    └── restoreFromCloud()
```

### 4.2 Persistence Middleware

Zustand's `persist` middleware syncs the store to IndexedDB via Dexie:

- **On every state change**: Debounced (300ms) write to IndexedDB.
- **On app load**: Hydrate Zustand store from IndexedDB.
- **Selective persistence**: Only `taskSlice`, `pomodoroSlice.settings`, and `uiSlice.theme`/`sidebarOpen` are persisted. Transient state (`isLoading`, `error`, `timeRemaining`) is not.

### 4.3 State Flow Diagram

```
User Action → Zustand Store Update → Re-render UI
                    │
                    ├──→ Dexie.js (IndexedDB write, debounced 300ms)
                    │
                    └──→ DriveSync (debounced 5s, if authenticated)
```

---

## 5. BYOK AI Integration — Data Flow

### 5.1 Provider Abstraction

```
┌─ AIService ──────────────────────────────────────────┐
│                                                      │
│  interface AIProvider {                               │
│    name: 'gemini' | 'groq';                          │
│    baseUrl: string;                                  │
│    buildRequest(prompt, history): RequestInit;        │
│    parseResponse(response): TaskSuggestion[];        │
│  }                                                   │
│                                                      │
│  ┌─ GeminiProvider ─┐    ┌─ GroqProvider ──────┐     │
│  │ baseUrl: https:// │    │ baseUrl: https://   │     │
│  │ generativelang... │    │ api.groq.com/...    │     │
│  │ Model: gemini-pro │    │ Model: llama-3.3-70b│     │
│  └───────────────────┘    └─────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 5.2 Request Flow

```
1. User types goal → clicks Submit
2. AIService reads provider + key from localStorage
3. AIService constructs system prompt:

   SYSTEM: "You are a task breakdown assistant. Given a high-level goal,
   return a JSON array of actionable sub-tasks. Each task should have:
   - title (string, concise action item)
   - description (string, 1-2 sentences of context)
   - priority ('low' | 'medium' | 'high')
   - estimatedMinutes (number, rough estimate)
   
   Return ONLY valid JSON. No markdown, no explanation."

4. AIService sends fetch() to provider endpoint:
   - Gemini: POST /v1beta/models/gemini-2.0-flash:generateContent
   - Groq:   POST /openai/v1/chat/completions

5. Parse response → extract JSON array
6. Map to Task objects → bulkAddTasks() → Kanban populates
7. Save prompt + response to promptHistory in IndexedDB
```

### 5.3 Error Handling

| Error | Detection | User-Facing Action |
|---|---|---|
| Invalid API key | 401/403 response | Toast: "API key invalid. Check settings." |
| Rate limited | 429 response | Toast: "Rate limited. Try again in X seconds." + auto-retry with backoff. |
| Malformed AI response | JSON.parse fails | Retry once with stricter prompt; if still fails, show raw text + "Copy" button. |
| Network error | `fetch` throws | Toast: "Network error. Check your connection." |
| Empty response | Parsed array is empty | Toast: "AI returned no tasks. Try a more specific goal." |
| Provider down | 5xx response | Toast: "AI service unavailable. Try again later." |

### 5.4 Prompt Context Management

To support follow-up refinement (US-04), the AI service maintains a **conversation window**:

- Store last 5 prompt-response pairs in memory (not persisted).
- Send as `messages[]` array for providers using chat completion format (Groq).
- For Gemini, concatenate as multi-turn conversation in `contents[]`.
- Clear context on page refresh or explicit "New Session" action.

---

## 6. Google Drive Sync — Technical Design

### 6.1 Authentication Flow

```
User clicks "Enable Cloud Sync"
        │
        ▼
Load Google Identity Services (GIS) library dynamically
        │
        ▼
google.accounts.oauth2.initTokenClient({
  client_id: '<PUBLIC_CLIENT_ID>',
  scope: 'https://www.googleapis.com/auth/drive.appdata',
  callback: handleTokenResponse
})
        │
        ▼
tokenClient.requestAccessToken()
        │
        ▼
Google OAuth popup → user consents
        │
        ▼
handleTokenResponse(tokenResponse)
  ├─ Store access_token in memory (NOT localStorage)
  ├─ Set isAuthenticated = true
  └─ Trigger initial sync
```

### 6.2 Drive API Calls

**List backup file:**
```
GET https://www.googleapis.com/drive/v3/files
  ?spaces=appDataFolder
  &q=name='slicetask-backup.json'
  &fields=files(id,modifiedTime)
  Authorization: Bearer <access_token>
```

**Read backup:**
```
GET https://www.googleapis.com/drive/v3/files/<fileId>
  ?alt=media
  Authorization: Bearer <access_token>
```

**Create backup:**
```
POST https://www.googleapis.com/upload/drive/v3/files
  ?uploadType=multipart
  Content-Type: multipart/related
  
  Metadata: { name: 'slicetask-backup.json', parents: ['appDataFolder'] }
  Body: <JSON state>
```

**Update backup:**
```
PATCH https://www.googleapis.com/upload/drive/v3/files/<fileId>
  ?uploadType=media
  Content-Type: application/json
  Body: <JSON state>
```

### 6.3 Backup Payload Schema

```typescript
interface BackupPayload {
  version: number;           // Schema version for forward compat
  exportedAt: number;        // Timestamp
  tasks: Task[];
  promptHistory: PromptHistoryEntry[];
  pomodoroSessions: PomodoroSession[];
  settings: {
    theme: 'dark' | 'light';
    pomodoroDefaults: PomodoroSettings;
    sidebarOpen: boolean;
  };
}
```

### 6.4 Sync Coordinator

- Uses `BroadcastChannel('slicetask-sync')` to prevent multi-tab conflicts.
- Only the "leader" tab (first opened) performs sync writes.
- Other tabs receive sync results via `BroadcastChannel` messages.
- Leader election: timestamp-based; on tab close, remaining tabs re-elect.

### 6.5 Offline Queue

```
State mutation occurs while offline
        │
        ▼
  Mutation stored in outbox (IndexedDB table)
        │
        ▼
  navigator.onLine event fires (back online)
        │
        ▼
  Drain outbox: serialize full state → upload to Drive
        │
        ▼
  Clear outbox on success
```

---

## 7. Deadline Notification System

### 7.1 Architecture

```
┌─ DeadlineScheduler ──────────────────────────────────┐
│                                                      │
│  On app load + on task mutation:                     │
│    1. Query tasks WHERE dueDate IS NOT NULL           │
│       AND status != 'done'                           │
│    2. For each task, calculate timeUntilDue           │
│    3. Schedule setTimeout for:                        │
│       - 24h before → warning notification            │
│       - At due time → urgent notification            │
│    4. Store active timer IDs for cleanup              │
│                                                      │
│  On task update/delete:                              │
│    Clear existing timers → reschedule                 │
│                                                      │
│  On visibility change (tab focus):                   │
│    Recalculate all timers (prevents drift)            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 7.2 Notification Levels

| Trigger | Visual | Audio | Browser Notification |
|---|---|---|---|
| 24h before due | Card turns amber | None | "Task X is due tomorrow" |
| At due time | Card turns red | Chime sound | "Task X is now due!" |
| Overdue (on app open) | Red + pulse | None | None (already notified) |

---

## 8. Pomodoro Engine

### 8.1 Timer Implementation

- Uses `setInterval(1000)` for the countdown display.
- On each tick: decrement `timeRemaining` in Zustand.
- **Drift correction**: Compare `Date.now()` against the expected end time; adjust display accordingly.
- **Background tabs**: Use `document.visibilitychange` to detect tab hidden; recalculate remaining time on re-focus.
- **Completion**: When `timeRemaining <= 0`, transition state (work → break or break → work), play sound, show notification.

### 8.2 Settings Schema

```typescript
interface PomodoroSettings {
  workDuration: number;       // seconds, default 1500 (25 min)
  shortBreakDuration: number; // seconds, default 300 (5 min)
  longBreakDuration: number;  // seconds, default 900 (15 min)
  sessionsBeforeLongBreak: number; // default 4
  soundEnabled: boolean;
  soundType: 'bell' | 'chime' | 'digital';
  ambientMusicEnabled: boolean;
  ambientMusicType: 'rain' | 'lofi' | 'whitenoise' | 'none';
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}
```

---

## 9. Security Considerations

| Concern | Mitigation |
|---|---|
| API key exposure | Key stored in `localStorage`; optional Web Crypto AES-GCM encryption with user passphrase. Never sent to any server except the AI provider. |
| XSS → key theft | Strict CSP headers (`script-src 'self'`); no inline scripts; sanitize all rendered content. |
| Google token leakage | Access token held in memory only; never persisted to storage. |
| Drive data privacy | `appDataFolder` scope limits access to app-created files only; no access to user's files. |
| Client-side validation | All AI responses are JSON-parsed with schema validation before rendering. |

---

## 10. Performance Budget

| Metric | Target |
|---|---|
| Initial JS bundle | < 120 KB gzipped |
| CSS | < 15 KB gzipped |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2.5s |
| Lighthouse Performance | ≥ 90 |
| IndexedDB write latency | < 50ms |

### Code Splitting Strategy

- **Route-based**: Settings modal, onboarding modal loaded lazily.
- **Feature-based**: Google Drive sync module loaded only when user enables sync. AI provider modules loaded based on selected provider.
- **Asset-based**: Ambient audio files loaded on-demand (not in main bundle). Icon components tree-shaken by Vite.

---

## 11. Project Structure

```
slicetask/
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── audio/
│       ├── bell.mp3
│       ├── chime.mp3
│       ├── digital.mp3
│       ├── rain.mp3
│       ├── lofi.mp3
│       └── whitenoise.mp3
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   ├── index.css                # Global styles + design tokens
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── Layout.css
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── AddCardButton.tsx
│   │   │   ├── DragOverlay.tsx
│   │   │   └── Kanban.css
│   │   ├── ai/
│   │   │   ├── AIInputBar.tsx
│   │   │   └── AIInputBar.css
│   │   ├── task-detail/
│   │   │   ├── TaskDetailPanel.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── PrioritySelector.tsx
│   │   │   └── TaskDetail.css
│   │   ├── pomodoro/
│   │   │   ├── PomodoroWidget.tsx
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── PomodoroSettings.tsx
│   │   │   └── Pomodoro.css
│   │   ├── history/
│   │   │   ├── HistoryPanel.tsx
│   │   │   ├── HistoryItem.tsx
│   │   │   └── History.css
│   │   ├── modals/
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── OnboardingModal.tsx
│   │   │   ├── ConflictModal.tsx
│   │   │   └── Modals.css
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Toast.tsx
│   │       ├── ToastContainer.tsx
│   │       ├── Input.tsx
│   │       └── UI.css
│   ├── store/
│   │   ├── index.ts             # Combined store
│   │   ├── taskSlice.ts
│   │   ├── uiSlice.ts
│   │   ├── pomodoroSlice.ts
│   │   ├── aiSlice.ts
│   │   └── syncSlice.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── AIService.ts     # Provider interface + orchestration
│   │   │   ├── GeminiProvider.ts
│   │   │   ├── GroqProvider.ts
│   │   │   └── prompts.ts       # System prompt templates
│   │   ├── db/
│   │   │   └── database.ts      # Dexie.js setup + schemas
│   │   ├── drive/
│   │   │   ├── DriveService.ts  # CRUD for appDataFolder
│   │   │   ├── SyncCoordinator.ts
│   │   │   └── auth.ts          # GIS OAuth flow
│   │   ├── notifications/
│   │   │   ├── DeadlineScheduler.ts
│   │   │   └── NotificationService.ts
│   │   └── pomodoro/
│   │       └── PomodoroEngine.ts
│   ├── hooks/
│   │   ├── useDeadlineAlerts.ts
│   │   ├── useDriveSync.ts
│   │   ├── usePomodoro.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useMediaQuery.ts
│   ├── utils/
│   │   ├── uuid.ts
│   │   ├── dateUtils.ts
│   │   ├── crypto.ts            # AES-GCM key encryption
│   │   └── validators.ts        # JSON schema validation
│   └── types/
│       └── index.ts             # Shared TypeScript interfaces
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
