# SliceTask — Instructional Context

## Project Overview
SliceTask is a privacy-first, client-side task management application. It helps users break down high-level goals into actionable sub-tasks using AI (Gemini or Groq) and manage them on a persistent Kanban board with integrated Pomodoro focus sessions.

### Core Technologies
- **Frontend**: React 19, Vite, TypeScript
- **State Management**: Zustand (with persistence)
- **Local Database**: Dexie.js (IndexedDB)
- **Drag & Drop**: @dnd-kit
- **AI Services**: Google Gemini 2.0 Flash, Groq (Llama 3.3)
- **Infrastructure**: Progressive Web App (PWA), Google Drive Sync (optional backup)

### Architecture
The app follows a 100% client-side architecture:
- `src/store/`: Zustand slices for UI, Tasks, AI, and Pomodoro state.
- `src/services/`: Business logic for AI providers, Database operations, Drive sync, and the Pomodoro engine.
- `src/components/`: Modular UI components organized by feature.
- `src/hooks/`: Custom hooks for Pomodoro logic, audio handling, and keyboard shortcuts.

## Building and Running
The project uses `npm` for dependency management and `vite` for building.

- **Development Server**: `npm run dev`
- **Production Build**: `npm run build`
- **Linting**: `npm run lint`
- **Testing**: `npx vitest` (unit tests for stores and services)

## Development Conventions
- **Strict TypeScript**: Path aliases (e.g., `@/store/...`) are used for cleaner imports.
- **Privacy**: No user data or API keys are sent to a central server; all processing happens in the browser.
- **Persistence**: All user data is stored in IndexedDB via Dexie. State configuration is persisted in `localStorage` where appropriate.
- **Components**: Functional components with CSS modules or dedicated CSS files.
- **Notifications**: Browser Notification API is used for deadline alerts.
- **Accuracy**: The Pomodoro timer runs in a Web Worker to prevent browser throttling.

## Pomodoro Assets (Required)
The application expects the following files in `public/audio/`:
- `bell.mp3`: Play on session completion.
- `rain.mp3`, `lofi.mp3`, `whitenoise.mp3`: Ambient loops.

## AI Configuration
Users must provide their own API keys in the settings:
- Gemini: `https://aistudio.google.com/`
- Groq: `https://console.groq.com/`
