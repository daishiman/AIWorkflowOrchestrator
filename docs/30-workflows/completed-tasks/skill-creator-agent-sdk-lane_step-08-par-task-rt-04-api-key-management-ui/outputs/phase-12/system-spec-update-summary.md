# System Spec Update Summary — TASK-RT-04

## 新規ファイル

| パス                                                                                | 内容                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                | Anthropic APIキー管理UIコンポーネント |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx` | 26件のユニットテスト                  |

## 変更ファイル

| パス                                                                 | 変更内容                                |
| -------------------------------------------------------------------- | --------------------------------------- |
| `packages/shared/src/types/skillCreator.ts` (L209)                   | `ApiKeyStatus` 型追加                   |
| `packages/shared/src/types/index.ts` (L166)                          | `ApiKeyStatus` re-export 追加           |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | import + ApiKeySettingsPanel 配置 (2行) |

## 新規型定義

```typescript
// packages/shared/src/types/skillCreator.ts
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";
```

## IPC チャネル（変更なし・既存活用）

- `auth-key:set` / `auth-key:exists` / `auth-key:validate` / `auth-key:delete`
