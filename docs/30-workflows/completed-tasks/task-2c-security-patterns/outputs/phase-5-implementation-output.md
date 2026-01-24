# Phase 5: 実装（TDD: Green）成果物

## 実行日時

2026-01-24

## 1. ディレクトリ作成 (Task 5-1)

| ディレクトリ                               | 状態                        |
| ------------------------------------------ | --------------------------- |
| `packages/shared/src/constants/`           | ✅作成済み（Phase 4で作成） |
| `packages/shared/src/constants/__tests__/` | ✅作成済み（Phase 4で作成） |

---

## 2. security.ts 実装 (Task 5-2)

### ファイル情報

- **パス**: `packages/shared/src/constants/security.ts`
- **行数**: 約260行
- **関数数**: 5関数
- **定数**: 2定数 + 1型

### 実装内容

#### DANGEROUS_PATTERNS

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

#### ALLOWED_TOOLS_WHITELIST

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

#### ユーティリティ関数

| 関数                   | 実装状態 | 備考                                   |
| ---------------------- | -------- | -------------------------------------- |
| isDangerousCommand()   | ✅完了   | 単語境界チェック対応（at, su, eval等） |
| isProtectedPath()      | ✅完了   | matchGlobPatternを使用                 |
| matchGlobPattern()     | ✅完了   | \*_, _, ~ のGlob展開対応               |
| validateAllowedTools() | ✅完了   | every + includes                       |
| filterAllowedTools()   | ✅完了   | filter + includes                      |

### 実装上の工夫

#### isDangerousCommand の単語境界対応

`at ` や `su ` などの短いパターンが `cat file.txt` のような無関係なコマンドにマッチしないよう、単語境界チェックを実装:

```typescript
const WORD_BOUNDARY_PATTERNS = [
  "at ",
  "su ",
  "su -",
  "eval ",
  "exec ",
  "source ",
];

if (WORD_BOUNDARY_PATTERNS.includes(pattern)) {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(?:^|[\\s;|&])${escapedPattern}`);
  return regex.test(command);
}
```

---

## 3. constants/index.ts 作成 (Task 5-3)

### ファイル情報

- **パス**: `packages/shared/src/constants/index.ts`

### エクスポート内容

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

---

## 4. パッケージ設定更新 (Task 5-4)

### tsup.config.ts

```typescript
// entry配列に追加
"src/constants/index.ts",
```

### package.json

```json
"./constants": {
  "types": "./dist/src/constants/index.d.ts",
  "import": "./dist/src/constants/index.js"
}
```

---

## 5. テスト実行・確認 (Task 5-5)

### テスト結果

```
 RUN  v2.1.9

 ✓ src/constants/__tests__/security.test.ts (70 tests) 11ms

 Test Files  1 passed (1)
      Tests  70 passed (70)
```

### ビルド結果

```
ESM dist/src/constants/index.js                        3.07 KB
DTS dist/src/constants/index.d.ts                    3.05 KB
ESM ⚡️ Build success in 723ms
DTS ⚡️ Build success in 27695ms
```

### 型チェック結果

```
> tsc --noEmit
(no errors)
```

---

## 6. 実装チェックリスト

### 6.1 定数

| 項目                                      | 状態   |
| ----------------------------------------- | ------ |
| DANGEROUS_PATTERNS.BASH_COMMANDS 24項目   | ✅完了 |
| DANGEROUS_PATTERNS.PROTECTED_PATHS 25項目 | ✅完了 |
| ALLOWED_TOOLS_WHITELIST 11項目            | ✅完了 |
| AllowedTool 型定義                        | ✅完了 |

### 6.2 関数

| 項目                   | 状態   |
| ---------------------- | ------ |
| isDangerousCommand()   | ✅完了 |
| isProtectedPath()      | ✅完了 |
| matchGlobPattern()     | ✅完了 |
| validateAllowedTools() | ✅完了 |
| filterAllowedTools()   | ✅完了 |

### 6.3 エクスポート

| 項目                    | 状態   |
| ----------------------- | ------ |
| constants/index.ts 作成 | ✅完了 |
| tsup.config.ts 更新     | ✅完了 |
| package.json 更新       | ✅完了 |

---

## 7. 完了ステータス

| タスク                       | 状態   |
| ---------------------------- | ------ |
| Task 5-1: ディレクトリ作成   | ✅完了 |
| Task 5-2: security.ts 実装   | ✅完了 |
| Task 5-3: constants/index.ts | ✅完了 |
| Task 5-4: パッケージ設定更新 | ✅完了 |
| Task 5-5: テスト実行・確認   | ✅完了 |
| 全テストパス（Green状態）    | ✅確認 |
| ビルド成功                   | ✅確認 |
| 型チェックパス               | ✅確認 |

**Phase 5: 実装（TDD: Green）完了**

### 次のフェーズ

Phase 6: テスト拡充 へ進む
