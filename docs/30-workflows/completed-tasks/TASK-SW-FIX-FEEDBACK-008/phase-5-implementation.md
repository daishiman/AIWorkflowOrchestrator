# Phase 5: 実装

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 4                                       |
| 後続Phase  | Phase 6                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

`SkillLifecyclePanel.tsx` の 2 箇所へ Phase 2 で確定した非ブロッキングパターンを適用する。

## 実装対象

| 対象                     | 変更内容                                              |
| ------------------------ | ----------------------------------------------------- |
| `processWorkflowOutcome` | `fetchSkills` 失敗時も `selectSkillByName` を継続する |
| `handleExecutePlan`      | `fetchSkills` 失敗時も後続選択処理を継続する          |
| 対応テスト               | U-NEW-1 から U-NEW-3 を green にする                  |

## 実行タスク

- [ ] Phase 2 の確定方針を読み直す
- [ ] `processWorkflowOutcome` を修正する
- [ ] `handleExecutePlan` を修正する
- [ ] U-NEW-1 から U-NEW-3 を green にする
- [ ] U-8 / U-13 が継続 PASS であることを確認する

## 統合テスト連携

| 接続点          | 確認内容                                       | 検証Phase         |
| --------------- | ---------------------------------------------- | ----------------- |
| Phase 4         | fail-first テストが green へ転じること         | Phase 5           |
| Renderer フロー | 生成成功後の選択継続が保たれること             | Phase 5, Phase 11 |
| Quality gate    | 実装後も typecheck / lint の前提を壊さないこと | Phase 9           |

## 完了条件

- [ ] 2 箇所の実装が同一非ブロッキングパターンで修正されている
- [ ] U-NEW-1 から U-NEW-3 が green である
- [ ] U-8 / U-13 が継続 PASS である
- [ ] `generationError` を更新しない実装になっている

## 成果物

- `outputs/phase-5/implementation-record.md`

## 参照資料

| 資料名             | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Phase 4 成果物     | `outputs/phase-4/test-specifications.md`                                                           |
| 修正対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
