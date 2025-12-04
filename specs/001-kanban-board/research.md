# Research & Technology Decisions

**Feature**: Simple Kanban Task Management Board  
**Phase**: 0 - Research & Unknowns Resolution  
**Date**: December 4, 2025

## Overview

This document resolves all technical uncertainties identified in the planning phase and documents technology choices with rationale.

---

## 1. Drag-and-Drop Library Selection

### Decision: @dnd-kit

**Rationale:**

- **Next.js 14 App Router Compatible**: Fully client-side, works seamlessly with 'use client' directive
- **Accessibility Built-in**: Keyboard navigation, screen reader support, ARIA attributes out of the box
- **Touch Device Support**: Native touch event handling for mobile/tablet
- **Performance**: Virtual DOM-friendly, minimal re-renders, handles 100+ items efficiently
- **Modular**: Can use only needed features (sortable, droppable) reducing bundle size
- **Active Maintenance**: Regular updates, strong TypeScript support

**Alternatives Considered:**

- **react-beautiful-dnd**: Deprecated, no longer maintained, poor Next.js 14 support
- **react-dnd**: More complex API, requires HTML5 backend configuration, heavier bundle

**Implementation Notes:**

- Use `@dnd-kit/core` for base drag-drop functionality
- Use `@dnd-kit/sortable` for within-column reordering
- Use `@dnd-kit/utilities` for CSS transform utilities
- Implement custom sensors for touch and keyboard accessibility

**References:**

- Documentation: https://docs.dndkit.com/
- Next.js integration: Works with Server Components by wrapping in client components

---

## 2. SQLite Integration Best Practices

### Decision: better-sqlite3

**Rationale:**

- **Synchronous API**: Simpler error handling in Next.js API routes (no async/await complexity for simple queries)
- **Performance**: Fastest SQLite library for Node.js (native C++ bindings)
- **Next.js Compatible**: Works in API routes with proper configuration
- **Type Safety**: Can be wrapped with type-safe query builders
- **Zero Configuration**: No server setup, file-based database
- **Development Friendly**: Single file database easy to reset/backup

**Migration Strategy**: Raw SQL migrations

- Keep migrations in `/migrations` folder as numbered SQL files
- Simple init script runs migrations in order
- No ORM overhead for this simple schema
- Direct SQL gives full control over indexes and constraints

**Connection Management:**

- Single connection instance per API route (serverless-friendly)
- Connection pooling not needed for SQLite
- Close connection after each request in API routes

**Alternatives Considered:**

- **Prisma**: Too heavy for simple schema, adds build complexity, ORM overhead unnecessary
- **node-sqlite3**: Async-only API, more complex error handling, slower than better-sqlite3
- **PostgreSQL**: Overkill for MVP, requires separate server, deployment complexity

**Implementation Notes:**

```typescript
// lib/db.ts
import Database from "better-sqlite3";

const db = new Database("data/kanban.db");
db.pragma("journal_mode = WAL"); // Write-Ahead Logging for better concurrency

export default db;
```

**References:**

- Documentation: https://github.com/WiseLibs/better-sqlite3
- Migration pattern: Simple sequential numbered files

---

## 3. Real-time Optimistic Updates Pattern

### Decision: Optimistic UI with Conflict Detection

**Pattern:**

1. **Optimistic Update**: Immediately update client state before API call
2. **API Request**: Send change to server in background
3. **Conflict Detection**: Server checks if resource was modified by another user
4. **Auto-Merge**: Non-conflicting changes (different tasks) merge automatically
5. **Rollback**: On error or conflict, revert client state and show notification

**Implementation Strategy:**

```typescript
// hooks/useTasks.ts
const updateTask = async (taskId: string, updates: Partial<Task>) => {
  // 1. Optimistic update
  const previousState = tasks.find((t) => t.id === taskId);
  setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));

  try {
    // 2. API request
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ ...updates, version: previousState.version }),
    });

    if (response.status === 409) {
      // 3. Conflict detected
      throw new ConflictError("Task was modified by another user");
    }

    const updated = await response.json();

    // 4. Update with server response (includes new version)
    setTasks(tasks.map((t) => (t.id === taskId ? updated.task : t)));
  } catch (error) {
    // 5. Rollback on error
    setTasks(tasks.map((t) => (t.id === taskId ? previousState : t)));
    showNotification("Update failed: " + error.message);
  }
};
```

**Conflict Detection Mechanism:**

- Add `version` field to Task entity (timestamp or incrementing number)
- Client sends current version with update
- Server compares received version with current version
- If versions mismatch → 409 Conflict response
- For same-task edits: prompt user to refresh
- For different-task edits: auto-merge (no conflict)

**Rationale:**

- Provides instant feedback (perceived performance)
- Handles network latency gracefully
- Prevents data loss from concurrent edits
- Simple implementation without WebSockets

**Alternatives Considered:**

- **WebSockets**: Too complex for MVP, requires server infrastructure
- **Polling**: Wasteful, poor user experience, delays conflicts
- **Last-Write-Wins**: Data loss risk, poor multi-user experience

---

## 4. State Management Approach

### Decision: React Context + useReducer (Not Zustand)

**Rationale:**

- **Simplicity**: No external dependencies, built-in to React
- **Sufficient for Scope**: Single board state, straightforward data flow - Zustand adds unnecessary complexity for this use case
- **Bundle Size**: Zero additional dependencies vs ~3KB for Zustand (negligible but unnecessary)
- **Server State Sync**: Easy to integrate with fetch/API calls
- **Debuggable**: React DevTools support out of the box
- **Colocation**: State logic near components that use it
- **MVP-Appropriate**: For single-board scope, Context is perfectly adequate
- **Future Migration Path**: Can upgrade to Zustand later if multi-board support or global state complexity increases

