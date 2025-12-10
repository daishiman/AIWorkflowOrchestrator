/**
 * profileSync ユニットテスト (TDD: Red)
 *
 * 設計書: docs/30-workflows/profile-persistence-bugfix/design/sync-design.md
 * 対象: apps/desktop/src/main/infrastructure/profileSync.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  syncProfileToMetadata,
  syncMetadataToProfile,
  ensureProfileConsistency,
  SYNC_ERROR_CODES,
} from "./profileSync";

describe("profileSync", () => {
  let mockSupabase: SupabaseClient;
  let mockUpdateUser: ReturnType<typeof vi.fn>;
  let mockGetUser: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Supabase Auth モック
    mockUpdateUser = vi.fn();
    mockGetUser = vi.fn();

    // Supabase DB モック
    mockFrom = vi.fn();

    mockSupabase = {
      auth: {
        updateUser: mockUpdateUser,
        getUser: mockGetUser,
      },
      from: mockFrom,
    } as unknown as SupabaseClient;
  });

  // ============================================
  // syncProfileToMetadata テスト
  // ============================================
  describe("syncProfileToMetadata", () => {
    it("should sync display_name to user_metadata successfully", async () => {
      // Arrange
      const updates = { display_name: "テストユーザー" };
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      });

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { display_name: "テストユーザー" },
      });
    });

    it("should sync avatar_url to user_metadata successfully", async () => {
      // Arrange
      const updates = { avatar_url: "https://example.com/avatar.jpg" };
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      });

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { avatar_url: "https://example.com/avatar.jpg" },
      });
    });

    it("should sync both display_name and avatar_url successfully", async () => {
      // Arrange
      const updates = {
        display_name: "テストユーザー",
        avatar_url: "https://example.com/avatar.jpg",
      };
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      });

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          display_name: "テストユーザー",
          avatar_url: "https://example.com/avatar.jpg",
        },
      });
    });

    it("should handle avatar_url=null for deletion sync", async () => {
      // Arrange
      const updates = { avatar_url: null };
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      });

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { avatar_url: null },
      });
    });

    it("should return success without API call when no updates provided", async () => {
      // Arrange
      const updates = {};

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("should return error when Supabase Auth API fails", async () => {
      // Arrange
      const updates = { display_name: "テストユーザー" };
      mockUpdateUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Auth API error" },
      });

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SYNC_ERROR_CODES.AUTH_UPDATE_FAILED);
      expect(result.error?.message).toContain("Auth API error");
    });

    it("should return error when exception is thrown", async () => {
      // Arrange
      const updates = { display_name: "テストユーザー" };
      mockUpdateUser.mockRejectedValue(new Error("Network error"));

      // Act
      const result = await syncProfileToMetadata(mockSupabase, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SYNC_ERROR_CODES.AUTH_UPDATE_FAILED);
      expect(result.error?.message).toContain("Network error");
    });
  });

  // ============================================
  // syncMetadataToProfile テスト
  // ============================================
  describe("syncMetadataToProfile", () => {
    it("should sync avatar_url to user_profiles successfully", async () => {
      // Arrange
      const userId = "test-user-id";
      const updates = { avatar_url: "https://example.com/avatar.jpg" };

      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      // Act
      const result = await syncMetadataToProfile(mockSupabase, userId, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFrom).toHaveBeenCalledWith("user_profiles");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar_url: "https://example.com/avatar.jpg",
        }),
      );
      expect(mockEq).toHaveBeenCalledWith("id", userId);
    });

    it("should sync avatar_url=null for deletion", async () => {
      // Arrange
      const userId = "test-user-id";
      const updates = { avatar_url: null };

      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      // Act
      const result = await syncMetadataToProfile(mockSupabase, userId, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar_url: null,
        }),
      );
    });

    it("should return success without DB call when no updates provided", async () => {
      // Arrange
      const userId = "test-user-id";
      const updates = {};

      // Act
      const result = await syncMetadataToProfile(mockSupabase, userId, updates);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should return error when DB update fails", async () => {
      // Arrange
      const userId = "test-user-id";
      const updates = { avatar_url: "https://example.com/avatar.jpg" };

      const mockEq = vi
        .fn()
        .mockResolvedValue({ error: { message: "DB error" } });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      // Act
      const result = await syncMetadataToProfile(mockSupabase, userId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SYNC_ERROR_CODES.DB_UPDATE_FAILED);
      expect(result.error?.message).toContain("DB error");
    });

    it("should return error when exception is thrown", async () => {
      // Arrange
      const userId = "test-user-id";
      const updates = { avatar_url: "https://example.com/avatar.jpg" };

      mockFrom.mockImplementation(() => {
        throw new Error("Connection error");
      });

      // Act
      const result = await syncMetadataToProfile(mockSupabase, userId, updates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(SYNC_ERROR_CODES.DB_UPDATE_FAILED);
      expect(result.error?.message).toContain("Connection error");
    });
  });

  // ============================================
  // ensureProfileConsistency テスト
  // ============================================
  describe("ensureProfileConsistency", () => {
    it("should detect inconsistency and sync from user_profiles to user_metadata", async () => {
      // Arrange
      const userId = "test-user-id";

      // user_profiles のデータ（Primary）
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: userId,
          display_name: "DBユーザー",
          avatar_url: "https://example.com/db-avatar.jpg",
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      // user_metadata のデータ（異なる値 = 不整合）
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            user_metadata: {
              display_name: "Metadataユーザー",
              avatar_url: "https://example.com/old-avatar.jpg",
            },
          },
        },
        error: null,
      });

      // sync 用モック
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });

      // Act
      const result = await ensureProfileConsistency(mockSupabase, userId);

      // Assert
      expect(result.success).toBe(true);
      // user_profiles の値で user_metadata を更新
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({
          display_name: "DBユーザー",
          avatar_url: "https://example.com/db-avatar.jpg",
        }),
      });
    });

    it("should do nothing when data is already consistent", async () => {
      // Arrange
      const userId = "test-user-id";
      const consistentData = {
        display_name: "同じユーザー",
        avatar_url: "https://example.com/same-avatar.jpg",
      };

      // user_profiles
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: userId, ...consistentData },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      // user_metadata（同じ値）
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            user_metadata: consistentData,
          },
        },
        error: null,
      });

      // Act
      const result = await ensureProfileConsistency(mockSupabase, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("should return success when user_profiles does not exist", async () => {
      // Arrange
      const userId = "test-user-id";

      // user_profiles なし（PGRST116）
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Row not found" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            user_metadata: { display_name: "Test" },
          },
        },
        error: null,
      });

      // Act
      const result = await ensureProfileConsistency(mockSupabase, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("should return error when fetching user_profiles fails", async () => {
      // Arrange
      const userId = "test-user-id";

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "DB_ERROR", message: "Database connection failed" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      mockGetUser.mockResolvedValue({
        data: { user: { id: userId, user_metadata: {} } },
        error: null,
      });

      // Act
      const result = await ensureProfileConsistency(mockSupabase, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(
        SYNC_ERROR_CODES.CONSISTENCY_CHECK_FAILED,
      );
    });

    it("should return error when exception is thrown", async () => {
      // Arrange
      const userId = "test-user-id";
      mockFrom.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      // Act
      const result = await ensureProfileConsistency(mockSupabase, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(
        SYNC_ERROR_CODES.CONSISTENCY_CHECK_FAILED,
      );
      expect(result.error?.message).toContain("Unexpected error");
    });
  });
});
