# Phase 2: 設計書

## 変更1: Preload 型シグネチャ修正

**ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

- import文: `RuntimeSkillCreatorExecuteResult` -> `RuntimeSkillCreatorExecuteResponse`
- interface (line 110): 戻り値型を `IpcResult<RuntimeSkillCreatorExecuteResponse>` に変更
- implementation (line 284): 戻り値型を `IpcResult<RuntimeSkillCreatorExecuteResponse>` に変更

## 変更2: Renderer 型ナロイング追加

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

- `SkillCreatorRuntimeApi` ローカル型 (line 72-77): `terminal_handoff` ケースを Union に追加
- `handleExecutePlan` (line 419-427): `"type" in result.data` による discriminated union 型ナロイング + 早期リターン

## IPC 4層整合性チェック

| 層             | ファイル               | 状態                         |
| -------------- | ---------------------- | ---------------------------- |
| 定数定義       | `channels.ts`          | 変更不要                     |
| ホワイトリスト | `preload/index.ts`     | 変更不要                     |
| ハンドラ登録   | `creatorHandlers.ts`   | 変更不要（正しい型使用済み） |
| Preload API    | `skill-creator-api.ts` | 要修正                       |
