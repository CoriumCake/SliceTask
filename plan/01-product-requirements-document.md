# SliceTask — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** 2026-04-12  
> **Status:** Draft  

---

## 1. Executive Summary

SliceTask is an AI-powered, local-first task management web application that eliminates task paralysis by breaking large goals into actionable sub-tasks. It runs entirely in the browser with zero backend costs, stores all data in IndexedDB, integrates AI via a Bring-Your-Own-Key (BYOK) model, and offers optional cross-device sync through Google Drive's hidden `appDataFolder`.

---

## 2. Problem Statement

Knowledge workers frequently experience **task paralysis** — the inability to start work because a goal feels too large or ambiguous. Existing tools (Trello, Notion, Todoist) require the user to manually decompose tasks, which is the exact cognitive step they are stuck on. SliceTask solves this by using AI to perform the decomposition automatically, then presenting the results in a focused Kanban workspace with built-in anti-burnout mechanics.

---

## 3. Target Users

| Persona | Description |
|---|---|
| **Solo Developer / Freelancer** | Manages personal sprints; needs fast task breakdown without team overhead. |
| **Student** | Breaks down semester projects and assignments; budget-conscious (free tier). |
| **Productivity Enthusiast** | Uses Pomodoro and structured workflows; wants a single integrated tool. |
| **Remote Worker** | Needs cross-device access (laptop at desk, tablet on couch) via Drive sync. |

---

## 4. User Stories

### 4.1 AI Task Breakdown

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-01 | As a user, I want to type a high-level goal so the AI breaks it into sub-tasks. | P0 | AI returns ≥3 actionable sub-tasks; each is added as a card in the "Todo" column. |
| US-02 | As a user, I want to see a loading skeleton while the AI processes my request. | P1 | Shimmer animation appears within 100ms of submission; disappears when tasks arrive. |
| US-03 | As a user, I want to regenerate or refine the AI output if it's not useful. | P1 | A "Regenerate" button re-sends the prompt; a "Refine" input allows follow-up instructions. |
| US-04 | As a user, I want the AI to respect context from previous prompts in the same session. | P2 | Conversation history is sent as context; the AI can reference earlier goals. |
| US-05 | As a user, I want to manually add tasks without using the AI. | P0 | A "+" button on each column creates a blank editable card. |

### 4.2 Kanban Workspace

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-10 | As a user, I want a 3-column Kanban board (Todo, In Progress, Done). | P0 | Three columns render; each has a header and accepts cards. |
| US-11 | As a user, I want to drag and drop cards between columns. | P0 | Cards can be dragged from any column to any other; order is preserved. |
| US-12 | As a user, I want to reorder cards within a column by dragging. | P1 | Intra-column drag reorders cards; new order persists after refresh. |
| US-13 | As a user, I want to delete a task card. | P0 | Swipe-to-delete on mobile; hover-reveal trash icon on desktop. Confirmation dialog appears. |
| US-14 | As a user, I want to edit a card's title inline. | P1 | Double-click (desktop) or long-press (mobile) enables inline editing. |

### 4.3 Task Details & Deadlines

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-20 | As a user, I want to click a card to open a detail panel/modal. | P0 | Panel slides in from the right (desktop) or opens as a bottom sheet (mobile). |
| US-21 | As a user, I want to set a due date on a task. | P0 | A date picker is available in the detail view; selected date is shown on the card. |
| US-22 | As a user, I want to add a description/notes to a task. | P1 | Markdown-capable textarea in detail view; persists to IndexedDB. |
| US-23 | As a user, I want visual indicators when a deadline is near. | P0 | Card border turns amber (≤24h remaining) or red (overdue). |
| US-24 | As a user, I want an audible + browser notification when a deadline arrives. | P1 | Uses the Notification API + a soft chime sound. Permission requested on first use. |
| US-25 | As a user, I want to assign a priority level (Low, Medium, High) to a task. | P2 | Color-coded dot on card; filterable. |

