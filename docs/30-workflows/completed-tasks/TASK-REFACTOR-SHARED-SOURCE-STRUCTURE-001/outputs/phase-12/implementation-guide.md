# Phase 12 実装ガイド

## Part 1（初学者・中学生向け）

### なぜこの作業が必要だったか

同じ役割のファイルが `types/` と `src/types/` の2カ所に分かれていると、修正のたびに「どちらを直すべきか」で迷い、片方だけ直して不具合が出やすくなります。

### 日常の例え（本棚の整理）

同じ教科のノートが2つの本棚に分かれている状態を想像してください。探すときに毎回2つの棚を確認する必要があります。今回の作業は、そのノートを1つの棚にまとめて「どこを見ればよいか」を明確にした、という整理です。

### この作業でやったこと

| 作業             | 何をしたか                           | 具体例                                        |
| ---------------- | ------------------------------------ | --------------------------------------------- |
| ファイル統合     | 型定義ファイルを `src/types/` に集約 | `types/auth.ts` → `src/types/auth.ts`         |
| 案内表の更新     | 新しい実体パスに合わせて設定を更新   | `package.json` の `exports` / `typesVersions` |
| 利用側の互換維持 | import の公開パスは変更しない        | `@repo/shared/types/auth` はそのまま          |

## Part 2（開発者向け）

### 1. Before / After

```text
Before
packages/shared/
├── types/                 # 旧実体
└── src/types/             # 既存実体

After
packages/shared/
└── src/types/             # 実体を一本化
```

### 2. 移行対象

- `types/auth.ts` → `src/types/auth.ts`
- `types/api-keys.ts` → `src/types/api-keys.ts`
- `types/common.ts` → `src/types/common.ts`
- `types/file-selection.ts` → `src/types/file-selection.ts`
- `types/workflow.ts` → `src/types/workflow.ts`
- `types/index.ts` は `src/types/index.ts` に統合
- `types/__tests__/auth.test.ts` → `src/types/__tests__/auth.test.ts`

### 3. 4ファイル同期チェック

| ファイル                         | 変更内容                                               |
| -------------------------------- | ------------------------------------------------------ |
| `packages/shared/package.json`   | `exports` と `typesVersions` を `src/types` 実体へ同期 |
| `apps/desktop/tsconfig.json`     | `@repo/shared/types/*` の `paths` を同期               |
| `apps/desktop/vitest.config.ts`  | `tsconfigPaths()` 経由で追従（直接alias更新なし）      |
| `packages/shared/tsup.config.ts` | 旧 `types/*.ts` entry を削除し `src/types/*.ts` へ更新 |

### 4. 型定義（監査・検証で使う記録型）

```ts
export interface SharedTypesPathMapping {
  publicPath: string;
  exportPath: string;
  typePath: string;
  desktopPath: string;
  buildEntry: string;
}

export interface MigrationVerificationResult {
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  allPassed: boolean;
}
```

### 5. パブリック契約シグネチャ（変更なし）

```ts
import type { AuthConfig } from "@repo/shared/types/auth";
import type { ApiKeyConfig } from "@repo/shared/types/api-keys";
import type { WorkflowDefinition } from "@repo/shared/types";
```

### 6. 検証API（コマンド）

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared test:run
```

### 7. エラーハンドリングとエッジケース

- パス同期漏れ: `exports` / `typesVersions` / `paths` / `entry` のどれか1つでも未更新だと import 解決が崩れる。
- 名前衝突: `src/types/index.ts` への統合時は重複exportを `comm` で事前検出する。
- 旧パス残存: `grep` で `dist/types/` と `./types/` を監査し 0件確認する。
- ロールバック: `types/` 削除前にビルド・型・テストを通し、失敗時は設定差分を戻す。

### 8. 設定可能パラメータ / 定数

| 項目                    | 値                          | 用途                   |
| ----------------------- | --------------------------- | ---------------------- |
| `MIGRATION_TARGET_DIR`  | `packages/shared/src/types` | 移行先ルート           |
| `LEGACY_TARGET_DIR`     | `packages/shared/types`     | 移行元ルート           |
| `COVERAGE_LINE_MIN`     | `80`                        | Line coverage 下限     |
| `COVERAGE_BRANCH_MIN`   | `60`                        | Branch coverage 下限   |
| `COVERAGE_FUNCTION_MIN` | `80`                        | Function coverage 下限 |
