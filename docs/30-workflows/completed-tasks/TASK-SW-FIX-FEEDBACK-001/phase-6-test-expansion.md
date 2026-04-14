# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| 対象機能   | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 5: 実装            |
| 次Phase    | Phase 7: カバレッジ確認  |
| ステータス | pending                  |
| 作成日     | 2026-04-14               |

## 目的

current facts を補強する境界ケースを整理する。
issue 8 の follow-up を別タスク化する前提で、現在の AC を壊さない境界条件だけを拡充する。

## 実行タスク

### Task 1: SkillLifecyclePanel の境界確認

- `terminal_handoff` 時に `fetchSkills` / `selectSkillByName` が呼ばれないことを確認する
- success path で `fetchSkills` / `selectSkillByName` が呼ばれることを確認する
- `generationError` が存在する場合の既存 UI を確認する

### Task 2: CompleteStep の境界確認

- `onRetry` が未指定でも `skillPath = null` のエラー UI が安全に描画されることを確認する
- `skillPath = ""` の場合は null ではないため success path として扱われることを確認する
- `skillPath = null` の場合、アクションカードが表示されないことを確認する

### Task 3: 回帰確認

- SkillLifecyclePanel と CompleteStep の全既存テストを再確認する
- Phase 4 で定義した evidence が引き続き PASS であることを確認する
- issue 8 の非ブロッキング化はこの Phase に含めない

## 参照資料

| 資料名        | パス                                                                 | 説明                   |
| ------------- | -------------------------------------------------------------------- | ---------------------- |
| 実装記録      | `outputs/phase-5/implementation-record.md`                           | current facts 記録     |
| テスト仕様書  | `outputs/phase-4/test-specifications.md`                             | 拡充元 evidence        |
| current facts | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | fetch / handoff の正本 |
| current facts | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | null guard の正本      |

## 統合テスト連携

- 境界ケースが AC-1〜AC-5 の補強として機能することを確認する
- 拡充した evidence が Phase 7 のカバレッジ確認の入力となる
- issue 8 の follow-up は別タスクで扱う

## 成果物

| 成果物         | パス                                      | 説明                     |
| -------------- | ----------------------------------------- | ------------------------ |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md` | 境界ケース evidence 一覧 |

## 完了条件

- [ ] SkillLifecyclePanel の境界ケースが整理されている
- [ ] CompleteStep の境界ケースが整理されている
- [ ] current facts に反するテスト拡張をしていない
- [ ] issue 8 が follow-up 候補として維持されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
