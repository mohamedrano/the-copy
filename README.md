# the copy

A unified production-ready web application integrating three powerful AI-powered platforms:
- **Arabic Screenplay Editor**: Production-ready writing environment with AI agents
- **Drama Analyst**: Advanced narrative analysis system
- **Stations**: 7-stage sequential text analysis pipeline
- **Multi-Agent Story**: 11-agent storytelling development platform

Built with Vite + React + TypeScript, deployed as a single Docker container with embedded SPAs.

## Table of Contents

1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [Getting Started](#getting-started)
4. [Development Scripts](#development-scripts)
5. [Environment Configuration](#environment-configuration)
6. [Using the Editor](#using-the-editor)
7. [AI Agent Platform](#ai-agent-platform)
8. [Project Structure](#project-structure)
9. [Contributing](#contributing)
10. [License](#license)

## Key Features

- **Arabic-first screenplay formatting** – Automatic styling for basmala, scene headers, action, dialogue, transitions, and parentheticals with precise RTL layout.
- **Productivity tooling** – Keyboard navigation between formats, rich text styling, search and replace, character renaming, statistics, and light/dark mode toggles.
- **Auto-save orchestration** – A dedicated manager that safely persists work and supports future integrations with remote storage.
- **Advanced search engine** – Regex-aware search/replace with whole-word and case-sensitivity options tuned for Arabic scripts.
- **AI assistance suite** – Modular agents that analyze rhythm, characters, tension, producibility, and more, plus creative generators and completion utilities.
- **Visual planning support** – Storyboard and beat sheet abstractions for connecting prose with cinematic planning artifacts.





## Architecture Overview

| Layer | Description |
| --- | --- |
| **UI Components** | React components under `src/components/` implement the editor shell, modal dialogs, and UX tooling. |
| **State & Services** | `StateManager`, `AutoSaveManager`, `CollaborationSystem`, and other classes inside `CleanIntegratedScreenplayEditor.tsx` encapsulate local domain logic. |
| **AI Agents** | Configuration-heavy modules in `src/agents/` define task-specific personas and prompts that are orchestrated through Gemini (`geminiService.ts`). |
| **Types & Config** | Shared enums and interfaces in `src/types/` plus centralized agent registries in `src/config/`. |
| **Assets & Styling** | Tailwind-powered styling pipeline with additional editor-specific CSS in `src/style.css`. |

## Getting Started

1. **Install prerequisites**
   - [Node.js 18+](https://nodejs.org/) (which ships with npm)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   By default Vite serves the app at [http://localhost:5173](http://localhost:5173). The terminal will display the exact URL.

4. **Build for production**
   ```bash
   npm run build
   ```
   The optimized bundle is emitted to `dist/` and can be previewed with `npm run preview`.

## Development Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Launches the hot-reloading development server. |
| `npm run build` | Type-checks the project and generates an optimized production build. |
| `npm run preview` | Serves the production bundle locally for smoke testing. |

> **Testing & Linting**: The repository currently does not ship automated tests or lint scripts. When adding them, prefer `vitest` for unit tests and `eslint` + `prettier` for consistent authoring.

## Environment Configuration

Some AI functionality requires a Gemini API key at runtime:

- Create a `.env.local` file at the project root.
- Add `API_KEY=<your_google_generative_ai_key>`.
- Restart the dev server after updating environment variables.

The application gracefully degrades when a key is absent; AI features will surface informative error messages.

## Using the Editor

1. **Drafting Basics**
   - Type directly into the central editing surface. Formatting updates automatically based on detected screenplay cues.
   - Use **Tab** / **Shift+Tab** to cycle between action, character, dialogue, and transition blocks.
   - Apply rich text commands with familiar shortcuts (`Ctrl+B`, `Ctrl+I`, `Ctrl+U`).

2. **Toolbars & Panels**
   - **Top toolbar** exposes file, edit, format, and tools menus along with theme toggles.
   - **Right sidebar** controls fonts, sizes, quick insert shortcuts, document statistics, search/replace dialogs, and AI helpers.

3. **Search & Replace**
   - Invoke search via the binoculars icon or shortcuts, then apply regex-enabled queries to locate dialogue or action lines.

4. **Character Management**
   - Rename characters globally from the sidebar dialog to maintain naming consistency across long drafts.

5. **AI Review**
   - Open the AI review panel to trigger an automated critique. The current implementation simulates responses; integrating the real Gemini backend requires a valid API key.

## AI Agent Platform

- Agent blueprints live in `src/agents/` and are grouped by category (core, analysis, generation, evaluation, transformation).
- The Gemini service (`src/agents/core/geminiService.ts`) assembles persona prompts, attaches uploaded documents, and calls the Google Generative AI SDK.
- Customize agent behaviour by editing the corresponding instruction files under `src/agents/instructions/`.

## Project Structure

```
src/
├── agents/            # Agent configs, instructions, and Gemini integration helpers
├── assets/            # Static assets consumed by the UI
├── components/        # React components (editor shell and popups)
│   └── editor/        # Screenplay editor and related dialogs
├── config/            # Shared configuration maps for agents and UI
├── services/          # Standalone utilities (e.g., classifier experiments)
├── tests/             # Placeholder for future automated tests
├── types/             # Shared TypeScript enums and interfaces
├── App.tsx            # Root component mounting the editor
└── main.tsx           # Vite entry point
```

## Contributing

1. Fork the repository and create a topic branch (`git checkout -b feature/amazing-improvement`).
2. Implement your changes and include documentation or tests where appropriate.
3. Run `npm run build` to ensure the project type-checks and bundles successfully.
4. Open a pull request that describes the motivation, solution, and validation steps.

## License

This project is provided under the MIT License. See the [LICENSE](LICENSE) file for full terms.
