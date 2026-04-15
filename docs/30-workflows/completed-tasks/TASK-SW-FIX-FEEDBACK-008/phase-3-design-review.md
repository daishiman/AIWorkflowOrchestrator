# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 2                                       |
| 後続Phase  | Phase 4                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

Phase 2 の設計がテスト作成へ進めるかを判定する。

## レビュー観点

| 観点        | 確認内容                                                   |
| ----------- | ---------------------------------------------------------- |
| lint 互換性 | `void fetchSkills().catch(...)` が lint で問題にならないか |
| outer catch | `handleExecutePlan` の外側 `try-catch` と競合しないか      |
| 回帰影響    | U-8 / U-13 の期待動作を壊さないか                          |
| 失敗時 UX   | `generationError` を上げない設計が AC-3 と一致するか       |

## 判定基準

| 判定     | 条件                   | 次のアクション                |
| -------- | ---------------------- | ----------------------------- |
| PASS     | 設計に問題なし         | Phase 4 へ進む                |
| MINOR    | 軽微な追記で解決できる | 指摘を記録して Phase 4 へ進む |
| MAJOR    | 実装方式の見直しが必要 | Phase 2 へ戻す                |
| CRITICAL | 要件から見直しが必要   | Phase 1 へ戻す                |

## 実行タスク

- [ ] Phase 1 の AC-1 から AC-5 と Phase 2 の方針が一致することを確認する
- [ ] lint 互換性を確認する
- [ ] outer catch と局所 `catch` の責務境界を確認する
- [ ] 回帰観点を U-8 / U-13 へ紐付ける
- [ ] 判定結果と未解決項目を記録する

## 統合テスト連携

| 接続点  | 確認内容                            | 検証Phase |
| ------- | ----------------------------------- | --------- |
| Phase 1 | AC と設計方針の一致                 | Phase 3   |
| Phase 2 | Before / After がレビュー結果と一致 | Phase 3   |
| Phase 4 | fail-first テスト項目へ落とせること | Phase 4   |

## 完了条件

- [ ] 判定結果が PASS / MINOR / MAJOR / CRITICAL のいずれかで記録されている
- [ ] lint 互換性の確認結果が記録されている
- [ ] outer catch との整合が記録されている
- [ ] 未解決項目がある場合は次 Phase での扱いが明記されている

## 成果物

- `outputs/phase-3/review-result.md`

## 参照資料

| 資料名           | パス                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Phase 1 成果物   | `outputs/phase-1/requirements-definition.md`                         |
| Phase 2 成果物   | `outputs/phase-2/design-document.md`                                 |
| 修正対象ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` |
