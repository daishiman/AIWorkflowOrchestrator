# フェーズ7: カバレッジレポート

## buildHealthPolicy.ts カバレッジ（推定）

| ブランチ                                              | テスト      | カバー |
| ----------------------------------------------------- | ----------- | ------ |
| `config?.providerId` 使用                             | TC-4-04     | ✅     |
| `fallbackProviderId` 使用（null）                     | TC-4-05     | ✅     |
| `fallbackProviderId` 引数指定                         | TC-4-06     | ✅     |
| `result.status` → `resolveHealthPolicy`               | TC-4-01〜03 | ✅     |
| `getAdapter` 例外 → `UNKNOWN_HEALTH_POLICY`           | TC-4-07     | ✅     |
| `checkHealth` 例外 → `UNKNOWN_HEALTH_POLICY`          | TC-4-08     | ✅     |
| `getSelectedLLMConfig` 例外 → `UNKNOWN_HEALTH_POLICY` | TC-4-09     | ✅     |

## RuntimeSkillCreatorFacade deps 変更のカバレッジ

`healthPolicy` フィールドは既存の `RuntimePolicyResolver.health-policy.test.ts` でコンストラクタ注入が検証済み。
Facade の `deps.healthPolicy` 渡しは実装上シンプルなパススルーのため既存テストで十分。

## 未カバー領域

- `registerAllIpcHandlers(mainWindow, db, { healthPolicy })` のエンドツーエンド統合テスト
  → `ipc-double-registration.test.ts` が `@repo/shared/types/auth` 問題で実行不可（既存問題）
  → 別タスクでの修正を推奨（スコープ外）
