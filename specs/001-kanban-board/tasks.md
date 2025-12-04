# Tasks: Simple Kanban Task Management Board

**Input**: Design documents from `/specs/001-kanban-board/`  
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Not explicitly requested in spec - tests are OPTIONAL and excluded from this breakdown

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a Next.js project with paths at repository root: `src/`, `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 14+ project with TypeScript in project root using `npx create-next-app@latest`
- [ ] T002 [P] Install core dependencies: @dnd-kit/core, @dnd-kit/sortable, better-sqlite3, tailwindcss in package.json
- [ ] T003 [P] Configure TypeScript strict mode and path aliases in tsconfig.json
- [ ] T004 [P] Configure Tailwind CSS with custom color palette in tailwind.config.ts
- [ ] T005 [P] Setup ESLint and Prettier configuration in .eslintrc.json and .prettierrc
- [ ] T006 Create project directory structure: src/app/, src/components/, src/lib/, src/hooks/, src/types/
- [ ] T007 [P] Setup environment configuration with .env.example and .env.local for DATABASE_URL
- [ ] T008 [P] Create SQLite database initialization script in scripts/db-init.sql
- [ ] T009 Create database setup npm scripts (db:init, db:reset, db:seed) in package.json

**Checkpoint**: Project structure ready - foundational work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Execute database schema DDL from data-model.md to create tables: tasks, labels, assignees, task_labels, task_assignees, task_history in kanban.db
- [ ] T011 [P] Create TypeScript type definitions in src/types/index.ts from contracts/types.ts (Task, Label, Assignee, Status enum)
- [ ] T012 [P] Create database client wrapper in src/lib/db.ts with better-sqlite3 connection and prepared statements
- [ ] T013 [P] Create API error handling utilities in src/lib/api-error.ts (ErrorResponse type, error handlers)
- [ ] T014 [P] Create base UI components: Button in src/components/UI/Button.tsx
- [ ] T015 [P] Create base UI components: Input in src/components/UI/Input.tsx
- [ ] T016 [P] Create base UI components: Modal in src/components/UI/Modal.tsx
- [ ] T017 [P] Create base UI components: Spinner in src/components/UI/Spinner.tsx
- [ ] T018 [P] Setup global styles and Tailwind imports in src/app/globals.css
- [ ] T019 Create root layout with HTML structure in src/app/layout.tsx
- [ ] T020 [P] Create utility functions (formatDate, generateUUID) in src/lib/utils.ts
- [ ] T021 [P] Create typed API client wrapper with fetch in src/lib/api-client.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Organize Tasks on Board (Priority: P1) 🎯 MVP

**Goal**: Display all tasks organized by status in 4 fixed columns so users can understand current work state at a glance

**Independent Test**: Create tasks in different statuses via database seed, verify they appear in correct columns with readable card format

### Implementation for User Story 1

- [X] T022 [P] [US1] Create Task entity repository in src/lib/repositories/task-repository.ts with getAllTasks() query
- [X] T023 [P] [US1] Create Label entity repository in src/lib/repositories/label-repository.ts with getAllLabels() query
- [X] T024 [P] [US1] Create Assignee entity repository in src/lib/repositories/assignee-repository.ts with getAllAssignees() query
- [X] T025 [US1] Create GET /api/tasks API route in src/app/api/tasks/route.ts using task repository
- [X] T026 [P] [US1] Create Board container component in src/components/Board/Board.tsx with 4-column layout
- [X] T027 [P] [US1] Create Column component in src/components/Board/Column.tsx accepting status and tasks props
- [X] T028 [P] [US1] Create TaskCard component in src/components/Board/Card.tsx displaying title, labels, assignees
- [X] T029 [P] [US1] Create EmptyColumn component in src/components/Board/EmptyColumn.tsx with empty state message
- [X] T030 [P] [US1] Create LabelBadge component in src/components/Labels/LabelBadge.tsx with color styling
- [X] T031 [US1] Create useBoard hook in src/hooks/useBoard.ts to fetch and manage board state
- [X] T032 [US1] Implement main board page in src/app/page.tsx using Board component and useBoard hook
- [X] T033 [US1] Add responsive layout with Tailwind classes for desktop (1024px+) in Board.tsx
- [X] T034 [US1] Add loading state with Spinner component in page.tsx

**Checkpoint**: User Story 1 complete - board displays tasks organized by status columns

---

## Phase 4: User Story 2 - Move Tasks Between Statuses (Priority: P1) 🎯 MVP

**Goal**: Enable drag-and-drop to move tasks between columns so users can quickly update status without complex interactions

**Independent Test**: Create task in TODO, drag to IN_PROGRESS, verify status persists after page refresh

### Implementation for User Story 2

- [X] T035 [P] [US2] Create PATCH /api/tasks/[id]/route.ts API route for updating task status and position
- [X] T036 [P] [US2] Add updateTask() method to task repository in src/lib/repositories/task-repository.ts
- [X] T037 [P] [US2] Create POST /api/tasks/reorder API route in src/app/api/tasks/reorder/route.ts
- [X] T038 [P] [US2] Create DraggableCard wrapper component in src/components/DragDrop/DraggableCard.tsx using @dnd-kit
- [X] T039 [P] [US2] Create DroppableColumn wrapper component in src/components/DragDrop/DroppableColumn.tsx using @dnd-kit
- [X] T040 [US2] Create useDragDrop hook in src/hooks/useDragDrop.ts with onDragEnd handler and position calculation
- [X] T041 [US2] Integrate DndContext from @dnd-kit into Board.tsx component
- [X] T042 [US2] Replace static Card with DraggableCard in Column.tsx
- [X] T043 [US2] Replace static Column with DroppableColumn in Board.tsx
- [X] T044 [US2] Add visual feedback (highlight, shadow) during drag in DraggableCard.tsx using Tailwind
- [X] T045 [US2] Implement optimistic update in useDragDrop.ts - update UI immediately before API call
- [X] T046 [US2] Add rollback logic in useDragDrop.ts for failed drag operations
- [X] T047 [US2] Update status_changed_at timestamp when status changes in task repository
- [X] T048 [US2] Create TaskHistory entry on status change using trigger or manual insert

**Checkpoint**: User Story 2 complete - drag-and-drop status updates work with persistence

---

## Phase 5: User Story 3 - Create and Manage Task Cards (Priority: P1) 🎯 MVP

**Goal**: Enable creating, editing, and deleting tasks so users can maintain accurate representation of work

**Independent Test**: Create new task, edit its details, delete it, verify all operations persist correctly

### Implementation for User Story 3

- [ ] T049 [P] [US3] Create POST /api/tasks API route in src/app/api/tasks/route.ts for task creation
- [ ] T050 [P] [US3] Create DELETE /api/tasks/[id]/route.ts API route for task deletion
- [ ] T051 [P] [US3] Add createTask() method to task repository in src/lib/repositories/task-repository.ts
- [ ] T052 [P] [US3] Add deleteTask() method to task repository in src/lib/repositories/task-repository.ts
- [ ] T053 [P] [US3] Create TaskModal component in src/components/Task/TaskModal.tsx with Modal wrapper
- [ ] T054 [P] [US3] Create TaskForm component in src/components/Task/TaskForm.tsx with title and description inputs
- [ ] T055 [P] [US3] Create DeleteConfirm component in src/components/Task/DeleteConfirm.tsx wrapping browser confirm()
- [ ] T056 [US3] Create useTasks hook in src/hooks/useTasks.ts with createTask, updateTask, deleteTask methods
- [ ] T057 [US3] Add "Add Task" button to Board.tsx that opens TaskModal in create mode
- [ ] T058 [US3] Add click handler to Card.tsx that opens TaskModal in edit mode
- [ ] T059 [US3] Add delete button with DeleteConfirm to TaskModal.tsx
- [ ] T060 [US3] Implement form validation (title 1-200 chars, description max 2000) in TaskForm.tsx
- [ ] T061 [US3] Add optimistic updates for create/delete operations in useTasks.ts
- [ ] T062 [US3] Auto-assign position as max(position) + 1 in TODO column for new tasks in task repository
- [ ] T063 [US3] Set created_at, updated_at timestamps on task creation in task repository
- [ ] T064 [US3] Cascade delete to task_labels, task_assignees, task_history on task deletion via SQL constraints

**Checkpoint**: User Story 3 complete - full CRUD operations for tasks working

---

## Phase 6: User Story 4 - Assign Tasks to Team Members (Priority: P2)

**Goal**: Enable task assignment to team members so work distribution is clear

**Independent Test**: Create task, assign to user, verify assignment visible and persisted

### Implementation for User Story 4

- [ ] T065 [P] [US4] Create GET /api/assignees API route in src/app/api/assignees/route.ts
- [ ] T066 [P] [US4] Add getAssigneesByTaskId() method to assignee repository in src/lib/repositories/assignee-repository.ts
- [ ] T067 [P] [US4] Add assignTaskToAssignees() method to task repository in src/lib/repositories/task-repository.ts
- [ ] T068 [P] [US4] Create AssigneeSelect component in src/components/Task/AssigneeSelect.tsx with multi-select dropdown
- [ ] T069 [P] [US4] Create AssigneeBadge component in src/components/Task/AssigneeBadge.tsx with name display
- [ ] T070 [US4] Add assigneeIds field to TaskForm.tsx with AssigneeSelect component
- [ ] T071 [US4] Update TaskCard component in Card.tsx to display AssigneeBadge for each assignee
- [ ] T072 [US4] Update PATCH /api/tasks/[id] to handle assigneeIds array and update task_assignees junction table
- [ ] T073 [US4] Update POST /api/tasks to handle assigneeIds array during task creation
- [ ] T074 [US4] Load assignees list in useBoard hook and pass to Board component
- [ ] T075 [US4] Replace assignees in task_assignees when updating (delete old, insert new) in task repository

**Checkpoint**: User Story 4 complete - task assignment working

---

## Phase 7: User Story 5 - Categorize Tasks with Labels (Priority: P2)

**Goal**: Enable label creation and application to tasks so users can categorize work beyond status

**Independent Test**: Create labels with colors, apply to tasks, verify they display correctly

### Implementation for User Story 5

- [ ] T076 [P] [US5] Create GET /api/labels API route in src/app/api/labels/route.ts
- [ ] T077 [P] [US5] Create POST /api/labels API route in src/app/api/labels/route.ts
- [ ] T078 [P] [US5] Add createLabel() method with duplicate name check to label repository in src/lib/repositories/label-repository.ts
- [ ] T079 [P] [US5] Add getLabelsByTaskId() method to label repository in src/lib/repositories/label-repository.ts
- [ ] T080 [P] [US5] Create ColorPalette component in src/components/Labels/ColorPalette.tsx with 18-color grid from LABEL_COLORS constant
- [ ] T081 [P] [US5] Create LabelSelect component in src/components/Labels/LabelSelect.tsx with multi-select and inline create
- [ ] T082 [P] [US5] Create LabelCreateForm component in src/components/Labels/LabelCreateForm.tsx with name input and ColorPalette
- [ ] T083 [US5] Add labelIds field to TaskForm.tsx with LabelSelect component
- [ ] T084 [US5] Update TaskCard component in Card.tsx to display multiple LabelBadge components
- [ ] T085 [US5] Update PATCH /api/tasks/[id] to handle labelIds array and update task_labels junction table
- [ ] T086 [US5] Update POST /api/tasks to handle labelIds array during task creation
- [ ] T087 [US5] Add inline label creation in LabelSelect - show LabelCreateForm modal when "Create New" clicked
- [ ] T088 [US5] Implement duplicate label name prevention in POST /api/labels using unique constraint
- [ ] T089 [US5] Load labels list in useBoard hook and pass to Board component
- [ ] T090 [US5] Replace labels in task_labels when updating (delete old, insert new) in task repository
- [ ] T091 [US5] Define LABEL_COLORS constant in src/types/index.ts with 18 hex colors from data-model.md

**Checkpoint**: User Story 5 complete - label creation and application working

---

## Phase 8: User Story 6 - Filter and Search Tasks (Priority: P2)

**Goal**: Enable search and filtering so users can quickly find relevant tasks without scanning entire board

**Independent Test**: Create tasks with different labels and assignees, apply filters, verify only matching tasks display

### Implementation for User Story 6

- [ ] T092 [P] [US6] Create SearchBar component in src/components/Filters/SearchBar.tsx with debounced input
- [ ] T093 [P] [US6] Create FilterPanel component in src/components/Filters/FilterPanel.tsx with label and assignee multi-select
- [ ] T094 [P] [US6] Create FilterChips component in src/components/Filters/FilterChips.tsx to display active filters with remove buttons
- [ ] T095 [US6] Create useFilters hook in src/hooks/useFilters.ts with search, labelIds, assigneeIds state
- [ ] T096 [US6] Add search query parameter support to GET /api/tasks route for title/description filtering
- [ ] T097 [US6] Add labelIds query parameter support to GET /api/tasks route for label filtering
- [ ] T098 [US6] Add assigneeIds query parameter support to GET /api/tasks route for assignee filtering
- [ ] T099 [US6] Update task repository getAllTasks() to support search and filter parameters with SQL WHERE clauses
- [ ] T100 [US6] Integrate SearchBar component into Board.tsx header
- [ ] T101 [US6] Integrate FilterPanel component into Board.tsx sidebar or header
- [ ] T102 [US6] Integrate FilterChips component into Board.tsx to show active filters
- [ ] T103 [US6] Connect useFilters hook to useBoard hook to pass filter parameters to API
- [ ] T104 [US6] Implement "Clear All Filters" button in FilterChips component
- [ ] T105 [US6] Add empty state message "No tasks match your search" in EmptyColumn when filters return no results
- [ ] T106 [US6] Maintain column organization when filtering (filtered tasks stay in their status columns)
- [ ] T107 [US6] Add debounce (300ms) to search input in SearchBar.tsx to prevent excessive API calls

**Checkpoint**: User Story 6 complete - search and filtering working efficiently

---

## Phase 9: User Story 7 - Track Task Time and Duration (Priority: P3)

**Goal**: Display time tracking information so team leads can identify bottlenecks and monitor efficiency

**Independent Test**: Create task, move through statuses, verify time tracking displays accurately

### Implementation for User Story 7

- [ ] T108 [P] [US7] Create TaskHistory repository in src/lib/repositories/task-history-repository.ts with getHistoryByTaskId() method
- [ ] T109 [P] [US7] Create GET /api/tasks/[id]/history API route in src/app/api/tasks/[id]/history/route.ts
- [ ] T110 [P] [US7] Verify SQLite trigger from data-model.md automatically creates TaskHistory entry when task status changes (trigger already defined in schema)
- [ ] T111 [P] [US7] Verify SQLite trigger from data-model.md automatically updates exitedAt and calculates duration when task leaves a status (trigger already defined in schema)
- [ ] T112 [P] [US7] Create TaskDuration component in src/components/Task/TaskDuration.tsx to display time in current status
- [ ] T113 [P] [US7] Create TaskHistoryView component in src/components/Task/TaskHistoryView.tsx to show status history table
- [ ] T114 [US7] Add TaskDuration component to TaskCard in Card.tsx showing "X days in Testing" format
- [ ] T115 [US7] Add TaskHistoryView component to TaskModal.tsx in a separate tab or section
- [ ] T116 [US7] Create formatDuration utility function in src/lib/utils.ts to convert seconds to human-readable format
- [ ] T117 [US7] Display created_at timestamp on task cards in Card.tsx
- [ ] T118 [US7] Calculate current status duration by subtracting status_changed_at from current time in TaskDuration.tsx
- [ ] T119 [US7] Add visual indicator (color coding) for tasks exceeding time thresholds in TaskDuration.tsx

**Checkpoint**: User Story 7 complete - time tracking and duration display working

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T120 [P] Add keyboard navigation support: Tab to navigate cards, Enter to open, Escape to close modal
- [ ] T121 [P] Add ARIA labels and roles for accessibility in Board.tsx, Card.tsx, Modal.tsx
- [ ] T122 [P] Ensure WCAG AA color contrast for all text and backgrounds in Tailwind config
- [ ] T123 [P] Add error boundaries in src/components/ErrorBoundary.tsx for graceful failure handling
- [ ] T124 [P] Implement loading skeletons for task cards in src/components/Board/CardSkeleton.tsx
- [ ] T125 [P] Add toast notifications for user actions (task created, updated, deleted) using a toast library
- [ ] T126 [P] Add mobile responsive layout with horizontal scroll for columns in Board.tsx using Tailwind breakpoints
- [ ] T127 [P] Add touch gesture support for drag-and-drop on mobile devices via @dnd-kit touch sensors
- [ ] T128 Add client-side caching strategy in useBoard.ts to reduce API calls
- [ ] T129 [P] Add API request logging in src/lib/api-client.ts for debugging
- [ ] T130 [P] Add version-based optimistic locking conflict detection in PATCH /api/tasks/[id]
- [ ] T131 [P] Implement auto-merge for non-conflicting concurrent changes in task update logic
- [ ] T132 [P] Add input sanitization for XSS prevention in TaskForm.tsx (React handles this by default, but add explicit validation)
- [ ] T133 [P] Add SQL injection prevention verification - ensure all queries use parameterized statements
- [ ] T134 [P] Create database seed script in scripts/db-seed.sql with sample tasks, labels, assignees
- [ ] T135 Update quickstart.md with actual npm scripts, environment variables, and setup steps
- [ ] T136 [P] Add performance optimization: virtualization for columns with 50+ tasks using react-window
- [ ] T137 [P] Add README.md at repository root with project overview and quickstart link
- [ ] T138 Run full workflow validation per quickstart.md: setup, create task, assign, label, move, delete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 board display but independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Extends US3 task forms but independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Extends US3 task forms but independently testable
- **User Story 6 (P2)**: Can start after US1, US4, US5 (needs board, assignees, labels to filter) - Enhances display
- **User Story 7 (P3)**: Can start after US2 (needs status changes for history) - Extends task display

### Within Each User Story

- Repository methods before API routes
- API routes before hooks
- Components can be built in parallel if they don't depend on each other
- Hooks integrate components and API
- Optimistic updates after basic functionality works
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T002-T009 can run in parallel (all marked [P])
- **Foundational Phase**: T011-T021 can run in parallel (all marked [P])
- **User Story 1**: T022-T024 (repositories), T026-T030 (components) can run in parallel
- **User Story 2**: T035-T039 (API + components) can run in parallel initially
- **User Story 3**: T049-T055 (API + components) can run in parallel initially
- **User Story 4**: T065-T069 (API + components) can run in parallel
- **User Story 5**: T076-T082 (API + components) can run in parallel
- **User Story 6**: T092-T094 (components), T096-T099 (API) can run in parallel
- **User Story 7**: T108-T113 (API + components) can run in parallel
- **Polish Phase**: T120-T134 can run in parallel (all marked [P] except T128, T135, T138)

### Critical Path (Minimum for MVP)

1. Phase 1: Setup (T001-T009) → ~2 hours
2. Phase 2: Foundational (T010-T021) → ~4 hours
3. Phase 3: User Story 1 (T022-T034) → ~6 hours
4. Phase 4: User Story 2 (T035-T048) → ~8 hours
5. Phase 5: User Story 3 (T049-T064) → ~6 hours
6. **MVP Complete** → Ready for demo/deployment

**Total MVP Estimate**: ~26 hours (Setup + Foundation + US1 + US2 + US3)

---

## Parallel Example: User Story 1

```bash
# Launch all repositories for User Story 1 together:
Task T022: "Create Task entity repository in src/lib/repositories/task-repository.ts"
Task T023: "Create Label entity repository in src/lib/repositories/label-repository.ts"
Task T024: "Create Assignee entity repository in src/lib/repositories/assignee-repository.ts"

