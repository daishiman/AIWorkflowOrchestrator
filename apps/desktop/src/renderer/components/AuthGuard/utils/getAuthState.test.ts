/**
 * @file getAuthState.test.ts
 * @description getAuthState関数のユニットテスト
 */

import { describe, it, expect } from "vitest";
import { getAuthState } from "./getAuthState";

describe("getAuthState", () => {
  describe("checking状態", () => {
    it("isLoading=true の場合、'checking'を返す", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: false,
          isTimedOut: false,
        }),
      ).toBe("checking");
    });

    it("isLoading=true かつ isAuthenticated=true の場合も'checking'を返す（ローディング優先）", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: true,
          isTimedOut: false,
        }),
      ).toBe("checking");
    });
  });

  describe("authenticated状態", () => {
    it("isLoading=false かつ isAuthenticated=true の場合、'authenticated'を返す", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: true,
          isTimedOut: false,
        }),
      ).toBe("authenticated");
    });
  });

  describe("unauthenticated状態", () => {
    it("isLoading=false かつ isAuthenticated=false の場合、'unauthenticated'を返す", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: false,
          isTimedOut: false,
        }),
      ).toBe("unauthenticated");
    });
  });

  describe("timed-out状態", () => {
    it("isLoading=true かつ isTimedOut=true の場合、'timed-out'を返す", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: false,
          isTimedOut: true,
        }),
      ).toBe("timed-out");
    });

    it("タイムアウト後にロード完了（認証済み）の場合、'authenticated'を返す", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: true,
          isTimedOut: true,
        }),
      ).toBe("authenticated");
    });

    it("タイムアウト後にロード完了（未認証）の場合、'unauthenticated'を返す", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: false,
          isTimedOut: true,
        }),
      ).toBe("unauthenticated");
    });
  });

  describe("境界値テスト", () => {
    it("すべての入力パターンで有効な状態を返す", () => {
      const validStates = [
        "checking",
        "authenticated",
        "unauthenticated",
        "timed-out",
      ];

      const inputs = [
        { isLoading: true, isAuthenticated: true, isTimedOut: false },
        { isLoading: true, isAuthenticated: false, isTimedOut: false },
        { isLoading: false, isAuthenticated: true, isTimedOut: false },
        { isLoading: false, isAuthenticated: false, isTimedOut: false },
        { isLoading: true, isAuthenticated: true, isTimedOut: true },
        { isLoading: true, isAuthenticated: false, isTimedOut: true },
        { isLoading: false, isAuthenticated: true, isTimedOut: true },
        { isLoading: false, isAuthenticated: false, isTimedOut: true },
      ];

      inputs.forEach((input) => {
        const result = getAuthState(input);
        expect(validStates).toContain(result);
      });
    });
  });

  // ============================================================
  // Phase 6: 全8パターンの個別期待値テスト（2^3 = 8パターン）
  // ============================================================
  describe("全8パターン個別期待値テスト", () => {
    it("パターン1: isLoading=false, isAuthenticated=false, isTimedOut=false → 'unauthenticated'", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: false,
          isTimedOut: false,
        }),
      ).toBe("unauthenticated");
    });

    it("パターン2: isLoading=false, isAuthenticated=false, isTimedOut=true → 'unauthenticated'", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: false,
          isTimedOut: true,
        }),
      ).toBe("unauthenticated");
    });

    it("パターン3: isLoading=false, isAuthenticated=true, isTimedOut=false → 'authenticated'", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: true,
          isTimedOut: false,
        }),
      ).toBe("authenticated");
    });

    it("パターン4: isLoading=false, isAuthenticated=true, isTimedOut=true → 'authenticated'", () => {
      expect(
        getAuthState({
          isLoading: false,
          isAuthenticated: true,
          isTimedOut: true,
        }),
      ).toBe("authenticated");
    });

    it("パターン5: isLoading=true, isAuthenticated=false, isTimedOut=false → 'checking'", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: false,
          isTimedOut: false,
        }),
      ).toBe("checking");
    });

    it("パターン6: isLoading=true, isAuthenticated=false, isTimedOut=true → 'timed-out'", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: false,
          isTimedOut: true,
        }),
      ).toBe("timed-out");
    });

    it("パターン7: isLoading=true, isAuthenticated=true, isTimedOut=false → 'checking'", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: true,
          isTimedOut: false,
        }),
      ).toBe("checking");
    });

    it("パターン8: isLoading=true, isAuthenticated=true, isTimedOut=true → 'timed-out'", () => {
      expect(
        getAuthState({
          isLoading: true,
          isAuthenticated: true,
          isTimedOut: true,
        }),
      ).toBe("timed-out");
    });
  });
});
