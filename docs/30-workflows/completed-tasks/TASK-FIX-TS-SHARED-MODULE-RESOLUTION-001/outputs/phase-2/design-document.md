# Phase 2 成果物: 設計書

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| タスク ID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Phase     | 2 — 設計                                 |
| 作成日    | 2026-02-20                               |
| Issue     | #837                                     |

---

## 1. tsconfig paths マッピング設計

### 設計方針

`apps/desktop/tsconfig.json` に `@repo/shared` の全サブパスに対応する paths マッピングを追加する。TypeScript コンパイラが `dist/` を経由せずソースファイル（`.ts`）を直接参照できるようにする。

### 定義順序の原則

**具体的なパスから汎用的なパスの順**で定義する。TypeScript は paths を上から順に評価し、最初にマッチしたものを使用する。

例:

- `@repo/shared/types/llm/schemas` → 先に定義（具体的）
- `@repo/shared/types/llm` → 後に定義（汎用的）
- `@repo/shared/types` → 最後に定義（最も汎用的）

### 全27エントリの paths マッピング

```jsonc
// apps/desktop/tsconfig.json の compilerOptions.paths に追加
{
  // 既存のマッピング（維持）
  "@renderer/*": ["src/renderer/*"],
  "@/*": ["src/*"],

  // --- @repo/shared サブパスマッピング（27エントリ） ---

  // infrastructure 系（4エントリ、最も深いパスから）
  "@repo/shared/infrastructure/ai/apiKeyValidator": [
    "../../packages/shared/infrastructure/ai/apiKeyValidator.ts",
  ],
  "@repo/shared/infrastructure/auth": [
    "../../packages/shared/infrastructure/auth/index.ts",
  ],
  "@repo/shared/infrastructure/database": [
    "../../packages/shared/infrastructure/database/index.ts",
  ],
  "@repo/shared/infrastructure": [
    "../../packages/shared/infrastructure/index.ts",
  ],

  // services 系（4エントリ）
  "@repo/shared/services/history/history-service": [
    "../../packages/shared/src/services/history/history-service.ts",
  ],
  "@repo/shared/services/history/types": [
    "../../packages/shared/src/services/history/types.ts",
  ],
  "@repo/shared/services/logging/conversion-logger": [
    "../../packages/shared/src/services/logging/conversion-logger.ts",
  ],
  "@repo/shared/services/logging/types": [
    "../../packages/shared/src/services/logging/types.ts",
  ],

  // types 系（12エントリ、最も深いパスから）
  "@repo/shared/types/llm/schemas": [
    "../../packages/shared/src/types/llm/schemas/index.ts",
  ],
  "@repo/shared/types/llm": [
    "../../packages/shared/src/types/llm/schemas/index.ts",
  ],
  "@repo/shared/types/rag/result": [
    "../../packages/shared/src/types/rag/result.ts",
  ],
  "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"],
  "@repo/shared/types/auth": ["../../packages/shared/types/auth.ts"],
  "@repo/shared/types/auth-mode": [
    "../../packages/shared/src/types/auth-mode.ts",
  ],
  "@repo/shared/types/api-keys": ["../../packages/shared/types/api-keys.ts"],
  "@repo/shared/types/agent": ["../../packages/shared/src/types/agent.ts"],
  "@repo/shared/types/skill": ["../../packages/shared/src/types/skill.ts"],
  "@repo/shared/types/replace": ["../../packages/shared/src/types/replace.ts"],
  "@repo/shared/types": ["../../packages/shared/src/types/index.ts"],

  // schemas 系（2エントリ）
  "@repo/shared/schemas/auth": ["../../packages/shared/schemas/auth.ts"],
  "@repo/shared/schemas": ["../../packages/shared/schemas/index.ts"],

  // agent, repositories, constants, ipc, core（5エントリ）
  "@repo/shared/agent": ["../../packages/shared/src/agent/index.ts"],
  "@repo/shared/repositories": [
    "../../packages/shared/src/repositories/index.ts",
  ],
  "@repo/shared/constants": ["../../packages/shared/src/constants/index.ts"],
  "@repo/shared/src/ipc/channels": [
    "../../packages/shared/src/ipc/channels.ts",
  ],
  "@repo/shared/core": ["../../packages/shared/core/index.ts"],

  // ルートエクスポート（最後に配置）
  "@repo/shared": ["../../packages/shared/index.ts"],
}
```