# Launch all base components for User Story 1 together:
Task T026: "Create Board container component in src/components/Board/Board.tsx"
Task T027: "Create Column component in src/components/Board/Column.tsx"
Task T028: "Create TaskCard component in src/components/Board/Card.tsx"
Task T029: "Create EmptyColumn component in src/components/Board/EmptyColumn.tsx"
Task T030: "Create LabelBadge component in src/components/Labels/LabelBadge.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (~2 hours)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) (~4 hours)
3. Complete Phase 3: User Story 1 - View Board (~6 hours)
4. Complete Phase 4: User Story 2 - Drag & Drop (~8 hours)
5. Complete Phase 5: User Story 3 - CRUD Operations (~6 hours)
6. **STOP and VALIDATE**: Test all 3 user stories independently
7. Deploy/demo MVP - fully functional Kanban board

**MVP Delivers**: Core value proposition - view tasks, move between statuses, create/edit/delete tasks

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~6 hours)
2. Add User Story 1 → Test independently → Deploy/Demo (basic board display)
3. Add User Story 2 → Test independently → Deploy/Demo (drag-and-drop working)
4. Add User Story 3 → Test independently → Deploy/Demo (full CRUD - **MVP!**)
5. Add User Story 4 → Test independently → Deploy/Demo (team assignments)
6. Add User Story 5 → Test independently → Deploy/Demo (labels and categorization)
7. Add User Story 6 → Test independently → Deploy/Demo (search and filtering)
8. Add User Story 7 → Test independently → Deploy/Demo (time tracking analytics)
9. Add Polish Phase → Final production-ready release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~6 hours)
2. Once Foundational is done:
   - **Developer A**: User Story 1 + User Story 2 (board display and drag-drop)
   - **Developer B**: User Story 3 + User Story 4 (CRUD and assignments)
   - **Developer C**: User Story 5 + User Story 6 (labels and filtering)
3. User Story 7 and Polish can be split across team
4. Stories integrate naturally through shared data model

---

## Task Summary

- **Total Tasks**: 138
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 12 tasks (BLOCKING)
- **User Story 1 (P1)**: 13 tasks - View and organize board
- **User Story 2 (P1)**: 14 tasks - Drag and drop
- **User Story 3 (P1)**: 16 tasks - CRUD operations
- **User Story 4 (P2)**: 11 tasks - Assignments
- **User Story 5 (P2)**: 16 tasks - Labels
- **User Story 6 (P2)**: 16 tasks - Search and filtering
- **User Story 7 (P3)**: 12 tasks - Time tracking
- **Polish Phase**: 19 tasks - Cross-cutting concerns

**MVP Scope** (US1 + US2 + US3): 54 tasks
**Full Feature** (All user stories): 138 tasks

**Parallel Opportunities**: 76 tasks marked [P] can run in parallel with other tasks in same phase

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] indicates tasks that can run in parallel (different files, no dependencies)
- [Story] label (US1-US7) maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are OPTIONAL - excluded as not explicitly requested in spec
- File paths based on plan.md Next.js project structure
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = Setup + Foundational + US1 + US2 + US3 (54 tasks, ~26 hours)
