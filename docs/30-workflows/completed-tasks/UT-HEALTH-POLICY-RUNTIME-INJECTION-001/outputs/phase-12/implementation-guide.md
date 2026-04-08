# UT-HEALTH-POLICY-RUNTIME-INJECTION-001 実装ガイド

## 概要

`RuntimePolicyResolver` の `healthPolicy?: HealthPolicy` コンストラクタ引数に、
起動時の LLM HealthCheck 結果を実際に注入する配線を実装した。

## 変更ファイル

### 新規: `apps/desktop/src/main/services/runtime/buildHealthPolicy.ts`

LLMAdapterFactory からヘルスチェックを実行し、`HealthPolicy` を構築するユーティリティ関数。

```typescript
export async function buildHealthPolicy(
  fallbackProviderId: LLMProviderId = "anthropic",
): Promise<HealthPolicy>;
```

**フロー**:

1. `getSelectedLLMConfig()` で選択中プロバイダーIDを取得（未選択なら `fallbackProviderId`）
2. `LLMAdapterFactory.getAdapter(providerId)` でアダプターを取得
3. `adapter.checkHealth()` でヘルスチェック実行
4. `resolveHealthPolicy()` で `HealthPolicy` に変換して返す
5. 例外発生時は `unknown` HealthPolicy にフォールバック（サイレント）

### 修正: `apps/desktop/src/main/ipc/index.ts`

`registerAllIpcHandlers` にオプション引数 `options?: { healthPolicy?: HealthPolicy }` を追加。

```typescript
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  conversationDb?: Database.Database | null,
  options?: { healthPolicy?: HealthPolicy },
): IpcHandlerRegistrationResult;
```

`RuntimePolicyResolver` と `RuntimeSkillCreatorFacade` 両方に `options?.healthPolicy` を渡す。

### 修正: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

`RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` を追加し、
`RuntimePolicyResolver` コンストラクタへ渡す。

### 修正: `apps/desktop/src/main/index.ts`

`app.whenReady().then(async () => { ... })` で `buildHealthPolicy()` を事前実行し、
`registerAllIpcHandlers` の `options` に渡す。

```typescript
const healthPolicy = await buildHealthPolicy();
registerAllIpcHandlers(mainWindowRef, conversationDb, { healthPolicy });
```

## 設計判断の記録

**DI タイミング**: 起動時1回注入（静的）

- `registerAllIpcHandlers` は約20のテストファイルで同期呼び出しされており async 化は影響大
- `main/index.ts` の `app.whenReady()` コールバックを `async` にする最小変更で対応
- `options` をオプショナルにすることで既存テストは変更不要

## テスト

```
apps/desktop/src/main/services/runtime/__tests__/buildHealthPolicy.test.ts  9 tests ✅
```

## 受入基準の達成

| AC                                                               | 状態                                    |
| ---------------------------------------------------------------- | --------------------------------------- |
| RuntimePolicyResolver が実際の HealthPolicy を受け取って動作する | ✅                                      |
| degraded 状態で terminal_handoff が返される                      | ✅ health-policy.test.ts で既存検証済み |

## 関連タスク

- 親タスク: `TASK-IMP-HEALTH-POLICY-UNIFICATION-001`
- 既存問題 (`ipc-double-registration.test.ts` の `@repo/shared/types/auth` 未解決): スコープ外
