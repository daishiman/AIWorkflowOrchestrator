# TASK-RT-05 Phase 12 Documentation Changelog

## Current

- `SkillCreatorUserInputKind`: 5 種類 (`single_select`, `multi_select`, `free_text`, `secret`, `confirm`)
- `SkillCreatorUserInputSubmission`: `selectedOptionIds?: string[]` フィールドあり
- `validateUserInputSubmission`: `multi_select` case 対応済み
- SkillLifecyclePanel: checkbox host + request kind 切替時 reset + submit disable 条件対応済み
- Canonical spec: `skill-creator` / `api-ipc-system-core` に `multi_select` 契約を反映済み

## Baseline

- `SkillCreatorUserInputKind`: 4 種類 (`single_select`, `free_text`, `secret`, `confirm`)
- `SkillCreatorUserInputSubmission`: `selectedOptionIds` なし
- `validateUserInputSubmission`: `multi_select` case なし
- SkillLifecyclePanel: checkbox host なし

## Validator 結果

- TypeScript typecheck: `pnpm exec tsc --noEmit` PASS
- Engine テスト: `esbuild` platform mismatch により再実行ブロック
- Renderer テスト: `esbuild` platform mismatch により再実行ブロック
- 回帰: 既存テスト群の再確認待ち