### 4.4 Sidebar & History

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-30 | As a user, I want a collapsible sidebar on the left. | P0 | Toggle button; sidebar slides in/out with animation; state persists. |
| US-31 | As a user, I want to see my AI prompt history in the sidebar. | P0 | Each past prompt is listed with a timestamp; clicking it shows the generated tasks. |
| US-32 | As a user, I want to re-run a past prompt. | P2 | "Re-run" button next to each history entry re-sends it to the AI. |
| US-33 | As a user, I want to clear my prompt history. | P1 | "Clear History" button with confirmation dialog; deletes from IndexedDB. |

### 4.5 Pomodoro System

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-40 | As a user, I want to start a Pomodoro timer from the sidebar. | P0 | Timer displays countdown; default 25 min work / 5 min break. |
| US-41 | As a user, I want to customize session and break durations. | P1 | Settings panel with number inputs; values persist in IndexedDB. |
| US-42 | As a user, I want an audible notification when a session/break ends. | P0 | Plays a configurable sound; uses Notification API. |
| US-43 | As a user, I want to toggle ambient focus music during a session. | P2 | Dropdown to select from 3–4 embedded ambient loops (rain, lo-fi, white noise). |
| US-44 | As a user, I want to see how many Pomodoros I've completed today. | P1 | Counter displayed in the Pomodoro panel; resets at midnight local time. |
| US-45 | As a user, I want to link a Pomodoro session to a specific task. | P2 | Dropdown/selector in Pomodoro panel lists "In Progress" tasks; logged in task detail. |

### 4.6 BYOK (Bring Your Own Key)

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-50 | As a user, I want to enter my AI API key in a settings panel. | P0 | Key is saved to `localStorage` (encrypted at rest with a user-defined passphrase, or obfuscated). |
| US-51 | As a user, I want to choose between supported AI providers (Gemini, Groq). | P0 | Dropdown with provider options; the app constructs the correct API call format. |
| US-52 | As a user, I want to validate my API key before saving. | P1 | A "Test Key" button sends a lightweight request; shows ✅ or ❌ result. |
| US-53 | As a user, I want to remove/rotate my API key. | P1 | "Remove Key" button clears the stored key; the app reverts to a "setup required" state. |

### 4.7 Google Drive Sync

| ID | Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-60 | As a user, I want to sign in with Google to enable cloud sync. | P1 | OAuth 2.0 flow using Google Identity Services; scopes: `drive.appdata`. |
| US-61 | As a user, I want my tasks to auto-backup to Google Drive. | P1 | After every state mutation, a debounced (5s) write to `appDataFolder/slicetask-backup.json`. |
| US-62 | As a user, I want to restore my data on a new device by signing in. | P1 | On login, if a backup file exists, prompt: "Restore from cloud backup or start fresh?" |
| US-63 | As a user, I want to manually trigger a sync. | P2 | "Sync Now" button in settings; shows last sync timestamp. |
| US-64 | As a user, I want conflict resolution if local and cloud data diverge. | P2 | Last-write-wins with a "Review Conflicts" modal showing both versions side-by-side. |

---

## 5. BYOK Flow — Detailed Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     FIRST-TIME USER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User opens app → sees onboarding modal                  │
│  2. Modal explains: "SliceTask uses YOUR AI key"            │
│  3. User selects provider (Gemini / Groq)                   │
│  4. User pastes API key into masked input                   │
│  5. User clicks "Test Key"                                  │
│     ├─ Success → Key saved to localStorage                  │
│     │            (optionally encrypted with passphrase)      │
│     │            → Modal closes → AI input enabled           │
│     └─ Failure → Error message with troubleshooting link     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     RETURNING USER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. App loads → checks localStorage for key                 │
│     ├─ Key exists → AI input enabled                        │
│     │   ├─ API call fails (401) → Toast: "Key expired"      │
│     │   │   → Prompt to re-enter key                        │
│     │   └─ API call succeeds → normal flow                  │
│     └─ Key missing → Show setup prompt (non-blocking)       │
│         → User can still use manual task features           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Security Considerations

- **Never** transmit the API key to any server other than the chosen AI provider.
- The key is stored in `localStorage`; optionally offer a passphrase-based encryption layer using the Web Crypto API (`AES-GCM`).
- Display a clear warning: *"Your key is stored locally in this browser. Clearing browser data will remove it."*
- API calls are made directly from the client via `fetch()` to the provider's CORS-enabled endpoint.

