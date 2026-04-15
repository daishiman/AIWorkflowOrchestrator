# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 3                                       |
| 後続Phase  | Phase 5                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

AC-1 から AC-3 を fail-first で検証できるテストを追加する。

## 追加テスト

| テストID | 内容                                                                                      | 対応 AC |
| -------- | ----------------------------------------------------------------------------------------- | ------- |
| U-NEW-1  | `processWorkflowOutcome` で `fetchSkills` が reject しても `selectSkillByName` が呼ばれる | AC-1    |
| U-NEW-2  | `handleExecutePlan` で `fetchSkills` が reject しても `selectSkillByName` が呼ばれる      | AC-2    |
| U-NEW-3  | `fetchSkills` reject 時に `generationError` が呼ばれない                                  | AC-3    |

## 既存回帰確認

| テストID | 期待値                                                           |
| -------- | ---------------------------------------------------------------- |
| U-8      | 成功時に `fetchSkills` と `selectSkillByName` が継続して呼ばれる |
| U-13     | `terminal_handoff` では `fetchSkills` を呼ばない                 |

## 実行タスク

- [ ] Phase 1 の AC 定義をテスト観点へ変換する
- [ ] U-NEW-1 から U-NEW-3 を追加する
- [ ] 実装前に U-NEW-1 から U-NEW-3 が red であることを確認する
- [ ] U-8 / U-13 が継続 PASS であることを確認する

## 統合テスト連携

| 接続点  | 確認内容                                             | 検証Phase |
| ------- | ---------------------------------------------------- | --------- |
| Phase 1 | AC-1 から AC-3 をテストへ落とし込む                  | Phase 4   |
| Phase 2 | 設計した非ブロッキングパターンをテスト前提へ反映する | Phase 4   |
| Phase 3 | レビュー指摘をテスト観点へ反映する                   | Phase 4   |
| Phase 5 | red から green へ遷移すること                        | Phase 5   |

## 完了条件

- [ ] U-NEW-1 から U-NEW-3 が追加されている
- [ ] U-NEW-1 から U-NEW-3 が実装前に red である
- [ ] U-8 / U-13 が継続 PASS である
- [ ] テスト追加範囲が AC-1 から AC-3 と一致している

## 成果物

- `outputs/phase-4/test-specifications.md`

## 参照資料

| 資料名             | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Phase 1 成果物     | `outputs/phase-1/requirements-definition.md`                                                       |
| Phase 2 成果物     | `outputs/phase-2/design-document.md`                                                               |
| Phase 3 成果物     | `outputs/phase-3/review-result.md`                                                                 |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
