# SliceTask — Implementation Roadmap

> **Version:** 1.0 | **Updated:** 2026-04-12

---

## Overview

The build is organized into **5 phases**, each producing a shippable increment. Phases are sequential — each builds on the previous. Estimated total: **6–8 weeks** for a solo developer.

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5
Project     Kanban      BYOK AI     Pomodoro    Google Drive
Setup &     Board       Integration & Deadlines  Sync & PWA
UI Shell    Logic                   & Notifs
(~1 week)   (~1.5 wks)  (~1.5 wks)  (~1.5 wks)  (~1.5 wks)
```

---

## Phase 1: Project Setup & UI Shell

**Goal:** A fully styled, responsive application shell with theming, navigation, and all visual components rendered with mock data.

**Duration:** ~1 week

### Tasks

#### 1.1 Project Initialization
- [ ] Scaffold Vite + React + TypeScript project (`npx create-vite`)
- [ ] Configure `tsconfig.json` (strict mode, path aliases)
- [ ] Set up ESLint + Prettier with project rules
- [ ] Install core dependencies: `zustand`, `dexie`, `lucide-react`, `@dnd-kit/core`, `@dnd-kit/sortable`
- [ ] Create project folder structure (see System Architecture §11)

#### 1.2 Design System & Global Styles
- [ ] Create `index.css` with all CSS custom properties (color tokens, spacing, typography)
- [ ] Implement dark/light theme toggle via `data-theme` attribute on `<html>`
- [ ] Set up Google Fonts loading (Inter, Space Grotesk, Space Mono)
- [ ] Define shared CSS utilities: `.visually-hidden`, focus ring styles, scrollbar styling
- [ ] Create base component styles: buttons, inputs, modals, toasts

#### 1.3 Layout Components
- [ ] Build `Layout.tsx` — sidebar + main content + status bar grid
- [ ] Build `Sidebar.tsx` — collapsible (280px ↔ 56px icon rail ↔ hidden on mobile)
- [ ] Build `StatusBar.tsx` — fixed bottom bar with placeholder slots
- [ ] Implement responsive breakpoints with CSS `@media` queries
- [ ] Mobile bottom navigation bar

#### 1.4 Kanban UI (Visual Only)
- [ ] Build `KanbanBoard.tsx` — 3-column layout (flex on desktop, tabs on mobile)
- [ ] Build `KanbanColumn.tsx` — header with count badge + scrollable card list
- [ ] Build `TaskCard.tsx` — card with title, deadline badge, priority dot, hover actions
- [ ] Build `AddCardButton.tsx` — "+" button at column bottom
- [ ] Populate with hardcoded mock data for visual testing

#### 1.5 Remaining UI Shells
- [ ] Build `AIInputBar.tsx` — auto-resize textarea + submit button + provider badge
- [ ] Build `TaskDetailPanel.tsx` — slide-in panel (desktop) / bottom sheet (mobile)
- [ ] Build `HistoryPanel.tsx` — scrollable list with mock items
- [ ] Build `PomodoroWidget.tsx` — timer circle (SVG) + controls
- [ ] Build `SettingsModal.tsx` — tabbed modal with form sections
- [ ] Build `OnboardingModal.tsx` — multi-step wizard shell
- [ ] Build `ToastContainer.tsx` + `Toast.tsx`

### Exit Criteria (Phase 1)
- [ ] App renders on Chrome, Firefox, Safari at all breakpoints
- [ ] Theme toggle works (dark ↔ light) with smooth transition
- [ ] Sidebar collapses/expands with animation
- [ ] All components render with mock data
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 90
- [ ] Mobile layout uses swipeable tabs for Kanban columns

---

## Phase 2: Kanban Board Logic & Persistence

**Goal:** Fully functional Kanban board with drag-and-drop, CRUD operations, and IndexedDB persistence.

**Duration:** ~1.5 weeks

### Tasks

#### 2.1 IndexedDB Setup
- [ ] Create `database.ts` with Dexie.js schema (tasks, promptHistory, pomodoroSessions, syncMeta)
- [ ] Define TypeScript interfaces for all table schemas
- [ ] Write seed data function for development
- [ ] Test: create, read, update, delete operations on all tables

#### 2.2 Zustand Store — Task Slice
- [ ] Create `taskSlice.ts` with state and actions (add, update, delete, move, reorder, bulkAdd)
- [ ] Create `uiSlice.ts` with sidebar, theme, active panel, selected task state
- [ ] Wire Zustand `persist` middleware to Dexie.js for task data
- [ ] Implement debounced (300ms) persistence
- [ ] Test: state survives page refresh

#### 2.3 Drag and Drop Integration
- [ ] Wire `@dnd-kit` to `KanbanBoard` and `KanbanColumn`
- [ ] Implement cross-column drag (changes task `status`)
- [ ] Implement intra-column reorder (updates `columnOrder`)
- [ ] Build `DragOverlay.tsx` ghost card
- [ ] Add keyboard drag support (Space to grab, arrows to move)
- [ ] Mobile: implement long-press "Move to…" action menu fallback

#### 2.4 Task CRUD
- [ ] "Add Card" button → inline editable card that saves on blur/Enter
- [ ] Double-click card title → inline edit mode
- [ ] Delete card → confirmation dialog → remove from store + DB
- [ ] Task detail panel: wire title, description (markdown textarea), status dropdown
- [ ] Task detail: close panel on Escape or click-away

#### 2.5 Data Validation
- [ ] Validate task title (non-empty, max 200 chars)
- [ ] Validate description (max 5000 chars)
- [ ] Handle edge case: duplicate task IDs (UUID collision — regenerate)
- [ ] Handle edge case: corrupted IndexedDB (catch errors, offer "Reset Data" option)

### Exit Criteria (Phase 2)
- [ ] Cards drag between all 3 columns; order persists after refresh
- [ ] Task CRUD (create, read, update, delete) fully functional
- [ ] Task detail panel shows all fields; edits persist
- [ ] IndexedDB stores all task data; survives browser restart
- [ ] Keyboard-only drag and drop works
- [ ] No console errors during any interaction

---

## Phase 3: BYOK AI Integration

**Goal:** Users can enter an API key, submit goals, and receive AI-generated task breakdowns populated into the Kanban board.

**Duration:** ~1.5 weeks

### Tasks

#### 3.1 API Key Management
- [ ] Build API key input UI in `SettingsModal` (masked input, provider dropdown)
- [ ] Implement `localStorage` save/load for API key
- [ ] Optional: Web Crypto AES-GCM encryption with user passphrase
- [ ] "Test Key" button — sends lightweight request to validate
- [ ] "Remove Key" button — clears key, disables AI features
- [ ] Show active provider badge in AI input bar

#### 3.2 Onboarding Flow
- [ ] First-time detection (check `localStorage` for `onboarding_complete` flag)
- [ ] Multi-step onboarding modal: Welcome → API Key Setup → (optional Drive) → Done
- [ ] Skip option for users who want to use manual-only mode
- [ ] Set `onboarding_complete` flag after completion or skip

#### 3.3 AI Service Layer
- [ ] Create `AIService.ts` — provider-agnostic interface
- [ ] Implement `GeminiProvider.ts`:
  - API endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
  - Request format: `{ contents: [{ role, parts }] }`
  - Parse response: extract JSON from `candidates[0].content.parts[0].text`
- [ ] Implement `GroqProvider.ts`:
  - API endpoint: `https://api.groq.com/openai/v1/chat/completions`
  - Request format: OpenAI-compatible `{ model, messages }` 
  - Parse response: `choices[0].message.content`
