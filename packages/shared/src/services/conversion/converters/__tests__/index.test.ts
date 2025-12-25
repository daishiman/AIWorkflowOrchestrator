/**
 * @file コンバーター登録のテスト
 * @module @repo/shared/services/conversion/converters/__tests__/index.test
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  registerDefaultConverters,
  resetRegistrationState,
  isConvertersRegistered,
  HTMLConverter,
  CSVConverter,
  JSONConverter,
} from "../index";
import { globalConverterRegistry } from "../../converter-registry";

describe("Converter Registration", () => {
  beforeEach(() => {
    // テスト前に状態をリセット
    globalConverterRegistry.clear();
    resetRegistrationState();
  });

  afterEach(() => {
    // テスト後に状態をリセット
    globalConverterRegistry.clear();
    resetRegistrationState();
  });

  describe("registerDefaultConverters", () => {
    it("should register all default converters", () => {
      const result = registerDefaultConverters();

      expect(result.success).toBe(true);
      expect(result.registeredCount).toBe(3);
      expect(result.skipped).toBe(false);
    });

    it("should register HTMLConverter", () => {
      registerDefaultConverters();

      const converterResult = globalConverterRegistry.get("html-converter");
      expect(converterResult.success).toBe(true);
      if (converterResult.success) {
        expect(converterResult.data).toBeInstanceOf(HTMLConverter);
      }
    });

    it("should register CSVConverter", () => {
      registerDefaultConverters();

      const converterResult = globalConverterRegistry.get("csv-converter");
      expect(converterResult.success).toBe(true);
      if (converterResult.success) {
        expect(converterResult.data).toBeInstanceOf(CSVConverter);
      }
    });

    it("should register JSONConverter", () => {
      registerDefaultConverters();

      const converterResult = globalConverterRegistry.get("json-converter");
      expect(converterResult.success).toBe(true);
      if (converterResult.success) {
        expect(converterResult.data).toBeInstanceOf(JSONConverter);
      }
    });

    it("should support expected MIME types after registration", () => {
      registerDefaultConverters();

      const mimeTypes = globalConverterRegistry.getSupportedMimeTypes();

      expect(mimeTypes).toContain("text/html");
      expect(mimeTypes).toContain("application/xhtml+xml");
      expect(mimeTypes).toContain("text/csv");
      expect(mimeTypes).toContain("text/tab-separated-values");
      expect(mimeTypes).toContain("application/json");
    });

    it("should skip duplicate registration", () => {
      const firstResult = registerDefaultConverters();
      const secondResult = registerDefaultConverters();

      expect(firstResult.success).toBe(true);
      expect(firstResult.skipped).toBe(false);
      expect(firstResult.registeredCount).toBe(3);

      expect(secondResult.success).toBe(true);
      expect(secondResult.skipped).toBe(true);
      expect(secondResult.registeredCount).toBe(0);
    });
  });

  describe("isConvertersRegistered", () => {
    it("should return false before registration", () => {
      expect(isConvertersRegistered()).toBe(false);
    });

    it("should return true after registration", () => {
      registerDefaultConverters();
      expect(isConvertersRegistered()).toBe(true);
    });
  });

  describe("resetRegistrationState", () => {
    it("should allow re-registration after reset", () => {
      registerDefaultConverters();
      expect(isConvertersRegistered()).toBe(true);

      resetRegistrationState();
      expect(isConvertersRegistered()).toBe(false);

      // 再登録が可能になる
      const result = registerDefaultConverters();
      expect(result.skipped).toBe(false);
    });
  });

  describe("Exported Converters", () => {
    it("should export HTMLConverter class", () => {
      expect(HTMLConverter).toBeDefined();
      const converter = new HTMLConverter();
      expect(converter.id).toBe("html-converter");
    });

    it("should export CSVConverter class", () => {
      expect(CSVConverter).toBeDefined();
      const converter = new CSVConverter();
      expect(converter.id).toBe("csv-converter");
    });

    it("should export JSONConverter class", () => {
      expect(JSONConverter).toBeDefined();
      const converter = new JSONConverter();
      expect(converter.id).toBe("json-converter");
    });
  });
});
