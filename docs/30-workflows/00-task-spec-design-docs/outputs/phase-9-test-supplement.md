# Phase 9: テスト補充

## 実施日

2026-04-16

## 補充テスト一覧

### TASK-SW-STREAM-001 / STREAM-002

**対象**: `SkillCreatorService.test.ts` TC-04

- `runCreateWorkflow` の purpose が `options.description` を返すことを検証
- `agents` が `["extract-purpose", "plan-structure"]` であることを検証
- onProgress コールバックありの場合に各フェーズで呼び出されることを検証

### TASK-SW-CANCEL-001 / 002

**対象**: `skillCreatorHandlers.validation.test.ts`

- IPC-EX-004: チャンネル数が 32（`skill-creator:cancel` 追加）
- IPC-EX-006 (新規): キャンセルハンドラーが `cancelCurrentOperation` を呼ぶことを確認
- IPC-AL-001: invoke チャンネル数が 16（`SKILL_CREATOR_CANCEL` 追加）

### TASK-SW-CANCEL-003

**対象**: `skillCreatorHandlers.validation.test.ts`

- `cancelCurrentOperation` がモックに登録済みであること
- `SKILL_CREATOR_CANCEL` が `unregisterSkillCreatorHandlers` で解除されること

### TASK-SW-CANCEL-004

**対象**: `useCancelGeneration.test.ts`

- `cancelGeneration` が `Promise<void>` を返す（async 化）
- `window.skillCreatorAPI?.cancelGeneration?.()` が呼ばれること（optional chain により未定義でも安全）

### TASK-SW-CANCEL-005〜009

**対象**: キャンセル連携と AbortSignal 伝播の補強テスト

- `ScriptExecutor.test.ts`
  - `SE-ABORT-001`: `AbortSignal` 発火時に child process が `kill()` されること
- `SkillCreatorService.test.ts`
  - `SC-CANCEL-001`: `createSkill()` がキャンセル時に `AbortError` で中断され、`init_skill.js` に `signal` が渡り、半作成ディレクトリが削除されること
  - `SC-CANCEL-002`: 既存のスキルディレクトリを誤って削除しないこと
- `SkillService.test.ts`
  - `cancelCurrentSkillCreation()` が `SkillCreatorService.cancelCurrentOperation()` を呼ぶこと
- `skillCreatorHandlers.validation.test.ts`
  - `skill-creator:cancel` が `cancelCurrentOperation` と `cancelCurrentSkillCreation` を両方呼ぶこと
- `SkillCreateWizard.test.tsx`
  - cancel 後に stale error が再表示されないこと

**結果**: いずれも PASS

### TASK-SW-TODO-001

追加テスト不要（コメント変更のみ）

## 未カバー領域（既知）

- `window.skillCreatorAPI.cancelGeneration` の実際の IPC 送信は引き続き E2E テストでの確認が有効
