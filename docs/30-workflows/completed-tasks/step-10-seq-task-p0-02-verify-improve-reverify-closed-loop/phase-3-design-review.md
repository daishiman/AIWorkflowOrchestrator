# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 3                                                |
| Phase名    | 設計レビューゲート                               |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 2: 設計                                    |
| 次Phase    | Phase 4: テスト作成                              |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

state machine の一貫性、遷移テーブルの完全性、verification engine 統合の整合性を gate 判定する。

## 実行タスク

### Task 1: state machine 一貫性チェック

- 遷移テーブルの全 edge が到達可能であることを確認する
- dead state（到達不能状態）が存在しないことを確認する
- verify(pass) と verify(fail) の分岐が対称的であることを確認する
- improve→verify と improve→execute の選択基準が明確であることを確認する
- `complete` terminal state が正しい終了条件を持つことを確認する

### Task 2: 遷移テーブル完全性検証

全 phase 対の遷移可否マトリクスを作成して漏れを検出する:

| from\to  | plan | review | execute | verify  | improve | complete | handoff |
| -------- | ---- | ------ | ------- | ------- | ------- | -------- | ------- |
| plan     | -    | ✅     | ❌      | ❌      | ❌      | ❌       | ❌      |
| review   | ❌   | -      | ✅      | ❌      | ❌      | ❌       | ✅      |
| execute  | ❌   | ❌     | -       | ✅      | ❌      | ❌       | ❌      |
| verify   | ❌   | ✅     | ❌      | -       | ✅      | ✅(NEW)  | ❌      |
| improve  | ❌   | ❌     | ✅      | ✅(NEW) | -       | ❌       | ❌      |
| complete | ❌   | ❌     | ❌      | ❌      | ❌      | -        | ❌      |

確認項目:

- 不正遷移（例: plan→verify）が禁止されていることを確認する
- reverify disabled conditions が新遷移と矛盾しないことを確認する:
  - execute phase ongoing → re-verify 禁止（improve phase なら許可）
  - terminal_handoff route → re-verify 禁止
  - no execute result → re-verify 禁止
  - last execution failed → re-verify 禁止

### Task 3: P0-01 との統合整合性

- TASK-P0-01 の `SkillCreatorVerificationEngine.verify()` の戻り値 `RuntimeSkillCreatorVerifyCheck[]` が `recordVerifyPass()` の引数と型一致することを確認する
- `allPass` 判定基準（`checks.every(c => c.status === "pass" || c.severity === "warning")`）が P0-01 の Layer 1/2 チェック結果と整合することを確認する
- Facade の graceful degradation（engine 未注入時は空配列→allPass→pass）が意図した挙動かを判定する
  - 空配列→pass は検証をスキップすることを意味するため、許容するか要判断

### Task 4: IPC 契約整合性

Phase 2 で設計した IPC 変更が以下と矛盾しないことを確認する:

- `ipc-contract-checklist.md` の必須項目（Main Process / Preload API / 型定義の同時更新）
- 既存の creatorHandlers の登録パターンとの一貫性
- `security-skill-ipc-core.md` のセキュリティパターン

### Task 5: gate 判定

| 判定     | 条件                                       | 対応                             |
| -------- | ------------------------------------------ | -------------------------------- |
| PASS     | 遷移テーブルが一貫しており実装に進める     | Phase 4 へ                       |
| MINOR    | 軽微な設計修正が必要だが実装可能           | 修正内容を記録し Phase 4 へ      |
| MAJOR    | 遷移テーブルに矛盾があり設計修正が必要     | Phase 2 へ差し戻し               |
| CRITICAL | state machine の根本設計を見直す必要がある | Phase 1 へ差し戻しユーザーに確認 |

## 参照資料

| 資料名             | パス                                                                       | 説明                |
| ------------------ | -------------------------------------------------------------------------- | ------------------- |
| 設計書             | `phase-2-design.md`                                                        | レビュー対象        |
| 要件定義           | `phase-1-requirements.md`                                                  | AC-1〜AC-6          |
| WorkflowEngine     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`     | 既存遷移テーブル    |
| VerificationEngine | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | P0-01 verify 結果型 |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`                                | 型定義の整合性      |

### システム仕様（aiworkflow-requirements）

> 設計レビューで必ず以下の仕様との整合性を確認してください。

| 参照資料                  | パス                                                                                        | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC変更の整合性検証          |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | セキュリティパターン準拠確認 |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | Facade pattern との整合性    |

## 統合テスト連携

- Phase 4 のテスト観点が AC-1〜AC-6 を 1:1 に覆うことを確認する
- 遷移テーブルの全 edge（新規追加の `verify→complete` と `improve→verify` を含む）がテストケースに対応することを確認する

## 成果物

| 成果物           | パス                               | 説明                                                 |
| ---------------- | ---------------------------------- | ---------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/review-result.md` | gate 判定、遷移マトリクス検証結果、P0-01統合検証結果 |

## 完了条件

- [ ] state machine の一貫性が確認されている（dead state なし、全 edge 到達可能）
- [ ] 遷移テーブル完全性マトリクスが作成され漏れがないことが検証されている
- [ ] P0-01 との統合に矛盾がないことが確認されている（型一致、allPass判定基準）
- [ ] IPC契約整合性が確認されている
- [ ] gate 判定（PASS/MINOR/MAJOR/CRITICAL）が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
