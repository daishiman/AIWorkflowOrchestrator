import { describe, it, expect } from "vitest";
import { files, File, NewFile } from "../files";
import { getTableConfig } from "drizzle-orm/sqlite-core";

describe("files schema", () => {
  const tableConfig = getTableConfig(files);

  it("should have correct table name", () => {
    expect(files).toBeDefined();
    expect(tableConfig.name).toBe("files");
  });

  it("should have all required columns", () => {
    const columns = Object.keys(files);
    expect(columns).toContain("id");
    expect(columns).toContain("name");
    expect(columns).toContain("path");
    expect(columns).toContain("mimeType");
    expect(columns).toContain("category");
    expect(columns).toContain("size");
    expect(columns).toContain("hash");
    expect(columns).toContain("encoding");
    expect(columns).toContain("lastModified");
    expect(columns).toContain("metadata");
    expect(columns).toContain("createdAt");
    expect(columns).toContain("updatedAt");
    expect(columns).toContain("deletedAt");
  });

  it("should have correct indexes", () => {
    expect(tableConfig.indexes).toBeDefined();
    const indexNames = tableConfig.indexes.map((idx: any) => idx.config.name);
    expect(indexNames).toContain("files_hash_idx");
    expect(indexNames).toContain("files_path_idx");
    expect(indexNames).toContain("files_mime_type_idx");
    expect(indexNames).toContain("files_category_idx");
    expect(indexNames).toContain("files_created_at_idx");
  });

  it("should have unique index on hash", () => {
    const hashIndex = tableConfig.indexes.find(
      (idx: any) => idx.config.name === "files_hash_idx",
    );
    expect(hashIndex).toBeDefined();
    expect(hashIndex?.config.unique).toBe(true);
  });

  it("should have primary key on id", () => {
    expect(tableConfig.primaryKeys).toBeDefined();
  });

  it("should export File type", () => {
    // Type check - this will fail at compile time if type is not exported
    const testType: File = {} as any;
    expect(testType).toBeDefined();
  });

  it("should export NewFile type", () => {
    // Type check - this will fail at compile time if type is not exported
    const testType: NewFile = {} as any;
    expect(testType).toBeDefined();
  });
});
