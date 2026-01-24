# Phase 2: 設計 成果物

## 実行日時

2026-01-24

## 1. ファイル構成設計 (Task 2-1)

### ディレクトリ構造

```
packages/shared/src/
├── constants/
│   ├── index.ts              # 定数エクスポート
│   ├── security.ts           # セキュリティパターン定義
│   └── __tests__/
│       └── security.test.ts  # 単体テスト
├── types/
│   └── skill.ts              # 既存（TASK-1-1）
│   └── agent-execution.ts    # 既存（簡易版DANGEROUS_PATTERNS）
└── index.ts                  # パッケージエクスポート（修正）
```

### ファイル責務

| ファイル                | 責務                                 |
| ----------------------- | ------------------------------------ |
| `constants/security.ts` | パターン定数・ユーティリティ関数定義 |
| `constants/index.ts`    | 定数モジュールのエクスポート         |
| `index.ts`              | パッケージ全体のエクスポート（追記） |

---

## 2. 定数設計 (Task 2-1)

### DANGEROUS_PATTERNS

```typescript
export const DANGEROUS_PATTERNS = {
  BASH_COMMANDS: [
    // 破壊的コマンド (5)
    "rm -rf",
    "rm -r",
    "> /dev/",
    "dd if=",
    "mkfs",

    // 権限昇格 (3)
    "sudo",
    "su -",
    "su ",

    // シェル操作 (4)
    "chmod 777",
    "chown root",
    "chattr",
    "setfacl",

    // コマンド置換 (2)
    "$(",
    "`",

    // 危険なシェル起動 (4)
    "/bin/sh",
    "/bin/bash",
    "bash -c",
    "sh -c",

    // 評価・実行 (3)
    "eval ",
    "exec ",
    "source ",

    // スケジューラ操作 (2)
    "crontab",
    "at ",

    // フォークボム (1)
    ":(){ :|:& };:",
  ] as const, // 計24項目

  PROTECTED_PATHS: [
    // システムディレクトリ (7)
    "/etc/**",
    "/usr/**",
    "/var/**",
    "/sys/**",
    "/proc/**",
    "/boot/**",
    "/root/**",

    // シェル設定ファイル (7)
    "**/.bashrc",
    "**/.bash_profile",
    "**/.bash_login",
    "**/.zshrc",
    "**/.zshenv",
    "**/.zprofile",
    "**/.profile",

    // 認証・鍵ファイル (2)
    "~/.ssh/**",
    "~/.gnupg/**",

    // クラウド認証情報 (4)
    "~/.aws/**",
    "~/.azure/**",
    "~/.kube/**",
    "~/.config/gcloud/**",

    // アプリケーション認証情報 (5)
    "**/.env",
    "**/.env.local",
    "**/.env.production",
    "**/credentials.json",
    "**/secrets.json",
  ] as const, // 計25項目
} as const;
```

---

## 3. 許可ツールホワイトリスト設計 (Task 2-2)

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
] as const; // 計11項目

export type AllowedTool = (typeof ALLOWED_TOOLS_WHITELIST)[number];
```

---

## 4. ユーティリティ関数シグネチャ設計 (Task 2-3)

```typescript
/**
 * コマンドが危険かどうかを判定
 */
export function isDangerousCommand(command: string): boolean;

/**
 * パスが保護されているかどうかを判定
 */
export function isProtectedPath(filePath: string): boolean;

/**
 * Globパターンマッチ（簡易版）
 */
export function matchGlobPattern(path: string, pattern: string): boolean;

/**
 * 許可ツールを検証
 */
export function validateAllowedTools(tools: string[]): boolean;

/**
 * 許可ツールをフィルタ（無効なツールを除外）
 */
export function filterAllowedTools(tools: string[]): AllowedTool[];
```

---

## 5. 関数実装アルゴリズム設計 (Task 2-4)

### isDangerousCommand

```typescript
export function isDangerousCommand(command: string): boolean {
  if (!command) return false;
  return DANGEROUS_PATTERNS.BASH_COMMANDS.some((pattern) =>
    command.includes(pattern),
  );
}
```

### isProtectedPath

```typescript
export function isProtectedPath(filePath: string): boolean {
  if (!filePath) return false;
  return DANGEROUS_PATTERNS.PROTECTED_PATHS.some((pattern) =>
    matchGlobPattern(filePath, pattern),
  );
}
```

### matchGlobPattern

```typescript
export function matchGlobPattern(path: string, pattern: string): boolean {
  const homeDir = process.env.HOME || "";

  // パターンを正規表現に変換
  let escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

  // ** と * の処理
  escapedPattern = escapedPattern
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");

  // ~ をホームディレクトリに置換
  escapedPattern = escapedPattern.replace(
    /~/g,
    homeDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  try {
    const regex = new RegExp(`^${escapedPattern}$`);
    return regex.test(path);
  } catch {
    return false;
  }
}
```

### validateAllowedTools

```typescript
export function validateAllowedTools(tools: string[]): boolean {
  return tools.every((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  );
}
```

### filterAllowedTools

```typescript
export function filterAllowedTools(tools: string[]): AllowedTool[] {
  return tools.filter((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  ) as AllowedTool[];
}
```

---

## 6. エクスポート設計 (Task 2-5)

### constants/index.ts

```typescript
export {
  DANGEROUS_PATTERNS,
  ALLOWED_TOOLS_WHITELIST,
  isDangerousCommand,
  isProtectedPath,
  matchGlobPattern,
  validateAllowedTools,
  filterAllowedTools,
} from "./security";

export type { AllowedTool } from "./security";
```

### src/index.ts への追加

```typescript
// 既存のエクスポートに追加
export * from "./constants";
```

---

## 7. 設計上の決定事項

### Globパターンマッチ

| 決定項目       | 選択肢                | 採用理由                         |
| -------------- | --------------------- | -------------------------------- |
| ライブラリ使用 | 自前実装 vs minimatch | 依存追加なし・必要機能のみで十分 |
| \*\* の解釈    | .\* (任意のパス)      | 標準的なGlobセマンティクス       |
| \* の解釈      | [^/]\* (単一階層)     | 標準的なGlobセマンティクス       |
| 大文字小文字   | 区別する              | ファイルシステムの標準動作       |

### エラーハンドリング

| ケース                    | 動作                    |
| ------------------------- | ----------------------- |
| command が空文字列        | false を返す            |
| filePath が空文字列       | false を返す            |
| process.env.HOME が未定義 | 空文字列として扱う      |
| tools が空配列            | true を返す（全て許可） |

---

## 8. 完了ステータス

| タスク                                     | 状態   |
| ------------------------------------------ | ------ |
| Task 2-1: 定数設計                         | ✅完了 |
| Task 2-2: 許可ツールホワイトリスト設計     | ✅完了 |
| Task 2-3: ユーティリティ関数シグネチャ設計 | ✅完了 |
| Task 2-4: 関数実装アルゴリズム設計         | ✅完了 |
| Task 2-5: エクスポート設計                 | ✅完了 |

**Phase 2: 設計 完了**
