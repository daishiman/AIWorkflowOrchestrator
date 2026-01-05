import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import {
  coalesce,
  jsonArrayLength,
  currentTimestamp,
  paginate,
  batchProcess,
  uuid,
} from "../utils";

describe("coalesce", () => {
  it("should create SQL COALESCE expression", () => {
    const result = coalesce(sql`column1`, sql`column2`, sql`'default'`);
    expect(result).toBeDefined();
  });

  it("should throw error when no arguments provided", () => {
    expect(() => coalesce()).toThrow("coalesce requires at least one argument");
  });
});

describe("jsonArrayLength", () => {
  it("should generate SQL for json_array_length function", () => {
    const column = sql`data`;
    const result = jsonArrayLength(column);
    expect(result).toBeDefined();
  });
});

describe("currentTimestamp", () => {
  it("should return ISO 8601 format timestamp", () => {
    const timestamp = currentTimestamp();
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(timestamp).toMatch(iso8601Regex);
  });

  it("should return UTC time", () => {
    const timestamp = currentTimestamp();
    expect(timestamp.endsWith("Z")).toBe(true);
  });

  it("should be parseable as Date", () => {
    const timestamp = currentTimestamp();
    const date = new Date(timestamp);
    expect(date.getTime()).not.toBeNaN();
  });
});

describe("paginate", () => {
  it("should calculate offset and limit for first page", () => {
    const result = paginate(1, 10);
    expect(result).toEqual({ offset: 0, limit: 10 });
  });

  it("should calculate offset for second page", () => {
    const result = paginate(2, 10);
    expect(result).toEqual({ offset: 10, limit: 10 });
  });

  it("should handle large page numbers", () => {
    const result = paginate(100, 20);
    expect(result).toEqual({ offset: 1980, limit: 20 });
  });

  it("should throw error when page is less than 1", () => {
    expect(() => paginate(0, 10)).toThrow("Page number must be >= 1");
  });

  it("should throw error when pageSize is less than 1", () => {
    expect(() => paginate(1, 0)).toThrow("Page size must be >= 1");
  });
});

describe("batchProcess", () => {
  it("should split array into chunks of specified size", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const batches = batchProcess(items, 3);
    expect(batches).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it("should use default batch size of 1000", () => {
    const items = Array.from({ length: 2500 }, (_, i) => i);
    const batches = batchProcess(items);
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(1000);
    expect(batches[1]).toHaveLength(1000);
    expect(batches[2]).toHaveLength(500);
  });

  it("should handle empty array", () => {
    const batches = batchProcess([], 10);
    expect(batches).toEqual([]);
  });

  it("should throw error when batch size is less than 1", () => {
    expect(() => batchProcess([1, 2, 3], 0)).toThrow("Batch size must be >= 1");
  });
});

describe("uuid", () => {
  it("should generate RFC4122 v4 UUID format", () => {
    const id = uuid();
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidV4Regex);
  });

  it("should generate unique IDs", () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(uuid());
    }
    expect(ids.size).toBe(100);
  });

  it("should have correct version number (4)", () => {
    const id = uuid();
    expect(id.charAt(14)).toBe("4");
  });

  it("should generate 36 character string", () => {
    const id = uuid();
    expect(id).toHaveLength(36);
  });
});
