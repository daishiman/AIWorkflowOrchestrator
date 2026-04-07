# Phase 11 手動テストチェックリスト - TASK-SDK-07

## 対象タスク

UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## 実施日

2026-04-06

## 事前準備チェック

- [x] screenshots ディレクトリ作成済み
- [x] screenshot-plan.json 確認済み（本タスクで作成）
- [x] SkillLifecyclePanel.tsx の HandoffGuidance 実装確認済み

## テストケースチェック

| TC-ID    | シナリオ                                                        | capture ID                      | 完了 |
| -------- | --------------------------------------------------------------- | ------------------------------- | ---- |
| TC-11-01 | terminal_handoff 状態で HandoffGuidance を確認・screenshot 取得 | SCREENSHOT-TASK07-HANDOFF-01    | [x]  |
| TC-11-02 | disclosure summary を表示して DOM 存在を確認・screenshot 取得   | SCREENSHOT-TASK07-DISCLOSURE-01 | [x]  |
| TC-11-03 | integrated_api 成功後の対照表示を確認・screenshot 取得          | SCREENSHOT-TASK07-INTEGRATED-01 | [x]  |

## 成果物チェック

- [x] `terminal_handoff-handoff-guidance.png` が screenshots/ に保存されている
- [x] `disclosure-summary-display.png` が screenshots/ に保存されている
- [x] `integrated-api-success-comparison.png` が screenshots/ に保存されている
- [x] `phase11-capture-metadata.json` が screenshots/ に保存されている
- [x] `manual-test-result.md` に evidence が追記されている
