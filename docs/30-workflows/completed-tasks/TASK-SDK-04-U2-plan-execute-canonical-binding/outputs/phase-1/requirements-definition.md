# Phase 1: 要件定義書

## 問題文

`handleExecutePlan` が `request.trim()`（textarea の現在値）を `executePlan` の第2引数に渡しているため、plan review 後にユーザーが textarea を編集すると承認済み plan と異なる内容が実行される（canonical binding drift）。

## 根本原因

draft input（textarea state）と approved payload（plan review 完了時の snapshot）の所有者が分離されておらず、同一の `request` state を経由していた。これは「Single Source of Truth」原則の違反であり、TASK-SDK-04 Phase 12 再監査で発見された。

## 受入条件

| ID   | 条件                                                           | 検証方法                                                                   |
| ---- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| AC-1 | execute は approved plan snapshot だけを使う                   | `handleExecutePlan` が `approvedSkillSpec` のみ参照する                    |
| AC-2 | review 後に textarea を編集しても execute payload は変化しない | U-8b テスト: plan作成→textarea変更→executeで canonical spec 維持           |
| AC-3 | cancel で current plan と approved snapshot の両方をクリアする | `handleCancelPlan` で `setApprovedSkillSpec(null)` 確認                    |
| AC-4 | plan を使わない既存 execute flow に回帰を入れない              | U-1〜U-17 既存テストの全パス                                               |
| AC-5 | preload / renderer API シグネチャを破壊しない                  | `executePlan(planId, skillSpec?, authMode?, apiKey?)` 維持、typecheck パス |

## スコープ

### 含む

- `SkillLifecyclePanel.tsx` の renderer state 修正
- `SkillLifecyclePanel.llm-generation.test.tsx` への drift 防止テスト追加
- タスク仕様書一式の整備

### 含まない

- Main Process の `executePlan` IPC ハンドラー修正
- `executePlan` API shape の変更
- PR 作成（ユーザー指示まで保留）

## 教訓ベース根本原因

canonical binding ルール: 承認済みデータは承認時点でスナップショットとして独立した state に保存し、後続の操作で変更可能な state と同一の参照を共有してはならない。
