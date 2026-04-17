# SliceTask — Calm AI Task Management

SliceTask is a 100% client-side, privacy-focused task manager that helps you slice big goals into actionable steps using AI. It combines a robust Kanban board with a Pomodoro timer and seamless Google Drive synchronization.

![SliceTask Banner](https://via.placeholder.com/1200x600?text=SliceTask+Coming+Soon)

## ✨ Features

- **BYOK AI Integration**: Use your own Gemini or Groq API keys for infinite task breakdowns.
- **Persistent Kanban**: Drag-and-drop workflow that saves instantly to your browser's IndexedDB.
- **Accurate Pomodoro**: A Web Worker-powered timer that stays precise even in background tabs.
- **Cloud Sync**: Optional, encrypted backup to your personal Google Drive (appDataFolder).
- **Offline First**: Works entirely offline as a Progressive Web App (PWA).
- **Privacy Native**: Your data and API keys never leave your browser.

## 🚀 Tech Stack

- **Framework**: React 18 (Vite)
- **Language**: TypeScript (Strict Mode)
- **State**: Zustand (with Persist Middleware)
- **Database**: Dexie.js (IndexedDB)
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin + Workbox

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔑 Configuration

### AI Providers
To enable task breakdowns, go to **Settings > AI Provider**:
- **Google Gemini**: Get a key from the [Google AI Studio](https://aistudio.google.com/).
- **Groq**: Get a key from the [Groq Console](https://console.groq.com/).

### Google Drive Sync
To enable cloud sync, you must provide a Google Client ID in the code (`src/services/drive/auth.ts`):
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Drive API**.
3. Configure the OAuth consent screen with the `drive.appdata` scope.
4. Create an OAuth 2.0 Client ID (Web Application) and add your domain to "Authorized JavaScript origins".

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `N` | Focus AI Input / New Session |
| `Space` | Start / Pause Pomodoro |
| `B` | Switch to Board |
| `H` | Switch to History |
| `P` | Switch to Pomodoro Widget |
| `S` | Open Settings |
| `1`, `2`, `3` | Switch Kanban Columns (Mobile) |
| `Esc` | Close Modal / Deselect Task |

## 📜 License
MIT