- [ ] Craft system prompt in `prompts.ts` (see System Architecture §5.2)
- [ ] JSON response parsing with fallback (handle markdown-wrapped JSON)

#### 3.4 AI Input Integration
- [ ] Wire AI input bar to `AIService`
- [ ] Show loading state (shimmer/skeleton in Todo column)
- [ ] On success: parse sub-tasks → `bulkAddTasks()` → animate cards into Todo
- [ ] On error: show toast with specific error message (see error table in §5.3)
- [ ] Implement `Ctrl/Cmd + Enter` keyboard shortcut

#### 3.5 Prompt History
- [ ] Save each prompt + response to `promptHistory` table in IndexedDB
- [ ] Wire `HistoryPanel` to display entries from IndexedDB
- [ ] Click history entry → expand to show generated tasks
- [ ] "Re-run" button → re-submit the same prompt
- [ ] "Clear History" button → confirmation → delete all entries
- [ ] Zustand `aiSlice` manages history state

#### 3.6 Conversation Context
- [ ] Maintain last 5 prompt-response pairs in memory
- [ ] Send as context for follow-up prompts (multi-turn)
- [ ] "New Session" button to clear context
- [ ] Implement "Regenerate" button on each AI result batch

### Exit Criteria (Phase 3)
- [ ] User can save Gemini key, test it, and receive task breakdowns
- [ ] User can save Groq key, test it, and receive task breakdowns
- [ ] AI-generated tasks appear in Todo column with animation
- [ ] Prompt history is saved and displayed in sidebar
- [ ] Re-run and regenerate work correctly
- [ ] Error handling covers all cases (401, 429, 5xx, parse error, network)
- [ ] App remains fully functional without an API key (manual-only mode)

