# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 8                        |
| Phase名    | リファクタリング         |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 機能名     | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 7                  |
| 後続Phase  | Phase 9                  |
| 作成日     | 2026-04-14               |
| ステータス | pending                  |

## 目的

docs と current facts の用語を統一し、`SkillCreateWizard` を legacy / historical reference に下げる。
Phase 5〜7 の結果を踏まえて、current contract を最小複雑性で説明できる形へ整える。

## 実行タスク

- Task 1: 用語統一
- Task 2: current contract の表現整理
- Task 3: follow-up 候補の分離表記
- Task 4: リファクタリング後の evidence 再確認

## 参照資料

| 資料名         | パス                                                                                               | 用途             |
| -------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| current facts  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | current flow     |
| current facts  | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | current contract |
| 既存テスト     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | evidence         |
| 既存テスト     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | evidence         |
| Phase 5 成果物 | `outputs/phase-5/implementation-record.md`                                                         | no-op 判定       |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                                                               | evidence         |

## 実行手順

### Task 1: 用語統一

- `SkillLifecyclePanel` を current facts の正本として扱う
- `SkillCreateWizard` を legacy / historical reference に下げる
- `terminal_handoff` / `current contract` / `follow-up 候補` の表現を統一する

### Task 2: current contract の表現整理

- `CompleteStepProps` は `skillPath?: string | null` と `onRetry?: () => void` を前提に記述する
- `skillPath === null` のみが error UI であることを明文化する
- `skillPath !== null` の通常パスで成功ヘッダーが表示されることを明文化する

### Task 3: follow-up 候補の分離表記

- issue 8 の non-blocking 化は follow-up 候補として別タスクへ切り出す
- current task の AC に含めない
- docs 上で current task と follow-up の境界を明記する

### Task 4: evidence 再確認

- Phase 4〜7 の evidence が current facts と一致しているかを再確認する
- `SkillLifecyclePanel` / `CompleteStep` の current contract に矛盾がないかを確認する

## 統合テスト連携【必須】

リファクタリング後も current facts が変わっていないことを確認する。

| 判定項目                    | 基準    | 結果    |
| --------------------------- | ------- | ------- |
| current contract の表現整合 | PASS    | pending |
| TC-FEEDBACK-001〜005 の整合 | 5件PASS | pending |
| follow-up 分離の明確さ      | PASS    | pending |
| legacy reference の扱い     | PASS    | pending |

## 成果物

| 成果物               | パス                                    | 説明                                            |
| -------------------- | --------------------------------------- | ----------------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | terminology / current contract / follow-up 分離 |

## 完了条件

- [ ] `SkillCreateWizard` が legacy / historical reference として明確化されている
- [ ] `CompleteStepProps` の current contract が明確化されている
- [ ] issue 8 の follow-up 分離が明文化されている
- [ ] Phase 5〜7 の evidence と矛盾がない
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 用語統一
2. current contract の表現整理
3. follow-up 候補の分離表記
4. evidence 再確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
