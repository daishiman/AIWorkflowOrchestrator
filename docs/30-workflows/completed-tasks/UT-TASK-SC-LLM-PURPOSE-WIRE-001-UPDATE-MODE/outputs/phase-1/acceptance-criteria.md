# Phase 1: 受け入れ基準 AC-1〜AC-5

## AC-1: update モードの期待動作が文書化されている

- [x] 既存スキルのファイル群（SKILL.md 等）を読み込む
- [x] スキルの内容を分析する
- [x] 差分更新を実行する（スタブ実装で可）
- [x] `init_skill.js` は**呼ばれない**
- [x] progress: `loading-skill` → `analyzing` → `done`

## AC-2: improve-prompt モードの期待動作が文書化されている

- [x] 既存スキルのファイル群（SKILL.md 等）を読み込む
- [x] SKILL.md の prompt セクションのみを分析する
- [x] prompt セクションのみを改善する（スタブ実装で可）
- [x] `init_skill.js` は**呼ばれない**
- [x] progress: `loading-skill` → `analyzing` → `improving` → `done`

## AC-3: runCreateWorkflow の実装パターンが確認されている

- [x] シグネチャ: `private async runCreateWorkflow(options: CreateSkillOptions, signal?: AbortSignal): Promise<StructurePlanJson | null>`
- [x] AbortError は re-throw
- [x] その他エラーは `this.logger.warn` + null 返却

## AC-4: 既存テストファイルのパスが確認されている

- [x] `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` 存在確認済み
- [x] SC-020/SC-021（update/improve-prompt）の既存テスト構造把握済み

## AC-5: init_skill.js が呼ばれない条件が明確化されている

- [x] **方式 B（early return）** を採用
- [x] `runUpdateWorkflow` / `runImprovePromptWorkflow` 完了後に `return skillDir` することで L429 以降をスキップ
