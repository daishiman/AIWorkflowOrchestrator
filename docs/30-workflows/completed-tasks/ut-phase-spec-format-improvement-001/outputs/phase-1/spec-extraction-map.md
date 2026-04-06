# Phase 1 Spec Extraction Map

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| タイプ | docs-only / NON_VISUAL               |
| 対象   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 |

## 抽出サマリー

| 論点                       | 抽出内容                                            | 判定     |
| -------------------------- | --------------------------------------------------- | -------- |
| Task/Step 混在             | plan と current fact が同一セクションに混在していた | 修正対象 |
| NON_VISUAL screenshot 前提 | screenshot-plan.json 前提が残っていた               | 修正対象 |
| 受入条件                   | AC-1〜AC-5 を検証可能な形へ整理した                 | PASS     |

## 判定基準

| タスク種別 | 判定基準       | evidence                                                                |
| ---------- | -------------- | ----------------------------------------------------------------------- |
| VISUAL     | 表示層変更あり | screenshot-plan.json / PNG / 自動検証                                   |
| NON_VISUAL | 表示層変更なし | manual-test-checklist.md / manual-test-result.md / discovered-issues.md |

## 次Phaseへの引き継ぎ

- Phase 2 で Task/Step 分離の具体設計へ進む。
- docs-only / NON_VISUAL の evidence ルールをテンプレートへ反映する。
