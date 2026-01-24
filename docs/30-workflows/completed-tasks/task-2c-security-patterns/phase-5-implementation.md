# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| フェーズ     | 5                              |
| フェーズ名   | 実装                           |
| 目的         | TDD: Green（テストを通す実装） |
| 前提フェーズ | Phase 4: テスト作成            |
| 次フェーズ   | Phase 6: テスト拡充            |
| 想定成果物   | security.ts, index.ts          |

---

## 1. 目的

Phase 4 で作成したテストを全てパスさせる実装を行う。TDDのGreenフェーズとして、最小限の実装でテストを通す。

---

## 2. 実行タスク

### Task 5-1: ディレクトリ作成

**目的**: constants ディレクトリを作成する

**手順**:

1. `packages/shared/src/constants/` ディレクトリを作成
2. `packages/shared/src/constants/__tests__/` ディレクトリを作成

```bash
mkdir -p packages/shared/src/constants/__tests__
```

### Task 5-2: security.ts 実装

**目的**: セキュリティパターン定数とユーティリティ関数を実装する

**ファイル**: `packages/shared/src/constants/security.ts`

````typescript
/**
 * セキュリティパターン定義
 * スキル実行時のセキュリティチェックに使用
 *
 * @module constants/security
 */

/**
 * 危険コマンドパターンと保護パスの定義
 * PreToolUseフックでセキュリティチェックに使用
 */
