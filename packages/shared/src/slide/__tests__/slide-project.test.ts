/**
 * スライドプロジェクトのユニットテスト
 * @module slide/__tests__/slide-project.test
 */

import { describe, it, expect } from "vitest";
import {
  createSlideProject,
  getSyncStatus,
  updateSyncStatus,
  isValidProjectPath,
} from "../slide-project";
import type { SlideProject } from "../types";

describe("slide-project", () => {
  describe("createSlideProject", () => {
    it("should create a slide project with correct paths", () => {
      const project = createSlideProject("/path/to/project");

      expect(project.path).toBe("/path/to/project");
      expect(project.structurePath).toBe("/path/to/project/structure.md");
      expect(project.htmlPath).toBe("/path/to/project/index.html");
    });

    it("should initialize with synced status", () => {
      const project = createSlideProject("/path/to/project");

      expect(project.syncStatus).toBe("synced");
    });

    it("should initialize with null lastSyncAt", () => {
      const project = createSlideProject("/path/to/project");

      expect(project.lastSyncAt).toBeNull();
    });

    it("should handle Windows-style paths", () => {
      const project = createSlideProject("C:\\Users\\test\\project");

      expect(project.path).toBe("C:\\Users\\test\\project");
      expect(project.structurePath).toContain("structure.md");
      expect(project.htmlPath).toContain("index.html");
    });

    it("should handle paths with spaces", () => {
      const project = createSlideProject("/path/to/my project");

      expect(project.path).toBe("/path/to/my project");
      expect(project.structurePath).toBe("/path/to/my project/structure.md");
    });
  });

  describe("getSyncStatus", () => {
    it("should return the current sync status", () => {
      const project: SlideProject = {
        path: "/test",
        structurePath: "/test/structure.md",
        htmlPath: "/test/index.html",
        syncStatus: "out-of-sync",
        lastSyncAt: null,
      };

      expect(getSyncStatus(project)).toBe("out-of-sync");
    });

    it("should return synced for synced projects", () => {
      const project: SlideProject = {
        path: "/test",
        structurePath: "/test/structure.md",
        htmlPath: "/test/index.html",
        syncStatus: "synced",
        lastSyncAt: new Date(),
      };

      expect(getSyncStatus(project)).toBe("synced");
    });
  });

  describe("updateSyncStatus", () => {
    it("should update sync status to synced", () => {
      const project: SlideProject = {
        path: "/test",
        structurePath: "/test/structure.md",
        htmlPath: "/test/index.html",
        syncStatus: "out-of-sync",
        lastSyncAt: null,
      };

      const updated = updateSyncStatus(project, "synced");

      expect(updated.syncStatus).toBe("synced");
      expect(updated.lastSyncAt).toBeInstanceOf(Date);
    });

    it("should not update lastSyncAt when status is not synced", () => {
      const project: SlideProject = {
        path: "/test",
        structurePath: "/test/structure.md",
        htmlPath: "/test/index.html",
        syncStatus: "synced",
        lastSyncAt: null,
      };

      const updated = updateSyncStatus(project, "syncing");

      expect(updated.syncStatus).toBe("syncing");
      expect(updated.lastSyncAt).toBeNull();
    });

    it("should preserve lastSyncAt when changing to out-of-sync", () => {
      const previousSync = new Date("2026-01-01T00:00:00Z");
      const project: SlideProject = {
        path: "/test",
        structurePath: "/test/structure.md",
        htmlPath: "/test/index.html",
        syncStatus: "synced",
        lastSyncAt: previousSync,
      };

      const updated = updateSyncStatus(project, "out-of-sync");

      expect(updated.lastSyncAt).toBe(previousSync);
    });

    it("should return immutable copy", () => {
      const project: SlideProject = {
        path: "/test",
        structurePath: "/test/structure.md",
        htmlPath: "/test/index.html",
        syncStatus: "synced",
        lastSyncAt: null,
      };

      const updated = updateSyncStatus(project, "out-of-sync");

      expect(updated).not.toBe(project);
      expect(project.syncStatus).toBe("synced"); // Original unchanged
    });
  });

  describe("isValidProjectPath", () => {
    it("should return true for absolute UNIX paths", () => {
      expect(isValidProjectPath("/path/to/project")).toBe(true);
      expect(isValidProjectPath("/")).toBe(true);
      expect(isValidProjectPath("/home/user/documents")).toBe(true);
    });

    it("should handle Windows paths (platform dependent)", () => {
      // On macOS/Linux, path.isAbsolute() does not recognize Windows paths
      // This test documents the expected platform behavior
      const isWindows = process.platform === "win32";
      if (isWindows) {
        expect(isValidProjectPath("C:\\Users\\test")).toBe(true);
        expect(isValidProjectPath("D:\\Projects\\my-slides")).toBe(true);
      } else {
        // On non-Windows platforms, Windows paths are not recognized as absolute
        expect(isValidProjectPath("C:\\Users\\test")).toBe(false);
      }
    });

    it("should return false for relative paths", () => {
      expect(isValidProjectPath("./relative/path")).toBe(false);
      expect(isValidProjectPath("relative/path")).toBe(false);
      expect(isValidProjectPath("../parent/path")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidProjectPath("")).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isValidProjectPath(null as unknown as string)).toBe(false);
      expect(isValidProjectPath(undefined as unknown as string)).toBe(false);
    });
  });
});
