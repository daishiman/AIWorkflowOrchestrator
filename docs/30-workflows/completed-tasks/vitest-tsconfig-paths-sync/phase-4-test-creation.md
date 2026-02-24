# Phase 4: テスト作成（TDD: Red） - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 4                                   |
| 機能名   | vitest-tsconfig-paths-sync          |
| 作成日   | 2026-02-24                          |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue    | #875                                |

## 目的

Phase 5 の実装対象（vitest-tsconfig-paths プラグイン導入、pnpm スクリプト追加、余剰エントリ検出強化）に対するテストケースを先に作成し、全テストが FAIL する Red 状態を確認する。既存テスト 43 件との重複を回避しつつ、新機能に特化したテストを追加する。

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: 新規テストケースの設計

以下の 3 カテゴリのテストケースを設計する。

#### カテゴリ A: pnpm スクリプト実行テスト（2件）

| #   | テストケース                                                     | 検証内容                                                                           | 期待結果                                           |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| A1  | `check:module-sync` スクリプトが `package.json` に定義されている | ルート `package.json` の `scripts` フィールドに `check:module-sync` キーが存在する | キーが存在し、値が `pnpm check:module-sync` である |
| A2  | `check:module-sync` スクリプトが正常終了する（完全一致データ）   | モックされた3層データが完全一致している状態で `main()` を呼び出す                  | `process.exitCode` が `undefined`（正常終了）      |

> **注記**: A2 は既存テスト #27 と類似するが、pnpm スクリプト経由の実行パスを想定したテストとして独立して設計する。ただし、実装時に #27 と統合可能と判断した場合はスキップしてよい。

#### カテゴリ B: vitest-tsconfig-paths プラグイン導入後の検証テスト（4件）

| #   | テストケース                                                                    | 検証内容                                                                                                                   | 期待結果                                                                          |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| B1  | `vitest.config.ts` から `@repo/shared` 手動 alias が削除されている              | `parseAliases()` で `vitest.config.ts`（プラグイン導入後）をパースした結果に `@repo/shared` プレフィックスの alias が 0 件 | `result.size === 0`（`@repo/shared` 系のみカウント）                              |
| B2  | vitest-tsconfig-paths プラグインが `vitest.config.ts` の plugins に含まれている | `vitest.config.ts` ファイル内に `tsconfigPaths()` の呼び出しが存在する                                                     | ファイル内容に `tsconfigPaths` 文字列が含まれる                                   |
| B3  | プラグイン導入後も `@/` と `@renderer/` の非shared alias は維持される           | `vitest.config.ts` から `@/` と `@renderer/` の alias 定義が存在する                                                       | alias にこれら 2 つのエントリが存在する                                           |
| B4  | プラグイン導入後にチェックスクリプトの alias 検証がスキップまたは更新される     | `checkExportsVsAliases` と `checkAliasesVsExports` の動作がプラグイン導入後のゼロ alias 状態に対応する                     | プラグイン使用時は alias チェックをスキップする、またはチェック結果が PASS になる |

#### カテゴリ C: チェックスクリプト拡張テスト（3件）

| #   | テストケース                                                           | 検証内容                                                                                                                            | 期待結果                                  |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| C1  | `formatReport()` が修正アクションヒントを出力する                      | 不整合データで `formatReport()` を実行し、どのファイルを修正すべきかのヒントが出力される                                            | 出力に `Action:` 行が含まれる             |
| C2  | typesVersions の逆方向チェック（typesVersions -> exports）が実装される | typesVersions にあるが exports にないエントリを検出する                                                                             | 余剰エントリが `missing` 配列に含まれる   |
| C3  | 実ファイル整合性テスト（モックなし）                                   | 実際の `packages/shared/package.json`、`apps/desktop/tsconfig.json`、`apps/desktop/vitest.config.ts` を使用して `main()` を実行する | 全チェック PASS（不整合が解消済みの前提） |

### Task 2: テストファイルの作成

#### ファイル配置

| ファイル             | パス                                                          | 説明                   |
| -------------------- | ------------------------------------------------------------- | ---------------------- |
| プラグイン導入テスト | `scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts`      | カテゴリ B のテスト    |
| スクリプト拡張テスト | `scripts/__tests__/check-shared-module-sync-extended.test.ts` | カテゴリ A, C のテスト |

#### テストファイル共通規約

- `vi.mock("fs")` で fs モジュールをモック（既存テストと同じパターン）
- `beforeEach` で `vi.restoreAllMocks()` を実行（P9 対策: テスト間状態リーク防止）
- `afterEach` で `vi.restoreAllMocks()` を実行
- テスト番号をコメントで明記（`// #A1:` 等）

