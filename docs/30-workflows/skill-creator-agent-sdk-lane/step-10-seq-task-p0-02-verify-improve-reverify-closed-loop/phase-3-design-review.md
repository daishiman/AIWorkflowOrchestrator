# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 3                                                |
| Phase名    | 設計レビュー                                     |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 2: 設計                                    |
| 次Phase    | Phase 4: テスト作成                              |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |

## 目的

state machine の一貫性、遷移テーブルの完全性、verification engine 統合の整合性を gate 判定する。

## 実行タスク

### Task 1: state machine 一貫性チェック

- 遷移テーブルの全 edge が到達可能であることを確認する
- dead state（到達不能状態）が存在しないことを確認する
- verify(pass) と verify(fail) の分岐が対称的であることを確認する
- improve→verify と improve→execute の選択基準が明確であることを確認する

### Task 2: 遷移テーブル完全性検証

- 全 phase 対の遷移可否を表にして漏れを検出する
- 不正遷移（例: plan→verify）が禁止されていることを確認する
- reverify disabled conditions が新遷移と矛盾しないことを確認する:
  - execute phase ongoing
  - terminal_handoff route
  - no execute result
  - last execution failed

### Task 3: P0-01 との統合整合性

- TASK-P0-01 の verification engine interface と P0-02 の統合設計に矛盾がないことを確認する
- auto-populate checks → verify result → recordVerifyPass/Failure の data flow に断絶がないことを確認する

### Task 4: gate 判定

- PASS: 遷移テーブルが一貫しており実装に進める
- MAJOR: 遷移テーブルに矛盾があり設計修正が必要
- CRITICAL: state machine の根本設計を見直す必要がある

## 参照資料

| 資料名             | パス                                                                   | 説明             |
| ------------------ | ---------------------------------------------------------------------- | ---------------- |
| 設計書             | `phase-2-design.md`                                                    | レビュー対象     |
| WorkflowEngine     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 既存遷移テーブル |
| skillCreator types | `packages/shared/src/types/skillCreator.ts`                            | 型定義の整合性   |

## 統合テスト連携

- Phase 4 のテスト観点が AC-1〜AC-6 を 1:1 に覆うことを確認する
- 遷移テーブルの全 edge がテストケースに対応することを確認する

## 成果物

| 成果物           | パス                               | 説明                            |
| ---------------- | ---------------------------------- | ------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/review-result.md` | gate 判定と遷移テーブル検証結果 |

## 完了条件

- [ ] state machine の一貫性が確認されている
- [ ] 遷移テーブルに漏れがないことが検証されている
- [ ] P0-01 との統合に矛盾がないことが確認されている
- [ ] gate 判定が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
