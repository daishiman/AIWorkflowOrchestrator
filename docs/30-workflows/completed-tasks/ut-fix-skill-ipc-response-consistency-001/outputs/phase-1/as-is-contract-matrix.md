# Phase 1: AS-IS 契約差分表

## 担当

- SubAgent-A（契約棚卸し）

## 契約マトリクス（主要チャネル）

| チャネル            | Main返却                                    | Preload 実装                                     | Renderer 側期待                             | 判定                     |
| ------------------- | ------------------------------------------- | ------------------------------------------------ | ------------------------------------------- | ------------------------ |
| `skill:list`        | `{ success, data: SkillMetadata[] }`        | `safeInvokeUnwrap`                               | `SkillMetadata[]`                           | 整合                     |
| `skill:getImported` | `{ success, data: ImportedSkill[] }`        | `safeInvokeUnwrap`                               | `ImportedSkill[]`                           | 整合                     |
| `skill:scan`        | `{ success, data: SkillMetadata[] }`        | `safeInvokeUnwrap`                               | `SkillMetadata[]`                           | 整合                     |
| `skill:import`      | `ImportedSkill` or throw                    | `safeInvoke`                                     | `ImportedSkill`                             | 整合                     |
| `skill:remove`      | `RemoveResult`                              | `safeInvoke` + `Promise<void>`                   | 返却値未使用                                | **不整合（型ドリフト）** |
| `skill:execute`     | `{ success, data: SkillExecutionResponse }` | `safeInvoke` + `Promise<SkillExecutionResponse>` | `response.executionId` / `response.success` | **不整合（unwrap漏れ）** |

## 補足（対象外だが同一ドメイン）

| チャネル           | Main返却                                          | 備考                                        |
| ------------------ | ------------------------------------------------- | ------------------------------------------- |
| `skill:get-detail` | `{ success, data }` / `{ success: false, error }` | Preloadに同名公開メソッドなし               |
| `skill:abort`      | `boolean`                                         | Preload は `Promise<void>` 宣言             |
| `skill:get-status` | `ExecutionInfo \| null`                           | Preload は `Promise<ExecutionInfo \| null>` |

## 差分の根拠

- Main: `apps/desktop/src/main/ipc/skillHandlers.ts`
- Preload: `apps/desktop/src/preload/skill-api.ts`
- Renderer 利用: `apps/desktop/src/renderer/store/slices/agentSlice.ts`, `apps/desktop/src/renderer/hooks/useSkillExecution.ts`

## 結論

- 実害が大きい差分は `execute` と `remove` の2点。
- Phase 2 で契約プロファイル表を作成し、`safeInvokeUnwrap` 適用チャネルを再定義する。
