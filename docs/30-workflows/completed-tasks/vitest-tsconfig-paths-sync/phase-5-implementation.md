# Phase 5: 実装（TDD: Green） - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 5                                   |
| 機能名   | vitest-tsconfig-paths-sync          |
| 作成日   | 2026-02-24                          |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue    | #875                                |

## 目的

Phase 4 で作成したテストを全て PASS させる最小限の実装を行う。具体的には以下の 4 つの変更を実施する:

1. `vite-tsconfig-paths` プラグインを `apps/desktop/vitest.config.ts` に導入し、手動 alias 定義（`@repo/shared` 系 27 エントリ）を削除する
2. ルート `package.json` に `check:module-sync` pnpm スクリプトを追加する
3. `scripts/check-shared-module-sync.ts` に第 6 チェック（typesVersions -> exports 逆方向）を追加する
4. チェックスクリプトの alias チェック（チェック 3, 4）をプラグイン導入後の状態に対応させる

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

## 実行手順

### Task 1: `vite-tsconfig-paths` パッケージのインストール

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm --filter @repo/desktop add -D vite-tsconfig-paths
```

**確認**: `apps/desktop/package.json` の `devDependencies` に `vite-tsconfig-paths` が追加されていること。

### Task 2: `apps/desktop/vitest.config.ts` の修正

#### 2-1: プラグイン追加

ファイル冒頭に import を追加:

```typescript
import tsconfigPaths from "vite-tsconfig-paths";
```

`plugins` 配列に `tsconfigPaths()` を追加:

```typescript
plugins: [react(), tsconfigPaths()],
```

#### 2-2: `@repo/shared` 系手動 alias の削除

`resolve.alias` セクションから `@repo/shared` プレフィックスを持つ全エントリ（27 件）を削除する。

**削除対象**: `vitest.config.ts` の行 87〜192（`@repo/shared/infrastructure/ai/apiKeyValidator` から `@repo/shared` まで）

**残すエントリ**:

- `"@": resolve(__dirname, "src")` — プロジェクト内パス alias
- `"@renderer": resolve(__dirname, "src/renderer")` — Renderer 層 alias
- `"@main": resolve(__dirname, "src/main")` — Main 層 alias
- `"@anthropic-ai/claude-agent-sdk": resolve(...)` — SDK モック alias

#### 2-3: 修正後の `resolve.alias` セクション

```typescript
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
```

### Task 3: ルート `package.json` へのスクリプト追加

ルート `package.json` の `scripts` セクションに以下を追加:

```json
"check:module-sync": "tsx scripts/check-shared-module-sync.ts"
```

**挿入位置**: `"validate:full"` の後（アルファベット順は不要、論理的グループとして検証系コマンドの近くに配置）。

### Task 4: チェックスクリプトの拡張

#### 4-1: 第 6 チェック関数の追加

`scripts/check-shared-module-sync.ts` に以下の関数を追加:

```typescript
/**
 * チェック6: typesVersions の各エントリが exports に存在するか検証する。
 * exports 側の "." エントリに対応する typesVersions エントリは存在しないため、
 * typesVersions のキーを "./xxx" 形式に変換して exports と照合する。
 */
export function checkTypesVersionsVsExports(
  typesVersions: Map<string, string[]>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  const missing: string[] = [];

  for (const tvKey of typesVersions.keys()) {
    const subpath = `./${tvKey}`;
    if (!exportsMap.has(subpath)) {
      missing.push(tvKey);
    }
  }

  return {
    checkName: "typesVersions -> exports",
    passed: missing.length === 0,
    missing,
  };
}
```

#### 4-2: `CHECK_NAMES` 定数の更新

```typescript
const CHECK_NAMES = {
  EXPORTS_VS_PATHS: "exports -> paths",
  PATHS_VS_EXPORTS: "paths -> exports",
  EXPORTS_VS_ALIASES: "exports -> aliases",
  ALIASES_VS_EXPORTS: "aliases -> exports",
  EXPORTS_VS_TYPES_VERSIONS: "exports -> typesVersions",
  TYPES_VERSIONS_VS_EXPORTS: "typesVersions -> exports", // 追加
} as const;
```

#### 4-3: `main()` 関数の更新

`main()` 関数の `results` 配列に第 6 チェックを追加:

```typescript
const results: CheckResult[] = [
  checkExportsVsPaths(exportsMap, paths),
  checkPathsVsExports(paths, exportsMap),
  checkExportsVsAliases(exportsMap, aliases),
  checkAliasesVsExports(aliases, exportsMap),
  checkExportsVsTypesVersions(exportsMap, typesVersions),
  checkTypesVersionsVsExports(typesVersions, exportsMap), // 追加
];
```

#### 4-4: alias チェックのプラグイン対応

`checkExportsVsAliases` と `checkAliasesVsExports` は、alias が 0 件の場合に自動的に PASS を返すよう修正する。vitest-tsconfig-paths プラグイン導入後は `parseAliases()` が `@repo/shared` 系エントリを返さないため、空 Map との比較で正しく動作する必要がある。

**方針**: `aliases.size === 0` の場合は早期 return で PASS を返す。

```typescript
export function checkExportsVsAliases(
  exportsMap: Map<string, ExportEntry>,
  aliases: Map<string, string>,
): CheckResult {
  // プラグイン使用時は alias が 0 件になるため、チェックをスキップ
  if (aliases.size === 0) {
    return {
      checkName: CHECK_NAMES.EXPORTS_VS_ALIASES,
      passed: true,
      missing: [],
    };
  }
  // ... 既存ロジック
}

