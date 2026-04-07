# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 1                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | -                                                            |
| 後続Phase  | Phase 2                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

`createVerificationReviewRequest()` が `free_text` kind のまま放置されているため、
`applyVerificationReviewTransition()` の遷移ロジックへ到達できない状態を解消する。
本Phaseでは変更スコープ・受け入れ基準・依存関係を明文化する。
あわせて `task-specification-creator` と `aiworkflow-requirements` の必須項目を抽出し、
Phase 2 の並列検証へ渡す。

## 背景

- TASK-SDK-04-U1 で `submitUserInput()` に reason 別の phase transition semantics を実装済み
- engine の `applyVerificationReviewTransition()` は `selectedOptionId`（approve/improve/reject）で判定する
- しかし `createVerificationReviewRequest()` は `free_text` kind のままであり、renderer 側に選択肢が表示されない
- 結果として renderer から `selectedOptionId` を送る導線が存在せず、遷移ロジックが実質到達不能

## タスク分類

| 分類項目        | 判定         | 根拠                                                                  |
| --------------- | ------------ | --------------------------------------------------------------------- |
| UIタスク        | **No**       | Renderer コンポーネント変更なし（既存 single_select handling で動作） |
| docsのみタスク  | No           | Main Process コードを変更する                                         |
| IPCチャネル変更 | No           | 新規 IPC チャンネル追加なし                                           |
| 影響範囲        | Main Process | `SkillCreatorWorkflowEngine.ts` のみ                                  |

## 実行タスク

- 要件抽出: 現行コードの `createVerificationReviewRequest()` 実装を確認し、変更箇所を特定する
- 受け入れ基準作成: AC-1〜AC-4 を定義する
- 依存確認: TASK-SDK-04-U1 の実装内容（`applyVerificationReviewTransition()`）を参照し、整合を確認する
- skill 抽出: `task-specification-creator` と `aiworkflow-requirements` の必須項目・禁止項目を抽出し、Phase 2 の検証観点へ変換する

## 参照資料

### 実装・コード

| 資料名                   | パス                                                                                              | 用途                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| WorkflowEngine           | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                            | `createVerificationReviewRequest()` L657-672 確認               |
| 型定義                   | `packages/shared/src/types/skillCreator.ts`                                                       | `SkillCreatorUserInputKind`, `SkillCreatorUserInputOption` 確認 |
| テストファイル           | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`             | 既存テストケース確認                                            |
| 親タスク unassigned-task | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md` | 背景・詳細仕様                                                  |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                              | 用途                           |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| Agent IPC仕様    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | Skill Creator ユーザー入力仕様 |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UserInputRequest型定義         |
| 教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 類似実装の知見                 |
| リソースマップ   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 参照先特定                     |

### task-specification-creator

| 資料名                    | パス                                                                                    | 用途                            |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| Skill 本体                | `.claude/skills/task-specification-creator/SKILL.md`                                    | Phase 1-13 の構成・必須要件確認 |
| 完了記録ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Phase 12 の Step 1/2 判定       |
| Step 1 完了記録ガイド     | `.claude/skills/task-specification-creator/references/spec-update-step1-completion.md`  | 完了記録の更新対象確認          |
| Step 2 domain sync ガイド | `.claude/skills/task-specification-creator/references/spec-update-step2-domain-sync.md` | 更新要否の判定                  |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# createVerificationReviewRequest の現状確認
grep -n "createVerificationReviewRequest\|free_text\|single_select" \
  apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts

# 型定義の確認
grep -n "SkillCreatorUserInputKind\|SkillCreatorUserInputOption\|single_select\|free_text" \
  packages/shared/src/types/skillCreator.ts

# 既存テストでの textValue / selectedOptionId 使用箇所
grep -n "textValue\|selectedOptionId\|verification_review" \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

### 1. 要件抽出

`createVerificationReviewRequest()` の現行実装を確認し、以下を記録する:

- 現在の kind 値（`free_text`）
- `recordExecutionFailure()` と `recordVerifyFailure()` の両方から呼ばれていることを確認
- `applyVerificationReviewTransition()` が期待する `selectedOptionId` の値（approve / improve / reject）

### 2. 受け入れ基準の定義

| AC-ID | 受け入れ基準                                                              | 検証方法                   |
| ----- | ------------------------------------------------------------------------- | -------------------------- |
| AC-1  | `createVerificationReviewRequest()` が `kind: "single_select"` を返す     | テスト（単体）             |
| AC-2  | `options` に `approve` / `improve` / `reject` の3選択肢が含まれる         | テスト（単体）             |
| AC-3  | `validateUserInputSubmission` が options 外の selectedOptionId を拒否する | テスト（単体）             |
| AC-4  | 既存テスト全件パス（回帰なし）                                            | `pnpm exec vitest run ...` |

### 3. 既存命名規則の確認

```bash
# テストファイルのテスト名命名規則を確認（camelCase / kebab-case）
grep -n "describe\|it(" \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts | head -30
```

## 統合テスト連携

対象は Main Process のみ（IPC 変更なし）。統合テストは Vitest 単体テストレベルで完結する。

```bash
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## サブタスク管理

- Lane A: 現行実装・型定義・既存テストを確認する
- Lane B: task-specification-creator / aiworkflow-requirements の必須項目を抽出する
- Lane C: A/B の結果を統合して受け入れ基準と依存関係を確定する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 責務境界   | `createVerificationReviewRequest()` は request 生成のみ。遷移判定は `applyVerificationReviewTransition()` が担う |
| 影響範囲   | `recordExecutionFailure` と `recordVerifyFailure` の両呼び出し元が自動反映されることを確認                       |
| 後方互換性 | renderer は既存の single_select kind handling で動作する想定。新規 IPC チャンネル追加不要                        |
| リスク     | free_text の `textValue` を使う既存テストが壊れる（F1-2）→ single_select 用に書き換える                          |

## 成果物

| 成果物       | パス                                                    | 説明                   |
| ------------ | ------------------------------------------------------- | ---------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`            | 機能要件・非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                | AC-1〜AC-4 一覧        |
| 仕様抽出結果 | `outputs/phase-1/aiworkflow-requirements-extraction.md` | aiworkflow仕様抽出結果 |

## 完了条件

- [ ] `createVerificationReviewRequest()` の現行実装を確認した
- [ ] `SkillCreatorUserInputKind` 型に `single_select` が存在することを確認した
- [ ] `task-specification-creator` と `aiworkflow-requirements` の必須項目を抽出した
- [ ] AC-1〜AC-4 が定義されている
- [ ] 受け入れ基準が検証可能な粒度になっている
- [ ] 既存テストの textValue 使用箇所を洗い出した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 1
```

## 次のPhase

Phase 2: 設計
