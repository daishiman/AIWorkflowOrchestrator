import { describe, it, expect } from "vitest";
import {
  isAuthenticated,
  isChecking,
  isUnauthenticated,
  isError,
  hasExpiresAt,
  assertNever,
  type AuthGuardState,
  type AuthErrorCode,
  type AuthError,
} from "./types";

// テスト用のモックユーザー（AuthUser型に準拠）
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.png",
  provider: "google" as const,
  createdAt: "2025-01-01T00:00:00Z",
  lastSignInAt: "2025-01-01T00:00:00Z",
};

describe("AuthGuard Types", () => {
  describe("TYPE-01〜03: isAuthenticated型ガード", () => {
    it("TYPE-01: status='authenticated'でuser付きの場合、trueを返す", () => {
      const state: AuthGuardState = {
        status: "authenticated",
        user: mockUser,
      };

      expect(isAuthenticated(state)).toBe(true);
    });

    it("TYPE-02: status='checking'の場合、falseを返す", () => {
      const state: AuthGuardState = { status: "checking" };

      expect(isAuthenticated(state)).toBe(false);
    });

    it("TYPE-03: status='unauthenticated'の場合、falseを返す", () => {
      const state: AuthGuardState = { status: "unauthenticated" };

      expect(isAuthenticated(state)).toBe(false);
    });

    it("認証済み状態の場合、state.userにアクセスできる（型推論確認）", () => {
      const state: AuthGuardState = {
        status: "authenticated",
        user: mockUser,
      };

      if (isAuthenticated(state)) {
        // TypeScriptの型推論により、state.userにアクセス可能
        expect(state.user.email).toBe("test@example.com");
        expect(state.user.id).toBe("user-123");
      }
    });
  });

  describe("isChecking型ガード", () => {
    it("status='checking'の場合、trueを返す", () => {
      const state: AuthGuardState = { status: "checking" };

      expect(isChecking(state)).toBe(true);
    });

    it("status='authenticated'の場合、falseを返す", () => {
      const state: AuthGuardState = {
        status: "authenticated",
        user: mockUser,
      };

      expect(isChecking(state)).toBe(false);
    });

    it("status='unauthenticated'の場合、falseを返す", () => {
      const state: AuthGuardState = { status: "unauthenticated" };

      expect(isChecking(state)).toBe(false);
    });
  });

  describe("isUnauthenticated型ガード", () => {
    it("status='unauthenticated'の場合、trueを返す", () => {
      const state: AuthGuardState = { status: "unauthenticated" };

      expect(isUnauthenticated(state)).toBe(true);
    });

    it("status='checking'の場合、falseを返す", () => {
      const state: AuthGuardState = { status: "checking" };

      expect(isUnauthenticated(state)).toBe(false);
    });

    it("status='authenticated'の場合、falseを返す", () => {
      const state: AuthGuardState = {
        status: "authenticated",
        user: mockUser,
      };

      expect(isUnauthenticated(state)).toBe(false);
    });
  });

  describe("TYPE-04〜06: isError型ガード", () => {
    it("TYPE-04: Errorインスタンスの場合、trueを返す", () => {
      const error = new Error("test error");

      expect(isError(error)).toBe(true);
    });

    it("TYPE-05: 文字列の場合、falseを返す", () => {
      const error = "string error";

      expect(isError(error)).toBe(false);
    });

    it("TYPE-06: nullの場合、falseを返す", () => {
      const error = null;

      expect(isError(error)).toBe(false);
    });

    it("undefinedの場合、falseを返す", () => {
      const error = undefined;

      expect(isError(error)).toBe(false);
    });

    it("オブジェクトの場合、falseを返す", () => {
      const error = { message: "error" };

      expect(isError(error)).toBe(false);
    });

    it("数値の場合、falseを返す", () => {
      const error = 404;

      expect(isError(error)).toBe(false);
    });

    it("TypeErrorの場合、trueを返す（Error継承）", () => {
      const error = new TypeError("type error");

      expect(isError(error)).toBe(true);
    });

    it("Errorの場合、error.messageにアクセスできる（型推論確認）", () => {
      const error: unknown = new Error("test message");

      if (isError(error)) {
        // TypeScriptの型推論により、error.messageにアクセス可能
        expect(error.message).toBe("test message");
      }
    });
  });

  describe("TYPE-07〜09: hasExpiresAt型ガード", () => {
    it("TYPE-07: expiresAtが数値の場合、trueを返す", () => {
      const obj = { expiresAt: 12345 };

      expect(hasExpiresAt(obj)).toBe(true);
    });

    it("TYPE-08: expiresAtがない場合、falseを返す", () => {
      const obj = { other: "value" };

      expect(hasExpiresAt(obj)).toBe(false);
    });

    it("TYPE-09: nullの場合、falseを返す", () => {
      const obj = null;

      expect(hasExpiresAt(obj)).toBe(false);
    });

    it("undefinedの場合、falseを返す", () => {
      const obj = undefined;

      expect(hasExpiresAt(obj)).toBe(false);
    });

    it("expiresAtが文字列の場合、falseを返す", () => {
      const obj = { expiresAt: "2025-01-01" };

      expect(hasExpiresAt(obj)).toBe(false);
    });

    it("expiresAtがnullの場合、falseを返す", () => {
      const obj = { expiresAt: null };

      expect(hasExpiresAt(obj)).toBe(false);
    });

    it("expiresAtが0の場合、trueを返す（数値として有効）", () => {
      const obj = { expiresAt: 0 };

      expect(hasExpiresAt(obj)).toBe(true);
    });

    it("配列の場合、falseを返す", () => {
      const obj = [1, 2, 3];

      expect(hasExpiresAt(obj)).toBe(false);
    });

    it("hasExpiresAtがtrueの場合、obj.expiresAtにアクセスできる（型推論確認）", () => {
      const obj: unknown = { expiresAt: 1234567890 };

      if (hasExpiresAt(obj)) {
        // TypeScriptの型推論により、obj.expiresAtにアクセス可能
        expect(obj.expiresAt).toBe(1234567890);
      }
    });
  });

  describe("assertNever（網羅性チェックヘルパー）", () => {
    it("呼び出されるとエラーをスローする", () => {
      // 実際には呼び出されないはずだが、テスト用にモックで呼び出す
      expect(() => {
        // 意図的にnever型でない値を渡す（as neverでキャスト）
        assertNever("invalid" as never);
      }).toThrow();
    });

    it("エラーメッセージに値が含まれる", () => {
      expect(() => {
        // 意図的にnever型でない値を渡す（as neverでキャスト）
        assertNever({ status: "unknown" } as never);
      }).toThrow(/unknown/);
    });
  });

  describe("AuthErrorCode型", () => {
    it("すべてのエラーコードが文字列型である", () => {
      const errorCodes: AuthErrorCode[] = [
        "NETWORK_ERROR",
        "AUTH_FAILED",
        "TIMEOUT",
        "SESSION_EXPIRED",
        "PROVIDER_ERROR",
        "PROFILE_UPDATE_FAILED",
        "LINK_PROVIDER_FAILED",
        "UNKNOWN",
      ];

      errorCodes.forEach((code) => {
        expect(typeof code).toBe("string");
      });
    });
  });

  describe("AuthError型", () => {
    it("必須プロパティが含まれる", () => {
      const error: AuthError = {
        code: "NETWORK_ERROR",
        message: "ネットワーク接続を確認してください",
      };

      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.message).toBe("ネットワーク接続を確認してください");
    });

    it("originalErrorプロパティはオプション", () => {
      const error: AuthError = {
        code: "AUTH_FAILED",
        message: "認証に失敗しました",
        originalError: new Error("Original error"),
      };

      expect(error.originalError).toBeInstanceOf(Error);
      expect(error.originalError?.message).toBe("Original error");
    });
  });

  describe("AuthGuardState Discriminated Union", () => {
    it("switch文で網羅的に処理できる", () => {
      const getDisplayText = (state: AuthGuardState): string => {
        switch (state.status) {
          case "checking":
            return "確認中";
          case "authenticated":
            return `ようこそ、${state.user.displayName}さん`;
          case "unauthenticated":
            return "ログインしてください";
        }
      };

      expect(getDisplayText({ status: "checking" })).toBe("確認中");
      expect(getDisplayText({ status: "authenticated", user: mockUser })).toBe(
        "ようこそ、Test Userさん",
      );
      expect(getDisplayText({ status: "unauthenticated" })).toBe(
        "ログインしてください",
      );
    });

    it("authenticatedの場合のみuserプロパティにアクセス可能", () => {
      const states: AuthGuardState[] = [
        { status: "checking" },
        { status: "authenticated", user: mockUser },
        { status: "unauthenticated" },
      ];

      states.forEach((state) => {
        if (state.status === "authenticated") {
          // authenticatedの場合のみuser.emailにアクセス可能
          expect(state.user.email).toBe("test@example.com");
        }
      });
    });
  });
});