---

## 6. Google Drive Sync — Detailed Lifecycle

### 6.1 Authentication

1. User clicks "Enable Cloud Sync" in Settings.
2. App initiates Google OAuth 2.0 via Google Identity Services (GIS) library.
3. Requested scope: `https://www.googleapis.com/auth/drive.appdata` (minimal — only hidden app folder).
4. On success, the access token is stored in memory (session-only) and a refresh token mechanism is used for persistence.

### 6.2 Backup Write Cycle

```
User mutates state (add/move/edit/delete task)
        │
        ▼
  Debounce timer (5 seconds)
        │
        ▼
  Serialize full state → JSON
        │
        ▼
  Check: Does `slicetask-backup.json` exist in appDataFolder?
  ├─ YES → PATCH (update file contents)
  └─ NO  → POST (create file)
        │
        ▼
  Store last sync timestamp in IndexedDB
```

### 6.3 Restore Cycle (New Device)

```
User signs in with Google
        │
        ▼
  GET files in appDataFolder where name = "slicetask-backup.json"
  ├─ File found → Download and parse JSON
  │   ├─ Local DB is empty → Auto-restore
  │   └─ Local DB has data → Show conflict resolution modal
  │       ├─ "Use Cloud Data" → overwrite local
  │       ├─ "Use Local Data" → overwrite cloud
  │       └─ "Merge" (P3 — future) → attempt merge
  └─ File not found → No action; continue with local data
```

### 6.4 Edge Cases

| Scenario | Handling |
|---|---|
| User revokes Drive permissions | Detect 403 on next sync → show "Re-authorize" prompt; degrade gracefully to local-only. |
| Quota exceeded | Show toast: "Google Drive quota full. Sync paused." |
| Offline during sync | Queue the write; retry with exponential backoff when `navigator.onLine` fires. |
| Corrupted backup JSON | Validate JSON schema on download; if invalid, prompt user: "Backup appears corrupted. Start fresh or try again?" |
| Multiple tabs open | Use `BroadcastChannel` API to coordinate; only one tab performs sync. |
| Token expiry mid-session | Use silent token refresh; if refresh fails, prompt re-auth. |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | First Contentful Paint < 1.5s; Lighthouse score ≥ 90 on all categories. |
| **Accessibility** | WCAG 2.1 AA compliant; keyboard navigation for all interactive elements; ARIA labels on cards. |
| **Browser Support** | Latest 2 versions of Chrome, Firefox, Safari, Edge. |
| **Offline** | Full functionality offline (except AI calls and Drive sync). Service Worker for PWA capability. |
| **Data Privacy** | Zero telemetry. No analytics. No cookies. All data stays in the user's browser/Drive. |
| **Bundle Size** | Target < 200 KB gzipped for initial load (excluding ambient audio assets). |
| **PWA** | Installable as a PWA with a manifest; works offline via Service Worker caching. |

---

## 8. Out of Scope (v1)

- Multi-user collaboration / shared boards.
- Native mobile apps (PWA covers mobile use cases).
- Server-side AI inference.
- Task dependencies / Gantt charts.
- Integrations with third-party tools (Slack, GitHub, etc.).
- End-to-end encryption of Drive backups (considered for v2).

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Time to first AI-generated task list | < 5 seconds (including API latency) |
| User retention (returns within 7 days) | > 40% (measured via optional, opt-in local counter) |
| Pomodoro sessions completed per user/week | ≥ 5 (local metric only) |
| Drive sync success rate | > 99% (when user is online and authorized) |
| Lighthouse Performance score | ≥ 90 |

---

## 10. Glossary

| Term | Definition |
|---|---|
| **BYOK** | Bring Your Own Key — user supplies their own AI API credentials. |
| **appDataFolder** | A hidden Google Drive folder accessible only to the app that created it. |
| **Task Paralysis** | The mental state of being unable to start work due to the overwhelming size of a goal. |
| **Pomodoro** | A time management method using 25-minute focused work intervals separated by short breaks. |
