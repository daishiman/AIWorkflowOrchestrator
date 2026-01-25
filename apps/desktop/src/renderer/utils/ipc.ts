/**
 * IPC Utilities
 *
 * Common utilities for handling IPC calls with error handling.
 *
 * @module @repo/desktop/renderer/utils/ipc
 */

import type {
  ConversationIPCResponse,
  ConversationIPCSuccessResponse,
  ConversationIPCErrorResponse,
} from "../../shared/types/conversation";

/**
 * IPC Error class for handling IPC-specific errors
 */
export class IPCError extends Error {
  constructor(
    message: string,
    public readonly code: string = "UNKNOWN_ERROR",
  ) {
    super(message);
    this.name = "IPCError";
  }
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ConversationIPCResponse<T>,
): response is ConversationIPCSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse<T>(
  response: ConversationIPCResponse<T>,
): response is ConversationIPCErrorResponse {
  return response.success === false;
}

/**
 * Extract data from IPC response or throw error
 */
export function unwrapResponse<T>(
  response: ConversationIPCResponse<T>,
  defaultErrorMessage: string = "Operation failed",
): T {
  if (isSuccessResponse(response)) {
    return response.data;
  }
  throw new IPCError(
    response.error.message || defaultErrorMessage,
    response.error.code,
  );
}

/**
 * Safe IPC call wrapper with error handling
 */
export async function safeIPCCall<T>(
  operation: () => Promise<ConversationIPCResponse<T>>,
  defaultErrorMessage: string = "Operation failed",
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const response = await operation();
    if (isSuccessResponse(response)) {
      return { data: response.data, error: null };
    }
    return {
      data: null,
      error: new IPCError(
        response.error.message || defaultErrorMessage,
        response.error.code,
      ),
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}

/**
 * Create error from unknown catch value
 */
export function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(typeof err === "string" ? err : "Unknown error");
}
