# Phase 1 成果物: 要件分析結果

## メタ情報

| 項目         | 値                                                   |
| ------------ | ---------------------------------------------------- |
| タスク ID    | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001             |
| Phase        | 1 — 要件定義                                         |
| 作成日       | 2026-02-20                                           |
| Issue        | #837                                                 |
| 実行環境     | macOS Darwin 24.6.0 / TypeScript 5.x                 |
| 計測ブランチ | `docs/task-fix-ts-shared-module-resolution-001-spec` |

---

## 1. エラー件数の実測結果

### 実行コマンド

```bash
cd apps/desktop && pnpm exec tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

### 実測結果: **228件**

計測日時: 2026-02-20

---

## 2. エラーコード別分類

| エラーコード | 件数    | 説明                                   | 根本/派生 |
| ------------ | ------- | -------------------------------------- | --------- |
| TS2307       | 169     | モジュールまたは型宣言が見つからない   | **根本**  |
| TS7006       | 30      | パラメータが暗黙的に 'any' 型を持つ    | 派生      |
| TS2339       | 20      | プロパティが型に存在しない             | 派生      |
| TS2358       | 5       | instanceof の左辺が不正な型            | 派生      |
| TS18046      | 2       | 型が 'unknown' のため使用不可          | 派生      |
| TS2353       | 1       | オブジェクトリテラルに未知のプロパティ | 派生      |
| TS2322       | 1       | 型の代入互換性エラー                   | 派生      |
| **合計**     | **228** |                                        |           |

### 根本原因と派生エラーの関係

```
TS2307（169件）= 根本原因
  └─ モジュール解決失敗により型が unknown / any になる
      ├── TS7006（30件）: パラメータが暗黙的 any
      ├── TS2339（20件）: 型にプロパティが存在しない
      ├── TS2358（5件）: instanceof の型が不正
      ├── TS18046（2件）: unknown 型の使用不可
      ├── TS2353（1件）: 未知のプロパティ
      └── TS2322（1件）: 型の代入互換性
          合計: 59件（全て派生）
```

**結論**: TS2307（169件）を解消すれば、派生エラー59件も全て解消する見込み。合計228件全てが解消する。

---

## 3. TS2307 インポートパス別内訳

| #   | インポートパス                                    | 件数    |
| --- | ------------------------------------------------- | ------- |
| 1   | `@repo/shared`（ルート）                          | 56      |
| 2   | `@repo/shared/types/llm/schemas`                  | 17      |
| 3   | `@repo/shared/types/agent`                        | 17      |
| 4   | `@repo/shared/types`                              | 15      |
| 5   | `@repo/shared/types/skill`                        | 13      |
| 6   | `@repo/shared/types/auth`                         | 13      |
| 7   | `@repo/shared/types/api-keys`                     | 5       |
| 8   | `@repo/shared/agent`                              | 5       |
| 9   | `@repo/shared/infrastructure/auth`                | 4       |
| 10  | `@repo/shared/types/llm`                          | 3       |
| 11  | `@repo/shared/schemas`                            | 3       |
| 12  | `@repo/shared/types/rag`                          | 2       |
| 13  | `@repo/shared/types/auth-mode`                    | 2       |
| 14  | `@repo/shared/services/logging/types`             | 2       |
| 15  | `@repo/shared/services/history/types`             | 2       |
| 16  | `@repo/shared/repositories`                       | 2       |
| 17  | `@repo/shared/types/replace`                      | 1       |
| 18  | `@repo/shared/types/rag/result`                   | 1       |
| 19  | `@repo/shared/src/ipc/channels`                   | 1       |
| 20  | `@repo/shared/services/logging/conversion-logger` | 1       |
| 21  | `@repo/shared/services/history/history-service`   | 1       |
| 22  | `@repo/shared/schemas/auth`                       | 1       |
| 23  | `@repo/shared/infrastructure/ai/apiKeyValidator`  | 1       |
| 24  | `@repo/shared/constants`                          | 1       |
|     | **合計**                                          | **169** |

**全169件が `@repo/shared` 関連**。他パッケージのモジュール解決エラーはゼロ。
ユニークなインポートパスは **24パターン**（`@repo/shared` ルート + 23サブパス）。

---

## 4. 根本原因の分析

### 直接的な原因

| 原因                                         | 説明                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/tsconfig.json` に paths 未設定 | `@repo/shared` への paths マッピングがない（既存は `@renderer/*` と `@/*` のみ）                               |
| `typesVersions` 未設定                       | `packages/shared/package.json` に `typesVersions` フィールドがなく、tsc が `exports` の `types` 条件を解決不可 |
| `dist/` ディレクトリの非存在                 | 開発時に `packages/shared` のビルド出力 `dist/` が存在しない場合、`exports` の `types` パスが無効になる        |
| `exports` パスの不整合                       | 一部エントリが `dist/types/` を指し、他が `dist/src/types/` を指す（ソース構造の二重性に起因）                 |