export function checkAliasesVsExports(
  aliases: Map<string, string>,
  exportsMap: Map<string, ExportEntry>,
): CheckResult {
  // プラグイン使用時は alias が 0 件になるため、チェックをスキップ
  if (aliases.size === 0) {
    return {
      checkName: CHECK_NAMES.ALIASES_VS_EXPORTS,
      passed: true,
      missing: [],
    };
  }
  // ... 既存ロジック
}
```

### Task 5: テスト実行による Green 状態確認

#### 5-1: 新規テストの実行

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts
```

全新規テストが PASS することを確認する。

#### 5-2: 既存テストの回帰確認

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

既存 43 件が全 PASS することを確認する。

#### 5-3: desktop パッケージのテスト回帰確認

```bash
cd apps/desktop && pnpm vitest run
```

desktop パッケージの全テストが PASS することを確認する（P40 対策: desktop ディレクトリから実行）。

#### 5-4: 型チェック

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm typecheck
```

全パッケージで 0 エラーを確認する。

#### 5-5: チェックスクリプト実行

```bash
pnpm check:module-sync
```

`ALL CHECKS PASSED` が出力され、exit code が 0 であることを確認する。

## 参照資料

| 資料                   | パス                                                                          | 用途                                     |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 4 テスト設計     | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-4-test-creation.md`       | テストケース一覧                         |
| 既存チェックスクリプト | `scripts/check-shared-module-sync.ts`                                         | 拡張対象の既存実装                       |
| vitest.config.ts       | `apps/desktop/vitest.config.ts`                                               | プラグイン導入・alias 削除対象           |
| tsconfig.json          | `apps/desktop/tsconfig.json`                                                  | paths 設定（プラグインがここを参照する） |
| package.json (root)    | `package.json`                                                                | スクリプト追加対象                       |
| package.json (shared)  | `packages/shared/package.json`                                                | exports/typesVersions の正本             |
| 三層アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | 変更の設計整合性確認                     |
| 品質要件仕様           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト/品質基準確認                      |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`      | CI実行パス整合確認                       |
| 開発ガイドライン       | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 運用手順の整合確認                       |

## 統合テスト連携

### vitest-tsconfig-paths プラグインの動作確認

プラグイン導入後、以下の import パターンが desktop パッケージのテストで正しく解決されることを確認する:

```typescript
// tsconfig.json paths 経由で解決されるパターン
import { xxx } from "@repo/shared";
import { yyy } from "@repo/shared/types";
import { zzz } from "@repo/shared/agent";
```

確認コマンド:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | head -50
```

テスト実行時に `Cannot find module '@repo/shared'` 等のモジュール解決エラーが出ないことを確認する。

## 多角的チェック観点

### セキュリティ

- [ ] `@anthropic-ai/claude-agent-sdk` のモック alias が維持されている（テスト環境の SDK モック）
- [ ] `vite-tsconfig-paths` パッケージが `devDependencies` に追加されている（本番ビルドに含まれない）

### アーキテクチャ

- [ ] vitest.config.ts の `@/`, `@renderer/`, `@main/` alias はプロジェクトローカルの alias であり、tsconfig.json paths にも定義があるため、プラグインが正しく解決する。ただし、`@anthropic-ai/claude-agent-sdk` はテスト専用モックであり、tsconfig.json には未定義のため手動 alias として残す必要がある
- [ ] チェックスクリプトの第 6 チェック追加により、typesVersions の双方向チェックが完成する

### 互換性

- [ ] 既存の CI ジョブ（`.github/workflows/ci.yml` の `check-module-sync`）が引き続き正常動作する
- [ ] `pnpm check:module-sync` が CI ジョブと同じ結果を返す

## 成果物

| 成果物                              | パス                                                                     | 説明                                     |
| ----------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| vitest.config.ts（修正）            | `apps/desktop/vitest.config.ts`                                          | プラグイン導入、手動 alias 削除          |
| check-shared-module-sync.ts（修正） | `scripts/check-shared-module-sync.ts`                                    | 第 6 チェック追加、alias チェック更新    |
| package.json（修正）                | `package.json`                                                           | `check:module-sync` スクリプト追加       |
| package.json（修正）                | `apps/desktop/package.json`                                              | `vite-tsconfig-paths` devDependency 追加 |
| 実装サマリー                        | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-5-implementation.md` | 本ファイル                               |

## 完了条件

- [ ] `vite-tsconfig-paths` が `apps/desktop/package.json` の `devDependencies` に追加されている
- [ ] `apps/desktop/vitest.config.ts` の `plugins` に `tsconfigPaths()` が含まれている
- [ ] `apps/desktop/vitest.config.ts` から `@repo/shared` 系手動 alias（27 エントリ）が削除されている
- [ ] `apps/desktop/vitest.config.ts` に `@/`, `@renderer/`, `@main/`, `@anthropic-ai/claude-agent-sdk` の alias が残っている
- [ ] ルート `package.json` に `"check:module-sync": "tsx scripts/check-shared-module-sync.ts"` が追加されている
- [ ] `scripts/check-shared-module-sync.ts` に `checkTypesVersionsVsExports` 関数が追加されている
- [ ] `main()` 関数が 6 つのチェックを実行している
- [ ] `checkExportsVsAliases` と `checkAliasesVsExports` が alias 0 件時に PASS を返す
- [ ] Phase 4 の全テストが PASS する（Green 状態）
- [ ] 既存テスト 43 件が全 PASS する
- [ ] desktop パッケージの全テストが PASS する
- [ ] `pnpm typecheck` が全パッケージで 0 エラー
- [ ] `pnpm check:module-sync` が `ALL CHECKS PASSED` を出力する

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 5
```

## 次のPhase

Phase 6: テスト拡充
