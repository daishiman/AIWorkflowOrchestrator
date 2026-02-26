# Phase 7: カバレッジ確認

## メタ情報

| 項目               | 内容                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                                                |
| Phase              | 7 / 13                                                                                                    |
| Phase名称          | カバレッジ確認                                                                                            |
| 機能名             | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御）                              |
| 作成日             | 2026-02-26                                                                                                |
| 前提Phase          | Phase 5（実装）、Phase 6（テスト拡充）                                                                    |
| 目的               | Phase 6 のテスト拡充結果を最終確認し、カバレッジ基準を満たしているか判定する。未達の場合は Phase 6 に戻る |
| 成果物ディレクトリ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/`                           |

## 目的

Phase 6 でテスト拡充した結果のカバレッジを最終計測し、プロジェクトのカバレッジ基準（Line 80%, Branch 60%, Function 80%）を満たしているか判定する。基準未達の場合は Phase 6 に戻って追加テストを作成する。

## 実行タスク

- **Task 7-1**: カバレッジの最終計測
- **Task 7-2**: カバレッジ基準との照合・判定
- **Task 7-3**: カバレッジレポートの作成

## 参照資料

| 参照資料                   | パス                                                                                                           | 内容                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 5 実装サマリー       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/implementation-summary.md`       | 実装内容と対象範囲         |
| Phase 5 コマンド参照       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/validation-command-reference.md` | 検証コマンド定義           |
| Phase 6 カバレッジレポート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/coverage-report.md`              | Phase 6 時点のカバレッジ   |
| Phase 6 統合テスト報告     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/integration-test.md`             | 追加テスト一覧             |
| テストコード               | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                        | 全テスト                   |
| quick_validate.js          | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                       | テスト対象スクリプト       |
| utils.js                   | `.claude/skills/skill-creator/scripts/utils.js`                                                                | 共通ユーティリティ         |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                             | カバレッジ基準の定義       |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                         | P41（v8 カバレッジ注意点） |

## 実行手順

### Task 7-1: カバレッジの最終計測

1. 全テスト（Phase 4 + Phase 6）を実行し、カバレッジを計測する:

   ```bash
   cd .claude/skills/skill-creator/scripts
   pnpm vitest run __tests__/quick_validate.test.js --coverage
   ```

2. テスト結果を確認する:
   - 全テストが PASS しているか
   - FAIL しているテストがある場合、Phase 5 の実装に戻って修正する

3. カバレッジレポートから以下の指標を抽出する:

   | ファイル          | Line Coverage | Branch Coverage | Function Coverage | Uncovered Lines |
   | ----------------- | ------------- | --------------- | ----------------- | --------------- |
   | quick_validate.js | ?%            | ?%              | ?%                | （行番号列挙）  |
   | utils.js          | ?%            | ?%              | ?%                | （行番号列挙）  |

### Task 7-2: カバレッジ基準との照合・判定

1. 以下の基準テーブルに計測結果を記入し、合否を判定する:

   | 指標              | 最低基準 | 推奨基準 | 計測結果 | 判定        |
   | ----------------- | -------- | -------- | -------- | ----------- |
   | Line Coverage     | 80%      | 90%      | ?%       | PASS / FAIL |
   | Branch Coverage   | 60%      | 70%      | ?%       | PASS / FAIL |
   | Function Coverage | 80%      | 90%      | ?%       | PASS / FAIL |

2. 判定ルール:

   | 条件                    | 判定結果               | アクション                                     |
   | ----------------------- | ---------------------- | ---------------------------------------------- |
   | 3指標すべて最低基準以上 | **PASS**               | Phase 8 に進む                                 |
   | 1指標以上が最低基準未達 | **FAIL: Phase 6 戻り** | Phase 6 に戻り、未カバー箇所のテストを追加する |
   | 3指標すべて推奨基準以上 | **PASS（推奨達成）**   | Phase 8 に進む（高品質）                       |

3. FAIL の場合の詳細手順:
   - 未カバー行・ブランチを特定する
   - 対応するテストケースを設計する
   - Phase 6 に戻り、テストを追加する
   - Phase 7 を再実行する

4. P41 対策: v8 カバレッジプロバイダのインライン関数カウントに注意する:
   - `utils.js` 内の arrow function（`parseFrontmatter` 内のコールバック等）が独立関数としてカウントされる可能性がある
   - Function Coverage が想定より低い場合、インライン関数の実行パスを確認する
   - テストで明示的にコールバック呼び出しを検証する（例: `parseFrontmatter` の各分岐パス）

### Task 7-3: カバレッジレポートの作成

1. `outputs/phase-7/coverage-report.md` を作成する — 以下を記載:

   | セクション             | 内容                                          |
   | ---------------------- | --------------------------------------------- |
   | テスト実行結果サマリー | テスト総数、PASS数、FAIL数、実行時間          |
   | カバレッジ計測結果     | ファイル別の Line/Branch/Function Coverage    |
   | カバレッジ基準との比較 | 最低基準・推奨基準との照合テーブル            |
   | 判定結果               | PASS / FAIL（Phase 6 戻り）/ PASS（推奨達成） |
   | 未カバー箇所一覧       | ファイル名・行番号・該当コードの概要          |
   | P41 影響分析           | インライン関数カウントの影響有無              |

2. `outputs/phase-7/integration-test.md` を作成する — 以下を記載:

   | セクション             | 内容                                                           |
   | ---------------------- | -------------------------------------------------------------- |
   | 全テスト一覧           | Phase 4 + Phase 6 の全テストケース（テスト名・結果・所要時間） |
   | テスト分類集計         | 単体テスト / 統合テスト / 境界値テスト / 組合せテストの件数    |
   | テストフィクスチャ一覧 | `__tests__/fixtures/` 配下の全ディレクトリと用途               |

## 統合テスト連携

- Phase 7 はテストの追加を行わない（カバレッジの確認のみ）
- FAIL 判定の場合のみ Phase 6 に戻りテストを追加する
- Phase 7 の PASS 判定後、Phase 8（リファクタリング）でテストが壊れないことを担保する

## 多角的チェック観点

| 観点                  | 適用 | 確認内容                                                                     |
| --------------------- | ---- | ---------------------------------------------------------------------------- |
| カバレッジ基準        | ○    | Line 80%, Branch 60%, Function 80% の最低基準を満たすか                      |
| P41 対策              | ○    | v8 プロバイダのインライン関数カウントが Function Coverage に影響していないか |
| テスト品質            | ○    | テストが意味のある検証を行っているか（カバレッジ稼ぎの空テストがないか）     |
| 再現性                | ○    | カバレッジ計測が毎回同じ結果を返すか（非決定論的テストがないか）             |
| コード品質            | ○    | テストコード自体が Lint・Prettier に準拠                                     |
| UI/UX                 | —    | 本Phase はカバレッジ確認のため UI/UX は対象外                                |
| Electron セキュリティ | —    | 本タスクは Electron IPC を含まない                                           |

## 成果物

| 成果物             | パス                                                                                               | 説明                                     |
| ------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| カバレッジレポート | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/coverage-report.md`  | 最終カバレッジ計測結果・判定             |
| 統合テスト報告     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/integration-test.md` | 全テスト一覧・分類集計・フィクスチャ一覧 |

## 完了条件

- [ ] 全テスト（Phase 4 + Phase 6）が PASS している
- [ ] カバレッジ計測が完了している
- [ ] カバレッジ基準テーブルが記入されている（Line/Branch/Function × 計測結果 × 判定）
- [ ] 判定結果が PASS（最低基準以上）である — FAIL の場合は Phase 6 に戻る
- [ ] 未カバー箇所が一覧化されている（推奨基準未達の箇所を含む）
- [ ] P41 影響分析が記載されている
- [ ] `outputs/phase-7/coverage-report.md` が作成されている
- [ ] `outputs/phase-7/integration-test.md` が作成されている
- [ ] `artifacts.json` の Phase 7 ステータスが `completed` に更新されている

## タスク100%実行確認【必須】

- [ ] 全タスク（7-1, 7-2, 7-3）が100%実行完了
- [ ] 各成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] 判定結果が PASS の場合のみ本Phase を完了とする

## 次のPhase

- **PASS の場合**: Phase 8: リファクタリング — コード品質改善を行う
- **FAIL の場合**: Phase 6: テスト拡充 — 未カバー箇所のテストを追加し、Phase 7 を再実行する
