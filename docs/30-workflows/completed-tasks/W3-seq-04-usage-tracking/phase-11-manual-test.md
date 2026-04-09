# Phase 11: 手動テスト

## メタ情報

| 項目           | 内容                                          |
| -------------- | --------------------------------------------- |
| Phase          | 11                                            |
| タスクID       | UT-SKILL-WIZARD-W3-seq-04                     |
| 機能名         | 使用率計装（usage tracking）                  |
| 前提Phase      | Phase 10                                      |
| 後続Phase      | Phase 12                                      |
| 作成日         | 2026-04-07                                    |
| ステータス     | pending                                       |
| タスク種別判定 | **NON_VISUAL**（visible surface change なし） |

## 目的

`SkillCreateWizard.tsx` と `CompleteStep.tsx` に追加した usage tracking が、手動ウォークスルーとモック確認で正しく発火することを検証する。

このタスクは visible UI の変更を伴わないため、スクリーンショット計画は作成しない。主証跡は `manual-test-report.md` / `manual-test-checklist.md` / `manual-test-result.md` に記録する console / mock / automation evidence とする。

## 判定方針

- `NON_VISUAL` として扱う。
- screenshot plan は前提にしない。
- 既存の `SkillAnalytics` / `AnalyticsStore` は実行ログ用途の基盤であり、今回の UI イベントの正本ではないため、renderer-local の `trackEvent` 振る舞いを優先して確認する。
- `skill_wizard_started` は payload なしで 1 回だけ、空 payload のまま記録されることを確認する。
- `manual-test-report.md` には実施概要と所見をまとめ、`manual-test-checklist.md` は TC-ID と evidence の補助証跡として残す。

## テストケース

| TC-ID | シナリオ                    | 期待結果                                                                                       | 主証跡                           |
| ----- | --------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| TC-01 | ウィザード起動時            | `skill_wizard_started` が 1 回、空 payload で記録される                                        | DevTools console / mock 呼び出し |
| TC-02 | Step 1 を complete で送信   | `skill_wizard_step1_completed` が `method: "complete"` で記録される                            | DevTools console / mock 呼び出し |
| TC-03 | Step 1 を skip で送信       | `skill_wizard_step1_completed` が `method: "skip"` かつ `skippedAtQuestion` を含んで記録される | DevTools console / mock 呼び出し |
| TC-04 | LLM 生成完了時              | `skill_wizard_generation_completed` が成功時のみ記録される                                     | DevTools console / mock 呼び出し |
| TC-05 | 品質フィードバック 👍       | `skill_skeleton_quality_feedback` が `satisfied: true` で記録される                            | DevTools console / mock 呼び出し |
| TC-06 | 品質フィードバック 👎       | `skill_skeleton_quality_feedback` が `satisfied: false` で記録される                           | DevTools console / mock 呼び出し |
| TC-07 | Next action: execute        | `skill_wizard_next_action` が `execute` で記録される                                           | DevTools console / mock 呼び出し |
| TC-08 | Next action: open_editor    | `skill_wizard_next_action` が `open_editor` で記録される                                       | DevTools console / mock 呼び出し |
| TC-09 | Next action: create_another | `skill_wizard_next_action` が `create_another` で記録される                                    | DevTools console / mock 呼び出し |

## 非視覚ウォークスルー記録要件

- `manual-test-checklist.md` に TC-ID / 実施内容 / evidence / 判定 を必ず記録する。
- `manual-test-result.md` には、証跡の主ソース、スクリーンショットを作らない理由、再現手順を明記する。
- `discovered-issues.md` は 0 件でも必ず作成し、発見事項がない場合はその旨を明記する。
- `console.info` の出力は開発環境の確認結果として扱い、本番では抑制される前提を記録する。

## 参照資料

| 資料名           | パス                                         | 用途            |
| ---------------- | -------------------------------------------- | --------------- |
| 実装設計書       | `outputs/phase-2/implementation-design.md`   | Phase 2 成果物  |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物  |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`    | Phase 10 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物  |
| イベントスキーマ | `outputs/phase-1/event-schema-definition.md` | Phase 1 成果物  |
| テスト仕様書     | `outputs/phase-4/test-specification.md`      | Phase 4 成果物  |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`     | Phase 6 成果物  |
| カバレッジ計画   | `outputs/phase-7/coverage-plan.md`           | Phase 7 成果物  |
| リファクタ計画   | `outputs/phase-8/refactoring-plan.md`        | Phase 8 成果物  |

## 実行タスク

1. Phase 10 の判定と Phase 1 の AC-01〜AC-05 を確認する。
2. `manual-test-checklist.md` の記録欄を先に用意する。
3. TC-01〜TC-09 を手動ウォークスルーで順番に実施し、各結果を記録する。
4. console / mock / automation evidence を整理し、`manual-test-report.md` と `manual-test-result.md` に集約する。
5. 発見事項がある場合は `discovered-issues.md` に転記する。

## 統合テスト連携

- Phase 4 / 6 / 7 の自動テスト結果を参照し、手動確認では記録順序と payload の整合だけを追加確認する。
- Phase 9 の品質評価で確認した StrictMode / production の前提を、console 証跡の解釈にそのまま使う。
- Phase 12 では、この NON_VISUAL 判定と TC-ID / evidence の記録をそのまま documentation update に引き継ぐ。

## 成果物

| 成果物                   | パス                                        | 説明                           |
| ------------------------ | ------------------------------------------- | ------------------------------ |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`    | 実施概要と所見                 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-ID と evidence の対応表     |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 実施結果・証跡主ソース・判定   |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 0 件でも作成する改善・懸念一覧 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `manual-test-report.md` が作成されていること
- [ ] TC-01〜TC-09 がすべて PASS であること
- [ ] `manual-test-result.md` に証跡の主ソースとスクリーンショット不要理由が記録されていること
- [ ] `discovered-issues.md` が 0 件でも作成されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. TC-01〜TC-09 の実施
3. 手動テストチェックリスト記録
4. 手動テスト結果と発見事項の記録
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
