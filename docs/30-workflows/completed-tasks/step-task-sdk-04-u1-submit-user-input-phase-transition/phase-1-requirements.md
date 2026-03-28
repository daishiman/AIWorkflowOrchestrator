# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 1                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

`submitUserInput()` の phase semantics を、検証可能な要件と AC に固定する。

## 実行タスク

- P50チェック: 既存 engine / facade / IPC / テストの current facts を確認する
- 要件抽出: `plan_review` / `verification_review` の meaning gap を FR/NFR に落とす
- AC固定: AC-1〜AC-7 をコマンド付きで検証可能な形へ定義する

## 参照資料

| 資料名                | パス                                                                                                  | 説明                       |
| --------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| unassigned input task | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md`       | 元要求                     |
| parent workflow       | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md` | upstream context           |
| system spec map       | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                            | IPC current contract       |
| phase 1 output        | `outputs/phase-1/requirements.md`                                                                     | 詳細要件                   |
| spec extraction map   | `outputs/phase-1/spec-extraction-map.md`                                                              | spec と code anchor の対応 |

## 実行手順

### ステップ1: current facts を固定する

`SkillCreatorWorkflowEngine.ts`、`RuntimeSkillCreatorFacade.ts`、`creatorHandlers.ts`、関連テストを読み、どこが owner でどこが transport かを確定する。

### ステップ2: FR/NFR と AC を閉じる

回答 reason、selectedOptionId、phase 遷移、verifyResult 更新、artifact 記録、fallback 挙動を FR/NFR/AC として分離して記述する。

### ステップ3: spec ↔ code anchor を記録する

`outputs/phase-1/spec-extraction-map.md` に system spec、コード、用途を 1:1 で対応づける。

## 統合テスト連携

- AC-1〜AC-7 に対応する `vitest --grep` 単位を Phase 4 テスト計画へ渡す
- engine / IPC の両方で snapshot 検証が必要なことを Phase 2 へ渡す

## 成果物

| 成果物              | パス                                     | 説明                       |
| ------------------- | ---------------------------------------- | -------------------------- |
| 要件定義書          | `outputs/phase-1/requirements.md`        | FR/NFR/AC の正本           |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | current spec / code anchor |

## 完了条件

- [x] current facts が owner / transport / consumer に分離されている
- [x] AC-1〜AC-7 が検証可能な形で定義されている
- [x] system spec と code anchor の対応表がある
- [x] 本Phase内の全タスクを100%実行完了
