# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

NON_VISUAL / state-only task として、公開キャンセル契約と close-out 証跡の整合を確認する。

## 実行タスク

1. `outputs/phase-11/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001-manual-test-report.md` を一次ソースにする
2. `manual-test-checklist.md` と `discovered-issues.md` を補助成果物にする
3. UI 変更なしのため screenshot 不要理由を固定文で記録する

## 参照資料

| 資料           | パス                                                                             | 用途              |
| -------------- | -------------------------------------------------------------------------------- | ----------------- |
| final review   | `outputs/phase-10/final-review-result.md`                                        | 前提結果          |
| phase 11 guide | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | NON_VISUAL ルール |

## 実行手順

- 固定文を使用する: `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- 代替 evidence は typecheck / targeted test / final review とする

## 統合テスト連携

- Phase 12 は `TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001-manual-test-report.md` を実証根拠として参照する

## 成果物

- `outputs/phase-11/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001-manual-test-report.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`

## 完了条件

- [ ] NON_VISUAL であることを明示した
- [ ] screenshot 不要理由を固定文で記載した
- [ ] 一次ソースの manual test report 名を canonical 化した
