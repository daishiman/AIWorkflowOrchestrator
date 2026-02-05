/**
 * Auth Callback Edge Cases Tests
 * Phase 6: Test Expansion - Edge cases and boundary conditions
 *
 * @see docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/outputs/phase-4/test-cases.md
 */
import { describe, it, expect } from "vitest";
import {
  parseOAuthError,
  mapOAuthErrorToMessage,
  calculateRefreshTokenExpiry,
} from "../auth/oauth-error-handler";
import { AUTH_ERROR_CODES } from "@repo/shared/types/auth";

// =============================================================================
// Edge Cases: parseOAuthError
// =============================================================================
describe("parseOAuthError - Edge Cases", () => {
  /**
   * 空のURL
   */
  it("should return null for empty URL", () => {
    const result = parseOAuthError("");
    expect(result).toBeNull();
  });

  /**
   * ハッシュなしのURL
   */
  it("should return null for URL without hash", () => {
    const result = parseOAuthError("aiworkflow://auth/callback");
    expect(result).toBeNull();
  });

  /**
   * ハッシュのみのURL
   */
  it("should return null for URL with only hash", () => {
    const result = parseOAuthError("aiworkflow://auth/callback#");
    expect(result).toBeNull();
  });

  /**
   * error以外のパラメータのみ
   */
  it("should return null when only non-error params present", () => {
    const result = parseOAuthError(
      "aiworkflow://auth/callback#state=abc&other=value",
    );
    expect(result).toBeNull();
  });

  /**
   * URLエンコードされたerror_description
   */
  it("should decode URL-encoded error_description", () => {
    const result = parseOAuthError(
      "aiworkflow://auth/callback#error=access_denied&error_description=User%20cancelled%20the%20authorization",
    );
    expect(result).toEqual({
      error: "access_denied",
      errorDescription: "User cancelled the authorization",
    });
  });

  /**
   * 特殊文字を含むerror_description
   */
  it("should handle special characters in error_description", () => {
    const result = parseOAuthError(
      "aiworkflow://auth/callback#error=server_error&error_description=%E3%82%A8%E3%83%A9%E3%83%BC%E7%99%BA%E7%94%9F",
    );
    expect(result).toEqual({
      error: "server_error",
      errorDescription: "エラー発生",
    });
  });

  /**
   * 複数のハッシュを含むURL
   */
  it("should handle URL with multiple hash characters", () => {
    const result = parseOAuthError(
      "aiworkflow://auth/callback#error=access_denied#extra=ignored",
    );
    expect(result?.error).toBe("access_denied");
  });

  /**
   * 不正なURL形式
   */
  it("should return null for malformed URL", () => {
    const result = parseOAuthError("not-a-valid-url");
    expect(result).toBeNull();
  });
});

// =============================================================================
// Edge Cases: mapOAuthErrorToMessage
// =============================================================================
describe("mapOAuthErrorToMessage - Edge Cases", () => {
  /**
   * 空文字列
   */
  it("should return default error for empty string", () => {
    const result = mapOAuthErrorToMessage("");
    expect(result.code).toBe(AUTH_ERROR_CODES.OAUTH_UNKNOWN_ERROR);
    expect(result.message).toBe("認証に失敗しました");
  });

  /**
   * 未知のエラーコード
   */
  it("should return default error for unknown error code", () => {
    const result = mapOAuthErrorToMessage("some_random_error");
    expect(result.code).toBe(AUTH_ERROR_CODES.OAUTH_UNKNOWN_ERROR);
  });

  /**
   * 大文字小文字の区別
   */
  it("should be case-sensitive for error codes", () => {
    const result = mapOAuthErrorToMessage("ACCESS_DENIED");
    // OAuth仕様では小文字なので、大文字は未知のエラーとして扱われる
    expect(result.code).toBe(AUTH_ERROR_CODES.OAUTH_UNKNOWN_ERROR);
  });

  /**
   * すべての定義済みエラーコード
   */
  const definedErrors = [
    {
      input: "access_denied",
      expectedCode: AUTH_ERROR_CODES.OAUTH_ACCESS_DENIED,
    },
    {
      input: "server_error",
      expectedCode: AUTH_ERROR_CODES.OAUTH_SERVER_ERROR,
    },
    {
      input: "temporarily_unavailable",
      expectedCode: AUTH_ERROR_CODES.OAUTH_TEMPORARILY_UNAVAILABLE,
    },
    {
      input: "invalid_request",
      expectedCode: AUTH_ERROR_CODES.OAUTH_INVALID_REQUEST,
    },
    {
      input: "unauthorized_client",
      expectedCode: AUTH_ERROR_CODES.OAUTH_UNAUTHORIZED_CLIENT,
    },
    {
      input: "unsupported_response_type",
      expectedCode: AUTH_ERROR_CODES.OAUTH_UNSUPPORTED_RESPONSE_TYPE,
    },
    {
      input: "invalid_scope",
      expectedCode: AUTH_ERROR_CODES.OAUTH_INVALID_SCOPE,
    },
  ];

  it.each(definedErrors)(
    "should map $input to correct error code",
    ({ input, expectedCode }) => {
      const result = mapOAuthErrorToMessage(input);
      expect(result.code).toBe(expectedCode);
    },
  );
});