export const DANGEROUS_PATTERNS = {
  /**
   * 危険なBashコマンドパターン
   * これらのパターンを含むコマンドはブロックされる
   */
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

  /**
   * 保護対象パスパターン（Glob形式）
   * これらのパスへの書き込みはブロックされる
   */
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

/**
 * 許可されたツールのホワイトリスト
 * これ以外のツールはスキル実行で使用不可
 */
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

/**
 * 許可されたツールの型
 * ALLOWED_TOOLS_WHITELIST から自動推論
 */
export type AllowedTool = (typeof ALLOWED_TOOLS_WHITELIST)[number];

/**
 * コマンドが危険かどうかを判定
 *
 * @param command - 検査対象のコマンド文字列
 * @returns 危険なパターンを含む場合はtrue
 *
 * @example
 * ```typescript
 * isDangerousCommand("rm -rf /"); // true
 * isDangerousCommand("ls -la");   // false
 * ```
 */
export function isDangerousCommand(command: string): boolean {
  if (!command) return false;

  return DANGEROUS_PATTERNS.BASH_COMMANDS.some((pattern) =>
    command.includes(pattern)
  );
}

/**
 * Globパターンマッチ（簡易版）
 *
 * @param path - 検査対象のパス
 * @param pattern - Globパターン
 * @returns マッチする場合はtrue
 *
 * @remarks
 * - ** は任意のパスにマッチ
 * - * は単一階層にマッチ
 * - ~ はホームディレクトリに展開
 *
 * @example
 * ```typescript
 * matchGlobPattern("/etc/passwd", "/etc/**");    // true
 * matchGlobPattern("/home/user/.bashrc", "**/.bashrc"); // true
 * ```
 */
export function matchGlobPattern(path: string, pattern: string): boolean {
  const homeDir = process.env.HOME || "";

  // パターンを正規表現に変換
  // 1. 特殊文字をエスケープ（ただし * は除く）
  // 2. ** を .* に置換（任意のパス）
  // 3. * を [^/]* に置換（単一階層）
  // 4. ~ をホームディレクトリに置換
  let escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&"); // 特殊文字エスケープ

  // ** と * の順序に注意: 先に ** を処理
  escapedPattern = escapedPattern
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");

  // ~ をホームディレクトリに置換
  escapedPattern = escapedPattern.replace(
    /~/g,
    homeDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  try {
    const regex = new RegExp(`^${escapedPattern}$`);
    return regex.test(path);
  } catch {
    // 無効な正規表現の場合はマッチしない
    return false;
  }
}

/**
 * パスが保護されているかどうかを判定
 *
 * @param filePath - 検査対象のファイルパス
 * @returns 保護対象パスの場合はtrue
 *
 * @example
 * ```typescript
 * isProtectedPath("/etc/passwd");      // true
 * isProtectedPath("~/.ssh/id_rsa");    // true
 * isProtectedPath("/home/user/code");  // false
 * ```
 */
export function isProtectedPath(filePath: string): boolean {
  if (!filePath) return false;

  return DANGEROUS_PATTERNS.PROTECTED_PATHS.some((pattern) =>
    matchGlobPattern(filePath, pattern)
  );
}

/**
 * 許可ツールを検証
 *
 * @param tools - 検証対象のツール名配列
 * @returns 全てのツールが許可リストに含まれる場合はtrue
 *
 * @example
 * ```typescript
 * validateAllowedTools(["Read", "Write"]); // true
 * validateAllowedTools(["Unknown"]);       // false
 * ```
 */
export function validateAllowedTools(tools: string[]): boolean {
  return tools.every((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool)
  );
}

/**
 * 許可ツールをフィルタ（無効なツールを除外）
 *
 * @param tools - フィルタ対象のツール名配列
 * @returns 許可リストに含まれるツールのみの配列
 *
 * @example
 * ```typescript
 * filterAllowedTools(["Read", "Unknown", "Write"]);
 * // ["Read", "Write"]
 * ```
 */
export function filterAllowedTools(tools: string[]): AllowedTool[] {
  return tools.filter((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool)
  ) as AllowedTool[];
}
````

### Task 5-3: constants/index.ts 作成

**目的**: 定数モジュールのエクスポートを設定する

**ファイル**: `packages/shared/src/constants/index.ts`

```typescript
/**
 * 定数モジュール
 *
 * @module constants
 */

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

### Task 5-4: src/index.ts 更新

**目的**: パッケージエクスポートにconstantsを追加する

**ファイル**: `packages/shared/src/index.ts`

```typescript
// 既存のエクスポートに追加
export * from "./constants";
```

### Task 5-5: テスト実行・確認

**目的**: 実装したコードがテストを全てパスすることを確認する

**手順**:

```bash
# テスト実行
pnpm --filter @repo/shared test -- --run

# ビルド確認
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/shared typecheck
```

**期待結果**:

- [ ] 全テストがパス（Green状態）
- [ ] ビルドが成功
- [ ] 型チェックがパス

---

## 3. 実装チェックリスト

### 3.1 定数

| 項目                                      | 状態 |
| ----------------------------------------- | ---- |
| DANGEROUS_PATTERNS.BASH_COMMANDS 18項目   | [ ]  |
| DANGEROUS_PATTERNS.PROTECTED_PATHS 15項目 | [ ]  |
| ALLOWED_TOOLS_WHITELIST 11項目            | [ ]  |
| AllowedTool 型定義                        | [ ]  |

### 3.2 関数

| 項目                   | 状態 |
| ---------------------- | ---- |
| isDangerousCommand()   | [ ]  |
| isProtectedPath()      | [ ]  |
| matchGlobPattern()     | [ ]  |
| validateAllowedTools() | [ ]  |
| filterAllowedTools()   | [ ]  |

### 3.3 エクスポート

| 項目                    | 状態 |
| ----------------------- | ---- |
| constants/index.ts 作成 | [ ]  |
| src/index.ts 更新       | [ ]  |

---

## 4. 参照資料

| 資料名     | パス                                                           |
| ---------- | -------------------------------------------------------------- |
| 設計書     | `./phase-2-design.md`                                          |
| テスト     | `./phase-4-test-creation.md`                                   |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md` |

---

## 5. 完了条件

- [ ] Task 5-1 完了: ディレクトリ作成
- [ ] Task 5-2 完了: security.ts 実装
- [ ] Task 5-3 完了: constants/index.ts 作成
- [ ] Task 5-4 完了: src/index.ts 更新
- [ ] Task 5-5 完了: テスト実行・確認
- [ ] 全テストがパス（Green状態）
- [ ] ビルドが成功
- [ ] 型チェックがパス

---

## 6. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 7. 成果物

| 成果物             | パス                                        | 状態     |
| ------------------ | ------------------------------------------- | -------- |
| セキュリティ定数   | `packages/shared/src/constants/security.ts` | 作成待ち |
| 定数index          | `packages/shared/src/constants/index.ts`    | 作成待ち |
| sharedエクスポート | `packages/shared/src/index.ts`              | 更新待ち |

---

## 8. TDD 検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run

# 確認項目
# - [ ] テストが全てパスすることを確認（Green状態）
```

---

## 9. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 10. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 5-1: ディレクトリ作成
2. Task 5-2: security.ts 実装
3. Task 5-3: constants/index.ts 作成
4. Task 5-4: src/index.ts 更新
5. Task 5-5: テスト実行・確認
6. TDD 検証（Green 状態確認）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
