# Phase 1 成果物: 要件定義書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## NOTE-001 の問題文と改善ゴール

**問題文**: `SkillLifecyclePanel.tsx` の `processWorkflowOutcome` および `handleExecutePlan` 内で `await fetchSkills()` が例外を throw した場合、後続の `selectSkillByName` 呼び出しに到達せず、スキル生成後の選択状態が維持されない。

**改善ゴール**: `fetchSkills()` の失敗を補助処理の失敗として局所的に吸収し、後続の `selectSkillByName` を継続実行することで、スキル生成成功後の選択状態を常に維持する。

## 修正対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
  - `processWorkflowOutcome` 関数
  - `handleExecutePlan` 関数

## 対応テスト

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

## 含む範囲と含まない範囲

### 含む

- `SkillLifecyclePanel.tsx` の 2 箇所の非ブロッキング化実装
- `console.warn` 記録方針の明文化
- 対応テスト（U-NEW-1 から U-NEW-6）の追加

### 含まない

- `fetchSkills()` 実装本体の変更
- Main Process と IPC 契約の変更
- `CompleteStep.tsx` や他 component の変更

## 依存タスクと競合確認

| 種別         | ID                           | 状態                  | 影響                                       |
| ------------ | ---------------------------- | --------------------- | ------------------------------------------ |
| prerequisite | TASK-SW-FIX-FEEDBACK-001     | completed             | NOTE-001 の根拠となる調査済み              |
| parallel     | TASK-SW-FIX-STATE-DETAIL-001 | confirmed no conflict | `SkillLifecyclePanel.tsx` への競合変更なし |
| parallel     | TASK-SW-FIX-UI-001           | confirmed no conflict | 修正対象ファイルが異なる                   |

## 受入条件（AC-1 〜 AC-5）

| AC   | 条件                                                                                | 検証方法               |
| ---- | ----------------------------------------------------------------------------------- | ---------------------- |
| AC-1 | `processWorkflowOutcome` で `fetchSkills` 失敗後も `selectSkillByName` が実行される | U-NEW-1 テスト         |
| AC-2 | `handleExecutePlan` で `fetchSkills` 失敗後も `selectSkillByName` が実行される      | U-NEW-2 テスト         |
| AC-3 | `fetchSkills` 失敗時は `console.warn` に記録し、`generationError` はセットしない    | U-NEW-3 テスト         |
| AC-4 | `fetchSkills` 成功時の既存フローに回帰がない                                        | U-8 / U-13 の継続 PASS |
| AC-5 | `pnpm --filter @repo/desktop typecheck` と `lint` が通る                            | Phase 9 の実行記録     |
