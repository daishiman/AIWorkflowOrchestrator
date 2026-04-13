# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 11                                                   |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 10                                             |
| 後続Phase  | Phase 12                                             |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

docs-only であることを前提に、文書・台帳・validator の整合を確認する。UI 撮影は不要で、非視覚証跡を正本として残す。

## 実行タスク

1. `SKILL.md` / `LOGS.md` / mirror parity を確認する。
2. `manual-test-checklist.md` を作成し、確認項目を固定する。
3. `manual-test-result.md` に NON_VISUAL 判定と TC-ID ↔ evidence を記録する。
4. `discovered-issues.md` に 0 件でも結果を残す。
5. `validate-phase-output.js` と `verify-all-specs.js` を再実行する。

## タスク分類と証跡種別

| 項目               | 値                     |
| ------------------ | ---------------------- |
| タスク分類         | docs-only              |
| 証跡種別           | NON_VISUAL             |
| スクリーンショット | 不要（文書証跡で代替） |

**NON_VISUAL 判定理由**: `sendToAnalyticsProvider` は Main プロセス内の内部処理であり、ユーザーが直接見る UI は増えない。確認対象は文書の整合、台帳の同期、validator の再実行結果であり、画面撮影は根拠にならない。

## 手動テストシナリオ

| ID    | シナリオ                                                        | 確認方法                                |
| ----- | --------------------------------------------------------------- | --------------------------------------- |
| MT-01 | `SKILL.md` から canonical path と参照先が辿れる                 | 参照リンクとファイル実在の目視確認      |
| MT-02 | `LOGS.md` と mirror parity が揃っている                         | `diff -qr` と更新履歴の確認             |
| MT-03 | validator を replay しても phase 定義と artifacts が崩れない    | `validate-phase-output.js` 実行結果確認 |
| MT-04 | docs-only であることが index.md / artifacts.json と一致している | `taskType` とタスク分類の突合確認       |

## 統合テスト連携【必須】

| 確認項目   | 確認内容                                                                                 | 期待結果 | 実行結果   |
| ---------- | ---------------------------------------------------------------------------------------- | -------- | ---------- |
| 文書連携   | `SKILL.md` から family file へ、`LOGS.md` から履歴へ辿れる                               | PASS     | {{RESULT}} |
| ミラー整合 | `.claude` と `.agents` の file set / 履歴が一致する                                      | PASS     | {{RESULT}} |
| 証跡整合   | `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` が一致する | PASS     | {{RESULT}} |
| 再検証     | `validate-phase-output.js` / `verify-all-specs.js` が PASS する                          | PASS     | {{RESULT}} |

## 証跡ソース

- `manual-test-checklist.md`
- `manual-test-result.md`
- `discovered-issues.md`
- `validate-phase-output.js` の実行結果
- `verify-all-specs.js --json` の実行結果

## 参照資料

| 参照資料               | パス                                                                                | 説明             |
| ---------------------- | ----------------------------------------------------------------------------------- | ---------------- |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                                            | Phase 2 成果物   |
| HTTP送信設計           | `outputs/phase-2/http-send-design.md`                                               | Phase 2 成果物   |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                                         | Phase 5 成果物   |
| 異常系結果             | `outputs/phase-6/edge-case-result.md`                                               | Phase 6 成果物   |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`                                   | Phase 7 成果物   |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`                                               | Phase 8 成果物   |
| 品質レポート           | `outputs/phase-9/quality-report.md`                                                 | Phase 9 成果物   |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`                                           | Phase 10 成果物  |
| 出荷準備チェック       | `outputs/phase-10/shipment-readiness-check.md`                                      | Phase 10 成果物  |
| docs-only ガイド       | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md` | 非視覚方針の参照 |
| 是正計画               | `outputs/phase-10/corrective-plan.md`                                               | Phase 10 成果物  |
| 出荷準備チェック       | `outputs/phase-10/shipment-readiness-check.md`                                      | Phase 10 成果物  |

## 成果物

| 成果物                   | パス                                        | 説明                             |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施項目と判定条件の固定         |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | NON_VISUAL 証跡と validator 結果 |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 発見した課題（0件でも出力）      |

## 完了条件

- [ ] docs-only 判定理由が明記されていること
- [ ] `manual-test-checklist.md` が作成されていること
- [ ] `manual-test-result.md` に NON_VISUAL 判定と TC-ID ↔ evidence が記録されていること
- [ ] `discovered-issues.md` が 0 件でも出力されていること
- [ ] `validate-phase-output.js` と `verify-all-specs.js` の再実行結果が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. docs-only 判定と参照確認
2. チェックリスト作成
3. 手動テスト結果記録
4. 発見課題記録
5. validator 再実行

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 3 つの成果物が全件生成されていること
- [ ] NON_VISUAL 判定理由と証跡ソースが記録されていること
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001 --json
```

## 次のPhase

Phase 12: ドキュメント更新
