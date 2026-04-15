# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | -                                             |
| 後続Phase  | Phase 2                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

修正スコープ、受入条件、依存タスク、実行前提を固定する。

## current facts

- `processWorkflowOutcome` と `handleExecutePlan` の 2 箇所で `await fetchSkills()` が失敗すると `selectSkillByName` に到達しない
- `fetchSkills()` は UI リフレッシュの補助処理であり、スキル生成成功判定とは責務が異なる
- Main Process、IPC チャンネル、`selectSkillByName` 本体は本タスクの修正対象外

## スコープ

### 含む

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の 2 箇所の非ブロッキング化
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` の fail-first テスト追加
- `console.warn` 記録方針の明文化

### 含まない

- `fetchSkills()` 実装そのものの変更
- Main Process と IPC 契約の変更
- `CompleteStep.tsx` や他 component の回収

## 受入条件

| AC   | 条件                                                                                | 検証方法               |
| ---- | ----------------------------------------------------------------------------------- | ---------------------- |
| AC-1 | `processWorkflowOutcome` で `fetchSkills` 失敗後も `selectSkillByName` が実行される | Phase 4/5 の追加テスト |
| AC-2 | `handleExecutePlan` で `fetchSkills` 失敗後も `selectSkillByName` が実行される      | Phase 4/5 の追加テスト |
| AC-3 | `fetchSkills` 失敗時は `console.warn` に記録し、`generationError` はセットしない    | Phase 4/10 の検証      |
| AC-4 | `fetchSkills` 成功時の既存フローに回帰がない                                        | U-8 / U-13 の継続 PASS |
| AC-5 | `pnpm --filter @repo/desktop typecheck` と `lint` が通る                            | Phase 9 の実行記録     |

## 実行タスク

- [ ] NOTE-001 の問題文と改善ゴールを 1 文で固定する
- [ ] 含む範囲と含まない範囲を明文化する
- [ ] 依存タスクと競合確認ポイントを記録する
- [ ] AC-1 から AC-5 を検証手段付きで定義する

## 統合テスト連携

本タスクはユニットテスト中心だが、後続 Phase で次の接続点を確認する。

| 接続点              | 確認内容                                                 | 検証Phase         |
| ------------------- | -------------------------------------------------------- | ----------------- |
| Renderer 実行フロー | `execute plan` 完了後に選択状態へ遷移すること            | Phase 5, Phase 11 |
| 品質ゲート          | typecheck / lint / 対象 vitest が一貫して通ること        | Phase 9, Phase 10 |
| 親 workflow 連携    | NOTE-001 の根拠と follow-up 切り出し理由が追跡できること | Phase 12          |

## 完了条件

- [ ] 修正対象ファイルが特定されている
- [ ] 受入条件 AC-1 から AC-5 が定義されている
- [ ] 含む範囲と含まない範囲が固定されている
- [ ] 依存タスクと競合確認ポイントが明記されている

## 成果物

- `outputs/phase-1/requirements-definition.md`

## 参照資料

| 資料名                  | パス                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| 親 workflow の NOTE-001 | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/outputs/phase-11/discovered-issues.md`                 |
| follow-up 化の記録      | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/outputs/phase-12/unassigned-task-detection.md`         |
| 修正対象ファイル        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               |
| 対応テスト              | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