### パスマッピング対応テーブル（TS2307インポートパスとの照合）

| #   | TS2307 インポートパス                             | paths ソースパス                                                  | ソース基点 |
| --- | ------------------------------------------------- | ----------------------------------------------------------------- | ---------- |
| 1   | `@repo/shared`                                    | `../../packages/shared/index.ts`                                  | ルート     |
| 2   | `@repo/shared/types/llm/schemas`                  | `../../packages/shared/src/types/llm/schemas/index.ts`            | src/       |
| 3   | `@repo/shared/types/agent`                        | `../../packages/shared/src/types/agent.ts`                        | src/       |
| 4   | `@repo/shared/types`                              | `../../packages/shared/src/types/index.ts`                        | src/       |
| 5   | `@repo/shared/types/skill`                        | `../../packages/shared/src/types/skill.ts`                        | src/       |
| 6   | `@repo/shared/types/auth`                         | `../../packages/shared/types/auth.ts`                             | ルート     |
| 7   | `@repo/shared/types/api-keys`                     | `../../packages/shared/types/api-keys.ts`                         | ルート     |
| 8   | `@repo/shared/agent`                              | `../../packages/shared/src/agent/index.ts`                        | src/       |
| 9   | `@repo/shared/infrastructure/auth`                | `../../packages/shared/infrastructure/auth/index.ts`              | ルート     |
| 10  | `@repo/shared/types/llm`                          | `../../packages/shared/src/types/llm/schemas/index.ts`            | src/       |
| 11  | `@repo/shared/schemas`                            | `../../packages/shared/schemas/index.ts`                          | ルート     |
| 12  | `@repo/shared/types/rag`                          | `../../packages/shared/src/types/rag/index.ts`                    | src/       |
| 13  | `@repo/shared/types/auth-mode`                    | `../../packages/shared/src/types/auth-mode.ts`                    | src/       |
| 14  | `@repo/shared/services/logging/types`             | `../../packages/shared/src/services/logging/types.ts`             | src/       |
| 15  | `@repo/shared/services/history/types`             | `../../packages/shared/src/services/history/types.ts`             | src/       |
| 16  | `@repo/shared/repositories`                       | `../../packages/shared/src/repositories/index.ts`                 | src/       |
| 17  | `@repo/shared/types/replace`                      | `../../packages/shared/src/types/replace.ts`                      | src/       |
| 18  | `@repo/shared/types/rag/result`                   | `../../packages/shared/src/types/rag/result.ts`                   | src/       |
| 19  | `@repo/shared/src/ipc/channels`                   | `../../packages/shared/src/ipc/channels.ts`                       | src/       |
| 20  | `@repo/shared/services/logging/conversion-logger` | `../../packages/shared/src/services/logging/conversion-logger.ts` | src/       |
| 21  | `@repo/shared/services/history/history-service`   | `../../packages/shared/src/services/history/history-service.ts`   | src/       |
| 22  | `@repo/shared/schemas/auth`                       | `../../packages/shared/schemas/auth.ts`                           | ルート     |
| 23  | `@repo/shared/infrastructure/ai/apiKeyValidator`  | `../../packages/shared/infrastructure/ai/apiKeyValidator.ts`      | ルート     |
| 24  | `@repo/shared/constants`                          | `../../packages/shared/src/constants/index.ts`                    | src/       |

**全24パターン（TS2307対象）が paths マッピングでカバー済み。**
加えて、予防的に3エントリ（`core`, `infrastructure`, `infrastructure/database`）を追加し、合計27エントリ。

---

## 2. Vitest alias との統合方針

### 現状

`apps/desktop/vitest.config.ts` に 28 個の `resolve.alias` が定義済み。

### 統合方針: **既存の Vitest alias を維持（変更なし）**

**理由**:

1. **Vitest は tsconfig paths を自動参照しない**: `vitest-tsconfig-paths` プラグイン未導入のため、Vitest は独自の `resolve.alias` でモジュール解決を行う
2. **安定稼働中**: 既存の alias は全テストで安定稼働しており、変更によるリグレッションリスクを取る必要がない
3. **P40 教訓の適用**: テスト実行ディレクトリ依存（P40）の教訓から、テスト設定は慎重に変更すべき
4. **スコープ限定**: 本タスクは tsc のモジュール解決エラー解消が目的であり、Vitest 設定の最適化は別タスクとする