**Why Not Zustand for This Project:**

While Zustand is excellent for complex state management, this Kanban board:

- Has single board scope (no cross-feature state sharing)
- Primarily deals with server state (tasks/labels/assignees from API)
- Uses simple CRUD operations without complex state transitions
- Benefits from React's built-in solution for this scale

**State Structure:**

```typescript
interface BoardState {
  tasks: Task[];
  labels: Label[];
  assignees: Assignee[];
  filters: {
    search: string;
    labelIds: string[];
    assigneeIds: string[];
  };
  loading: boolean;
  error: string | null;
}
```

**Caching Strategy:**

- React Query pattern: Cache API responses in context
- Stale-while-revalidate: Show cached data, fetch fresh in background
- Invalidate on mutations: Clear cache after create/update/delete
- No persistent cache (no localStorage): Always fetch fresh on mount

**When to Consider Zustand:**

- If state grows beyond single board
- If cross-component subscriptions become complex
- If debugging context re-renders becomes issue
- Migration path is straightforward if needed

**Alternatives Considered:**

- **Zustand**: Adds dependency, overkill for current scope
- **Redux**: Way too heavy, unnecessary boilerplate
- **Recoil/Jotai**: Additional concepts, learning curve

**Implementation Notes:**

```typescript
// store/board-context.tsx
const BoardContext = createContext<BoardState>(initialState);

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
```

---

## 5. Responsive Drag-and-Drop UX

### Decision: Horizontal Scroll on Mobile + Touch Gestures

**Layout Strategy:**

**Desktop (≥1024px):**

- 4 columns side-by-side, full width
- Each column min-width: 250px, max-width: 400px
- Flex-grow to fill available space
- Vertical scrolling within columns

**Tablet (768px - 1023px):**

- Horizontal scroll container
- Columns maintain min-width: 250px
- Snap scrolling to columns
- Touch drag-and-drop enabled

**Mobile (<768px):**

- Horizontal scroll with snap points
- Single column visible at a time
- Swipe to see next column
- Touch drag-and-drop with visual feedback
- Optional: Compact card view

**Touch Gesture Implementation:**

- Long press to initiate drag (300ms delay)
- Visual feedback: card elevation, shadow, slight scale
- Drop zones highlighted during drag
- Haptic feedback on drop (if supported)

**Keyboard Navigation:**

- Tab: Move between cards
- Enter: Open card details
- Space: Select card for move
- Arrow keys: Navigate move target
- Enter again: Confirm move
- Escape: Cancel move

**Rationale:**

- Horizontal scroll familiar pattern (iOS, Android app trays)
- Maintains column structure on small screens
- No layout shift between breakpoints
- Touch gestures feel native
- Keyboard alternative for accessibility

**Alternatives Considered:**

- **Vertical Stack**: Loses visual board metaphor, harder to see workflow
- **Accordion Columns**: Complex interaction, poor UX
- **Separate Mobile View**: Duplicates code, maintenance burden

**Implementation Notes:**

```css
/* Tailwind classes */
.board-container {
  @apply flex overflow-x-auto snap-x snap-mandatory;
  @apply lg:overflow-x-visible lg:snap-none;
}

.column {
  @apply flex-shrink-0 w-[85vw] snap-center;
  @apply md:w-[45vw] lg:w-auto lg:min-w-[250px] lg:max-w-[400px] lg:flex-1;
}
```

**References:**

- @dnd-kit touch sensors: https://docs.dndkit.com/api-documentation/sensors/touch
- @dnd-kit keyboard sensors: https://docs.dndkit.com/api-documentation/sensors/keyboard

---

## Summary of Technology Stack

| Category               | Choice                     | Rationale                                              |
| ---------------------- | -------------------------- | ------------------------------------------------------ |
| **Frontend Framework** | Next.js 14 (App Router)    | Modern React, built-in API routes, SSR/SSG, optimal DX |
| **UI Library**         | React 18                   | Component model, ecosystem, team familiarity           |
| **Language**           | TypeScript 5               | Type safety, IDE support, maintainability              |
| **Styling**            | Tailwind CSS 3             | Rapid development, consistent design, mobile-first     |
| **Drag-and-Drop**      | @dnd-kit                   | Accessible, performant, TypeScript support             |
| **Database**           | SQLite (better-sqlite3)    | Simple, fast, zero-config, perfect for MVP             |
| **State Management**   | Context + useReducer       | Built-in, sufficient scope, no dependencies            |
| **API Pattern**        | REST (Next.js API routes)  | Simple, stateless, easy testing                        |
| **Testing**            | Jest + RTL + Playwright    | Standard React testing, E2E coverage                   |
| **Type Safety**        | End-to-end (DB → API → UI) | All layers typed, compile-time safety                  |

---

## Open Questions & Future Considerations

**Resolved in this research:**

- ✅ How to handle drag-and-drop on mobile
- ✅ SQLite vs PostgreSQL for MVP
- ✅ State management complexity
- ✅ Real-time updates without WebSockets
- ✅ Accessibility for drag-and-drop

**Deferred to future iterations:**

- Authentication (JWT vs session-based) - Not needed for MVP
- Multi-board support - Out of scope for v1
- Real-time collaboration (WebSockets) - Optimistic updates sufficient for MVP
- Data export/import - Not in current requirements
- Deployment strategy (Vercel vs Docker) - Decided during deployment phase

---

## Next Steps

1. ✅ All unknowns resolved
2. → Proceed to **Phase 1**: Create data-model.md, API contracts, quickstart.md
3. → Generate tasks.md with `/speckit.tasks`
4. → Begin implementation

**Research Complete**: December 4, 2025
