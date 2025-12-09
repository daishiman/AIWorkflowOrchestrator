/**
 * 認証Zodスキーマ テスト
 *
 * TDD Red Phase: これらのテストは実装前に作成され、
 * 実装が完了するまで失敗する（Red状態）
 */

import { describe, it, expect } from "vitest";
import {
  oauthProviderSchema,
  displayNameSchema,
  avatarUrlSchema,
  updateProfileSchema,
  loginArgsSchema,
  updateProfileArgsSchema,
  linkProviderArgsSchema,
  safeValidate,
  isValidProvider,
  VALID_PROVIDERS,
  DISPLAY_NAME_CONSTRAINTS,
  DISPLAY_NAME_ERRORS,
  AVATAR_URL_ERRORS,
  type OAuthProvider,
  type DisplayName,
  type AvatarUrl,
  type UpdateProfileInput,
  type LoginArgs,
  type ValidationResult,
} from "./auth";

describe("認証Zodスキーマ", () => {
  describe("oauthProviderSchema", () => {
    describe("有効なケース", () => {
      it.each(["google", "github", "discord"] as const)(
        "有効なプロバイダー: %s",
        (provider) => {
          const result = oauthProviderSchema.safeParse(provider);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBe(provider);
          }
        },
      );
    });

    describe("無効なケース", () => {
      it.each([
        ["facebook", "未サポートプロバイダー"],
        ["twitter", "未サポートプロバイダー"],
        ["apple", "未サポートプロバイダー"],
        ["", "空文字列"],
        [" google", "先頭にスペース"],
        ["GOOGLE", "大文字"],
      ])("無効なプロバイダー: %s (%s)", (provider) => {
        const result = oauthProviderSchema.safeParse(provider);
        expect(result.success).toBe(false);
      });

      it.each([null, undefined, 123, {}, []])("無効な型: %s", (value) => {
        const result = oauthProviderSchema.safeParse(value);
        expect(result.success).toBe(false);
      });
    });

    it("エラーメッセージが日本語である", () => {
      const result = oauthProviderSchema.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "無効な認証プロバイダー",
        );
      }
    });
  });

  describe("displayNameSchema", () => {
    describe("有効なケース", () => {
      it.each([
        ["John", "英字のみ"],
        ["田中太郎", "日本語のみ"],
        ["user_123", "アンダースコア付き"],
        ["Test-User", "ハイフン付き"],
        ["ユーザー テスト", "スペース付き日本語"],
        ["A", "最小長（1文字）"],
        ["a".repeat(50), "最大長（50文字）"],
        ["カタカナ", "カタカナ"],
        ["ひらがな", "ひらがな"],
        ["漢字", "漢字"],
        ["123", "数字のみ"],
        ["User123", "英数字混在"],
        ["田中_太郎", "日本語とアンダースコア"],
      ])("有効なdisplayName: %s (%s)", (name) => {
        const result = displayNameSchema.safeParse(name);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(name);
        }
      });
    });

    describe("無効なケース - 空・長さ違反", () => {
      it("空文字列はエラー", () => {
        const result = displayNameSchema.safeParse("");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            DISPLAY_NAME_ERRORS.tooShort,
          );
        }
      });

      it("51文字以上はエラー", () => {
        const result = displayNameSchema.safeParse("a".repeat(51));
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            DISPLAY_NAME_ERRORS.tooLong,
          );
        }
      });
    });

    describe("無効なケース - XSS攻撃文字列", () => {
      it.each([
        ["<script>alert('xss')</script>", "scriptタグ"],
        ["<img src=x onerror=alert(1)>", "imgタグ"],
        ["javascript:alert(1)", "javascriptプロトコル"],
        ["<svg onload=alert(1)>", "svgタグ"],
      ])("XSS攻撃文字列を拒否: %s (%s)", (name) => {
        const result = displayNameSchema.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            DISPLAY_NAME_ERRORS.invalidChars,
          );
        }
      });
    });

    describe("無効なケース - SQLインジェクション", () => {
      it.each([
        ["'; DROP TABLE users;--", "SQLインジェクション"],
        ["1'; SELECT * FROM users--", "SELECT文"],
        ["admin'--", "コメントアウト"],
      ])("SQLインジェクション文字列を拒否: %s (%s)", (name) => {
        const result = displayNameSchema.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            DISPLAY_NAME_ERRORS.invalidChars,
          );
        }
      });
    });

    describe("無効なケース - 特殊記号", () => {
      it.each([
        ["test@example.com", "@記号"],
        ["user!name", "!記号"],
        ["test{name}", "波括弧"],
        ["test[name]", "角括弧"],
        ["test#name", "#記号"],
        ["test$name", "$記号"],
        ["test%name", "%記号"],
        ["test^name", "^記号"],
        ["test&name", "&記号"],
        ["test*name", "*記号"],
        ["test(name)", "丸括弧"],
        ["test=name", "=記号"],
        ["test+name", "+記号"],
        ["test|name", "|記号"],
        ["test\\name", "バックスラッシュ"],
        ["test/name", "スラッシュ"],
        ["test?name", "?記号"],
        ["test<name", "<記号"],
        ["test>name", ">記号"],
        ["test:name", ":記号"],
        ["test;name", ";記号"],
        ['test"name', "ダブルクォート"],
        ["test'name", "シングルクォート"],
        ["test`name", "バッククォート"],
        ["test~name", "チルダ"],
      ])("特殊記号を拒否: %s (%s)", (name) => {
        const result = displayNameSchema.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            DISPLAY_NAME_ERRORS.invalidChars,
          );
        }
      });
    });

    describe("エラーメッセージ", () => {
      it("必須エラーメッセージが日本語である", () => {
        const result = displayNameSchema.safeParse(undefined);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            DISPLAY_NAME_ERRORS.required,
          );
        }
      });
    });
  });

  describe("avatarUrlSchema", () => {
    describe("有効なケース", () => {
      it("HTTPSのURLは許可", () => {
        const result = avatarUrlSchema.safeParse(
          "https://example.com/avatar.png",
        );
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe("https://example.com/avatar.png");
        }
      });

      it("nullは許可", () => {
        const result = avatarUrlSchema.safeParse(null);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(null);
        }
      });

      it("クエリパラメータ付きHTTPS URLは許可", () => {
        const result = avatarUrlSchema.safeParse(
          "https://example.com/avatar.png?size=100",
        );
        expect(result.success).toBe(true);
      });

      it("サブドメイン付きHTTPS URLは許可", () => {
        const result = avatarUrlSchema.safeParse(
          "https://cdn.example.com/avatar.png",
        );
        expect(result.success).toBe(true);
      });
    });

    describe("無効なケース", () => {
      it("HTTPは拒否", () => {
        const result = avatarUrlSchema.safeParse(
          "http://example.com/avatar.png",
        );
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            AVATAR_URL_ERRORS.httpsRequired,
          );
        }
      });

      it("不正なURL形式は拒否", () => {
        const result = avatarUrlSchema.safeParse("not-a-url");
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(
            AVATAR_URL_ERRORS.invalidFormat,
          );
        }
      });

      it("javascript:プロトコルは拒否", () => {
        const result = avatarUrlSchema.safeParse("javascript:alert(1)");
        expect(result.success).toBe(false);
      });

      it("data:プロトコルは拒否", () => {
        const result = avatarUrlSchema.safeParse(
          "data:image/png;base64,iVBORw0KGgo=",
        );
        expect(result.success).toBe(false);
      });

      it("file:プロトコルは拒否", () => {
        const result = avatarUrlSchema.safeParse("file:///etc/passwd");
        expect(result.success).toBe(false);
      });

      it("空文字列は拒否", () => {
        const result = avatarUrlSchema.safeParse("");
        expect(result.success).toBe(false);
      });

      it("undefinedは拒否（nullのみ許可）", () => {
        const result = avatarUrlSchema.safeParse(undefined);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateProfileSchema", () => {
    it("displayNameのみの更新", () => {
      const result = updateProfileSchema.safeParse({
        displayName: "新しい名前",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe("新しい名前");
        expect(result.data.avatarUrl).toBeUndefined();
      }
    });

    it("avatarUrlのみの更新", () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: "https://example.com/new-avatar.png",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.avatarUrl).toBe(
          "https://example.com/new-avatar.png",
        );
        expect(result.data.displayName).toBeUndefined();
      }
    });

    it("両方の更新", () => {
      const result = updateProfileSchema.safeParse({
        displayName: "新しい名前",
        avatarUrl: "https://example.com/new-avatar.png",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe("新しい名前");
        expect(result.data.avatarUrl).toBe(
          "https://example.com/new-avatar.png",
        );
      }
    });

    it("空のオブジェクトは許可", () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("avatarUrlをnullに設定可能", () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.avatarUrl).toBe(null);
      }
    });

    it("無効なdisplayNameはエラー", () => {
      const result = updateProfileSchema.safeParse({
        displayName: "<script>alert(1)</script>",
      });
      expect(result.success).toBe(false);
    });

    it("無効なavatarUrlはエラー", () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: "http://example.com/avatar.png",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginArgsSchema", () => {
    it("有効なプロバイダーでのログイン引数", () => {
      const result = loginArgsSchema.safeParse({ provider: "google" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.provider).toBe("google");
      }
    });

    it("無効なプロバイダーはエラー", () => {
      const result = loginArgsSchema.safeParse({ provider: "invalid" });
      expect(result.success).toBe(false);
    });

    it("providerフィールドが必須", () => {
      const result = loginArgsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileArgsSchema", () => {
    it("有効な更新引数", () => {
      const result = updateProfileArgsSchema.safeParse({
        updates: { displayName: "新しい名前" },
      });
      expect(result.success).toBe(true);
    });

    it("updatesフィールドが必須", () => {
      const result = updateProfileArgsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("ネストしたバリデーションが機能する", () => {
      const result = updateProfileArgsSchema.safeParse({
        updates: { displayName: "<script>" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("linkProviderArgsSchema", () => {
    it("有効なプロバイダー連携引数", () => {
      const result = linkProviderArgsSchema.safeParse({ provider: "github" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.provider).toBe("github");
      }
    });

    it("無効なプロバイダーはエラー", () => {
      const result = linkProviderArgsSchema.safeParse({ provider: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  describe("safeValidate ユーティリティ", () => {
    it("成功時はsuccessがtrueでdataを返す", () => {
      const result = safeValidate(displayNameSchema, "Valid Name");
      expect(result.success).toBe(true);
      expect(result.data).toBe("Valid Name");
      expect(result.error).toBeUndefined();
    });

    it("失敗時はsuccessがfalseでerrorを返す", () => {
      const result = safeValidate(displayNameSchema, "");
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });

    it("複雑なスキーマでも機能する", () => {
      const result = safeValidate(updateProfileSchema, {
        displayName: "田中太郎",
        avatarUrl: "https://example.com/avatar.png",
      });
      expect(result.success).toBe(true);
    });

    it("最初のエラーメッセージを返す", () => {
      const result = safeValidate(displayNameSchema, "<script>");
      expect(result.success).toBe(false);
      expect(result.error).toBe(DISPLAY_NAME_ERRORS.invalidChars);
    });
  });

  describe("isValidProvider（後方互換性）", () => {
    it.each(["google", "github", "discord"])(
      "有効なプロバイダー: %s",
      (provider) => {
        expect(isValidProvider(provider)).toBe(true);
      },
    );

    it.each(["facebook", "twitter", "", null, undefined, 123])(
      "無効なプロバイダー: %s",
      (provider) => {
        expect(isValidProvider(provider)).toBe(false);
      },
    );
  });

  describe("定数エクスポート", () => {
    it("VALID_PROVIDERSが正しくエクスポートされている", () => {
      expect(VALID_PROVIDERS).toEqual(["google", "github", "discord"]);
    });

    it("DISPLAY_NAME_CONSTRAINTSが正しくエクスポートされている", () => {
      expect(DISPLAY_NAME_CONSTRAINTS.minLength).toBe(1);
      expect(DISPLAY_NAME_CONSTRAINTS.maxLength).toBe(50);
      expect(DISPLAY_NAME_CONSTRAINTS.pattern).toBeInstanceOf(RegExp);
    });

    it("DISPLAY_NAME_ERRORSが日本語メッセージを含む", () => {
      expect(DISPLAY_NAME_ERRORS.required).toContain("表示名");
      expect(DISPLAY_NAME_ERRORS.tooShort).toContain("表示名");
      expect(DISPLAY_NAME_ERRORS.tooLong).toContain("50文字");
      expect(DISPLAY_NAME_ERRORS.invalidChars).toContain("使用できない文字");
    });

    it("AVATAR_URL_ERRORSが日本語メッセージを含む", () => {
      expect(AVATAR_URL_ERRORS.invalidFormat).toContain("URL");
      expect(AVATAR_URL_ERRORS.httpsRequired).toContain("HTTPS");
    });
  });

  describe("型推論", () => {
    it("OAuthProvider型がスキーマから正しく推論される", () => {
      const provider: OAuthProvider = "google";
      const result = oauthProviderSchema.parse(provider);
      // TypeScriptコンパイル時に型チェックが行われる
      const _typeCheck: OAuthProvider = result;
      expect(_typeCheck).toBe("google");
    });

    it("DisplayName型がスキーマから正しく推論される", () => {
      const name: DisplayName = "田中太郎";
      const result = displayNameSchema.parse(name);
      const _typeCheck: DisplayName = result;
      expect(_typeCheck).toBe("田中太郎");
    });

    it("AvatarUrl型がnullを含む", () => {
      const url: AvatarUrl = null;
      const result = avatarUrlSchema.parse(url);
      const _typeCheck: AvatarUrl = result;
      expect(_typeCheck).toBe(null);
    });

    it("UpdateProfileInput型がオプショナルフィールドを持つ", () => {
      const input: UpdateProfileInput = {};
      const result = updateProfileSchema.parse(input);
      const _typeCheck: UpdateProfileInput = result;
      expect(_typeCheck).toEqual({});
    });

    it("LoginArgs型がproviderを持つ", () => {
      const args: LoginArgs = { provider: "github" };
      const result = loginArgsSchema.parse(args);
      const _typeCheck: LoginArgs = result;
      expect(_typeCheck.provider).toBe("github");
    });

    it("ValidationResult型が正しく機能する", () => {
      const successResult: ValidationResult<string> = {
        success: true,
        data: "test",
      };
      const failureResult: ValidationResult<string> = {
        success: false,
        error: "エラー",
      };
      expect(successResult.success).toBe(true);
      expect(failureResult.success).toBe(false);
    });
  });

  describe("セキュリティ要件", () => {
    it("displayNameでXSSベクトルがブロックされる", () => {
      const xssVectors = [
        "<script>",
        "javascript:",
        "onclick=",
        "onerror=",
        "<iframe>",
        "<object>",
        "<embed>",
        "<form>",
        "<input>",
        "<button>",
      ];

      xssVectors.forEach((vector) => {
        const result = displayNameSchema.safeParse(vector);
        expect(result.success).toBe(false);
      });
    });

    it("avatarUrlでプロトコルインジェクションがブロックされる", () => {
      const dangerousUrls = [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "vbscript:alert(1)",
        "file:///etc/passwd",
      ];

      dangerousUrls.forEach((url) => {
        const result = avatarUrlSchema.safeParse(url);
        expect(result.success).toBe(false);
      });
    });
  });
});
