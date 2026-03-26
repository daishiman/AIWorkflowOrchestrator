# Manifest Scope Definition

## 固定した scope

manifest が保持する責務は次の 3 系統だけに限定した。

| 区分                | 格納先                                                             | 役割                                                                         |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| phase topology      | `phases[]`                                                         | downstream Task02 が phase graph を追加解釈なしで読めるようにする            |
| resource descriptor | `resources[]`                                                      | downstream Task03 が resource kind / path / phase 関連を受け取れるようにする |
| entry-exit hook     | `entry[]`, `exit[]`, `phases[].entryHookId`, `phases[].exitHookId` | downstream Task04 が hook 契約を参照できるようにする                         |

## 今回の実装反映

- `packages/shared/src/types/skillCreator.ts` に workflow manifest contract 型を追加
- `apps/desktop/src/main/services/runtime/ManifestLoader.ts` に read / validate / normalize / cache のみを持つ loader を追加
- `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` に最小サンプルを追加

## downstream handoff の固定項目

- Task02: `WorkflowManifestPhase[]`
- Task03: `WorkflowManifestResourceDescriptor[]`
- Task04: `WorkflowManifestHook[]` と phase 側の hook 参照
