/**
 * @file getAuthState.test.ts
 * @description getAuthState関数のユニットテスト
 */

import { describe, it, expect } from "vitest";
import { getAuthState } from "./getAuthState";

describe("getAuthState", () => {
  describe("checking状態", () => {
    it("isLoading=true の場合、'checking'を返す", () => {
      expect(getAuthState({ isLoading: true, isAuthenticated: false })).toBe(
        "checking",
      );
    });

    it("isLoading=true かつ isAuthenticated=true の場合も'checking'を返す（ローディング優先）", () => {
      expect(getAuthState({ isLoading: true, isAuthenticated: true })).toBe(
        "checking",
      );
    });
  });

  describe("authenticated状態", () => {
    it("isLoading=false かつ isAuthenticated=true の場合、'authenticated'を返す", () => {
      expect(getAuthState({ isLoading: false, isAuthenticated: true })).toBe(
        "authenticated",
      );
    });
  });

  describe("unauthenticated状態", () => {
    it("isLoading=false かつ isAuthenticated=false の場合、'unauthenticated'を返す", () => {
      expect(getAuthState({ isLoading: false, isAuthenticated: false })).toBe(
        "unauthenticated",
      );
    });
  });

  describe("境界値テスト", () => {
    it("すべての入力パターンで有効な状態を返す", () => {
      const validStates = ["checking", "authenticated", "unauthenticated"];

      const inputs = [
        { isLoading: true, isAuthenticated: true },
        { isLoading: true, isAuthenticated: false },
        { isLoading: false, isAuthenticated: true },
        { isLoading: false, isAuthenticated: false },
      ];

      inputs.forEach((input) => {
        const result = getAuthState(input);
        expect(validStates).toContain(result);
      });
    });
  });
});
