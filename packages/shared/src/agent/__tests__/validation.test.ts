/**
 * Agent SDK Validation Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for Zod schema validation of Agent SDK requests
 */

import { describe, it, expect } from "vitest";
import {
  queryOptionsSchema,
  queryRequestSchema,
  resumeSessionRequestSchema,
  destroySessionRequestSchema,
} from "../validation";

describe("queryOptionsSchema", () => {
  describe("timeout validation", () => {
    it("should accept valid timeout within range (1000-300000ms)", () => {
      const result = queryOptionsSchema.safeParse({ timeout: 30000 });
      expect(result.success).toBe(true);
    });

    it("should reject timeout below minimum (999ms)", () => {
      const result = queryOptionsSchema.safeParse({ timeout: 999 });
      expect(result.success).toBe(false);
    });

    it("should accept minimum timeout (1000ms)", () => {
      const result = queryOptionsSchema.safeParse({ timeout: 1000 });
      expect(result.success).toBe(true);
    });

    it("should accept maximum timeout (300000ms)", () => {
      const result = queryOptionsSchema.safeParse({ timeout: 300000 });
      expect(result.success).toBe(true);
    });

    it("should reject timeout above maximum (300001ms)", () => {
      const result = queryOptionsSchema.safeParse({ timeout: 300001 });
      expect(result.success).toBe(false);
    });

    it("should accept undefined timeout (optional)", () => {
      const result = queryOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("sessionId validation", () => {
    it("should accept valid UUID v4 sessionId", () => {
      const result = queryOptionsSchema.safeParse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID format", () => {
      const result = queryOptionsSchema.safeParse({
        sessionId: "invalid-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty string sessionId", () => {
      const result = queryOptionsSchema.safeParse({ sessionId: "" });
      expect(result.success).toBe(false);
    });

    it("should accept undefined sessionId (optional)", () => {
      const result = queryOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("systemPrompt validation", () => {
    it("should accept valid systemPrompt", () => {
      const result = queryOptionsSchema.safeParse({
        systemPrompt: "You are a helpful assistant.",
      });
      expect(result.success).toBe(true);
    });

    it("should accept systemPrompt at maximum length (5000 chars)", () => {
      const result = queryOptionsSchema.safeParse({
        systemPrompt: "a".repeat(5000),
      });
      expect(result.success).toBe(true);
    });

    it("should reject systemPrompt exceeding maximum length (5001 chars)", () => {
      const result = queryOptionsSchema.safeParse({
        systemPrompt: "a".repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it("should accept undefined systemPrompt (optional)", () => {
      const result = queryOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("strict mode", () => {
    it("should reject extra fields not in schema", () => {
      const result = queryOptionsSchema.safeParse({
        timeout: 30000,
        unknownField: "value",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("queryRequestSchema", () => {
  describe("prompt validation", () => {
    it("should accept valid prompt", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "Hello, Claude!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty prompt", () => {
      const result = queryRequestSchema.safeParse({ prompt: "" });
      expect(result.success).toBe(false);
    });

    it("should accept minimum length prompt (1 char)", () => {
      const result = queryRequestSchema.safeParse({ prompt: "a" });
      expect(result.success).toBe(true);
    });

    it("should accept maximum length prompt (10000 chars)", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "a".repeat(10000),
      });
      expect(result.success).toBe(true);
    });

    it("should reject prompt exceeding maximum length (10001 chars)", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "a".repeat(10001),
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing prompt", () => {
      const result = queryRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("options validation", () => {
    it("should accept valid prompt with options", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "Hello",
        options: {
          timeout: 60000,
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should accept prompt without options", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "Hello",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid options", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "Hello",
        options: {
          timeout: -1,
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("strict mode", () => {
    it("should reject extra fields at root level", () => {
      const result = queryRequestSchema.safeParse({
        prompt: "Hello",
        extraField: "value",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("resumeSessionRequestSchema", () => {
  it("should accept valid UUID sessionId", () => {
    const result = resumeSessionRequestSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID format", () => {
    const result = resumeSessionRequestSchema.safeParse({
      sessionId: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing sessionId", () => {
    const result = resumeSessionRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty sessionId", () => {
    const result = resumeSessionRequestSchema.safeParse({ sessionId: "" });
    expect(result.success).toBe(false);
  });

  it("should reject extra fields", () => {
    const result = resumeSessionRequestSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      extraField: "value",
    });
    expect(result.success).toBe(false);
  });
});

describe("destroySessionRequestSchema", () => {
  it("should accept valid UUID sessionId", () => {
    const result = destroySessionRequestSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID format", () => {
    const result = destroySessionRequestSchema.safeParse({
      sessionId: "invalid-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing sessionId", () => {
    const result = destroySessionRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject empty sessionId", () => {
    const result = destroySessionRequestSchema.safeParse({ sessionId: "" });
    expect(result.success).toBe(false);
  });

  it("should reject extra fields", () => {
    const result = destroySessionRequestSchema.safeParse({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      extraField: "value",
    });
    expect(result.success).toBe(false);
  });
});
