# Implementation Plan: Simple Kanban Task Management Board

**Branch**: `001-kanban-board` | **Date**: December 4, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-kanban-board/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a responsive web-based Kanban board with 4 fixed status columns (To Do, In Progress, Testing, Done) supporting drag-and-drop task management, inline label creation, task assignments, search/filtering, and time tracking. Uses optimistic updates for real-time collaboration with conflict detection. Technical stack: Next.js 14+ (App Router), React 18+, TypeScript 5+, Tailwind CSS, SQLite database, @dnd-kit for drag-and-drop.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x LTS  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Tailwind CSS 3.x, @dnd-kit, better-sqlite3  
**Storage**: SQLite (better-sqlite3) for persistence with JSON storage for complex fields  
**Testing**: Jest + React Testing Library for unit/integration, Playwright for E2E (optional)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge), desktop-first with mobile responsive (1024px+ primary, 768px+ secondary)  
**Project Type**: Web application (full-stack Next.js)  
**Performance Goals**: <2s initial page load, <1s search/filter response, <100ms drag-and-drop feedback, support 100+ tasks per board  
**Constraints**: <200ms p95 API response, optimistic UI updates, keyboard accessible, WCAG AA compliance  
**Scale/Scope**: Single-board MVP, ~10 components, ~15 API routes, 4 main database tables

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **Library-First & Componentized**: All features built as reusable components (Board, Column, Card, TaskModal, SearchBar, FilterPanel). Drag-and-drop isolated in custom hooks.

✅ **Type-First**: Full TypeScript coverage - all API contracts, component props, database schemas, state types defined upfront.

✅ **Test-First**: Unit tests for state management, drag-drop logic, persistence layer. Integration tests for CRUD operations. E2E for critical flows (create → move → delete).

✅ **Simplicity & UX-first**: Responsive design with Tailwind, mobile-optimized touch gestures, keyboard navigation, inline editing, clear visual feedback.

✅ **Observability**: Console logging for development, error boundaries for graceful failures, API logging for debugging persistence issues.

**Additional Constitution Compliance**:

- ✅ Single role (User) for MVP as specified
- ✅ Accessibility: Keyboard navigation, ARIA labels, WCAG AA color contrast
- ✅ Performance: Client-side caching, optimistic updates, debounced search
- ✅ Security: Input validation, SQL injection prevention via parameterized queries, XSS prevention via React's built-in escaping

## Project Structure

### Documentation (this feature)

```text
specs/001-kanban-board/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-spec.yaml   # OpenAPI/REST endpoint definitions
│   └── types.ts        # Shared TypeScript type definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
kanban-board/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Main board page
│   │   ├── api/                 # API routes
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts    # GET, POST /api/tasks
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # PATCH, DELETE /api/tasks/:id
│   │   │   ├── labels/
│   │   │   │   └── route.ts    # GET, POST /api/labels
│   │   │   ├── assignees/
│   │   │   │   └── route.ts    # GET /api/assignees
│   │   │   └── tasks/reorder/
│   │   │       └── route.ts    # POST /api/tasks/reorder
│   │   └── globals.css          # Tailwind imports
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx        # Main board container
│   │   │   ├── Column.tsx       # Status column component
│   │   │   ├── Card.tsx         # Task card component
│   │   │   └── EmptyColumn.tsx  # Empty state
│   │   ├── Task/
│   │   │   ├── TaskModal.tsx    # Create/Edit modal
│   │   │   ├── TaskForm.tsx     # Form fields
│   │   │   ├── DeleteConfirm.tsx # Browser confirm wrapper
│   │   │   └── TaskCard.tsx     # Card content layout
│   │   ├── Labels/
│   │   │   ├── LabelSelect.tsx  # Label picker with inline create
│   │   │   ├── LabelBadge.tsx   # Label display component
│   │   │   └── ColorPalette.tsx # Color selector
│   │   ├── Filters/
│   │   │   ├── SearchBar.tsx    # Text search input
│   │   │   ├── FilterPanel.tsx  # Label/assignee filters
│   │   │   └── FilterChips.tsx  # Active filter display
│   │   ├── UI/
│   │   │   ├── Button.tsx       # Reusable button
│   │   │   ├── Input.tsx        # Form input
│   │   │   ├── Modal.tsx        # Base modal
│   │   │   └── Spinner.tsx      # Loading indicator
│   │   └── DragDrop/
│   │       ├── DraggableCard.tsx # Draggable wrapper
│   │       └── DroppableColumn.tsx # Droppable wrapper
│   ├── lib/
│   │   ├── db.ts                # SQLite connection & queries
│   │   ├── api-client.ts        # Typed fetch wrapper
│   │   └── utils.ts             # Helper functions
│   ├── hooks/
│   │   ├── useBoard.ts          # Board state management
│   │   ├── useTasks.ts          # Task CRUD operations
│   │   ├── useFilters.ts        # Search & filter logic
│   │   └── useDragDrop.ts       # Drag-drop event handlers
│   ├── types/
│   │   ├── index.ts             # Main type exports
│   │   ├── task.ts              # Task entity types
│   │   ├── label.ts             # Label entity types
│   │   ├── api.ts               # API request/response types
│   │   └── dnd.ts               # Drag-drop types
│   └── store/
│       └── board-store.ts       # Client-side state (if using Zustand)
├── tests/
│   ├── unit/
│   │   ├── components/          # Component tests
│   │   ├── hooks/               # Hook tests
│   │   └── lib/                 # Utility tests
│   ├── integration/
│   │   ├── api/                 # API route tests
│   │   └── flows/               # User flow tests
│   └── e2e/
│       └── board.spec.ts        # End-to-end tests
├── public/
│   └── images/                  # Static assets
├── prisma/ or migrations/       # Database schema (if using Prisma, else raw SQL)
├── data/
│   └── kanban.db                # SQLite database file
├── .env.local                   # Environment variables
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest configuration
├── playwright.config.ts         # Playwright configuration (optional)
└── package.json                 # Dependencies & scripts
```