---

## Phase 4: Pomodoro System & Deadline Notifications

**Goal:** Working Pomodoro timer with customizable settings, and deadline-based task notifications.

**Duration:** ~1.5 weeks

### Tasks

#### 4.1 Pomodoro Engine
- [ ] Build `PomodoroEngine.ts` — timer logic with state machine (idle → work → shortBreak → work → … → longBreak)
- [ ] Implement `setInterval(1000)` countdown with drift correction (`Date.now()` comparison)
- [ ] Handle background tab (recalculate on `visibilitychange`)
- [ ] Wire to `pomodoroSlice` in Zustand

#### 4.2 Pomodoro UI
- [ ] Wire `PomodoroWidget.tsx` to engine state
- [ ] SVG circular progress ring — animated `stroke-dashoffset`
- [ ] Start / Pause / Reset / Skip buttons
- [ ] Session counter (resets at midnight local time)
- [ ] Link-to-task selector (dropdown of "In Progress" tasks)
- [ ] Mini timer in `StatusBar` when sidebar is collapsed
- [ ] Streak indicator (🔥 icon after 3+ sessions)

#### 4.3 Pomodoro Settings
- [ ] Build settings panel within Pomodoro widget
- [ ] Configurable: work duration, short break, long break, sessions before long break
- [ ] Sound type selector (bell, chime, digital) with preview play
- [ ] Ambient music toggle (rain, lo-fi, white noise) with preview
- [ ] Auto-start breaks / auto-start work toggles
- [ ] Persist settings to IndexedDB via Zustand

#### 4.4 Audio System
- [ ] Load notification sounds lazily (on first Pomodoro start)
- [ ] Implement ambient music loop with fade-in/fade-out (1s transition)
- [ ] Pause music during breaks; resume on work start
- [ ] Volume control (local only, not persisted)
- [ ] Handle browser autoplay restrictions (require user interaction before first play)

#### 4.5 Pomodoro History
- [ ] Save completed sessions to `pomodoroSessions` table
- [ ] Link session to task (if selected) → increment `task.pomodoroCount`
- [ ] Display Pomodoro count on task detail panel

#### 4.6 Deadline Notification System
- [ ] Build `DeadlineScheduler.ts` — queries tasks with due dates, schedules `setTimeout`
- [ ] Wire `DatePicker` component in task detail panel
- [ ] Display due date badge on task cards
- [ ] Visual: amber border animation for ≤24h; red border + pulse for overdue
- [ ] Browser Notification API: request permission on first deadline set
- [ ] Audio: play chime when deadline is reached
- [ ] Recalculate timers on task update/delete and on tab focus
- [ ] Due tasks counter in `StatusBar`

