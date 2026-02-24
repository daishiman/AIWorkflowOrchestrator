# Phase 7: テストカバレッジ確認 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 7                                   |
| 機能名   | vitest-tsconfig-paths-sync          |
| 作成日   | 2026-02-24                          |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue    | #875                                |

## 目的

Phase 6 で追加したテストを含む全テストのカバレッジを計測し、プロジェクトのカバレッジ基準を充足していることを確認する。基準未達の場合は Phase 6 に戻ってテストを追加する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定                            |
| ----------------- | -------- | -------- | ------------------------------- |
| Line Coverage     | 80%      | 90%      | 最低基準未達で Phase 6 差し戻し |
| Branch Coverage   | 60%      | 70%      | 最低基準未達で Phase 6 差し戻し |
| Function Coverage | 80%      | 90%      | 最低基準未達で Phase 6 差し戻し |

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: カバレッジ計測

#### 1-1: スクリプトテストのカバレッジ

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/ --coverage
```

対象ファイル: `scripts/check-shared-module-sync.ts`

#### 1-2: desktop パッケージのテストカバレッジ（回帰確認）

```bash
cd apps/desktop
pnpm vitest run --coverage
```

対象: `apps/desktop/vitest.config.ts` の修正（プラグイン導入）が既存テストのカバレッジに影響していないことを確認する。

### Task 2: カバレッジレポートの分析

カバレッジ計測結果から以下を記録する:

#### 2-1: `scripts/check-shared-module-sync.ts` のカバレッジ

| 指標              | 計測値 | 最低基準 | 推奨基準 | 判定        |
| ----------------- | ------ | -------- | -------- | ----------- |
| Line Coverage     | \_\_%  | 80%      | 90%      | PASS / FAIL |
| Branch Coverage   | \_\_%  | 60%      | 70%      | PASS / FAIL |
| Function Coverage | \_\_%  | 80%      | 90%      | PASS / FAIL |

#### 2-2: 未カバー行の特定

カバレッジレポートで未カバーとして報告された行を列挙する:

| 行番号         | コード内容 | 未カバーの理由 | 対応要否 |
| -------------- | ---------- | -------------- | -------- |
| (計測後に記入) |            |                |          |

#### 2-3: 未カバーブランチの特定

| 行番号         | ブランチ条件 | 未通過側 | 対応要否 |
| -------------- | ------------ | -------- | -------- |
| (計測後に記入) |              |          |          |

### Task 3: 判定とアクション

#### 全指標が最低基準を達成した場合

→ Phase 8（リファクタリング）に進む

#### いずれかの指標が最低基準未達の場合

→ Phase 6 に戻り、以下の手順で追加テストを作成する:

1. Task 2 の未カバー行/ブランチ一覧から、テスト追加で到達可能な箇所を特定する
2. テストケースを設計し、`scripts/__tests__/check-shared-module-sync-extended.test.ts` に追加する
3. テスト実行後、再度 Task 1 からカバレッジを計測する

**注意**: 以下のコードは「テストでカバーする必要がない」ため、未カバーでも許容する:

- `isDirectRun` の条件分岐（行 414-421）: スクリプト直接実行時のエントリポイントであり、テスト環境では実行されない
- `printSummary` 内の `console.log` 呼び出し: `formatReport` のテストでロジックはカバー済み

### Task 4: テスト総数の記録

| テストカテゴリ             | テスト数 | ファイル                                    |
| -------------------------- | -------- | ------------------------------------------- |
| 既存テスト                 | 43件     | `check-shared-module-sync.test.ts`          |
| Phase 4 新規（カテゴリ A） | 2件      | `check-shared-module-sync-extended.test.ts` |
| Phase 4 新規（カテゴリ B） | 4件      | `vitest-tsconfig-paths-plugin.test.ts`      |
| Phase 4 新規（カテゴリ C） | 3件      | `check-shared-module-sync-extended.test.ts` |
| Phase 6 拡張（E1-E8）      | 8件      | `check-shared-module-sync-extended.test.ts` |
| **合計**                   | **60件** |                                             |

> **注記**: 上記は Phase 4 設計時の最大見積もり。実装時に統合・スキップされたテストがある場合は実際の数に更新する。

## 参照資料

| 資料               | パス                                                                        | 用途                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                 | 実装内容の確認       |
| Phase 6 テスト拡充 | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-6-test-expansion.md`    | 追加テスト一覧       |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                          | カバレッジ基準の定義 |
| チェックスクリプト | `scripts/check-shared-module-sync.ts`                                       | カバレッジ計測対象   |
| テストファイル群   | `scripts/__tests__/*.test.ts`                                               | テスト実行対象       |
| 品質要件仕様       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート基準の参照 |
| CI/CD仕様          | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    | CI計測観点の参照     |

## 実行手順

### Step 1: 全テスト PASS 確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260224-061309-wt2
pnpm vitest run scripts/__tests__/
```

全テストが PASS することを確認する。1 件でも FAIL がある場合は Phase 5 または Phase 6 に戻って修正する。

### Step 2: カバレッジ計測

```bash
pnpm vitest run scripts/__tests__/ --coverage
```

### Step 3: カバレッジレポート分析

出力結果から Task 2 のテーブルを埋める。

### Step 4: 判定

- 全指標が最低基準以上 → Phase 8 へ進む
- いずれかが最低基準未達 → Phase 6 に戻る（Task 3 参照）

### Step 5: desktop パッケージ回帰確認（任意）

vitest-tsconfig-paths プラグイン導入による影響がないことを確認する:

```bash
cd apps/desktop && pnpm vitest run --coverage 2>&1 | tail -20
```

desktop パッケージ全体のカバレッジが Phase 5 実装前と同等であることを確認する。

## 統合テスト連携

| 連携対象           | 実施内容                                                                               |
| ------------------ | -------------------------------------------------------------------------------------- |
| scripts カバレッジ | `check-shared-module-sync.ts` の実測値を Phase 9 品質ゲート入力として記録する          |
| desktop 側回帰     | `apps/desktop` の `vitest` カバレッジ変化を監視し、alias解決変更の副作用有無を確認する |
| 差し戻し連携       | 基準未達時は Phase 6 に戻し、追加テスト→再計測のループを明確化する                     |

## 多角的チェック観点

### カバレッジ品質

- [ ] Line Coverage が最低基準 80% 以上
- [ ] Branch Coverage が最低基準 60% 以上
- [ ] Function Coverage が最低基準 80% 以上
- [ ] 未カバー行がテスト不可能な行（スクリプトエントリポイント等）に限定されている

### テスト健全性

- [ ] 全テストが PASS している（FAIL なし）
- [ ] テスト実行時間が妥当（スクリプトテスト全体で 30 秒以内）
- [ ] テスト間で順序依存がない（ランダム実行でも全 PASS する）

## 成果物

| 成果物             | パス                                                                     | 説明                         |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------- |
| カバレッジレポート | `docs/30-workflows/vitest-tsconfig-paths-sync/phase-7-coverage-check.md` | 本ファイル（計測結果を記入） |

## 完了条件

- [ ] `scripts/check-shared-module-sync.ts` の Line Coverage が 80% 以上
- [ ] `scripts/check-shared-module-sync.ts` の Branch Coverage が 60% 以上
- [ ] `scripts/check-shared-module-sync.ts` の Function Coverage が 80% 以上
- [ ] カバレッジレポートの分析テーブル（Task 2）が記入されている
- [ ] 全テストが PASS している
- [ ] 判定結果（Phase 8 進行 or Phase 6 差し戻し）が明記されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 7
```

## 次のPhase

Phase 8: リファクタリング