### Vitest alias と tsconfig paths の対応確認

tsconfig paths と vitest alias は同一のソースファイルを参照する必要がある。Phase 4（テスト作成）で両者の整合性を検証する。

### 将来的改善（スコープ外）

`vitest-tsconfig-paths` プラグイン導入により、tsconfig の paths から Vitest alias を自動生成し、二重管理を解消可能。未タスク化: `UT-FIX-TS-VITEST-TSCONFIG-PATHS-001`

---

## 3. package.json exports 整合性修正の設計

### 不整合の分析結果

`exports` フィールドには、ソース構造の二重性に起因する2系統のパスが存在する:

| パターン                   | 例             | dist パス                   | ソース               |
| -------------------------- | -------------- | --------------------------- | -------------------- |
| パターン A（ルートレベル） | `./types/auth` | `dist/types/auth.d.ts`      | `types/auth.ts`      |
| パターン B（src 配下）     | `./types`      | `dist/src/types/index.d.ts` | `src/types/index.ts` |

### 修正方針: **exports フィールドは現状維持**

**理由**:

1. tsup のエントリーポイントがソースの実パスに基づいてビルドするため、`exports` のパスは tsup の出力構造に合わせる必要がある
2. `exports` を変更すると tsup の設定も変更が必要となり、変更範囲が拡大する
3. TypeScript 側は `paths` でソースを直接参照するため、`exports` の不整合は `tsc` には影響しない
4. ランタイム（Electron）は `dist/` 経由で `exports` を使用するため、現状の動作を維持すべき

### typesVersions の追加（補完措置）

外部からの参照（ビルド後の dist/ 経由）のために `typesVersions` を追加する:

```jsonc
// packages/shared/package.json に追加
{
  "typesVersions": {
    "*": {
      "core": ["./dist/core/index.d.ts"],
      "infrastructure": ["./dist/infrastructure/index.d.ts"],
      "infrastructure/auth": ["./dist/infrastructure/auth/index.d.ts"],
      "infrastructure/database": ["./dist/infrastructure/database/index.d.ts"],
      "infrastructure/ai/apiKeyValidator": [
        "./dist/infrastructure/ai/apiKeyValidator.d.ts",
      ],
      "types": ["./dist/src/types/index.d.ts"],
      "types/auth": ["./dist/types/auth.d.ts"],
      "types/api-keys": ["./dist/types/api-keys.d.ts"],
      "types/replace": ["./dist/src/types/replace.d.ts"],
      "types/rag": ["./dist/src/types/rag/index.d.ts"],
      "types/rag/result": ["./dist/src/types/rag/result.d.ts"],
      "types/llm/schemas": ["./dist/src/types/llm/schemas/index.d.ts"],
      "types/llm": ["./dist/src/types/llm/schemas/index.d.ts"],
      "types/skill": ["./dist/src/types/skill.d.ts"],
      "types/agent": ["./dist/src/types/agent.d.ts"],
      "types/auth-mode": ["./dist/src/types/auth-mode.d.ts"],
      "agent": ["./dist/src/agent/index.d.ts"],
      "schemas": ["./dist/schemas/index.d.ts"],
      "schemas/auth": ["./dist/schemas/auth.d.ts"],
      "services/history/types": ["./dist/src/services/history/types.d.ts"],
      "services/history/history-service": [
        "./dist/src/services/history/history-service.d.ts",
      ],
      "services/logging/types": ["./dist/src/services/logging/types.d.ts"],
      "services/logging/conversion-logger": [
        "./dist/src/services/logging/conversion-logger.d.ts",
      ],
      "repositories": ["./dist/src/repositories/index.d.ts"],
      "constants": ["./dist/src/constants/index.d.ts"],
      "src/ipc/channels": ["./dist/src/ipc/channels.d.ts"],
    },
  },
}
```

**注意**: `typesVersions` のキーには `@repo/shared/` プレフィックスを含めない。TypeScript は自動的にパッケージ名を除いたサブパスとマッチングする。

---

## 4. ビルドパイプラインへの影響評価

### 変更対象ファイル

