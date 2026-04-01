# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 8                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

機能を変えずに、読みやすさと保守性だけを上げる。

## 実行タスク

- P0-07 の runtime loop を読みやすくする
- U2 の snapshot semantics をコメントで明確にする

## 参照資料

| 資料名         | パス                                                                  | 参照理由               |
| -------------- | --------------------------------------------------------------------- | ---------------------- |
| runtime facade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | runtime refactor 対象  |
| renderer panel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | renderer refactor 対象 |

## リファクタリング観点

### TASK-P0-07

- `PLAN_RESOURCE_REQUESTS` から agent エントリを抽出する local helper を置くか、inline のままにするかを決める
- `AGENT_NAMES` が消えた後に、fallback path の意図が読みやすいかを確認する
- 新しい層を増やさず、現行の runtime service 内で閉じる

### TASK-SDK-04-U2

- `approvedSkillSpec` の意味をコードコメントで明確にする
- canonical JSON を作る helper は追加しない
- `handleGeneratePlan` と `handleExecutePlan` の責務境界をシンプルに保つ

## 実行手順

### ステップ1: runtime ループを整える

1. `RuntimeSkillCreatorFacade.ts` の fallback path を読む
2. 必要なら agent エントリ抽出を小さな helper に切る
3. テストが読みやすい名前になっているか確認する

### ステップ2: renderer snapshot を整える

1. `SkillLifecyclePanel.tsx` に `approvedSkillSpec` の意図をコメントする
2. live draft と snapshot が混同されないようにする

### ステップ3: 再実行する

1. runtime / renderer の unit test を再実行する
2. refactor 後も behavior が同じであることを確認する

## 成果物

| 成果物              | パス                                     | 説明           |
| ------------------- | ---------------------------------------- | -------------- |
| refactoring summary | `outputs/phase-8/refactoring-summary.md` | 変更内容の記録 |

## 完了条件

- [ ] 機能変更なしで可読性が上がっている
- [ ] runtime / renderer の責務境界が読みやすい
- [ ] テストが引き続き pass する

## サブタスク管理

1. runtime の refactor
2. renderer の refactor
3. 再実行と確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 実装の意味がコメントで伝わる
- [ ] Phase 9 へ進める
