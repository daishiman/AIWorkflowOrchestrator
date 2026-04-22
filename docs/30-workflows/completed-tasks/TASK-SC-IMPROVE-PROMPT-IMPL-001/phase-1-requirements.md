# Phase 1: 要件定義

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 1                               |
| タスクID            | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス          | pending                         |
| 作成日              | 2026-04-21                      |
| taskType            | NON_VISUAL                      |
| implementation_mode | `new`                           |

## 目的

`SkillCreatorService.runImprovePromptWorkflow()` の未実装状態、依存タスク、受入基準、テスト前提を固定し、以降の Phase で迷わない要件セットを作る。兄弟タスクとの責務境界をここで明確化する。

## 実行タスク

### Step 0: P50チェック

- `git log --oneline -10` で前提タスク `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` の完了痕跡を確認する
- `git diff main...HEAD` でスコープ外変更の混入有無を確認する
- `pnpm --filter @repo/desktop test SkillCreatorService` の現状結果を記録する

### Step 1: 現状実装の棚卸し

- `case "improve-prompt"` がスタブであることを確認する
- `runCreateWorkflow()`、`improveSkill()`、`throwIfAborted()` の既存パターンを整理する
- `PROGRESS_FLOWS["improve-prompt"]` の順序とメッセージを固定する

### Step 2: SKILL.md と prompt 対象の確認

- 改善対象が frontmatter か本文セクションかを整理する
- `improveSkill()` フォールバックが想定する入力と出力を確認する
- YAML / Markdown 境界を壊さない制約を明記する

### Step 3: テスト前提の固定

- 既存 `SkillCreatorService` 系テストの命名規則とモック方針を確認する
- 新規テストファイル名を `SkillCreatorService.improve-prompt.test.ts` に固定する
- targeted run コマンドを Phase 4 用に整理する

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`
- [index.md](index.md)

## 実行手順

1. 依存タスクと差分範囲を確認する
2. 対象メソッドと progress 契約を読み、現状の欠落を記録する
3. SKILL.md の対象領域と書き戻し制約を整理する
4. テスト戦略と命名規則を Phase 4 へ引き渡す

## 統合テスト連携

Phase 1 ではコード変更を行わず、Phase 4 以降で観測すべき統合ポイントを定義する。対象は `mode dispatch`、`progress emission`、`AbortSignal`、`SKILL.md 書き戻し`、`LLM / fallback 切替` の5点とする。

## 多角的チェック観点

- 論理分析系: `update` と `improve-prompt` の責務境界を区別できているか
- 構造分解系: 実装対象、テスト対象、close-out 対象が混ざっていないか
- システム系: 兄弟タスク、依存タスク、Phase 差し戻し先が見えるか
- 戦略系: 高リスクを `prompt section / abort / fallback` に絞れているか

## サブタスク管理

| サブタスクID | 内容            | 担当   |
| ------------ | --------------- | ------ |
| ST-1-01      | P50チェック     | Step 0 |
| ST-1-02      | スタブ確認      | Step 1 |
| ST-1-03      | prompt 対象確認 | Step 2 |
| ST-1-04      | テスト前提固定  | Step 3 |

## 成果物

- `outputs/phase-1/code-audit.md`
- `outputs/phase-1/skill-md-format.md`
- `outputs/phase-1/test-strategy.md`

## 完了条件

- [ ] P50チェックが完了していること
- [ ] 対象メソッド、依存、progress 契約が記録されていること
- [ ] SKILL.md の改善対象と制約が明記されていること
- [ ] Phase 4 に渡すテスト戦略が固定されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-1/` に出力されていること
- [ ] Phase 2 に渡す前提が固定されていること

## 次 Phase

[Phase 2: 設計](phase-2-design.md) へ進む。
