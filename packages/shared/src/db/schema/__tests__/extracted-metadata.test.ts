import { describe, it, expect } from "vitest";
import {
  extractedMetadata,
  ExtractedMetadata,
  NewExtractedMetadata,
} from "../extracted-metadata";
import { getTableConfig } from "drizzle-orm/sqlite-core";

describe("extractedMetadata schema", () => {
  const tableConfig = getTableConfig(extractedMetadata);

  it("should have correct table name", () => {
    expect(extractedMetadata).toBeDefined();
    expect(tableConfig.name).toBe("extracted_metadata");
  });

  it("should have all required columns", () => {
    const columns = Object.keys(extractedMetadata);
    expect(columns).toContain("id");
    expect(columns).toContain("conversionId");
    expect(columns).toContain("title");
    expect(columns).toContain("author");
    expect(columns).toContain("language");
    expect(columns).toContain("wordCount");
    expect(columns).toContain("lineCount");
    expect(columns).toContain("charCount");
    expect(columns).toContain("codeBlocks");
    expect(columns).toContain("headers");
    expect(columns).toContain("links");
    expect(columns).toContain("custom");
    expect(columns).toContain("createdAt");
    expect(columns).toContain("updatedAt");
  });

  it("should have foreign key to conversions table", () => {
    // Verify conversionId column exists and is configured
    expect(extractedMetadata.conversionId).toBeDefined();
    expect(tableConfig.foreignKeys).toBeDefined();
    expect(tableConfig.foreignKeys.length).toBeGreaterThan(0);
  });

  it("should have correct indexes", () => {
    expect(tableConfig.indexes).toBeDefined();
    const indexNames = tableConfig.indexes.map((idx: any) => idx.config.name);
    expect(indexNames).toContain("extracted_metadata_conversion_id_idx");
    expect(indexNames).toContain("extracted_metadata_language_idx");
  });

  it("should have unique index on conversionId", () => {
    const conversionIdIndex = tableConfig.indexes.find(
      (idx: any) => idx.config.name === "extracted_metadata_conversion_id_idx",
    );
    expect(conversionIdIndex).toBeDefined();
    expect(conversionIdIndex?.config.unique).toBe(true);
  });

  it("should export ExtractedMetadata type", () => {
    // Type check - this will fail at compile time if type is not exported
    const testType: ExtractedMetadata = {} as any;
    expect(testType).toBeDefined();
  });

  it("should export NewExtractedMetadata type", () => {
    // Type check - this will fail at compile time if type is not exported
    const testType: NewExtractedMetadata = {} as any;
    expect(testType).toBeDefined();
  });
});
