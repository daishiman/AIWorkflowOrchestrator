# Phase 10: 最終レビューゲート

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 10                                          |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 9                                           |
| 次Phase | 11                                          |
| 作成日  | 2026-04-19                                  |

## 目的

- 受入条件（Acceptance Criteria）の全件を確認し、Phase 11 への進行可否を判定する
- 問題が検出された場合は適切なフェーズへ差し戻す

## 実行タスク

### T-10-1: AC-1〜AC-5 の証跡を回収

- Phase 5〜9 の成果物から、各 AC を裏付けるログ・テスト結果・型チェック結果を確認する
- 証跡が不足している場合は当該フェーズへ差し戻す

### T-10-2: レビュー観点テーブルを評価

- 下記レビュー観点テーブルの各 AC を PASS / FAIL で判定する
- FAIL の場合は原因と戻り先を併記する

### T-10-3: 総合判定を記録

- 判定テーブルに従って PASS / MINOR / MAJOR / CRITICAL を決定する
- MINOR は当フェーズで修正可能な軽微指摘のみに限定する

### T-10-4: 最終レビュー成果物を出力

- `outputs/phase-10/final-review-result.md` に判定結果を記録する
- `outputs/phase-10/shipping-checklist.md` に Phase 11 着手前の残確認事項を記録する

## レビュー観点テーブル

| AC ID | 観点                        | 確認内容                                                            | 結果                |
| ----- | --------------------------- | ------------------------------------------------------------------- | ------------------- |
| AC-1  | update モードの動作         | `update` モードで `runUpdateWorkflow` が呼ばれる                    | [ ] PASS / [ ] FAIL |
| AC-2  | improve-prompt モードの動作 | `improve-prompt` モードで `runImprovePromptWorkflow` が呼ばれる     | [ ] PASS / [ ] FAIL |
| AC-3  | 誤呼び出しの排除            | `update` / `improve-prompt` 各モードで `init_skill.js` が呼ばれない | [ ] PASS / [ ] FAIL |
| AC-4  | 型安全性                    | TypeScript 型チェックが PASS（エラー 0 件）                         | [ ] PASS / [ ] FAIL |
| AC-5  | テスト品質                  | 全ユニットテストが PASS（グリーン）                                 | [ ] PASS / [ ] FAIL |

## レビュー結果判定テーブル

| 判定     | 基準                                      | 対応                              |
| -------- | ----------------------------------------- | --------------------------------- |
| PASS     | 全 AC が PASS                             | Phase 11 へ進行                   |
| MINOR    | 軽微な問題（コードスタイル等）が 1 件以上 | 当フェーズで修正後、再レビュー    |
| MAJOR    | AC-1〜AC-3 のいずれかが FAIL              | Phase 6〜7 へ差し戻し（実装修正） |
| CRITICAL | AC-4 または AC-5 が FAIL かつ修正困難     | Phase 6 へ差し戻し（設計見直し）  |

## 戻り先決定基準テーブル

| 問題カテゴリ                 | 戻り先                      | 理由                       |
| ---------------------------- | --------------------------- | -------------------------- |
| モード分岐ロジックの誤り     | Phase 6（実装）             | switch/if 分岐の修正が必要 |
| ワークフロー関数呼び出し漏れ | Phase 7（テスト修正）       | テストと実装の整合性確認   |
| TypeScript 型エラー          | Phase 8（リファクタリング） | 型定義の見直しが必要       |
| テスト失敗                   | Phase 9（品質保証）         | テストケースの修正が必要   |
| Lint エラー                  | Phase 9（品質保証）         | コードスタイル修正が必要   |

## 参照資料

| 資料名                 | パス                                                                                         | 用途                               |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 要件定義書     | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-1-requirements.md`      | AC-1〜AC-5 の原典確認              |
| Phase 5 実装仕様書     | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-5-implementation.md`    | 実装完了条件の確認                 |
| Phase 9 品質保証仕様書 | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-9-quality-assurance.md` | test / typecheck / lint 結果の確認 |

## 成果物

| 成果物               | パス                                      | 内容                          |
| -------------------- | ----------------------------------------- | ----------------------------- |
| 最終レビュー判定     | `outputs/phase-10/final-review-result.md` | AC ごとの判定と総合結論       |
| 出荷前チェックリスト | `outputs/phase-10/shipping-checklist.md`  | Phase 11 進行前の最終確認項目 |

## 完了条件

- [ ] AC-1: update モードで `runUpdateWorkflow` が呼ばれることを確認した
- [ ] AC-2: improve-prompt モードで `runImprovePromptWorkflow` が呼ばれることを確認した
- [ ] AC-3: 各モードで `init_skill.js` が呼ばれないことを確認した
- [ ] AC-4: TypeScript 型チェックが PASS であることを確認した
- [ ] AC-5: 全ユニットテストが PASS であることを確認した
- [ ] レビュー結果が「PASS」と判定され、Phase 11 への進行が承認された
