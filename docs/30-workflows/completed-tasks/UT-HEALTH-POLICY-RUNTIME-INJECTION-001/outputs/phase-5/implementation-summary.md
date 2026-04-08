# フェーズ5: 実装サマリー

## 変更・新規作成ファイル一覧

| ファイル                                                                     | 種別 | 変更内容                                                                               |
| ---------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/buildHealthPolicy.ts`                | 新規 | HealthCheck → HealthPolicy 変換ユーティリティ                                          |
| `apps/desktop/src/main/services/runtime/__tests__/buildHealthPolicy.test.ts` | 新規 | 9 ユニットテスト                                                                       |
| `apps/desktop/src/main/ipc/index.ts`                                         | 修正 | `options?: { healthPolicy? }` 引数追加、RuntimePolicyResolver/Facade へ注入            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | 修正 | `deps.healthPolicy?: HealthPolicy` 追加、RuntimePolicyResolver へ渡す                  |
| `apps/desktop/src/main/index.ts`                                             | 修正 | `async () => {}` 化 + `buildHealthPolicy()` 呼び出し → `registerAllIpcHandlers` へ渡す |

## 設計判断の記録（DI タイミング）

- **起動時静的注入（採用）**: `app.whenReady()` コールバックで1回だけ HealthCheck を実行
- `registerAllIpcHandlers` は sync を維持（テスト互換性 — 約20テストファイルが同期呼び出し）
- `options?.healthPolicy` としてオプショナルに渡す → 既存テストはすべて変更不要

## テスト結果

```
buildHealthPolicy.test.ts       9 tests  ✓ PASS
RuntimePolicyResolver.test.ts   25 tests ✓ PASS
RuntimePolicyResolver.health-policy.test.ts  8 tests ✓ PASS
```
