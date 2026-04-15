# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008 |
| 前提Phase  | -                        |
| 次Phase    | Phase 2: 設計            |
| ステータス | completed                |
| 作成日     | 2026-04-15               |

## 目的

`fetchSkills()` 非ブロッキング化の受入条件を固定し、
修正スコープと検証可能な完了基準を定義する。

## 実行タスク

### Task 1: 問題の固定

- `SkillLifecyclePanel.tsx` の `handleExecutePlan` において、`fetchSkills()` を `try-catch` で囲み失敗時に `return true` で early return しているため、`selectSkillByName` が到達不能になっている事実を記録する
- `SkillLifecyclePanel.tsx` の `processWorkflowOutcome` においても同様のパターンで `selectSkillByName` が到達不能になっている事実を記録する
- `fetchSkills()` の失敗はスキル一覧の更新失敗であり、スキル選択（`selectSkillByName`）の実行を妨げるべきでないという設計上の問題を記録する

### Task 2: 受入条件の確定

- AC-1: `processWorkflowOutcome` で `fetchSkills()` が throw した場合、`selectSkillByName` が実行される
- AC-2: `handleExecutePlan` で `fetchSkills()` が throw した場合、`selectSkillByName` が実行される
- AC-3: `fetchSkills()` 失敗時のエラーは `console.warn` で記録するが `generationError` には設定しない
- AC-4: 既存テスト U-8/U-13 が PASS（回帰なし）
- AC-5: TypeScript 型エラー・ESLint エラーなし

### Task 3: スコープ境界

- 含む: `SkillLifecyclePanel.tsx` の `handleExecutePlan` / `processWorkflowOutcome` の `fetchSkills()` 呼び出し修正、対応するユニットテスト追加
- 含まない: `fetchSkills()` 自体の実装変更、他コンポーネントの修正、Main Process 実装修正、IPC 契約変更、PR 作成

## 参照資料

| 資料名             | パス                                                                                               | 説明                             |
| ------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | L769-784 / L1110-1113 が修正対象 |
| 対象テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト追加対象                   |
| 親タスク仕様書     | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                                              | Wave C の背景・依存タスク        |
| 関連 Issue         | GitHub Issue #2176                                                                                 | 問題報告・CLOSED                 |

## 統合テスト連携

- Phase 4 で `fetchSkills()` 失敗時の `selectSkillByName` 実行シナリオを先に定義する
- Phase 10 で AC-1〜AC-5 とテストの対応表を再確認する

## 成果物

| 成果物     | パス                                         | 説明                             |
| ---------- | -------------------------------------------- | -------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義・受入条件・スコープ境界 |

## 完了条件

- [x] 問題が発生箇所（handleExecutePlan / processWorkflowOutcome）ごとに固定されている
- [x] AC-1〜AC-5 が検証可能な形で定義されている
- [x] 含む/含まないが明確である
- [x] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている
- [x] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
