# SliceTask — UI/UX Architecture

> **Version:** 1.0 | **Updated:** 2026-04-12

---

## 1. Design Philosophy

**"Calm Productivity"** — reduce cognitive load by stripping visual noise and guiding the eye to one action at a time.

- **Minimal chrome**: Borders, shadows used sparingly
- **Content-first**: Task content ≥80% viewport
- **Motion with purpose**: Animations signal state changes only
- **Dark-mode native**: Designed dark-first, light mode available

---

## 2. Color Palette

### Dark Theme (Default)

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `hsl(225, 15%, 8%)` | App background |
| `--bg-surface` | `hsl(225, 15%, 12%)` | Cards, sidebar |
| `--bg-elevated` | `hsl(225, 15%, 16%)` | Modals, dropdowns |
| `--border-subtle` | `hsl(225, 10%, 20%)` | Dividers |
| `--text-primary` | `hsl(220, 15%, 92%)` | Headings |
| `--text-secondary` | `hsl(220, 10%, 60%)` | Labels |
| `--text-muted` | `hsl(220, 8%, 40%)` | Placeholders |
| `--accent-primary` | `hsl(250, 80%, 65%)` | Primary buttons, links |
| `--accent-success` | `hsl(145, 60%, 45%)` | Done column |
| `--accent-warning` | `hsl(38, 90%, 55%)` | Deadline ≤24h |
| `--accent-danger` | `hsl(0, 75%, 55%)` | Overdue |
| `--accent-info` | `hsl(200, 70%, 55%)` | In Progress accent |

### Light Theme

Inverted lightness: `--bg-base: hsl(225,20%,97%)`, `--bg-surface: white`, `--text-primary: hsl(225,15%,12%)`. Accent hues identical.

### Semantic Colors

- **Deadline safe** (>24h): no indicator
- **Approaching** (≤24h): amber glow on card border
- **Overdue**: red glow + pulsing dot
- **Kanban columns**: Todo (neutral), In Progress (blue left-border), Done (green left-border + strikethrough)

---

## 3. Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Logo | `Space Grotesk` | 20px | 700 |
| Column headers | `Inter` | 13px | 600 |
| Card titles | `Inter` | 14px | 500 |
| Card descriptions | `Inter` | 12px | 400 |
| AI input | `Inter` | 15px | 400 |
| Pomodoro timer | `Space Mono` | 48px | 400 |

Font loading: `font-display: swap` + preload for Inter.

---

## 4. Layout Architecture

### 4.1 Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────────┐
│ ┌─SIDEBAR (280px)──┐  ┌─MAIN CONTENT──────────────────┐   │
│ │ Logo              │  │ ┌─AI INPUT BAR──────────────┐ │   │
│ │ Nav links         │  │ │ "Break down a goal…" [▶]  │ │   │
│ │ History panel     │  │ └────────────────────────────┘ │   │
│ │ Pomodoro widget   │  │ ┌─KANBAN (3 cols)────────────┐ │   │
│ │ Sync status       │  │ │ Todo │ In Prog │ Done      │ │   │
│ └───────────────────┘  │ └────────────────────────────┘ │   │
│ ┌─STATUS BAR (32px)────────────────────────────────────┐   │
│ │ Sync ✅ │ 🍅 18:42 │ 3 tasks due                     │   │
│ └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Tablet (768–1023px)

- Sidebar → icon rail (56px)
- Kanban: Todo + In Progress side-by-side; Done as horizontal strip below
- Task detail: slide-in panel (50% width)

### 4.3 Mobile (<768px)

```
┌────────────────────────┐
│ [☰] SliceTask    [🍅]  │  Top bar
│ ┌─AI INPUT───────────┐ │
│ │ "Goal…"    [Submit] │ │
│ └─────────────────────┘ │
│ [Todo] [Progress] [Done]│  Swipeable tabs
│ ┌─Card────────────────┐ │
│ │ Task title    🔴    │ │
│ └─────────────────────┘ │
│ [📋] [🕐] [🍅] [⚙️]   │  Bottom nav
└────────────────────────┘
```

- Columns shown one-at-a-time via tabs
- Drag-and-drop → long-press "Move to…" menu
- Detail view → bottom sheet (80vh)

---

## 5. Breakpoints

