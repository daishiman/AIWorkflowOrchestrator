# Phase 6: テスト拡充 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 6                                   |
| 機能名   | vitest-tsconfig-paths-sync          |
| 作成日   | 2026-02-24                          |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue    | #875                                |

## 目的

Phase 5 の実装完了後、カバレッジ不足箇所を特定し、エッジケース・エラーハンドリング・回帰テストを追加する。特に以下の観点でテストを拡充する:

1. 新規追加した `checkTypesVersionsVsExports` 関数のエッジケース
2. alias チェックの空 Map 早期 return パス
3. vitest-tsconfig-paths プラグイン導入後の回帰テスト
4. `parseAliases` のプラグイン導入後の新しい vitest.config.ts 形式への対応

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: カバレッジ計測（現状把握）

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/ --coverage
```

カバレッジレポートから以下を特定する:

- `scripts/check-shared-module-sync.ts` の Line / Branch / Function Coverage
- 未カバーの行番号とブランチ

### Task 2: エッジケーステストの追加

以下のテストを `scripts/__tests__/check-shared-module-sync-extended.test.ts` に追加する。

#### 2-1: `checkTypesVersionsVsExports` エッジケース（3件）

| #   | テストケース                                            | 検証内容                                              | 期待結果                                                  |
| --- | ------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| E1  | typesVersions が空 Map の場合                           | 空の `typesVersions` Map を渡した場合                 | `passed: true`, `missing: []`                             |
| E2  | typesVersions の全キーが exports に存在する場合         | 完全一致データ                                        | `passed: true`, `missing: []`                             |
| E3  | typesVersions にあるが exports にないキーが複数ある場合 | `foo`, `bar` が typesVersions にあるが exports にない | `passed: false`, `missing` に `"foo"`, `"bar"` が含まれる |

#### 2-2: alias チェック空 Map 早期 return テスト（2件）

| #   | テストケース                                  | 検証内容                                           | 期待結果                                          |
| --- | --------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| E4  | `checkExportsVsAliases` に空 alias Map を渡す | `aliases = new Map()`, `exportsMap` に複数エントリ | `passed: true`, `missing: []`（早期 return パス） |
| E5  | `checkAliasesVsExports` に空 alias Map を渡す | `aliases = new Map()`, `exportsMap` に複数エントリ | `passed: true`, `missing: []`（早期 return パス） |

#### 2-3: `main()` 統合テスト拡張（2件）

| #   | テストケース                                       | 検証内容                                                                   | 期待結果                                                                 |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| E6  | 6 チェック全実行の統合テスト（完全一致）           | 全 6 チェックが PASS する完全一致データで `main()` を実行                  | `process.exitCode` が `undefined`、レポートに `ALL CHECKS PASSED`        |
| E7  | typesVersions に余剰エントリがある場合の統合テスト | typesVersions に `extra` キーがあるが exports にない状態で `main()` を実行 | `process.exitCode === 1`、レポートに `typesVersions -> exports (FAILED)` |

#### 2-4: `parseAliases` プラグイン導入後テスト（1件）

| #   | テストケース                                         | 検証内容                                                                               | 期待結果                                                                |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| E8  | プラグイン導入後の vitest.config.ts をパースした場合 | `tsconfigPaths()` を含み `@repo/shared` alias を含まない vitest.config.ts をパースする | `result.size === 0`（`@repo/shared` 系 alias なし）、警告が出力されない |

### Task 3: 既存テストの回帰確認

Phase 6 のテスト追加後、以下を全て実行して回帰がないことを確認する:

```bash
# 既存テスト（43件）
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts

# Phase 4 テスト
pnpm vitest run scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts

# Phase 6 拡張テスト
pnpm vitest run scripts/__tests__/check-shared-module-sync-extended.test.ts

# 全スクリプトテスト一括実行
pnpm vitest run scripts/__tests__/
```

## 参照資料

| 資料                 | パス                                                                              | 用途                 |
| -------------------- | --------------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト設計   | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-4-test-creation.md`           | 既存テストケース一覧 |
| Phase 5 実装サマリー | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-5-implementation.md`          | 実装内容の確認       |
| チェックスクリプト   | `scripts/check-shared-module-sync.ts`                                             | カバレッジ計測対象   |
| 既存テスト           | `scripts/__tests__/check-shared-module-sync.test.ts`                              | 重複回避のための参照 |
| 品質要件仕様         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト品質基準の参照 |
| テストパターン仕様   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト設計指針の参照 |

## 実行手順

### Step 1: カバレッジ計測

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/ --coverage
```

出力されたカバレッジレポートから `check-shared-module-sync.ts` の未カバー行を特定し、Task 2 のテストケースで補完する。

### Step 2: テストケース追加

`scripts/__tests__/check-shared-module-sync-extended.test.ts` に E1〜E8 の 8 テストケースを追加する。

テスト追加時の注意事項:

- `beforeEach` / `afterEach` で `vi.restoreAllMocks()` を実行（P9 対策）
- `process.exitCode` を使用するテストは `afterEach` で `process.exitCode = undefined` にリセット
- テスト番号コメントを明記（`// #E1:` 等）

### Step 3: テスト実行

```bash
pnpm vitest run scripts/__tests__/
```

全テスト（既存 43 件 + Phase 4 新規 + Phase 6 拡張 8 件）が PASS することを確認する。

### Step 4: カバレッジ再計測

```bash
pnpm vitest run scripts/__tests__/ --coverage
```

以下のカバレッジ基準を確認する:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

基準未達の場合は、追加テストを作成して Step 2 に戻る。

## 統合テスト連携

| 連携対象               | 実施内容                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| scripts テスト一括実行 | `pnpm vitest run scripts/__tests__/` で拡張後の総合回帰を確認する |
| CI 実行パス            | `main()` 統合テストで `exitCode` とレポート整合性を確認する       |
| desktop 側回帰         | プラグイン導入時の解決系回帰は Phase 7/9 で継続監視する           |

## 多角的チェック観点

### テスト品質

- [ ] 各テストが 1 つの振る舞いのみを検証している（単一責任）
- [ ] テスト名がテスト内容を正確に記述している
- [ ] エッジケースとして空 Map、単一エントリ、複数エントリの 3 パターンが網羅されている
- [ ] `checkTypesVersionsVsExports` のテストが正方向（checkExportsVsTypesVersions）のテストと対称になっている

### 回帰防止

- [ ] 既存テスト 43 件に変更を加えていない
- [ ] 新規テストが既存テストと同一の describe ブロックに含まれていない（ファイル分離済み）
- [ ] Phase 5 で追加した機能（第 6 チェック、alias 空 Map 対応）の全ブランチがテストされている

## 成果物

| 成果物             | パス                                                                     | 説明                  |
| ------------------ | ------------------------------------------------------------------------ | --------------------- |
| 拡張テスト（更新） | `scripts/__tests__/check-shared-module-sync-extended.test.ts`            | エッジケース 8 件追加 |
| テスト拡充レポート | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-6-test-expansion.md` | 本ファイル            |

## 完了条件

- [ ] エッジケーステストが 8 件追加されている
- [ ] 全テストが PASS する（既存 43 件 + Phase 4 新規 + Phase 6 拡張 8 件）
- [ ] `check-shared-module-sync.ts` の Line Coverage が 80% 以上
- [ ] `check-shared-module-sync.ts` の Branch Coverage が 60% 以上
- [ ] `check-shared-module-sync.ts` の Function Coverage が 80% 以上
- [ ] テスト間で状態を共有していない（P9 対策確認済み）
- [ ] `process.exitCode` を使用するテストが `afterEach` でリセットしている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
