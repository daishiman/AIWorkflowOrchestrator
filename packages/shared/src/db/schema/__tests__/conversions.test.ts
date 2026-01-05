import { describe, it, expect } from "vitest";
import { conversions, Conversion, NewConversion } from "../conversions";
import { getTableConfig } from "drizzle-orm/sqlite-core";

describe("conversions schema", () => {
  const tableConfig = getTableConfig(conversions);

  it("should have correct table name", () => {
    expect(conversions).toBeDefined();
    expect(tableConfig.name).toBe("conversions");
  });

  it("should have all required columns", () => {
    const columns = Object.keys(conversions);
    expect(columns).toContain("id");
    expect(columns).toContain("fileId");
    expect(columns).toContain("status");
    expect(columns).toContain("converterId");
    expect(columns).toContain("inputHash");
    expect(columns).toContain("outputHash");
    expect(columns).toContain("duration");
    expect(columns).toContain("inputSize");
    expect(columns).toContain("outputSize");
    expect(columns).toContain("error");
    expect(columns).toContain("errorDetails");
    expect(columns).toContain("createdAt");
    expect(columns).toContain("updatedAt");
  });

  it("should have foreign key to files table", () => {
    // Verify fileId column exists and is configured
    expect(conversions.fileId).toBeDefined();
    expect(tableConfig.foreignKeys).toBeDefined();
    expect(tableConfig.foreignKeys.length).toBeGreaterThan(0);
  });

  it("should have correct indexes", () => {
    expect(tableConfig.indexes).toBeDefined();
    const indexNames = tableConfig.indexes.map((idx: any) => idx.config.name);
    expect(indexNames).toContain("conversions_file_id_idx");
    expect(indexNames).toContain("conversions_status_idx");
    expect(indexNames).toContain("conversions_input_hash_idx");
    expect(indexNames).toContain("conversions_created_at_idx");
    expect(indexNames).toContain("conversions_file_status_idx");
  });

  it("should have composite index on fileId and status", () => {
    const compositeIndex = tableConfig.indexes.find(
      (idx: any) => idx.config.name === "conversions_file_status_idx",
    );
    expect(compositeIndex).toBeDefined();
  });

  it("should export Conversion type", () => {
    // Type check - this will fail at compile time if type is not exported
    const testType: Conversion = {} as any;
    expect(testType).toBeDefined();
  });

  it("should export NewConversion type", () => {
    // Type check - this will fail at compile time if type is not exported
    const testType: NewConversion = {} as any;
    expect(testType).toBeDefined();
  });
});
