# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 5                                       |
| 後続Phase  | Phase 7                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

正常系とガード条件の網羅を補強する。

## 追加テスト

| テストID | 内容                                                      |
| -------- | --------------------------------------------------------- |
| U-NEW-4  | `skillName` がない場合に `selectSkillByName` が呼ばれない |
| U-NEW-5  | `fetchSkills` 成功時に既存フローが維持される              |
| U-NEW-6  | `fetchSkills` 失敗かつ `skillName` なしで副作用が増えない |

## 実行タスク

- [ ] U-NEW-4 から U-NEW-6 を追加する
- [ ] U-NEW-4 から U-NEW-6 が PASS であることを確認する
- [ ] Phase 5 の green ケースと矛盾がないことを確認する

## 統合テスト連携

| 接続点  | 確認内容                                     | 検証Phase |
| ------- | -------------------------------------------- | --------- |
| Phase 5 | 実装済みフローの境界条件を補強する           | Phase 6   |
| Phase 7 | 成功 / 失敗 / ガード条件の分岐網羅へつなげる | Phase 7   |

## 完了条件

- [ ] U-NEW-4 から U-NEW-6 が追加されている
- [ ] U-NEW-4 から U-NEW-6 が PASS である
- [ ] 成功系とガード条件の両方が記録されている

## 成果物

- `outputs/phase-6/extended-test-record.md`

## 参照資料

| 資料名             | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Phase 5 成果物     | `outputs/phase-5/implementation-record.md`                                                         |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
