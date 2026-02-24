# 実装ガイド - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 12                                  |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 実行日   | 2026-02-24                          |

---

# Part 1: 概念説明（中学生レベル）

## 「4つの名簿」のたとえ話

学校の部活動で、メンバーの連絡先を4冊のノートで管理しているとします：

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ ノートA   │  │ ノートB   │  │ ノートC   │  │ ノートD   │
│（公式名簿）│  │（教室用） │  │（練習用） │  │（先生用） │
│           │  │           │  │           │  │           │
│ 田中太郎  │  │ 田中太郎  │  │ 田中太郎  │  │ 田中太郎  │
│ 鈴木花子  │  │ 鈴木花子  │  │ 鈴木花子  │  │ 鈴木花子  │
│ 佐藤一郎  │  │ 佐藤一郎  │  │ ??? なし  │  │ 佐藤一郎  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

もし新しいメンバー「佐藤一郎」を公式名簿にだけ追加して、練習用ノートに書き忘れたら？ → **練習の時に連絡が届かなくなります！**

このプロジェクトでも同じことが起きます。プログラムの「部品リスト」が4か所に書かれていて、1か所だけ更新して他を忘れると、テストやビルドが壊れてしまいます。

## この仕組みがやっていること

**「名簿チェック係」** を作りました：

```
         ┌─────────────┐
         │  チェック係   │
         │（スクリプト） │
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    ↓           ↓           ↓
 ノートA ←→ ノートB  ノートA ←→ ノートC  ノートA ←→ ノートD
 (公式)     (教室)    (公式)     (練習)    (公式)     (先生)
    ↓           ↓           ↓
  一致？      一致？      一致？
    ↓           ↓           ↓
    ○           ×           ○
                │
         「練習用に佐藤一郎が
          書かれていません！」
```

公式名簿（ノートA）を基準にして、残りの3つが同じ内容かを確認します。足りない名前があれば「○○が書かれていません！」と教えてくれます。

## さらに便利にしたこと

以前は「教室用ノート」に1人1人手書きでコピーしていましたが、**自動コピー機**を導入しました。公式名簿を更新するだけで、教室用ノートに自動で反映されるようになりました。

## メリット

1. **書き忘れゼロ**: チェック係が自動で全ノートの不一致を見つけてくれる
2. **手間が減る**: 自動コピー機のおかげで、教室用ノートの手書き更新が不要になった（27人分の手書きを削減）
3. **安心して更新できる**: コード提出時に自動チェックが走るので、うっかりミスを防げる
4. **わかりやすいエラー**: 「○○が足りません」と具体的に教えてくれるので、修正箇所が一目瞭然

---

# Part 2: 開発者向け実装詳細

## アーキテクチャ概要

```
scripts/check-shared-module-sync.ts
├── 型定義: ExportEntry, CheckResult
├── 定数: CONFIG, CHECK_NAMES, PATTERNS
├── パーサー（4関数）
│   ├── parseExports()     ← package.json exports
│   ├── parsePaths()       ← tsconfig.json paths
│   ├── parseAliases()     ← vitest.config.ts alias（正規表現パース）
│   └── parseTypesVersions() ← package.json typesVersions
├── 変換ユーティリティ（3関数）
│   ├── toModuleKey()          "." → "@repo/shared"
│   ├── toSubpath()            "@repo/shared" → "."
│   └── toTypesVersionsKey()   "./xxx" → "xxx" | null
├── 汎用チェッカー
│   └── checkMapContainment()  ← DRY化された包含チェック
├── チェッカー（6関数）
│   ├── checkExportsVsPaths()
│   ├── checkPathsVsExports()
│   ├── checkExportsVsAliases()
│   ├── checkAliasesVsExports()
│   ├── checkExportsVsTypesVersions()
│   └── checkTypesVersionsVsExports()
├── レポーター
│   ├── formatReport()
│   └── printSummary()
└── main()
```

## 型定義

```typescript
export interface ExportEntry {
  types?: string;
  import?: string;
  require?: string;
  default?: string;
}

export interface CheckResult {
  checkName: string; // チェック名（例: "exports -> paths"）
  passed: boolean; // 合格/不合格
  missing: string[]; // 不足しているキーの一覧
}
```

## 定数

```typescript
export const CONFIG = {
  PACKAGE_JSON_PATH: "packages/shared/package.json",
  TSCONFIG_PATH: "apps/desktop/tsconfig.json",
  VITEST_CONFIG_PATH: "apps/desktop/vitest.config.ts",
  SHARED_PREFIX: "@repo/shared",
} as const;
```

## API 仕様

### パーサー関数

| 関数名               | 引数                       | 戻り値                     | 説明                                                                          |
| -------------------- | -------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `parseExports`       | `packageJsonPath: string`  | `Map<string, ExportEntry>` | exports フィールドを Map に変換。string 値は `{ import: value }` に正規化     |
| `parsePaths`         | `tsconfigPath: string`     | `Map<string, string[]>`    | `@repo/shared` プレフィックスの paths のみ抽出。ワイルドカード(\*) をスキップ |
| `parseAliases`       | `vitestConfigPath: string` | `Map<string, string>`      | 正規表現で `@repo/shared` alias を抽出。0件時に警告出力                       |
| `parseTypesVersions` | `packageJsonPath: string`  | `Map<string, string[]>`    | `typesVersions["*"]` を Map に変換                                            |

### チェッカー関数