| #   | ファイル                       | 変更内容                       | リスク | 影響範囲         |
| --- | ------------------------------ | ------------------------------ | ------ | ---------------- |
| 1   | `apps/desktop/tsconfig.json`   | `paths` に 27 エントリ追加     | 低     | tsc のみ         |
| 2   | `packages/shared/package.json` | `typesVersions` フィールド追加 | 低     | 外部からの型参照 |

### 変更しないファイル

| ファイル                         | 理由                                              |
| -------------------------------- | ------------------------------------------------- |
| `apps/desktop/vitest.config.ts`  | 既存の alias が安定稼働中、変更不要               |
| `packages/shared/tsconfig.json`  | shared パッケージ自体の型チェックには影響なし     |
| `packages/shared/tsup.config.ts` | ビルド設定の変更は不要                            |
| `tsconfig.json`（ルート）        | project references 構成は変更不要                 |
| `apps/desktop/src/**/*.ts`       | import 文の変更は不要（受入基準: コード変更ゼロ） |

### 既知の Pitfall への対策

| Pitfall | 内容                             | 対策                                                   |
| ------- | -------------------------------- | ------------------------------------------------------ |
| P8      | 幽霊依存の導入                   | 新パッケージ追加なし。paths はソース参照のみ           |
| P11     | Prettier/ESLint による Edit 失敗 | 一括 Write で対応。JSON は Prettier の影響を受けにくい |
| P40     | テスト実行ディレクトリ依存       | Vitest 設定を変更しないため影響なし                    |

---

## 5. モジュール解決フロー図

変更後のモジュール解決は以下の3パスで行われる:

```
┌──────────────────────────────────────────────────────────┐
│                    apps/desktop                          │
│                                                          │
│  import { Foo } from "@repo/shared/types/agent"          │
│                        │                                 │
│          ┌─────────────┼─────────────┐                   │
│          │             │             │                   │
│     [TypeScript]  [Vitest]    [Runtime/Electron]         │
│          │             │             │                   │
│   tsconfig paths  resolve.alias  package.json exports    │
│          │             │             │                   │
│          ▼             ▼             ▼                   │
│   ソースファイル   ソースファイル  dist/ ビルド出力      │
│   (.ts 直接参照)  (.ts 直接参照) (.js + .d.ts)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  packages/shared                         │
│                                                          │
│  ../../packages/shared/src/types/agent.ts                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

| パス       | 解決手段                    | 参照先                | 使用場面       |
| ---------- | --------------------------- | --------------------- | -------------- |
| TypeScript | `tsconfig.json` の `paths`  | ソース `.ts` ファイル | `tsc --noEmit` |
| Vitest     | `vitest.config.ts` の alias | ソース `.ts` ファイル | テスト実行     |
| Runtime    | `package.json` の `exports` | `dist/` ビルド出力    | Electron 実行  |

---

## 6. 実装順序

```
Step 1: apps/desktop/tsconfig.json に paths マッピング 27 エントリを追加
Step 2: packages/shared/package.json に typesVersions を追加
Step 3: cd apps/desktop && pnpm typecheck → エラー 0件を確認
Step 4: cd apps/desktop && pnpm vitest run → 全テスト PASS を確認
Step 5: pnpm --filter @repo/shared build → ビルド成功を確認
Step 6: pnpm lint → PASS を確認
```

---

## 7. 現状の設定ファイル確認結果

### apps/desktop/tsconfig.json

- `moduleResolution`: `"bundler"`
- `baseUrl`: `"."`
- `paths`: 2エントリ（`@renderer/*`, `@/*`）のみ
- `@repo/shared` 関連の paths は **未定義**

### packages/shared/package.json

- `exports`: 27エントリ（ルート `.` + 26サブパス）
- `typesVersions`: **未定義**
- `main`: `./dist/index.js`
- `types`: `./dist/index.d.ts`

### apps/desktop/vitest.config.ts

- `resolve.alias`: 28エントリ
  - `@`, `@renderer`, `@main`: 3エントリ（内部エイリアス）
  - `@repo/shared` 関連: 24エントリ
  - `@anthropic-ai/claude-agent-sdk`: 1エントリ（テストモック）
- `@repo/shared` のサブパスエイリアスは全て `../../packages/shared/` 配下のソースファイルを直接参照
