# Phase 1: 要件定義書

## タスクID: UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE

## 問題の根本原因

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `createSkill` メソッド内 switch 文において:

- `case "update":` — `emitProgress("loading-skill")` と `emitProgress("analyzing")` のみ実行し、専用ワークフローを呼ばずに break
- `case "improve-prompt":` — `emitProgress("loading-skill")`, `emitProgress("analyzing")`, `emitProgress("improving")` のみ実行し、専用ワークフローを呼ばずに break

break 後、`init_skill.js`（L429〜）が無条件に実行される。

## 確認コマンド実行結果

```
grep -n "case \"update\"\|case \"improve-prompt\"\|runUpdateWorkflow\|runImprovePromptWorkflow" SkillCreatorService.ts
412: case "update":
416: case "improve-prompt":
(runUpdateWorkflow / runImprovePromptWorkflow は存在しない)

grep -n "init_skill.js" SkillCreatorService.ts
430: const initResult = await this.executeScript("init_skill.js", [...])
455: const legacyInitResult = await this.executeScript("init_skill.js", [...])

grep -n "private async run" SkillCreatorService.ts
949: private async runCollaborativeWorkflow(...)
965: private async runOrchestrateWorkflow(...)
979: private async runCreateWorkflow(...) → Promise<StructurePlanJson | null>
```

## update モードの期待動作 (AC-1)

- 既存スキルの読み込み・分析を行う（スタブ実装で可）
- `runUpdateWorkflow(options, signal)` プライベートメソッドが呼ばれる
- `init_skill.js` は呼ばれない
- progress: `loading-skill` → `analyzing` → `done`

## improve-prompt モードの期待動作 (AC-2)

- 既存スキルの読み込み・prompt セクション分析を行う（スタブ実装で可）
- `runImprovePromptWorkflow(options, signal)` プライベートメソッドが呼ばれる
- `init_skill.js` は呼ばれない
- progress: `loading-skill` → `analyzing` → `improving` → `done`

## runCreateWorkflow 実装パターン (AC-3)

- シグネチャ: `private async runCreateWorkflow(options: CreateSkillOptions, signal?: AbortSignal): Promise<StructurePlanJson | null>`
- AbortError を re-throw、その他は `this.logger.warn` で記録して null 返却

## 既存テストファイル (AC-4)

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` 存在確認済み
- describe 構造: detectMode(), createSkill(), createSkill() Extended Modes (SC-020, SC-021)

## init_skill.js 非実行の制御方式 (AC-5)

**方式 B (early return) を採用**: update/improve-prompt の専用メソッド完了後に `return skillDir` し、`init_skill.js` 呼び出し行（L429〜）に到達させない。

理由: 既存コードへの影響が局所的で、制御フローが明示的。