**Structure Decision**: Web application (Next.js App Router) with integrated API routes. Single repository containing frontend components and backend API. SQLite for simple, file-based persistence. No separate backend needed - Next.js API routes handle all server logic. Mobile responsiveness via Tailwind utility classes, not separate mobile app.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles satisfied:

- Component-first architecture with clear separation
- TypeScript coverage for type safety
- Test coverage for critical paths
- Simple, user-friendly responsive design
- Adequate observability for debugging

---

## Phase 0: Research & Unknowns

_Output: `research.md` - Decisions on unknowns from Technical Context_

### Research Tasks

1. **Drag-and-drop Library Selection**

   - Evaluate @dnd-kit vs react-beautiful-dnd for Next.js 14 App Router compatibility
   - Confirm touch device support and keyboard accessibility
   - Verify performance with 100+ cards

2. **SQLite Integration Best Practices**

   - Research better-sqlite3 vs other SQLite libraries for Next.js API routes
   - Determine schema migration strategy (raw SQL vs Prisma)
   - Investigate connection pooling needs for serverless deployment

3. **Real-time Optimistic Updates Pattern**

   - Design conflict detection mechanism for concurrent edits
   - Implement auto-merge strategy for non-conflicting changes
   - Error handling and rollback patterns

4. **State Management Approach**

   - Evaluate React Context + useReducer vs Zustand for board state
   - Determine caching strategy for API responses
   - Local state synchronization with server state

5. **Responsive Drag-and-drop UX**
   - Research mobile touch gesture handling
   - Determine column layout strategy for narrow screens (horizontal scroll vs vertical stack)
   - Keyboard navigation implementation for accessibility

---

## Phase 1: Design & Contracts

_Output: `data-model.md`, `/contracts/_`, `quickstart.md`\*

### Data Model (`data-model.md`)

**Entities:**

1. **Task**

   - `id`: UUID (primary key)
   - `title`: string (required, max 200 chars)
   - `description`: string (optional, max 2000 chars)
   - `status`: enum ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')
   - `position`: integer (for manual ordering within column)
   - `created_at`: timestamp
   - `updated_at`: timestamp
   - `status_changed_at`: timestamp
   - Relationships: many-to-many with Labels, many-to-many with Assignees

2. **Label**

   - `id`: UUID (primary key)
   - `name`: string (unique, required, max 50 chars)
   - `color`: string (hex color code from predefined palette)
   - `created_at`: timestamp

3. **Assignee**

   - `id`: UUID (primary key)
   - `name`: string (required, max 100 chars)
   - `email`: string (unique, optional)
   - `created_at`: timestamp

4. **TaskLabel** (junction table)

   - `task_id`: UUID (foreign key → Task)
   - `label_id`: UUID (foreign key → Label)

5. **TaskAssignee** (junction table)

   - `task_id`: UUID (foreign key → Task)
   - `assignee_id`: UUID (foreign key → Assignee)

6. **TaskHistory** (for time tracking)
   - `id`: UUID (primary key)
   - `task_id`: UUID (foreign key → Task)
   - `status`: enum ('TODO', 'IN_PROGRESS', 'TESTING', 'DONE')
   - `entered_at`: timestamp
   - `exited_at`: timestamp (nullable, null means currently in this status)

**Validation Rules:**

- Task title: required, 1-200 characters
- Label name: unique across system, 1-50 characters
- Label color: must be from predefined palette (8 colors)
- Task position: non-negative integer, unique within column
- Duplicate label names prevented at API level

### API Contracts (`/contracts/`)

**REST Endpoints:**

```typescript
// GET /api/tasks
Response: { tasks: Task[], labels: Label[], assignees: Assignee[] }

// POST /api/tasks
Request: { title: string, description?: string, labelIds?: string[], assigneeIds?: string[] }
Response: { task: Task }

// PATCH /api/tasks/:id
Request: { title?: string, description?: string, status?: Status, labelIds?: string[], assigneeIds?: string[] }
Response: { task: Task }

// DELETE /api/tasks/:id
Response: { success: boolean }

// POST /api/tasks/reorder
Request: { taskId: string, targetColumn: Status, targetPosition: number }
Response: { success: boolean }

// GET /api/labels
Response: { labels: Label[] }

// POST /api/labels
Request: { name: string, color: string }
Response: { label: Label }

// GET /api/assignees
Response: { assignees: Assignee[] }
```

**Type Definitions** (contracts/types.ts):

```typescript
export type Status = "TODO" | "IN_PROGRESS" | "TESTING" | "DONE";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  position: number;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  labels: Label[];
  assignees: Assignee[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  status: Status;
  enteredAt: string;
  exitedAt: string | null;
  duration: number | null; // in seconds
}
```

### Quickstart Guide (`quickstart.md`)

**Development Setup:**

```bash
# Clone and install
git clone <repo>
cd kanban-board
npm install

# Setup database
npm run db:init    # Creates SQLite database and runs migrations

# Environment setup
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# Open browser
http://localhost:3000

# Run tests
npm test                 # Unit & integration tests
npm run test:e2e        # E2E tests (optional)
```

**Key Commands:**

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript validation

---

## Phase 2: Implementation Tasks

_Output: `tasks.md` - Created by `/speckit.tasks` command (NOT by `/speckit.plan`)_

This section is intentionally left empty. Run `/speckit.tasks` to generate the detailed task breakdown based on this plan.