| Name | Range | Strategy |
|---|---|---|
| `mobile-sm` | 0–479px | Single column, compact cards |
| `mobile-lg` | 480–767px | Wider cards |
| `tablet` | 768–1023px | Icon rail, 2-col Kanban |
| `desktop` | 1024–1439px | Full sidebar, 3-col |
| `desktop-lg` | ≥1440px | Max-width 1320px, centered |

---

## 6. Component Hierarchy

```
App
├── ThemeProvider
├── Layout
│   ├── Sidebar
│   │   ├── SidebarHeader (logo, collapse)
│   │   ├── SidebarNav
│   │   ├── HistoryPanel → HistoryItem[]
│   │   ├── PomodoroWidget (timer, controls, settings)
│   │   └── SyncStatus
│   ├── MainContent
│   │   ├── AIInputBar (textarea, provider badge, submit)
│   │   ├── KanbanBoard
│   │   │   └── KanbanColumn (×3) → TaskCard[] + AddCardButton
│   │   └── TaskDetailPanel (date, priority, description, delete)
│   └── StatusBar
├── SettingsModal (API key, theme, Drive, Pomodoro defaults)
├── OnboardingModal (welcome, API key setup, Drive)
├── ConflictResolutionModal
└── ToastContainer
```

---

## 7. Interaction Patterns

### AI Input Bar
- **Idle**: Pulsing placeholder text
- **Focus**: Glow border (`--accent-primary`, 20% opacity)
- **Submitting**: Progress bar animation beneath input
- **Result**: Cards cascade into Todo with staggered fade-in (300ms, 50ms stagger)
- **Shortcut**: `Ctrl/Cmd + Enter` to submit

### Drag and Drop (Desktop)
- Grab: shadow + 2° rotation
- Dragging: ghost at 50% opacity; drop zones highlight
- Drop: spring snap (200ms)
- Library: `@dnd-kit/core`

### Task Card Actions

| Action | Desktop | Mobile |
|---|---|---|
| Open detail | Click | Tap |
| Edit title | Double-click | Long press |
| Move column | Drag | Long press → menu |
| Delete | Hover → trash → confirm | Swipe left → confirm |

### Pomodoro Timer
- States: Idle → Work → Break → Work → … → Long Break (after 4)
- Visual: Circular SVG progress ring
- Ambient music: 1s fade in/out
- Mini timer in status bar when sidebar is collapsed

---

## 8. Animations

| Element | Duration | Easing |
|---|---|---|
| Sidebar toggle | 250ms | ease-in-out |
| Card AI appear | 300ms (50ms stagger) | ease-out |
| Card drop | 200ms | spring |
| Card delete | 200ms | ease-in |
| Modal open/close | 200ms / 150ms | ease-out / ease-in |
| Toast in/out | 300ms / 200ms | ease-out / ease-in |
| Theme transition | 300ms | ease-in-out |
| Pomodoro ring tick | 1s | linear |

Respect `prefers-reduced-motion`: disable all animations except opacity.

---

## 9. Micro-Interactions

1. **AI "thinking"**: Three dots pulse sequentially (chat-style typing indicator)
2. **All tasks done**: Subtle confetti burst (canvas, 1.5s)
3. **Pomodoro complete**: Growing circle animation + ding
4. **Empty columns**: SVG illustration + helper text
5. **Streak**: 🔥 icon after 3+ consecutive Pomodoro sessions

---

## 10. Accessibility

| Requirement | Implementation |
|---|---|
| Keyboard nav | Full tab order; `Escape` closes modals |
| Screen reader | ARIA roles for columns/cards; live regions for toasts |
| Drag a11y | `@dnd-kit` keyboard drag (Space, arrows) |
| Contrast | WCAG AA (≥4.5:1 body, ≥3:1 large) |
| Reduced motion | `prefers-reduced-motion` respected |
| Focus ring | 2px solid `--accent-primary` |
| Touch targets | Min 44×44px on mobile |
| Landmarks | `header`, `nav`, `main`, `aside` |

---

## 11. Iconography

**Lucide Icons** (open-source, tree-shakeable, 24px):

Sidebar toggle (`PanelLeftClose`), Add (`Plus`), Delete (`Trash2`), Edit (`Pencil`), Deadline (`Calendar`), Priority (`Flag`), Settings (`Settings`), History (`Clock`), Pomodoro (`Timer`), AI (`Sparkles`), Sync (`RefreshCw`), Theme (`Sun`/`Moon`), Close (`X`), Drag (`GripVertical`)
