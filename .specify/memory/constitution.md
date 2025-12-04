# Kanbanify Constitution

เว็บ Kanban สำหรับจัดการงานแบบง่าย มีสเตตัส 4 ขั้นตอน: To Do → In Progress → Testing → Done รองรับการลากวาง (drag & drop), เพิ่ม/แก้ไข/ลบการ์ด, ค้นหาและกรองตามป้าย (labels), มอบหมายผู้รับผิดชอบ และสถานะเวลาการดำเนินงาน

## Core Principles

### I. Library-First & Componentized

ทุกฟีเจอร์ต้องอยู่ในรูปแบบ component/utility ที่แยกทดสอบได้ (เช่น Board, Column, Card, Modal, API client).

### II. Type-First

ใช้ TypeScript ให้ครบทั้ง frontend types และ API contract types.

### III. Test-First

เขียน unit tests สำหรับ core logic (drag-drop, state transitions, persistence) ก่อนหรือพร้อมกับ implementation.

### IV. Simplicity & UX-first

UI ต้องตอบสนอง (responsive) ใช้งานง่ายบน desktop และ mobile.

### V. Observability

เหตุการณ์สำคัญ (card moved, card created, errors) ต้อง log ให้ debug ได้ (console dev + option สำหรับ server logs).

## Users & Roles

User (authenticated) — สร้าง/แก้ไข/ลบบอร์ด, คอลัมน์, การ์ด; มอบหมายการ์ด; เปลี่ยนสถานะ.(ในเวอร์ชันเริ่มต้นให้รองรับ role เดียว — ผู้ใช้ปกติ; เพิ่ม role admin/team later)

## Additional Contraints

### Non-functional requirements

- Responsive: Desktop และ mobile friendly.
- Accessibility: ปฏิบัติตามหลัก WCAG (keyboard navigation สำหรับ drag/drop fallback, aria attributes).
- Performance: โหลดหน้าแรก < 2s บนการเชื่อมต่อปานกลาง; pagination/virtualization หากการ์ดจำนวนมาก.
- Security: การยืนยันตัวตน (JWT หรือ session cookie), ป้องกัน XSS/CSRF.
- Persistency: ข้อมูลต้องอยู่ข้าม session (localStorage สำหรับ offline prototype; API + DB สำหรับ production).

### Tech stack (required)

- Frontend framework: Next.js (app/router ตาม preference) + React + TypeScript
- Styling/Components: Tailwind CSS
- State management: เลือกหนึ่ง — React Context + useReducer (ขนาดเล็ก) หรือ Zustand (ถ้าจำเป็น)
- Drag & drop: @dnd-kit หรือ react-beautiful-dnd (แนะนำ dnd-kit สำหรับ flexibility)
- API client: fetch (native) หรือ axios (optional) พร้อม typed API layers
- Tests: Jest + React Testing Library; E2E (optional) Playwright / Cypress
- Backend (optional prototype): Next.js API routes (or lightweight Node/Express) + simple JSON file / SQLite / supabase / Firebase (เลือกตาม infra)
- Persist store: PostgreSQL / SQLite / Supabase for production; localStorage for quick demo

### UI/UX specs

- Layout: Horizontal columns (4) across; each column shows column header, count badge, "Add Card" CTA. On narrow screens, columns stack horizontally scrollable or convert to vertical list.
- Card: title, small description snippet, labels, avatar(s) of assignees, drag handle, menu (edit/delete).
- Modals / Inline editor: Click card opens modal with full details and edit form.
- Drag & Drop: Smooth reordering and moving between columns; animate transitions.
- Filtering & Search: Top bar: search by title/description, filter by label, filter by assignee.
- Keyboard: Basic keyboard navigation (tab to card, Enter to open, arrow keys to move focus).
- Empty states: Guidance + CTA to create first card.

### Features (MVP)

- Create board (single default board for MVP)
- 4 Columns pre-defined: To Do, In Progress, Testing, Done
- Create / Edit / Delete Card (title required)
- Drag & drop reorder and move cards across columns
- Persist changes to backend or localStorage
- Search and filter by label / assignee
- Basic user presence (avatar) — optional for MVP
- Undo last move (toast with undo) — optional

### API contract (example endpoints)

(If using Next API routes)

- GET /api/board → returns board metadata + columns + cards
- POST /api/cards → create card (body: CardCreateDTO)
- PATCH /api/cards/:id → update card (move, edit)
- DELETE /api/cards/:id → delete card
- POST /api/cards/reorder → bulk reorder (payload: list of card ids with column & order)
  Payload examples should be fully typed in src/types/api.ts.

### Frontend architecture & file layout (suggested)

/src
/app (or /pages)
/board
page.tsx
BoardLayout.tsx
/components
/Board
Board.tsx
Column.tsx
Card.tsx
CardModal.tsx
/UI
Button.tsx
Input.tsx
Modal.tsx
/lib
api.ts
dnd.ts
/hooks
useBoard.ts
/types
index.ts
/styles
globals.css (tailwind)

### State management & synchronization

- Local state via React state/useReducer or Zustand for board; API sync occurs on actions (optimistic UI + rollback on error).
- For multi-user real-time presence (future): WebSockets / Supabase Realtime.

### Testing strategy

- Unit tests: components rendering, reducer logic (move card logic), api client mocks.
- Integration tests: drag & drop flows (simulate reordering), create/edit/delete.
- E2E: critical flows (create card → move → delete).
- Test coverage threshold: 70% for core modules (target).

### Accessibility

- All interactive elements keyboard-focusable.
- Drag & drop must provide keyboard alternative (move card via “move” menu with select target column).
- Aria labels for columns and cards; color contrast per WCAG AA.

### Performance & scaling notes

- Virtualize column lists if >200 cards/column (react-window).
- Debounce search/filter.
- Batch reorder API calls when many moves.

### Deployment

- Build: next build & next start (or Vercel deployment).
- Env vars: DATABASE_URL, NEXT_PUBLIC_API_BASE, JWT_SECRET (if used).
- CI: run linters, typecheck, unit tests; then build.

### Metrics & observability

Basic telemetry: counts of create/move/delete (anonymized) , error tracking: Sentry or equivalent (optional).

### Roadmap (Milestones)

1.MVP (2 weeks): Board with 4 columns, create/edit/delete cards, drag & drop, local persistence.
2.v1 (4–6 weeks): Backend persistence (Postgres/SQLite), auth, filters, search.
3.v2: Team features (assignments, comments, history), real-time syncing.
4.v3: Integrations (Slack, GitHub), advanced permissions.

### Acceptance criteria (example)

- User can create a card with title and see it in To Do.
- User can drag card from To Do → In Progress; order preserved.
- Changes persist after page reload (backend or localStorage).
- Tests cover move-card logic and create/edit flows.

## Governance

Follow the project's constitution template for principles: tests-first, library/component-first, and integration testing where contract changes occur. (Template referenced: Spec Kit uploaded).

**Version**: 1.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04

<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
