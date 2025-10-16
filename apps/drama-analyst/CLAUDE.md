# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Drama Analyst & Creative Mimic** is an AI-powered dramatic text analysis and creative generation platform built with React, TypeScript, and Google's Gemini API. The system uses a sophisticated multi-agent architecture where specialized AI agents handle different aspects of dramatic text processing, from critical analysis to creative scene generation.

**Core Tech Stack:**
- Frontend: React 19, TypeScript, Vite
- AI Provider: Google Gemini API (`@google/genai`)
- Document Processing: Mammoth (for .docx files)
- File Upload: react-dropzone

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (default port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Agent-Based System

The codebase implements an **AI Agent Orchestration System** where specialized agents handle different tasks. This is the core architectural pattern that distinguishes this project.

**Key Concepts:**
1. **AIAgentConfig** ([core/types.ts](core/types.ts)): Defines agent capabilities, dependencies, and behavior
2. **Agent Registry** ([agents/index.ts](agents/index.ts)): Central registry of all 29 specialized agents
3. **Orchestration Manager** ([orchestration/orchestration.ts](orchestration/orchestration.ts)): Manages agent lifecycle, collaboration, and performance

**Agent Categories:**
- **Core Agents** (4): Analysis, Creative, Integrated, Completion
- **Analytical Agents** (6): Rhythm mapping, character networks, dialogue forensics, thematic mining, style fingerprinting, conflict dynamics
- **Creative Agents** (4): Adaptive rewriting, scene generation, character voice, world building
- **Predictive Agents** (4): Plot prediction, tension optimization, audience resonance, platform adaptation
- **Advanced Modules** (11): Deep analyzers for characters, dialogue, visual/cinematic elements, themes, cultural context, producibility, target audience, literary quality, and recommendations

### Path Aliases

The project uses TypeScript path aliases configured in [tsconfig.json](tsconfig.json#L21-L39):

```typescript
"@/*"             → ./*              // Root directory
"@core/*"         → core/*           // Core types, enums, constants
"@agents/*"       → agents/*         // Agent configurations
"@orchestration/*"→ orchestration/*  // Orchestration logic
"@ui/*"           → ui/*             // React components
"@services/*"     → services/*       // Services (file processing, Gemini API)
```

### Directory Structure

```
agents/               # 29 specialized AI agents, each in its own folder
  <agentName>/
    agent.ts         # Agent configuration (AIAgentConfig)
    instructions.ts  # Detailed system prompt
core/                # Shared types, enums, and constants
  types.ts           # Core TypeScript interfaces
  enums.ts           # TaskType and TaskCategory enums
  constants.ts       # App configuration and labels
orchestration/       # Agent coordination and execution
  orchestration.ts   # AIAgentOrchestraManager singleton
  executor.ts        # Main execution pipeline
  promptBuilder.ts   # Dynamic prompt construction
services/            # External service integrations
  geminiService.ts   # Google Gemini API calls
  fileReaderService.ts # File processing (txt, md, pdf, docx, images)
ui/                  # React frontend
  App.tsx           # Main application component
  components/       # Reusable UI components
```

## Key Implementation Patterns

### 1. Agent Configuration Pattern

Each agent follows a strict configuration structure defined in [agents/\<name\>/agent.ts](agents/analysis/agent.ts):

```typescript
export const AGENT_CONFIG: AIAgentConfig = {
  id: TaskType.EXAMPLE,
  name: "Agent Name",
  description: "Arabic description",
  category: TaskCategory.CORE,
  capabilities: {
    multiModal: boolean,
    reasoningChains: boolean,
    ragEnabled: boolean,
    // ... 15+ capability flags
  },
  collaboratesWith: TaskType[],  // Agents that work together
  dependsOn: TaskType[],          // Required prerequisite agents
  enhances: TaskType[],           // Agents this improves
  systemPrompt: "...",            // Agent-specific instructions
  cacheStrategy: 'adaptive' | 'aggressive' | 'none',
  parallelizable: boolean,
  confidenceThreshold: number
}
```

### 2. Request Flow

1. **User uploads files** → [FileUpload.tsx](ui/components/FileUpload.tsx)
2. **Files processed** → [fileReaderService.ts](services/fileReaderService.ts) converts to `ProcessedFile[]`
3. **User selects task** → [TaskSelector.tsx](ui/components/TaskSelector.tsx) chooses from `TaskType` enum
4. **Request submitted** → [App.tsx](ui/App.tsx) creates `AIRequest` object
5. **Orchestration** → [executor.ts](orchestration/executor.ts) prepares prompt via [promptBuilder.ts](orchestration/promptBuilder.ts)
6. **API call** → [geminiService.ts](services/geminiService.ts) invokes Gemini model
7. **Response parsed** → Results displayed in [ResultsDisplay.tsx](ui/components/ResultsDisplay.tsx)

### 3. Type System

The project uses strict TypeScript with comprehensive types in [core/types.ts](core/types.ts):

```typescript
// Core types
AIRequest       // User request with agent, files, params
AIResponse      // Model response with parsed and raw content
ProcessedFile   // Unified file representation (text or binary)
AIAgentConfig   // Complete agent specification
Result<T>       // Success/error wrapper pattern
```

### 4. Orchestration System

The [AIAgentOrchestraManager](orchestration/orchestration.ts#L14) is a **singleton** that:
- Maintains agent registry and collaboration graph
- Tracks performance metrics with exponential moving averages
- Manages episodic/semantic/procedural memory systems
- Optimizes execution order based on dependencies
- Provides meta-learning capabilities

Access via: `import { aiAgentOrchestra } from '@orchestration/orchestration';`

## Working with Agents

### Adding a New Agent

1. Create directory: `agents/newAgent/`
2. Create `agent.ts` with `AIAgentConfig` export
3. Create `instructions.ts` with detailed system prompt
4. Register in [agents/index.ts](agents/index.ts) by adding to `AGENT_CONFIGS` array
5. Add enum value to [core/enums.ts](core/enums.ts) `TaskType`
6. Add label to [core/constants.ts](core/constants.ts) `TASK_LABELS`

### Agent Collaboration

Agents can collaborate through three mechanisms:
- `collaboratesWith`: Direct peer collaboration
- `dependsOn`: Sequential dependency (A must run before B)
- `enhances`: Improvement relationship (A enhances B's output)

The orchestration system automatically builds a collaboration graph and optimizes execution order.

## Environment Configuration

Required environment variables in `.env`:

```bash
API_KEY=<your-gemini-api-key>
```

The API key is accessed via `import.meta.env.VITE_API_KEY` in the Gemini service.

## Important Implementation Details

1. **Arabic Language**: The UI and outputs are primarily in Arabic. Task labels, descriptions, and system prompts use Arabic text.

2. **Completion Tasks**: Some tasks (completion, plot prediction, scene generation, etc.) require a `completionScope` parameter that specifies the desired extent of generation.

3. **File Processing**: The system supports multiple formats:
   - Text: `.txt`, `.md`
   - Documents: `.docx` (via Mammoth), `.doc` (limited), `.pdf`
   - Images: `.png`, `.jpg`, `.jpeg`, `.webp`

4. **Memory Systems**: The orchestration layer implements three memory types:
   - **Episodic**: Stores recent interaction episodes (last 100)
   - **Semantic**: Vector embeddings for conceptual memory
   - **Procedural**: Function-based learned procedures

5. **Performance Tracking**: Each agent's performance is monitored with:
   - Success rate (exponential moving average)
   - Average execution time
   - Resource usage intensity
   - User satisfaction scores

## Testing & Type Checking

```bash
# Type checking (recommended before commits)
npx tsc --noEmit

# The project uses TypeScript strict mode with:
# - experimentalDecorators enabled
# - isolatedModules enforced
# - noEmit (build handled by Vite)
```

## Common Development Tasks

**Modifying agent behavior:**
- Edit `agents/<agentName>/instructions.ts` for prompt changes
- Edit `agents/<agentName>/agent.ts` for capability/configuration changes

**Adding UI components:**
- Place in `ui/components/` directory
- Import using `@ui/components/<ComponentName>`
- Follow existing pattern of styled components with Tailwind CSS

**Updating orchestration logic:**
- Core logic in [orchestration/orchestration.ts](orchestration/orchestration.ts)
- Execution pipeline in [orchestration/executor.ts](orchestration/executor.ts)
- Prompt construction in [orchestration/promptBuilder.ts](orchestration/promptBuilder.ts)

**File processing:**
- All file handling logic in [services/fileReaderService.ts](services/fileReaderService.ts)
- Returns `Result<ProcessedFile[]>` with success/error wrapper

## Notable Design Decisions

1. **Agent-based architecture** instead of monolithic prompt system allows:
   - Specialized expertise per task
   - Independent capability configuration
   - Collaborative multi-agent workflows
   - Performance tracking per agent

2. **Orchestration manager singleton** ensures:
   - Single source of truth for agent registry
   - Centralized performance metrics
   - Consistent collaboration graph

3. **Path aliases** reduce import verbosity and make refactoring easier

4. **Result<T> pattern** for error handling provides type-safe success/failure handling without exceptions

5. **ProcessedFile abstraction** unifies text and binary file handling with a single interface