### Vitest で問題が発生しない理由

Vitest は `vitest.config.ts` の `resolve.alias` で 28 個のエイリアスを定義済みであり、tsc とは独立したモジュール解決メカニズムを使用している。そのため `tsconfig.json` の paths 未設定の影響を受けない。

### moduleResolution: "bundler" の影響

`apps/desktop/tsconfig.json` の `moduleResolution: "bundler"` は `package.json` の `exports` フィールドを参照するが、以下の条件が全て満たされていないと解決に失敗する:

1. `exports` に `types` 条件が正しく定義されている ✓
2. `types` が指すファイルが実際に存在する ✗（`dist/` がないと不在）
3. 代替として `typesVersions` が定義されている ✗（未定義）

---

## 5. サブパスエクスポート一覧（29エントリ）

`packages/shared/package.json` の `exports` フィールドに定義されている全29エントリ:

| #   | エクスポートパス                       | types 出力パス                                       | ソース基点          |
| --- | -------------------------------------- | ---------------------------------------------------- | ------------------- |
| 1   | `.`                                    | `./dist/index.d.ts`                                  | `./`                |
| 2   | `./core`                               | `./dist/core/index.d.ts`                             | `core/`             |
| 3   | `./infrastructure`                     | `./dist/infrastructure/index.d.ts`                   | `infrastructure/`   |
| 4   | `./infrastructure/auth`                | `./dist/infrastructure/auth/index.d.ts`              | `infrastructure/`   |
| 5   | `./infrastructure/database`            | `./dist/infrastructure/database/index.d.ts`          | `infrastructure/`   |
| 6   | `./types`                              | `./dist/src/types/index.d.ts`                        | `src/types/`        |
| 7   | `./types/auth`                         | `./dist/types/auth.d.ts`                             | `types/`            |
| 8   | `./types/api-keys`                     | `./dist/types/api-keys.d.ts`                         | `types/`            |
| 9   | `./infrastructure/ai/apiKeyValidator`  | `./dist/infrastructure/ai/apiKeyValidator.d.ts`      | `infrastructure/`   |
| 10  | `./schemas`                            | `./dist/schemas/index.d.ts`                          | `schemas/`          |
| 11  | `./schemas/auth`                       | `./dist/schemas/auth.d.ts`                           | `schemas/`          |
| 12  | `./types/replace`                      | `./dist/src/types/replace.d.ts`                      | `src/types/`        |
| 13  | `./types/rag`                          | `./dist/src/types/rag/index.d.ts`                    | `src/types/`        |
| 14  | `./agent`                              | `./dist/src/agent/index.d.ts`                        | `src/agent/`        |
| 15  | `./types/llm/schemas`                  | `./dist/src/types/llm/schemas/index.d.ts`            | `src/types/`        |
| 16  | `./types/llm`                          | `./dist/src/types/llm/schemas/index.d.ts`            | `src/types/`        |
| 17  | `./types/skill`                        | `./dist/src/types/skill.d.ts`                        | `src/types/`        |
| 18  | `./services/history/types`             | `./dist/src/services/history/types.d.ts`             | `src/services/`     |
| 19  | `./services/history/history-service`   | `./dist/src/services/history/history-service.d.ts`   | `src/services/`     |
| 20  | `./types/rag/result`                   | `./dist/src/types/rag/result.d.ts`                   | `src/types/`        |
| 21  | `./services/logging/types`             | `./dist/src/services/logging/types.d.ts`             | `src/services/`     |
| 22  | `./services/logging/conversion-logger` | `./dist/src/services/logging/conversion-logger.d.ts` | `src/services/`     |
| 23  | `./types/agent`                        | `./dist/src/types/agent.d.ts`                        | `src/types/`        |
| 24  | `./repositories`                       | `./dist/src/repositories/index.d.ts`                 | `src/repositories/` |
| 25  | `./constants`                          | `./dist/src/constants/index.d.ts`                    | `src/constants/`    |
| 26  | `./src/ipc/channels`                   | `./dist/src/ipc/channels.d.ts`                       | `src/ipc/`          |
| 27  | `./types/auth-mode`                    | `./dist/src/types/auth-mode.d.ts`                    | `src/types/`        |

### 不整合の検出