### Task 3: Red 状態の確認

テスト実行コマンド:

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts
```

**確認基準**:

- 新規テスト全件（最大 9 件）が FAIL する
- 既存テスト 43 件は変更なし（PASS のまま）

## 参照資料

| 資料                   | パス                                                                        | 用途                                                               |
| ---------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 要件定義書             | `outputs/phase-1/requirements.md`                                           | 機能要件FR-1〜FR-4の検証対象を確認                                 |
| 設計書                 | `outputs/phase-2/design-document.md`                                        | 技術選定（プラグイン導入 or スクリプト拡張）の確認                 |
| 設計レビュー報告書     | `outputs/phase-3/design-review-result.md`                                   | レビュー指摘事項の反映確認                                         |
| 既存チェックスクリプト | `scripts/check-shared-module-sync.ts`                                       | テスト対象の既存実装（既存5 + 追加予定1チェック、4パーサー）       |
| 既存テスト             | `scripts/__tests__/check-shared-module-sync.test.ts`                        | 重複回避のため43件の既存テスト構成を参照                           |
| vitest.config.ts       | `apps/desktop/vitest.config.ts`                                             | 現在の手動 alias 定義（27エントリ）の確認                          |
| tsconfig.json          | `apps/desktop/tsconfig.json`                                                | paths 設定（28エントリ）の確認                                     |
| package.json (shared)  | `packages/shared/package.json`                                              | exports（26エントリ）と typesVersions（25エントリ）の確認          |
| package.json (root)    | `package.json`                                                              | 既存スクリプト一覧（`check:module-sync` が未登録であることの確認） |
| 品質要件仕様           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト品質基準の参照                                               |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    | CI実行パス整合の参照                                               |

## 実行手順

### Step 1: 既存テストの動作確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

43 件全 PASS を確認する。

### Step 2: テストファイル作成

1. `scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts` を作成（カテゴリ B: 4件）
2. `scripts/__tests__/check-shared-module-sync-extended.test.ts` を作成（カテゴリ A: 2件、カテゴリ C: 3件）

### Step 3: Red 状態確認

```bash
pnpm vitest run scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts
```

全新規テストが FAIL することを確認する。

### Step 4: 既存テストの回帰確認

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

既存 43 件が全 PASS のままであることを確認する。

## 統合テスト連携

| 連携対象               | 実施内容                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| scripts テストスイート | 新規テスト（最大9件）と既存43件を分離実行し、回帰有無を切り分ける                       |
| desktop テスト         | プラグイン導入有無に応じて `apps/desktop` テストへの影響を Phase 5 で検証する前提を作る |
| CI 連携                | `pnpm check:module-sync` 相当シナリオをカテゴリAに含め、CIと同等パスを先に検証する      |

## 多角的チェック観点

### テスト設計の品質

- [ ] 既存テスト 43 件との重複がない（同一の入力・検証を行うテストが存在しない）
- [ ] 各テストが独立して実行可能（テスト間で状態を共有していない）
- [ ] テストケースが Phase 2 設計書の全要件をカバーしている
- [ ] `beforeEach` / `afterEach` で `vi.restoreAllMocks()` を実行している（P9 対策）

### アーキテクチャ整合性

- [ ] テストファイルの配置が既存パターン（`scripts/__tests__/`）に従っている
- [ ] テストの import パスが相対パス（`../check-shared-module-sync`）を使用している
- [ ] モック戦略が既存テストと一致している（`vi.mock("fs")`）

## 成果物

| 成果物           | パス                                                                    | 説明                                            |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| プラグインテスト | `scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts`                | vitest-tsconfig-paths 導入後の検証テスト（4件） |
| 拡張テスト       | `scripts/__tests__/check-shared-module-sync-extended.test.ts`           | pnpm スクリプト・チェック拡張テスト（5件）      |
| テスト設計書     | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-4-test-creation.md` | 本ファイル                                      |

## 完了条件

- [ ] 新規テストファイル 2 つが作成されている
- [ ] 新規テスト全件（最大 9 件）が FAIL する（Red 状態）
- [ ] 既存テスト 43 件が全 PASS のまま変更されていない
- [ ] テスト間で状態を共有していない（`beforeEach` で `vi.restoreAllMocks()` 実行）
- [ ] テストケースが設計書の全要件（pnpm スクリプト、プラグイン導入、チェック拡張）をカバーしている
- [ ] テスト実行ディレクトリがプロジェクトルートである（P40 対策: `scripts/__tests__/` はルートの vitest.config が適用される）

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
