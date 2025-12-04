import type { ErrorResponse } from "@/types";

/**
 * API client error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public error: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Type-safe fetch wrapper
 */
export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    throw new ApiError(
      response.status,
      errorData.error,
      errorData.message,
      errorData.details
    );
  }

  return response.json();
}

/**
 * GET request
 */
export function get<T>(url: string): Promise<T> {
  return apiClient<T>(url, { method: "GET" });
}

/**
 * POST request
 */
export function post<T>(url: string, data: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export function patch<T>(url: string, data: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function del<T>(url: string): Promise<T> {
  return apiClient<T>(url, { method: "DELETE" });
}
