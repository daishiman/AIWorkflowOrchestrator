---
id: TASK-2C
tier: 1
title: セキュリティパターン定義
phase: 2
depends_on: [TASK-1-1]
parallel_with: [TASK-2A, TASK-2B]
blocks: [TASK-3-1]
status: pending
priority: high
estimated_complexity: small
tags: [backend, shared, security]
---

# セキュリティパターン定義

## 概要

スキル実行時のセキュリティチェックに使用する危険コマンドパターン、保護パス、許可ツールホワイトリストを定義する。

## 入力

- specification.md のセキュリティセクション（7.1）
- execution-plan.md の Appendix B

## 出力

- `packages/shared/src/constants/security.ts`
- ユーティリティ関数

## 実装詳細

### 危険コマンドパターン

```typescript
export const DANGEROUS_PATTERNS = {
  BASH_COMMANDS: [
    // 破壊的コマンド
    "rm -rf",
    "rm -r",
    "> /dev/",
    "dd if=",
    "mkfs",

    // 権限昇格
    "sudo",
    "su -",
    "su ",

    // シェル操作
    "chmod 777",
    "chown root",
    "chattr",
    "setfacl",

    // コマンド置換（インジェクション防止）
    "$(",
    "`",

    // 危険なシェル起動
    "/bin/sh",
    "/bin/bash",
    "bash -c",
    "sh -c",

    // 評価・実行
    "eval ",
    "exec ",
    "source ",

    // スケジューラ操作
    "crontab",
    "at ",

    // フォークボム
    ":(){ :|:& };:",
  ] as const,

  PROTECTED_PATHS: [
    // システムディレクトリ
    "/etc/**",
    "/usr/**",
    "/var/**",
    "/sys/**",
    "/proc/**",
    "/boot/**",
    "/root/**",

    // シェル設定ファイル
    "**/.bashrc",
    "**/.bash_profile",
    "**/.bash_login",
    "**/.zshrc",
    "**/.zshenv",
    "**/.zprofile",
    "**/.profile",

    // 認証・鍵ファイル
    "~/.ssh/**",
    "~/.gnupg/**",

    // クラウド認証情報
    "~/.aws/**",
    "~/.azure/**",
    "~/.kube/**",
    "~/.config/gcloud/**",

    // アプリケーション認証情報
    "**/.env",
    "**/.env.local",
    "**/.env.production",
    "**/credentials.json",
    "**/secrets.json",
  ] as const,
} as const;
```

### 許可ツールホワイトリスト

```typescript
export const ALLOWED_TOOLS_WHITELIST = [
  "Read",
  "Write",
  "Edit",
  "Bash",
  "Glob",
  "Grep",
  "LS",
  "Task",
  "WebSearch",
  "WebFetch",
  "TodoWrite",
] as const;

export type AllowedTool = (typeof ALLOWED_TOOLS_WHITELIST)[number];
```

### ユーティリティ関数

```typescript
/**
 * コマンドが危険かどうかを判定
 */
export function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.BASH_COMMANDS.some((pattern) =>
    command.includes(pattern),
  );
}

/**
 * パスが保護されているかどうかを判定
 */
export function isProtectedPath(filePath: string): boolean {
  return DANGEROUS_PATTERNS.PROTECTED_PATHS.some((pattern) =>
    matchGlobPattern(filePath, pattern),
  );
}

/**
 * Globパターンマッチ（簡易版）
 */
export function matchGlobPattern(path: string, pattern: string): boolean {
  const homeDir = process.env.HOME || "";
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/~/g, homeDir) +
      "$",
  );
  return regex.test(path);
}

/**
 * 許可ツールを検証
 */
export function validateAllowedTools(tools: string[]): boolean {
  return tools.every((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  );
}

/**
 * 許可ツールをフィルタ（無効なツールを除外）
 */
export function filterAllowedTools(tools: string[]): AllowedTool[] {
  return tools.filter((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  ) as AllowedTool[];
}
```

## ファイル

| 操作 | パス                                                       |
| ---- | ---------------------------------------------------------- |
| 作成 | `packages/shared/src/constants/security.ts`                |
| 作成 | `packages/shared/src/constants/index.ts`                   |
| 修正 | `packages/shared/src/index.ts`                             |
| 作成 | `packages/shared/src/constants/__tests__/security.test.ts` |

## 依存パッケージ

なし（Node.js標準のみ）

## 完了条件

- [ ] `DANGEROUS_PATTERNS` 定数が定義されている
- [ ] `ALLOWED_TOOLS_WHITELIST` 定数が定義されている
- [ ] `isDangerousCommand()` が正しく判定する
- [ ] `isProtectedPath()` が正しく判定する
- [ ] `validateAllowedTools()` が正しく検証する
- [ ] `filterAllowedTools()` が正しくフィルタする
- [ ] 型エクスポートが追加されている
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("Security Patterns", () => {
  describe("isDangerousCommand", () => {
    it("should detect rm -rf");
    it("should detect sudo");
    it("should detect command substitution");
    it("should detect fork bomb");
    it("should allow safe commands");
  });

  describe("isProtectedPath", () => {
    it("should protect /etc");
    it("should protect ~/.ssh");
    it("should protect .env files");
    it("should allow normal paths");
  });

  describe("validateAllowedTools", () => {
    it("should accept valid tools");
    it("should reject invalid tools");
  });

  describe("filterAllowedTools", () => {
    it("should filter out invalid tools");
    it("should keep valid tools");
  });
});
```

## 参考資料

- [specification.md - 7. セキュリティ考慮事項](../specification.md)
- [execution-plan.md - Appendix B](../execution-plan.md)
