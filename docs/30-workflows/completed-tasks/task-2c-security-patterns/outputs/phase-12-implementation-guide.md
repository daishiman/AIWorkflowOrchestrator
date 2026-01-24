# セキュリティパターン定義 実装ガイド

## Part 1: 概念的説明（初学者・非技術者向け）

### 概要

スキル実行時に危険な操作を防ぐためのセキュリティパターンを定義しています。

### 何ができるか

- 危険なコマンド（`rm -rf`, `sudo` など）の検出
- 保護すべきパス（`/etc`, `~/.ssh` など）の検出
- 許可されたツールの検証

### なぜ必要か

AIがスキルを実行する際、意図しない破壊的な操作を防ぐ必要があります。
このモジュールは、実行前に危険な操作をブロックするための基盤を提供します。

### 対象ユースケース

1. **PreToolUseフック**: ツール実行前のセキュリティチェック
2. **スキル検証**: スキル定義の許可ツールリスト検証
3. **ファイル操作ガード**: 保護パスへの書き込み防止

---

## Part 2: 技術的詳細（開発者向け）

### インストール・設定

追加の依存関係は不要です。`@repo/shared` パッケージに含まれています。

### インポート

```typescript
import {
  DANGEROUS_PATTERNS,
  ALLOWED_TOOLS_WHITELIST,
  isDangerousCommand,
  isProtectedPath,
  matchGlobPattern,
  validateAllowedTools,
  filterAllowedTools,
  type AllowedTool,
} from "@repo/shared/constants";
```

### 定数リファレンス

#### DANGEROUS_PATTERNS

危険なコマンドパターンと保護パスの定義。

```typescript
DANGEROUS_PATTERNS.BASH_COMMANDS; // 24個の危険コマンドパターン
DANGEROUS_PATTERNS.PROTECTED_PATHS; // 25個の保護パスパターン
```

**BASH_COMMANDS（24パターン）**:

| カテゴリ         | パターン例                          |
| ---------------- | ----------------------------------- | ------- |
| 破壊的コマンド   | `rm -rf`, `rm -r`, `dd if=`, `mkfs` |
| 権限昇格         | `sudo`, `su -`, `su `               |
| シェル操作       | `chmod 777`, `chown root`           |
| コマンド置換     | `$(`, `` ` ``                       |
| 危険なシェル起動 | `/bin/sh`, `bash -c`                |
| 評価・実行       | `eval `, `exec `, `source `         |
| スケジューラ     | `crontab`, `at `                    |
| フォークボム     | `:(){ :                             | :& };:` |

**PROTECTED_PATHS（25パターン）**:

| カテゴリ             | パターン例                       |
| -------------------- | -------------------------------- |
| システムディレクトリ | `/etc/**`, `/usr/**`, `/var/**`  |
| シェル設定ファイル   | `**/.bashrc`, `**/.zshrc`        |
| 認証・鍵ファイル     | `~/.ssh/**`, `~/.gnupg/**`       |
| クラウド認証情報     | `~/.aws/**`, `~/.kube/**`        |
| アプリケーション認証 | `**/.env`, `**/credentials.json` |

#### ALLOWED_TOOLS_WHITELIST

許可されたツールのリスト（11ツール）:

```typescript
const tools = [
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
];
```

### API リファレンス

#### isDangerousCommand(command: string): boolean

コマンドに危険なパターンが含まれているか判定します。

```typescript
isDangerousCommand("rm -rf /"); // true
isDangerousCommand("ls -la"); // false
isDangerousCommand("cat file.txt"); // false (単語境界を考慮)
isDangerousCommand("sudo apt-get update"); // true
```

**特徴**:

- 単語境界を考慮（`cat`の`at`を誤検出しない）
- 空文字列は`false`を返す

#### isProtectedPath(filePath: string): boolean

パスが保護対象かどうか判定します。

```typescript
isProtectedPath("/etc/passwd"); // true
isProtectedPath("~/.ssh/id_rsa"); // true
isProtectedPath("/home/user/.bashrc"); // true
isProtectedPath("/tmp/test.txt"); // false
```

**特徴**:

- Globパターン（`**`, `*`, `~`）をサポート
- `~`はホームディレクトリに展開

#### matchGlobPattern(path: string, pattern: string): boolean

パスがGlobパターンにマッチするか判定します。

```typescript
matchGlobPattern("/etc/passwd", "/etc/**"); // true
matchGlobPattern("/home/user/.bashrc", "**/.bashrc"); // true
matchGlobPattern("/tmp/test", "/etc/**"); // false
```

**サポートパターン**:

- `**`: 任意の深さのパスにマッチ
- `*`: 単一階層にマッチ
- `~`: ホームディレクトリに展開

#### validateAllowedTools(tools: readonly string[]): boolean

ツールリストが全て許可リストに含まれるか検証します。

```typescript
validateAllowedTools(["Read", "Write"]); // true
validateAllowedTools(["Read", "Unknown"]); // false
validateAllowedTools([]); // true (空配列は全て許可)
```

#### filterAllowedTools(tools: readonly string[]): AllowedTool[]

許可されたツールのみをフィルタリングします。

```typescript
filterAllowedTools(["Read", "Invalid", "Write"]); // ["Read", "Write"]
filterAllowedTools(["Unknown"]); // []
```

### 型リファレンス

#### AllowedTool

許可されたツールの型。`ALLOWED_TOOLS_WHITELIST`から自動推論されます。

```typescript
type AllowedTool =
  | "Read"
  | "Write"
  | "Edit"
  | "Bash"
  | "Glob"
  | "Grep"
  | "LS"
  | "Task"
  | "WebSearch"
  | "WebFetch"
  | "TodoWrite";
```

### 使用例

#### PreToolUseフックでの使用

```typescript
import { isDangerousCommand, isProtectedPath } from "@repo/shared/constants";

function preToolUseHook(toolName: string, args: Record<string, unknown>) {
  if (toolName === "Bash") {
    const command = args.command as string;
    if (isDangerousCommand(command)) {
      throw new Error(`Dangerous command blocked: ${command}`);
    }
  }

  if (toolName === "Write" || toolName === "Edit") {
    const filePath = args.file_path as string;
    if (isProtectedPath(filePath)) {
      throw new Error(`Protected path blocked: ${filePath}`);
    }
  }
}
```

#### スキル定義の検証

```typescript
import {
  validateAllowedTools,
  filterAllowedTools,
} from "@repo/shared/constants";

function validateSkillDefinition(skill: { allowedTools: string[] }) {
  if (!validateAllowedTools(skill.allowedTools)) {
    const validTools = filterAllowedTools(skill.allowedTools);
    console.warn(
      `Invalid tools removed. Valid tools: ${validTools.join(", ")}`,
    );
  }
}
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
