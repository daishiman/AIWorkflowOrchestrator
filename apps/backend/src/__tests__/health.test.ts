import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, type HealthResponse } from "../app/api/health/route";
import { NextResponse } from "next/server";

// NextResponseのモック
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: ResponseInit) => ({
      data,
      status: init?.status || 200,
    })),
  },
}));

describe("Health API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return healthy status", async () => {
    await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "healthy",
        timestamp: "2025-01-01T00:00:00.000Z",
        version: expect.any(String),
        uptime: expect.any(Number),
      }),
      { status: 200 },
    );
  });

  it("should include version from environment variable", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_VERSION;
    process.env.NEXT_PUBLIC_API_VERSION = "2.0.0";

    await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        version: "2.0.0",
      }),
      { status: 200 },
    );

    process.env.NEXT_PUBLIC_API_VERSION = originalEnv;
  });

  it("should default version to 1.0.0 if not set", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_VERSION;
    delete process.env.NEXT_PUBLIC_API_VERSION;

    await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        version: "1.0.0",
      }),
      { status: 200 },
    );

    process.env.NEXT_PUBLIC_API_VERSION = originalEnv;
  });

  it("should return valid timestamp in ISO format", async () => {
    await GET();

    const callArgs = vi.mocked(NextResponse.json).mock
      .calls[0][0] as HealthResponse;
    expect(() => new Date(callArgs.timestamp)).not.toThrow();
    expect(callArgs.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    );
  });

  it("should return uptime as a number", async () => {
    await GET();

    const callArgs = vi.mocked(NextResponse.json).mock
      .calls[0][0] as HealthResponse;
    expect(typeof callArgs.uptime).toBe("number");
  });
});
