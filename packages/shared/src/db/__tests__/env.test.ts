import { describe, it, expect } from "vitest";
import { getDatabaseEnv, getDatabaseUrl, isCloudMode } from "../env";

describe("env", () => {
  describe("getDatabaseEnv", () => {
    it("should return env with default DATABASE_MODE as local", () => {
      const result = getDatabaseEnv({});

      expect(result.DATABASE_MODE).toBe("local");
    });

    it("should use provided env parameter", () => {
      const customEnv = {
        DATABASE_MODE: "local",
        LOCAL_DB_PATH: "./custom.db",
      };

      const result = getDatabaseEnv(customEnv);

      expect(result.DATABASE_MODE).toBe("local");
      expect(result.LOCAL_DB_PATH).toBe("./custom.db");
    });

    it("should handle cloud mode with auth token", () => {
      const cloudEnv = {
        DATABASE_MODE: "cloud",
        TURSO_DATABASE_URL: "libsql://test.turso.io",
        TURSO_AUTH_TOKEN: "test-token",
      };

      const result = getDatabaseEnv(cloudEnv);

      expect(result.DATABASE_MODE).toBe("cloud");
      expect(result.TURSO_DATABASE_URL).toBe("libsql://test.turso.io");
      expect(result.TURSO_AUTH_TOKEN).toBe("test-token");
    });
  });

  describe("getDatabaseUrl", () => {
    it("should prioritize TURSO_DATABASE_URL when present", () => {
      const env = getDatabaseEnv({
        TURSO_DATABASE_URL: "libsql://turso.example.com",
        TURSO_AUTH_TOKEN: "token",
        LOCAL_DB_PATH: "./local.db",
      });

      const url = getDatabaseUrl(env);

      expect(url).toBe("libsql://turso.example.com");
    });

    it("should use LOCAL_DB_PATH when TURSO_DATABASE_URL is not present", () => {
      const env = getDatabaseEnv({
        LOCAL_DB_PATH: "./my-local.db",
      });

      const url = getDatabaseUrl(env);

      expect(url).toBe("file:./my-local.db");
    });

    it("should return default file:local.db when neither is present", () => {
      const env = getDatabaseEnv({});

      const url = getDatabaseUrl(env);

      expect(url).toBe("file:local.db");
    });
  });

  describe("isCloudMode", () => {
    it("should return true when DATABASE_MODE is cloud", () => {
      const env = getDatabaseEnv({
        DATABASE_MODE: "cloud",
        TURSO_DATABASE_URL: "libsql://test.turso.io",
        TURSO_AUTH_TOKEN: "token",
      });

      const result = isCloudMode(env);

      expect(result).toBe(true);
    });

    it("should return true when TURSO_DATABASE_URL starts with libsql://", () => {
      const env = getDatabaseEnv({
        TURSO_DATABASE_URL: "libsql://example.turso.io",
        TURSO_AUTH_TOKEN: "token",
      });

      const result = isCloudMode(env);

      expect(result).toBe(true);
    });

    it("should return false when DATABASE_MODE is local and no TURSO_DATABASE_URL", () => {
      const env = getDatabaseEnv({
        DATABASE_MODE: "local",
      });

      const result = isCloudMode(env);

      expect(result).toBe(false);
    });
  });
});
