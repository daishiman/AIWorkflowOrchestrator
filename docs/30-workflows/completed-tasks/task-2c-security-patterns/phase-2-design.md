# Phase 2: 設計

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| フェーズ     | 2                           |
| フェーズ名   | 設計                        |
| 目的         | アーキテクチャ・詳細設計    |
| 前提フェーズ | Phase 1: 要件定義           |
| 次フェーズ   | Phase 3: 設計レビューゲート |
| 想定成果物   | 設計書                      |

---

## 1. 目的

セキュリティパターン定義の詳細設計を行い、ファイル構成・型定義・関数シグネチャを決定する。

---

## 2. ファイル構成設計

### 2.1 ディレクトリ構造

```
packages/shared/src/
├── constants/
│   ├── index.ts              # 定数エクスポート
│   ├── security.ts           # セキュリティパターン定義
│   └── __tests__/
│       └── security.test.ts  # 単体テスト
├── types/
│   └── skill.ts              # 既存（TASK-1-1）
└── index.ts                  # パッケージエクスポート（修正）
```

### 2.2 ファイル責務

| ファイル                | 責務                                 |
| ----------------------- | ------------------------------------ |
| `constants/security.ts` | パターン定数・ユーティリティ関数定義 |
| `constants/index.ts`    | 定数モジュールのエクスポート         |
| `index.ts`              | パッケージ全体のエクスポート（追記） |

---

## 3. 実行タスク

### Task 2-1: 定数設計

**目的**: DANGEROUS_PATTERNS と ALLOWED_TOOLS_WHITELIST の型定義を設計する

**設計**:

```typescript
// packages/shared/src/constants/security.ts

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
```

### Task 2-2: 許可ツールホワイトリスト設計

**目的**: ALLOWED_TOOLS_WHITELIST と AllowedTool 型を設計する

**設計**:

```typescript
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
```

### Task 2-3: ユーティリティ関数設計

**目的**: セキュリティチェック用ユーティリティ関数のシグネチャを設計する

**設計**:

```typescript
/**
 * コマンドが危険かどうかを判定
 * @param command 検査対象のコマンド文字列
 * @returns 危険なパターンを含む場合はtrue
 */
export function isDangerousCommand(command: string): boolean;

/**
 * パスが保護されているかどうかを判定
 * @param filePath 検査対象のファイルパス
 * @returns 保護対象パスの場合はtrue
 */
export function isProtectedPath(filePath: string): boolean;

/**
 * Globパターンマッチ（簡易版）
 * @param path 検査対象のパス
 * @param pattern Globパターン
 * @returns マッチする場合はtrue
 */
export function matchGlobPattern(path: string, pattern: string): boolean;

/**
 * 許可ツールを検証
 * @param tools 検証対象のツール名配列
 * @returns 全てのツールが許可リストに含まれる場合はtrue
 */
export function validateAllowedTools(tools: string[]): boolean;

/**
 * 許可ツールをフィルタ（無効なツールを除外）
 * @param tools フィルタ対象のツール名配列
 * @returns 許可リストに含まれるツールのみの配列
 */
export function filterAllowedTools(tools: string[]): AllowedTool[];
```

### Task 2-4: 関数実装設計

**目的**: 各ユーティリティ関数の実装アルゴリズムを設計する

**isDangerousCommand 実装**:

```typescript
export function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.BASH_COMMANDS.some((pattern) =>
    command.includes(pattern),
  );
}
```

**isProtectedPath 実装**:

```typescript
export function isProtectedPath(filePath: string): boolean {
  return DANGEROUS_PATTERNS.PROTECTED_PATHS.some((pattern) =>
    matchGlobPattern(filePath, pattern),
  );
}
```

**matchGlobPattern 実装**:

```typescript
export function matchGlobPattern(path: string, pattern: string): boolean {
  const homeDir = process.env.HOME || "";

  // パターンを正規表現に変換
  // 1. 特殊文字をエスケープ（ただし * と ** は除く）
  // 2. ** を .* に置換（任意のパス）
  // 3. * を [^/]* に置換（単一階層）
  // 4. ~ をホームディレクトリに置換
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // 特殊文字エスケープ
    .replace(/\\\*\\\*/g, ".*") // ** → .*
    .replace(/\\\*/g, "[^/]*") // * → [^/]*
    .replace(/~/g, homeDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // ~ → HOME

  const regex = new RegExp(`^${escapedPattern}$`);
  return regex.test(path);
}
```

**validateAllowedTools 実装**:

```typescript
export function validateAllowedTools(tools: string[]): boolean {
  return tools.every((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  );
}
```

**filterAllowedTools 実装**:

```typescript
export function filterAllowedTools(tools: string[]): AllowedTool[] {
  return tools.filter((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  ) as AllowedTool[];
}
```

### Task 2-5: エクスポート設計

**目的**: モジュールエクスポート構成を設計する

**constants/index.ts**:

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

**src/index.ts への追加**:

```typescript
// 既存のエクスポートに追加
export * from "./constants";
```

---

## 4. 設計上の決定事項

### 4.1 Glob パターンマッチの実装

| 決定項目       | 選択肢                | 採用理由                         |
| -------------- | --------------------- | -------------------------------- |
| ライブラリ使用 | 自前実装 vs minimatch | 依存追加なし・必要機能のみで十分 |
| \*\* の解釈    | .\* (任意のパス)      | 標準的なGlobセマンティクス       |
| \* の解釈      | [^/]\* (単一階層)     | 標準的なGlobセマンティクス       |
| 大文字小文字   | 区別する              | ファイルシステムの標準動作       |

### 4.2 エラーハンドリング

| ケース                    | 動作                    |
| ------------------------- | ----------------------- |
| command が空文字列        | false を返す            |
| filePath が空文字列       | false を返す            |
| process.env.HOME が未定義 | 空文字列として扱う      |
| tools が空配列            | true を返す（全て許可） |

---

## 5. 参照資料

| 資料名     | パス                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md`                   |
| タスク定義 | `docs/30-workflows/skill-import-agent-system/tasks/task-2c-security-patterns.md` |

---

## 6. 完了条件

- [ ] Task 2-1 完了: 定数設計
- [ ] Task 2-2 完了: 許可ツールホワイトリスト設計
- [ ] Task 2-3 完了: ユーティリティ関数シグネチャ設計
- [ ] Task 2-4 完了: 関数実装アルゴリズム設計
- [ ] Task 2-5 完了: エクスポート設計
- [ ] 設計上の決定事項が文書化されている

---

## 7. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 8. 成果物

| 成果物 | パス                                  | 状態 |
| ------ | ------------------------------------- | ---- |
| 設計書 | このドキュメント（phase-2-design.md） | 完了 |

---

## 9. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 10. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 2-1: 定数設計
3. Task 2-2: 許可ツールホワイトリスト設計
4. Task 2-3: ユーティリティ関数シグネチャ設計
5. Task 2-4: 関数実装アルゴリズム設計
6. Task 2-5: エクスポート設計
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