#### 4.7 Notification Preferences
- [ ] Add notification preferences to Settings modal
- [ ] Toggle: enable/disable browser notifications
- [ ] Toggle: enable/disable sound notifications
- [ ] Handle revoked notification permissions gracefully

### Exit Criteria (Phase 4)
- [ ] Pomodoro timer counts down accurately (including background tabs)
- [ ] Work → break → work cycle transitions automatically
- [ ] All settings are configurable and persist
- [ ] Notification sounds play on session transitions
- [ ] Ambient music loops during work sessions
- [ ] Deadline badges show correct color states (safe/warning/overdue)
- [ ] Browser notifications fire for approaching and due deadlines
- [ ] Pomodoro session history is recorded in IndexedDB
- [ ] Session count on task detail reflects linked Pomodoro sessions

---

## Phase 5: Google Drive Sync & PWA

**Goal:** Optional cloud backup/restore via Google Drive, PWA installability, and production polish.

**Duration:** ~1.5 weeks

### Tasks

#### 5.1 Google OAuth Setup
- [ ] Create Google Cloud Console project
- [ ] Enable Google Drive API
- [ ] Configure OAuth consent screen (scope: `drive.appdata`)
- [ ] Create OAuth 2.0 Client ID (Web application type)
- [ ] Add authorized origins for localhost + production domain

#### 5.2 Auth Implementation
- [ ] Dynamically load Google Identity Services library
- [ ] Implement `auth.ts` — token client initialization, sign-in, sign-out
- [ ] Store access token in memory (session-only)
- [ ] Implement token refresh (GIS handles this transparently)
- [ ] Wire to `syncSlice` in Zustand
- [ ] UI: "Sign in with Google" button in Settings → Drive section

#### 5.3 Drive Sync Service
- [ ] Build `DriveService.ts` — CRUD for `slicetask-backup.json` in `appDataFolder`
- [ ] Implement backup write: serialize state → upload (create or update)
- [ ] Implement backup read: download → parse → validate schema
- [ ] Build `SyncCoordinator.ts`:
  - Debounced (5s) auto-sync on state mutation
  - `BroadcastChannel` leader election for multi-tab safety
  - Offline queue with retry on `navigator.onLine`
  - Last sync timestamp tracking

#### 5.4 Restore & Conflict Resolution
- [ ] On sign-in: check for existing backup in Drive
- [ ] If local data is empty → auto-restore from cloud
- [ ] If both exist → show `ConflictResolutionModal`:
  - Display local vs cloud timestamps and task counts
  - Options: "Use Cloud Data", "Use Local Data", "Cancel"
- [ ] Handle corrupted backup: JSON schema validation, error prompt

#### 5.5 Sync UI
- [ ] Sync status indicator in sidebar (✅ synced / 🔄 syncing / ⚠️ error)
- [ ] "Sync Now" button in Settings
- [ ] Last sync timestamp display
- [ ] "Disconnect Drive" button → clear tokens, disable auto-sync
- [ ] Toast notifications for sync success/failure

#### 5.6 PWA Setup
- [ ] Configure `vite-plugin-pwa` with Workbox
- [ ] Create `manifest.json` (name: SliceTask, theme color, icons)
- [ ] Generate app icons (192px, 512px, maskable)
- [ ] Service Worker: precache app shell + critical assets
- [ ] Runtime caching: cache Google Fonts, icon assets
- [ ] Offline fallback: full app works offline (except AI + sync)
- [ ] Test installability on Chrome, Edge, Safari

#### 5.7 Production Polish
- [ ] SEO meta tags (`<title>`, `<meta description>`, Open Graph)
- [ ] Error boundaries for all major component trees
- [ ] 404 / error fallback page
- [ ] Export/Import data as JSON (manual backup in Settings)
- [ ] "Clear All Data" button with double confirmation
- [ ] Performance audit: Lighthouse ≥ 90 on all 4 categories
- [ ] Cross-browser testing: Chrome, Firefox, Safari, Edge
- [ ] Mobile device testing: iOS Safari, Android Chrome
- [ ] Keyboard navigation audit (full tab order, Escape behavior)
- [ ] Screen reader testing (VoiceOver, NVDA)

