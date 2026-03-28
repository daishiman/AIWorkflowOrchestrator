# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| Phase名    | 要件定義                                      |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | -                                             |
| 次Phase    | Phase 2: 設計                                 |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

`planId` と execute payload の canonical binding drift を要件として固定し、承認済み plan と textarea draft を分離する受入条件を定義する。

## 実行タスク

### Task 1: 問題の固定

- `SkillLifecyclePanel.tsx` の `handleExecutePlan` が textarea の current draft を送っていた事実を記録する
- approved plan snapshot と draft input の owner が分離されていない点を問題文として確定する

### Task 2: 受入条件の確定

- AC-1: execute は approved plan snapshot だけを使う
- AC-2: review 後に textarea を編集しても execute payload は変化しない
- AC-3: cancel で current plan と approved snapshot の両方をクリアする
- AC-4: plan を使わない既存 execute flow に回帰を入れない
- AC-5: preload / renderer API シグネチャを破壊しない

### Task 3: スコープ境界

- 含む: renderer state、execute binding、renderer test、仕様書整備
- 含まない: Main Process 実装修正、`executePlan` API shape の変更、PR 作成

## 参照資料

| 資料名     | パス                                                                                               | 説明                           |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| 実装コード | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | drift 発生箇所                 |
| テスト     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 再発防止テスト                 |
| 教訓       | `.agents/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`         | canonical binding の標準ルール |

## 統合テスト連携

- Phase 4 で plan review 後の textarea 編集シナリオを追加する
- Phase 10 で approved snapshot と draft input の分離が回帰していないことを再確認する

## 成果物

| 成果物     | パス                                         | 説明                     |
| ---------- | -------------------------------------------- | ------------------------ |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義、受入条件、境界 |

## 完了条件

- [ ] 問題文が 1 文で固定されている
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] 含む / 含まないが明確である
- [ ] 教訓ベースの root cause が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