ソースパス基点が **2系統** に分かれている:

- **パターン A（ルートレベル）**: `types/auth` → `dist/types/auth.d.ts`
- **パターン B（src 配下）**: `types` → `dist/src/types/index.d.ts`

この不整合は `packages/shared` のディレクトリ構造が歴史的に `types/`（ルート）と `src/types/`（src 配下）の両方にファイルを持つことに起因する。

---

## 6. アプローチ比較と選択

### 3つのアプローチ比較表

| 観点                     | A: exports + typesVersions    | B: tsconfig paths 一括設定        | C: moduleResolution 調査・修正      |
| ------------------------ | ----------------------------- | --------------------------------- | ----------------------------------- |
| **変更範囲**             | `package.json` のみ           | `apps/desktop/tsconfig.json`      | 複数の tsconfig + package.json      |
| **対象ファイル数**       | 1                             | 1                                 | 3-5                                 |
| **dist/ ビルド依存**     | 必要（`dist/` に .d.ts 必須） | 不要（ソースを直接参照可能）      | 必要                                |
| **Vitest 互換性**        | 影響なし                      | 影響なし                          | 要検証                              |
| **将来の保守性**         | 高（npm 標準準拠）            | 中（新サブパス追加時に2箇所更新） | 高（標準準拠）                      |
| **他パッケージへの波及** | なし                          | `apps/desktop` のみ               | `apps/web`, `apps/backend` にも波及 |
| **Node.js 互換性**       | 高（exports は Node.js 標準） | TypeScript のみ                   | 高                                  |
| **実装の複雑性**         | 低                            | 低                                | 高（根本原因調査が必要）            |
| **既知の成功事例**       | 多数（npm エコシステム標準）  | モノレポでは一般的                | 事例少ない                          |

### 選択: アプローチ B（paths 一括設定）+ A 補完（typesVersions 追加）

**選択理由**:

1. **dist/ 非依存**: 開発時に `packages/shared` のビルドが不要で、ソースファイルを直接参照できる
2. **変更範囲最小**: `apps/desktop/tsconfig.json` の paths 追加のみで 169 件の TS2307 が解消見込み
3. **Vitest 安全**: 既存の `vitest.config.ts` を変更しないため、テストへの影響ゼロ
4. **モノレポ標準**: monorepo 環境でのソース直接参照は広く採用されているパターン
5. **補完性**: typesVersions を同時追加することで、将来的な npm パッケージ公開にも対応可能

---

## 7. 受入基準

### 定量的基準

| #   | 基準                                                      | 計測方法                                      |
| --- | --------------------------------------------------------- | --------------------------------------------- |
| 1   | `cd apps/desktop && pnpm typecheck` が **エラー 0件**     | `tsc --noEmit 2>&1 \| grep -c "error TS"` = 0 |
| 2   | `cd apps/desktop && pnpm vitest run` が **全テスト PASS** | exit code 0                                   |
| 3   | `cd packages/shared && pnpm typecheck` が **エラー 0件**  | `tsc --noEmit 2>&1 \| grep -c "error TS"` = 0 |
| 4   | `pnpm --filter @repo/shared build` が **成功**            | exit code 0                                   |
| 5   | `pnpm lint` が **PASS**                                   | exit code 0                                   |

### 定性的基準

| #   | 基準                                                                        |
| --- | --------------------------------------------------------------------------- |
| 1   | `@repo/shared` の新しいサブパス追加時に更新が必要なファイルが **2箇所以内** |
| 2   | Vitest の `resolve.alias` が **削減または維持**（増加しない）               |
| 3   | 既存の `import` 文を **変更しない**（apps/desktop 側のコード変更ゼロ）      |
| 4   | P8（幽霊依存）に該当する新たな依存関係を **導入しない**                     |

---

## 8. 現状の設定ファイル記録

### apps/desktop/tsconfig.json（変更前）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@renderer/*": ["src/renderer/*"],
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "out",
    "dist",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/__tests__/**",
    "src/**/*.stories.tsx",
    "src/**/*.stories.ts",
    "src/**/stories/**",
    "src/main/services/agent/AgentExecutor.ts"
  ]
}
```

### apps/desktop/vitest.config.ts — alias 数: 28個

Vitest に定義済みのエイリアスは 28 個で、`@repo/shared` 関連が 25 個、その他が 3 個（`@`, `@renderer`, `@main`, `@anthropic-ai/claude-agent-sdk`）。

### packages/shared/package.json — exports エントリ数: 27個

`exports` フィールドに 27 個のサブパスエクスポートが定義済み（ルート `.` を含む）。`typesVersions` は未定義。