#### 5.8 Deployment
- [ ] Configure Vercel/Cloudflare Pages deployment
- [ ] Set up `vercel.json` or `_redirects` for SPA routing
- [ ] Configure environment variables (Google Client ID — public)
- [ ] Set up custom domain (if desired)
- [ ] Test production build (`vite build` → serve locally → verify)

### Exit Criteria (Phase 5)
- [ ] User can sign in with Google and enable Drive sync
- [ ] Data auto-backs up to Drive on changes (debounced 5s)
- [ ] User can restore data on a new device/browser
- [ ] Conflict resolution modal works correctly
- [ ] App is installable as a PWA on all platforms
- [ ] App works fully offline (except AI and sync)
- [ ] Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO
- [ ] No console errors in production build

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI provider changes API format | Medium | Medium | Abstract provider behind interface; quick swap. Version-pin API. |
| Google deprecates GIS library | Low | High | GIS is the current standard; monitor announcements. Auth layer is abstracted. |
| IndexedDB storage limits | Low | Low | Typical limit is 50–80% of disk; SliceTask data is small (< 10MB for heavy users). |
| Browser autoplay policy blocks audio | High | Medium | Require user interaction (click "Start") before first audio play. Graceful fallback. |
| CORS issues with AI providers | Medium | High | Gemini and Groq both support CORS for browser clients. Test early in Phase 3. |
| `setTimeout` drift in Pomodoro | Medium | Low | Drift correction via `Date.now()` comparison on each tick. |
| Multi-tab data corruption | Medium | High | `BroadcastChannel` leader election; only leader writes to Drive. IndexedDB is inherently multi-tab safe. |

---

## Testing Strategy

### Unit Tests (Vitest)
- All Zustand store slices: state transitions and actions
- AI response parsing: valid JSON, malformed JSON, empty response
- Date utilities: deadline calculations, timezone handling
- Pomodoro engine: timer logic, state transitions, drift correction
- Crypto utilities: encrypt/decrypt API key

### Integration Tests (Vitest + React Testing Library)
- Kanban board: render cards, simulate drag-and-drop
- AI flow: mock API response → verify cards appear
- Settings: save/load API key, toggle theme
- Pomodoro: start → countdown → break transition

### E2E Tests (Playwright)
- Full user journey: onboarding → add API key → submit goal → see tasks → drag to Done
- Offline mode: disconnect network → verify app works → reconnect → verify sync
- Mobile viewport: swipeable tabs, bottom sheet, long-press menu
- PWA: install prompt, offline launch

### Accessibility Tests
- `axe-core` automated audit on all pages
- Manual keyboard navigation walkthrough
- VoiceOver (macOS) and NVDA (Windows) screen reader testing

---

## Dependencies Summary

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "zustand": "^4.5",
    "dexie": "^4.0",
    "@dnd-kit/core": "^6.1",
    "@dnd-kit/sortable": "^8.0",
    "@dnd-kit/utilities": "^3.2",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "vite": "^5.4",
    "@vitejs/plugin-react": "^4.3",
    "vite-plugin-pwa": "^0.20",
    "vitest": "^2.0",
    "@testing-library/react": "^16.0",
    "playwright": "^1.45",
    "eslint": "^9.0",
    "prettier": "^3.3"
  }
}
```

**Total production dependencies:** 7 packages (lightweight).

---

## Milestone Summary

| Milestone | Deliverable | Deployed State |
|---|---|---|
| M1 (end Phase 1) | Styled UI shell with mock data | Static app, no functionality |
| M2 (end Phase 2) | Working Kanban with persistence | Usable as a basic task board |
| M3 (end Phase 3) | AI task breakdown integrated | Core value prop working |
| M4 (end Phase 4) | Pomodoro + deadline alerts | Full local feature set |
| M5 (end Phase 5) | Drive sync + PWA | Production-ready launch |