| 関数名                        | source                     | target                     | keyTransform         | 備考                                      |
| ----------------------------- | -------------------------- | -------------------------- | -------------------- | ----------------------------------------- |
| `checkExportsVsPaths`         | `Map<string, ExportEntry>` | `Map<string, string[]>`    | `toModuleKey`        | exports の各エントリが paths に存在するか |
| `checkPathsVsExports`         | `Map<string, string[]>`    | `Map<string, ExportEntry>` | `toSubpath`          | paths の各エントリが exports に存在するか |
| `checkExportsVsAliases`       | `Map<string, ExportEntry>` | `Map<string, string>`      | `toModuleKey`        | alias 0件時は早期return でPASS            |
| `checkAliasesVsExports`       | `Map<string, string>`      | `Map<string, ExportEntry>` | `toSubpath`          | alias 0件時は早期return でPASS            |
| `checkExportsVsTypesVersions` | `Map<string, ExportEntry>` | `Map<string, string[]>`    | `toTypesVersionsKey` | "." はnull返却でスキップ                  |
| `checkTypesVersionsVsExports` | `Map<string, string[]>`    | `Map<string, ExportEntry>` | `(k) => \`./${k}\``  | typesVersionsキーを"./xxx"に変換          |

### 汎用関数

```typescript
function checkMapContainment(
  source: Map<string, unknown>,
  target: Map<string, unknown>,
  checkName: string,
  keyTransform: (key: string) => string | null = (k) => k,
): CheckResult;
```

`source` の各キーを `keyTransform` で変換し、`target` に存在するか検証する。`keyTransform` が `null` を返すキーはスキップされる（typesVersions の `"."` エントリ対応）。

## vitest.config.ts の変更

**変更前:**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@repo/shared": resolve(__dirname, "../../packages/shared/index.ts"),
      "@repo/shared/core": resolve(
        __dirname,
        "../../packages/shared/core/index.ts",
      ),
      // ... 27エントリの手動定義
    },
  },
});
```

**変更後:**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@renderer": resolve(__dirname, "src/renderer"),
      "@main": resolve(__dirname, "src/main"),
      "@anthropic-ai/claude-agent-sdk": resolve(
        __dirname,
        "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
      ),
    },
  },
});
```

`@repo/shared` 系の27個の手動alias定義を削除し、`vite-tsconfig-paths` プラグインが `tsconfig.json` の `paths` から自動解決する。

## コマンド使い方

```bash
# 同期チェック実行
pnpm check:module-sync

# 直接実行
pnpm check:module-sync
```

オプションはなし。実行すると6つのチェックを順番に実行し、結果を標準出力に表示する。不整合があれば `process.exitCode = 1` を設定する。

## エラーメッセージと対処法

| エラーメッセージ                                                                     | 原因                                                                             | 対処法                                                                                                 |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Check N: exports -> paths (FAILED) Missing: ./xxx`                                  | `package.json` の exports に `./xxx` があるが tsconfig.json の paths にない      | `apps/desktop/tsconfig.json` の `compilerOptions.paths` に `@repo/shared/xxx` を追加する               |
| `Check N: paths -> exports (FAILED) Missing: @repo/shared/xxx`                       | tsconfig.json の paths に `@repo/shared/xxx` があるが exports にない             | `packages/shared/package.json` の `exports` に `"./xxx"` を追加するか、不要なら paths から削除する     |
| `Check N: exports -> typesVersions (FAILED) Missing: ./xxx`                          | exports に `./xxx` があるが typesVersions にない                                 | `packages/shared/package.json` の `typesVersions["*"]` に `"xxx"` を追加する                           |
| `Check N: typesVersions -> exports (FAILED) Missing: xxx`                            | typesVersions に `xxx` があるが exports にない                                   | `packages/shared/package.json` の `exports` に `"./xxx"` を追加するか、不要なら typesVersions から削除 |
| `Warning: vitest.config.ts contains "alias" but no @repo/shared aliases were parsed` | vitest.config.ts に alias セクションがあるが @repo/shared パターンにマッチしない | vite-tsconfig-paths プラグイン使用時は正常動作（手動alias削除済み）                                    |

## 新しいサブパスを追加する手順

`@repo/shared` に新しいサブパス（例: `./utils`）を追加する場合:

### Step 1: ソースファイル作成

```bash
mkdir -p packages/shared/src/utils
echo 'export const helper = () => "hello";' > packages/shared/src/utils/index.ts
```

### Step 2: package.json の exports に追加

```json
// packages/shared/package.json
{
  "exports": {
    "./utils": {
      "types": "./dist/src/utils/index.d.ts",
      "import": "./dist/src/utils/index.js"
    }
  }
}
```

### Step 3: tsconfig.json の paths に追加

```json
// apps/desktop/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@repo/shared/utils": ["../../packages/shared/src/utils/index.ts"]
    }
  }
}
```

### Step 4: typesVersions に追加

```json
// packages/shared/package.json
{
  "typesVersions": {
    "*": {
      "utils": ["./dist/src/utils/index.d.ts"]
    }
  }
}
```

### Step 5: 同期チェック実行

```bash
pnpm check:module-sync
# → ALL 6 CHECKS PASSED であることを確認
```

### Step 6: テスト実行

```bash
cd apps/desktop && pnpm vitest run
# → @repo/shared/utils の import が正常に解決されることを確認
```

## テスト構成

| ファイル                                    | テスト数 | カバー範囲                             |
| ------------------------------------------- | -------- | -------------------------------------- |
| `check-shared-module-sync.test.ts`          | 43件     | パーサー、チェッカー、レポーター、統合 |
| `check-shared-module-sync-extended.test.ts` | 13件     | typesVersions、alias 0件、エッジケース |
| `vitest-tsconfig-paths-plugin.test.ts`      | 4件      | プラグイン導入検証                     |
| **合計**                                    | **60件** |                                        |

カバレッジ: Line 98.57% / Branch 97.46% / Function 100%
