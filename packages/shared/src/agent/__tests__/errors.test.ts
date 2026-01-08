/**
 * Agent SDK Error Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for error class hierarchy and serialization
 */

import { describe, it, expect } from "vitest";
import {
  AgentErrorCode,
  AgentError,
  AgentInitializationError,
  AgentQueryError,
  AgentTimeoutError,
  AgentAbortedError,
  AgentSessionError,
  AgentValidationError,
  deserializeAgentError,
  type SerializedAgentError,
} from "../errors";

describe("AgentErrorCode", () => {
  it("should have INITIALIZATION_FAILED code", () => {
    expect(AgentErrorCode.INITIALIZATION_FAILED).toBe("AGENT_INIT_FAILED");
  });

  it("should have NOT_INITIALIZED code", () => {
    expect(AgentErrorCode.NOT_INITIALIZED).toBe("AGENT_NOT_INITIALIZED");
  });

  it("should have QUERY_FAILED code", () => {
    expect(AgentErrorCode.QUERY_FAILED).toBe("AGENT_QUERY_FAILED");
  });

  it("should have TIMEOUT code", () => {
    expect(AgentErrorCode.TIMEOUT).toBe("AGENT_TIMEOUT");
  });

  it("should have ABORTED code", () => {
    expect(AgentErrorCode.ABORTED).toBe("AGENT_ABORTED");
  });

  it("should have SESSION_NOT_FOUND code", () => {
    expect(AgentErrorCode.SESSION_NOT_FOUND).toBe("AGENT_SESSION_NOT_FOUND");
  });

  it("should have SESSION_ERROR code", () => {
    expect(AgentErrorCode.SESSION_ERROR).toBe("AGENT_SESSION_ERROR");
  });

  it("should have VALIDATION_ERROR code", () => {
    expect(AgentErrorCode.VALIDATION_ERROR).toBe("AGENT_VALIDATION_ERROR");
  });
});

describe("AgentError", () => {
  it("should create error with correct code and message", () => {
    const error = new AgentError(
      AgentErrorCode.QUERY_FAILED,
      "Query execution failed",
    );
    expect(error.code).toBe(AgentErrorCode.QUERY_FAILED);
    expect(error.message).toBe("Query execution failed");
    expect(error.name).toBe("AgentError");
  });

  it("should extend Error class", () => {
    const error = new AgentError(
      AgentErrorCode.QUERY_FAILED,
      "Query execution failed",
    );
    expect(error).toBeInstanceOf(Error);
  });

  it("should preserve cause if provided", () => {
    const cause = new Error("Original error");
    const error = new AgentError(
      AgentErrorCode.QUERY_FAILED,
      "Query execution failed",
      cause,
    );
    expect(error.cause).toBe(cause);
  });

  it("should serialize to JSON correctly", () => {
    const error = new AgentError(
      AgentErrorCode.QUERY_FAILED,
      "Query execution failed",
    );
    const json = error.toJSON();
    expect(json.name).toBe("AgentError");
    expect(json.code).toBe(AgentErrorCode.QUERY_FAILED);
    expect(json.message).toBe("Query execution failed");
    expect(json.stack).toBeDefined();
  });
});

describe("AgentInitializationError", () => {
  it("should create error with INITIALIZATION_FAILED code", () => {
    const error = new AgentInitializationError("SDK initialization failed");
    expect(error.code).toBe(AgentErrorCode.INITIALIZATION_FAILED);
    expect(error.name).toBe("AgentInitializationError");
  });

  it("should extend AgentError", () => {
    const error = new AgentInitializationError("SDK initialization failed");
    expect(error).toBeInstanceOf(AgentError);
  });

  it("should preserve cause", () => {
    const cause = new Error("API key invalid");
    const error = new AgentInitializationError(
      "SDK initialization failed",
      cause,
    );
    expect(error.cause).toBe(cause);
  });
});

describe("AgentQueryError", () => {
  it("should create error with QUERY_FAILED code", () => {
    const error = new AgentQueryError("Query failed");
    expect(error.code).toBe(AgentErrorCode.QUERY_FAILED);
    expect(error.name).toBe("AgentQueryError");
  });

  it("should extend AgentError", () => {
    const error = new AgentQueryError("Query failed");
    expect(error).toBeInstanceOf(AgentError);
  });
});

describe("AgentTimeoutError", () => {
  it("should create error with TIMEOUT code", () => {
    const error = new AgentTimeoutError();
    expect(error.code).toBe(AgentErrorCode.TIMEOUT);
    expect(error.name).toBe("AgentTimeoutError");
  });

  it("should have default message", () => {
    const error = new AgentTimeoutError();
    expect(error.message).toBe("Query timed out");
  });

  it("should accept custom message", () => {
    const error = new AgentTimeoutError("Operation timed out after 30s");
    expect(error.message).toBe("Operation timed out after 30s");
  });

  it("should extend AgentError", () => {
    const error = new AgentTimeoutError();
    expect(error).toBeInstanceOf(AgentError);
  });
});