// =============================================================================
// Edge Cases: calculateRefreshTokenExpiry
// =============================================================================
describe("calculateRefreshTokenExpiry - Edge Cases", () => {
  /**
   * 正常なタイムスタンプ
   */
  it("should calculate expiry correctly for normal timestamp", () => {
    const sessionCreatedAt = 1704067200; // 2024-01-01 00:00:00 UTC
    const result = calculateRefreshTokenExpiry(sessionCreatedAt);
    expect(result).toBe(sessionCreatedAt + 604800); // +7 days
  });

  /**
   * ゼロのタイムスタンプ
   */
  it("should handle zero timestamp", () => {
    const result = calculateRefreshTokenExpiry(0);
    expect(result).toBe(604800); // 7 days in seconds
  });

  /**
   * 大きなタイムスタンプ（遠い未来）
   */
  it("should handle large timestamp", () => {
    const futureTimestamp = 4102444800; // 2100-01-01
    const result = calculateRefreshTokenExpiry(futureTimestamp);
    expect(result).toBe(futureTimestamp + 604800);
  });

  /**
   * 7日間の正確な秒数
   */
  it("should add exactly 7 days (604800 seconds)", () => {
    const now = Math.floor(Date.now() / 1000);
    const result = calculateRefreshTokenExpiry(now);
    const expectedDays = (result - now) / (24 * 60 * 60);
    expect(expectedDays).toBe(7);
  });
});

// =============================================================================
// Integration: Error Flow
// =============================================================================
describe("Integration: Complete OAuth error flow", () => {
  /**
   * URLパース→エラーマッピングの一貫したフロー
   */
  it("should correctly process access_denied from URL to mapped error", () => {
    const url = "aiworkflow://auth/callback#error=access_denied";
    const parsedError = parseOAuthError(url);

    expect(parsedError).not.toBeNull();
    expect(parsedError!.error).toBe("access_denied");

    const mappedError = mapOAuthErrorToMessage(parsedError!.error);
    expect(mappedError.code).toBe(AUTH_ERROR_CODES.OAUTH_ACCESS_DENIED);
    expect(mappedError.message).toBe("認証がキャンセルされました");
  });

  /**
   * server_errorのフロー
   */
  it("should correctly process server_error from URL to mapped error", () => {
    const url =
      "aiworkflow://auth/callback#error=server_error&error_description=Internal%20error";
    const parsedError = parseOAuthError(url);

    expect(parsedError).not.toBeNull();
    expect(parsedError!.error).toBe("server_error");
    expect(parsedError!.errorDescription).toBe("Internal error");

    const mappedError = mapOAuthErrorToMessage(parsedError!.error);
    expect(mappedError.code).toBe(AUTH_ERROR_CODES.OAUTH_SERVER_ERROR);
  });
});
