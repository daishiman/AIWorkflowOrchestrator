# Phase 5: 実装

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 対象機能   | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 4: テスト作成      |
| 次Phase    | Phase 6: テスト拡充      |
| ステータス | pending                  |
| 作成日     | 2026-04-14               |

## 目的

current facts では issue 6 / 14 / 20 に相当する挙動は既に実装済みであることを確認し、この Phase では no-op を記録する。
issue 8 を follow-up に分離する場合のみ、別タスクとして最小差分の code delta を計画する。

## 実行タスク

### Task 1: current facts の baseline 確認

- `SkillLifecyclePanel.llm-generation.test.tsx` を確認し、success path と terminal_handoff path が current facts と一致することを確認する
- `CompleteStep.test.tsx` を確認し、null guard / success header が current facts と一致することを確認する
- 既存テストがすでに PASS していることを baseline として記録する

### Task 2: no-op 判定

- current task では `SkillLifecyclePanel.tsx` / `CompleteStep.tsx` に code delta を入れない
- issue 8 の非ブロッキング化は follow-up 候補として別タスクに分離する
- この Phase の成果物には `no-op` の判断根拠を明記する

### Task 3: follow-up 分離メモ

- follow-up が必要な場合、変更対象を `SkillLifecyclePanel` とそのテストに限定する
- `CompleteStep` は follow-up の対象外として維持する
- docs-only の current task と follow-up の責務境界を明文化する

### Task 4: 実装記録の整理

- current facts と no-op 判定を `outputs/phase-5/implementation-record.md` に記録する
- issue 6 / 14 / 20 は current facts として記録し、issue 8 は follow-up 候補として分離する

## 新規作成/修正ファイルパス一覧

| ファイルパス                                                | 操作 | 修正概要                           |
| ----------------------------------------------------------- | ---- | ---------------------------------- |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/phase-*.md`     | 修正 | current facts / docs-only へ再構成 |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json` | 修正 | Phase 状態とメタデータの同期       |

## 参照資料

| 資料名        | パス                                                                                               | 説明                       |
| ------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| テスト仕様書  | `outputs/phase-4/test-specifications.md`                                                           | evidence matrix            |
| 設計成果物    | `outputs/phase-2/design-document.md`                                                               | current contract           |
| current facts | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | current flow               |
| current facts | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | current contract           |
| 既存テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | success / terminal_handoff |
| 既存テスト    | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | null guard / success UI    |

## 統合テスト連携

- current facts が既存テストで担保されていることを確認する
- no-op の場合は追加修正を行わず、記録のみを残す
- follow-up を立てる場合は issue 8 のみを別タスクに切り出す

## 成果物

| 成果物   | パス                                       | 説明                      |
| -------- | ------------------------------------------ | ------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | no-op 判定・current facts |

## 完了条件

- [ ] current facts で issue 6 / 14 / 20 が解消済みである
- [ ] issue 8 が follow-up 候補として分離されている
- [ ] current task では code delta を入れない no-op 判定が記録されている
- [ ] 既存テストの PASS 状態が baseline として記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