describe("AgentAbortedError", () => {
  it("should create error with ABORTED code", () => {
    const error = new AgentAbortedError();
    expect(error.code).toBe(AgentErrorCode.ABORTED);
    expect(error.name).toBe("AgentAbortedError");
  });

  it("should have default message", () => {
    const error = new AgentAbortedError();
    expect(error.message).toBe("Query was aborted");
  });

  it("should accept custom message", () => {
    const error = new AgentAbortedError("User cancelled the operation");
    expect(error.message).toBe("User cancelled the operation");
  });

  it("should extend AgentError", () => {
    const error = new AgentAbortedError();
    expect(error).toBeInstanceOf(AgentError);
  });
});

describe("AgentSessionError", () => {
  it("should create error with SESSION_ERROR code by default", () => {
    const error = new AgentSessionError("Session error");
    expect(error.code).toBe(AgentErrorCode.SESSION_ERROR);
    expect(error.name).toBe("AgentSessionError");
  });

  it("should accept SESSION_NOT_FOUND code", () => {
    const error = new AgentSessionError(
      "Session not found",
      AgentErrorCode.SESSION_NOT_FOUND,
    );
    expect(error.code).toBe(AgentErrorCode.SESSION_NOT_FOUND);
  });

  it("should extend AgentError", () => {
    const error = new AgentSessionError("Session error");
    expect(error).toBeInstanceOf(AgentError);
  });
});

describe("AgentValidationError", () => {
  it("should create error with VALIDATION_ERROR code", () => {
    const error = new AgentValidationError("Validation failed");
    expect(error.code).toBe(AgentErrorCode.VALIDATION_ERROR);
    expect(error.name).toBe("AgentValidationError");
  });

  it("should store validation details", () => {
    const details = { field: "prompt", error: "too short" };
    const error = new AgentValidationError("Validation failed", details);
    expect(error.details).toEqual(details);
  });

  it("should extend AgentError", () => {
    const error = new AgentValidationError("Validation failed");
    expect(error).toBeInstanceOf(AgentError);
  });
});

describe("deserializeAgentError", () => {
  it("should deserialize AgentInitializationError", () => {
    const serialized: SerializedAgentError = {
      name: "AgentInitializationError",
      code: AgentErrorCode.INITIALIZATION_FAILED,
      message: "SDK init failed",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentInitializationError);
    expect(error.message).toBe("SDK init failed");
  });

  it("should deserialize AgentQueryError", () => {
    const serialized: SerializedAgentError = {
      name: "AgentQueryError",
      code: AgentErrorCode.QUERY_FAILED,
      message: "Query failed",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentQueryError);
    expect(error.message).toBe("Query failed");
  });

  it("should deserialize AgentTimeoutError", () => {
    const serialized: SerializedAgentError = {
      name: "AgentTimeoutError",
      code: AgentErrorCode.TIMEOUT,
      message: "Query timed out",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentTimeoutError);
    expect(error.message).toBe("Query timed out");
  });

  it("should deserialize AgentAbortedError", () => {
    const serialized: SerializedAgentError = {
      name: "AgentAbortedError",
      code: AgentErrorCode.ABORTED,
      message: "Query was aborted",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentAbortedError);
    expect(error.message).toBe("Query was aborted");
  });

  it("should deserialize AgentSessionError with SESSION_NOT_FOUND", () => {
    const serialized: SerializedAgentError = {
      name: "AgentSessionError",
      code: AgentErrorCode.SESSION_NOT_FOUND,
      message: "Session not found",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentSessionError);
    expect(error.code).toBe(AgentErrorCode.SESSION_NOT_FOUND);
  });

  it("should deserialize AgentSessionError with SESSION_ERROR", () => {
    const serialized: SerializedAgentError = {
      name: "AgentSessionError",
      code: AgentErrorCode.SESSION_ERROR,
      message: "Session error",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentSessionError);
    expect(error.code).toBe(AgentErrorCode.SESSION_ERROR);
  });

  it("should deserialize AgentValidationError", () => {
    const serialized: SerializedAgentError = {
      name: "AgentValidationError",
      code: AgentErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentValidationError);
    expect(error.message).toBe("Validation failed");
  });

  it("should fallback to base AgentError for unknown codes", () => {
    const serialized: SerializedAgentError = {
      name: "AgentError",
      code: AgentErrorCode.NOT_INITIALIZED,
      message: "Unknown error",
    };
    const error = deserializeAgentError(serialized);
    expect(error).toBeInstanceOf(AgentError);
    expect(error.code).toBe(AgentErrorCode.NOT_INITIALIZED);
  });
});
