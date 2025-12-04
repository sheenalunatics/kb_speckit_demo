/**
 * TypeScript type definitions for Kanban Board API
 * Matches data-model.md entities and api-spec.yaml contracts
 */

// ========================================
// Database Entities
// ========================================

/**
 * Task entity representing a work item on the Kanban board
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  position: number;
  version: number;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  statusChangedAt: string; // ISO 8601 datetime
  labels: Label[];
  assignees: Assignee[];
}

/**
 * Label entity for categorizing tasks
 */
export interface Label {
  id: string;
  name: string;
  color: string; // Hex color code (e.g., "#EF4444")
  createdAt: string; // ISO 8601 datetime
}

/**
 * Assignee entity representing a team member
 */
export interface Assignee {
  id: string;
  name: string;
  email: string | null;
  createdAt: string; // ISO 8601 datetime
}

/**
 * TaskHistory entity for tracking time spent in each status
 */
export interface TaskHistory {
  id: string;
  taskId: string;
  status: Status;
  enteredAt: string; // ISO 8601 datetime
  exitedAt: string | null; // ISO 8601 datetime, null if still in this status
  duration: number | null; // Duration in seconds, null if still in this status
}

/**
 * Task status enum matching the four Kanban columns
 */
export enum Status {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  TESTING = "TESTING",
  DONE = "DONE",
}

// Alternative type for those who prefer string literals
export type StatusType = "TODO" | "IN_PROGRESS" | "TESTING" | "DONE";

// ========================================
// API Request DTOs
// ========================================

/**
 * Request body for creating a new task
 */
export interface TaskCreateRequest {
  title: string; // 1-200 characters
  description?: string; // Max 2000 characters
  labelIds?: string[]; // Array of label UUIDs
  assigneeIds?: string[]; // Array of assignee UUIDs
}

/**
 * Request body for updating an existing task
 */
export interface TaskUpdateRequest {
  title?: string; // 1-200 characters
  description?: string; // Max 2000 characters
  status?: Status;
  labelIds?: string[]; // Replace all labels
  assigneeIds?: string[]; // Replace all assignees
  version?: number; // For optimistic locking
}

/**
 * Request body for reordering/moving a task
 */
export interface TaskReorderRequest {
  taskId: string;
  targetColumn: Status;
  targetPosition: number; // 0-indexed position in target column
}

/**
 * Request body for creating a new label
 */
export interface LabelCreateRequest {
  name: string; // 1-50 characters
  color: string; // Hex color from predefined palette (e.g., "#3B82F6")
}

// ========================================
// API Response DTOs
// ========================================

/**
 * Response for GET /api/tasks
 */
export interface GetTasksResponse {
  tasks: Task[];
  labels: Label[];
  assignees: Assignee[];
}

/**
 * Response for POST /api/tasks
 */
export interface CreateTaskResponse {
  task: Task;
}

/**
 * Response for PATCH /api/tasks/:id
 */
export interface UpdateTaskResponse {
  task: Task;
}

/**
 * Response for DELETE /api/tasks/:id
 */
export interface DeleteTaskResponse {
  success: boolean;
}

/**
 * Response for POST /api/tasks/reorder
 */
export interface ReorderTaskResponse {
  success: boolean;
}

/**
 * Response for GET /api/tasks/:id/history
 */
export interface GetTaskHistoryResponse {
  history: TaskHistory[];
}

/**
 * Response for GET /api/labels
 */
export interface GetLabelsResponse {
  labels: Label[];
}

/**
 * Response for POST /api/labels
 */
export interface CreateLabelResponse {
  label: Label;
}

/**
 * Response for GET /api/assignees
 */
export interface GetAssigneesResponse {
  assignees: Assignee[];
}

// ========================================
// Error Response
// ========================================

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string; // Error type (e.g., "BadRequest", "NotFound", "Conflict")
  message: string; // Human-readable error message
  details?: Record<string, unknown>; // Optional additional error details
}

// ========================================
// Client-Side State Types
// ========================================

/**
 * Optimistic update metadata for conflict detection
 */
export interface OptimisticUpdate<T> {
  id: string;
  originalData: T;
  pendingData: T;
  timestamp: number;
}

/**
 * Kanban board state structure for React Context
 */
export interface BoardState {
  tasks: Task[];
  labels: Label[];
  assignees: Assignee[];
  loading: boolean;
  error: string | null;
  optimisticUpdates: Map<string, OptimisticUpdate<Task>>;
}

/**
 * Board action types for useReducer
 */
export type BoardAction =
  | { type: "LOAD_BOARD_START" }
  | { type: "LOAD_BOARD_SUCCESS"; payload: GetTasksResponse }
  | { type: "LOAD_BOARD_FAILURE"; payload: string }
  | { type: "CREATE_TASK_OPTIMISTIC"; payload: Task }
  | { type: "CREATE_TASK_SUCCESS"; payload: Task; optimisticId: string }
  | { type: "CREATE_TASK_FAILURE"; payload: string; optimisticId: string }
  | { type: "UPDATE_TASK_OPTIMISTIC"; payload: Task }
  | { type: "UPDATE_TASK_SUCCESS"; payload: Task }
  | { type: "UPDATE_TASK_FAILURE"; payload: string; taskId: string }
  | { type: "DELETE_TASK_OPTIMISTIC"; payload: string }
  | { type: "DELETE_TASK_SUCCESS"; payload: string }
  | { type: "DELETE_TASK_FAILURE"; payload: string; taskId: string }
  | {
      type: "REORDER_TASK_OPTIMISTIC";
      payload: { taskId: string; targetColumn: Status; targetPosition: number };
    }
  | { type: "REORDER_TASK_SUCCESS" }
  | { type: "REORDER_TASK_FAILURE"; payload: string }
  | { type: "CREATE_LABEL_SUCCESS"; payload: Label }
  | { type: "CLEAR_ERROR" };

// ========================================
// Utility Types
// ========================================

/**
 * Predefined color palette for labels
 */
export const LABEL_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#64748B", // Slate
] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];

/**
 * Query parameters for GET /api/tasks
 */
export interface TaskQueryParams {
  search?: string;
  labelIds?: string; // Comma-separated
  assigneeIds?: string; // Comma-separated
}

/**
 * Task without associations (for internal use)
 */
export type TaskBase = Omit<Task, "labels" | "assignees">;

/**
 * Partial task for form state
 */
export type TaskFormData = Pick<Task, "title" | "description"> & {
  labelIds: string[];
  assigneeIds: string[];
};

/**
 * Type guard for Status enum
 */
export function isStatus(value: string): value is Status {
  return Object.values(Status).includes(value as Status);
}

/**
 * Type guard for LabelColor
 */
export function isLabelColor(value: string): value is LabelColor {
  return LABEL_COLORS.includes(value as LabelColor);
}
