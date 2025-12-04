import { NextResponse } from "next/server";
import type { ErrorResponse } from "@/types";

/**
 * Standard error response builder
 */
export function errorResponse(
  error: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      message,
      details,
    },
    { status }
  );
}

/**
 * Bad Request (400) error
 */
export function badRequest(message: string, details?: Record<string, unknown>) {
  return errorResponse("BadRequest", message, 400, details);
}

/**
 * Not Found (404) error
 */
export function notFound(message: string) {
  return errorResponse("NotFound", message, 404);
}

/**
 * Conflict (409) error - for optimistic locking failures
 */
export function conflict(message: string) {
  return errorResponse("Conflict", message, 409);
}

/**
 * Internal Server Error (500)
 */
export function internalError(message: string, error?: unknown) {
  console.error("Internal error:", error);
  return errorResponse("InternalServerError", message, 500);
}

/**
 * Validation error helper
 */
export function validationError(field: string, message: string) {
  return badRequest("Validation failed", { [field]: message });
}

/**
 * Generic error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof Error) {
    return internalError(error.message, error);
  }
  return internalError("An unknown error occurred", error);
}
