# Phase 12: システムドキュメント更新サマリー

## 更新対象ファイル

### IPC チャンネル仕様

`packages/shared/src/ipc/channels.ts`

`SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` が追加され、4チャネル構成になりました。
これにより `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が `IPC_CHANNELS` オブジェクト経由で参照可能です。

### Preload API 仕様

`apps/desktop/src/preload/skill-creator-api.ts`

`SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が追加されました。
`types.ts` を通じて `window.skillCreatorAPI.cancelGeneration` として renderer から呼び出し可能です。

### IPC ハンドラー仕様

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

- `skill-creator:cancel` ハンドラーが `registerSkillCreatorHandlers` 内で登録されます。
- `unregisterSkillCreatorHandlers` で解除されます（登録・解除の対が保証されています）。
- `skill-creator:cancel` は `SkillCreatorService.cancelCurrentOperation()` だけでなく、`SkillService.cancelCurrentSkillCreation()` も呼び出し、`skill:create` 経由の作成処理も停止します。

### サービス仕様

`apps/desktop/src/main/services/skill/SkillCreatorService.ts`

- `createSkill(options, onProgress?)` のシグネチャが変更されました（後方互換）。
- `cancelCurrentOperation()` パブリックメソッドが追加されました。
- `createSkill()` は `AbortController` を保持し、`runCreateWorkflow` / `generateSkillMd` / `generateTaskSpecs` / `validateSkill` / `validateWithSchema` へ `AbortSignal` を伝播します。
- `createSkill()` は、キャンセル時に今回の実行で新規作成された半作成 `skillDir` を削除し、既存ディレクトリは保持します。
- `runCreateWorkflow` の `StructurePlanJson` 出力仕様が修正されました。
- `SkillService.cancelCurrentSkillCreation()` が追加され、renderer の cancel 操作が active な `skill:create` にも届くようになりました。

## 変更なしのシステム仕様

- `useStreamingProgress.ts` — 変更なし（既に正しく実装済み）
- `GenerateStep.tsx` — 変更なし
- `SkillCreateWizard.tsx` — `handleCancelGeneration` を async 対応のみ（仕様変更なし）
