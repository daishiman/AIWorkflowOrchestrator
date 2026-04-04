# Phase 2: 型互換性検証テーブル - TASK-RT-01

## 新規追加型

```typescript
/** LLMAdapter ステータス IPC レスポンス payload (TASK-RT-01) */
export interface LLMAdapterStatusPayload {
  status: LLMAdapterStatus; // "ready" | "initializing" | "failed"
  failureReason: string | null;
}
```

追加位置: `packages/shared/src/types/skillCreator.ts` の `LLMAdapterStatus` 型直下

## 型互換性テーブル

| 型                        | 定義場所                                    | 使用場所                                                               | 互換性               |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- | -------------------- |
| `LLMAdapterStatusPayload` | `packages/shared/src/types/skillCreator.ts` | `creatorHandlers.ts`, `skill-creator-api.ts`, `useLLMAdapterStatus.ts` | PASS                 |
| `LLMAdapterStatus`        | `packages/shared/src/types/skillCreator.ts` | `RuntimeSkillCreatorFacade.ts`, `LLMAdapterErrorBanner.tsx`            | 既存（変更不要）PASS |

## `@repo/shared/types` 再エクスポート

`packages/shared/src/types/index.ts` の `export type { ..., LLMAdapterStatus, ... } from "./skillCreator"` ブロックに
`LLMAdapterStatusPayload` を追加する。

## 判定: PASS

全型が `packages/shared` に集約されており、Main/Renderer/Preload の全層で参照可能。
型ドリフトのリスクなし。
