# Phase 1: 受入基準（AC-1〜AC-7）

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 1                                      |
| 作成日 | 2026-04-14                             |
| タスク | UT-HEALTH-POLICY-RUNTIME-INJECTION-001 |

---

## 受入基準一覧

| AC番号 | 基準                                                                                                                                         | 検証方法              | 判定 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---- |
| AC-1   | `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` が追加されている                                                            | コードレビュー / grep | ✅   |
| AC-2   | `RuntimeSkillCreatorFacade` のコンストラクタが `RuntimePolicyResolver` に3番目引数を渡している                                               | コードレビュー        | ✅   |
| AC-3   | `apps/desktop/src/main/ipc/index.ts` で `healthPolicy` が生成・渡されている（`undefined` 不可）                                              | コードレビュー        | ✅   |
| AC-4   | `isDegraded: true` の `healthPolicy` を渡した `RuntimeSkillCreatorFacade.plan()` が `terminal_handoff` 系のレスポンス（guidance 含む）を返す | テスト PASS           | ✅   |
| AC-5   | `healthPolicy` を渡さない（`undefined`）場合の後方互換性が保たれており、既存テストが全 PASS                                                  | `pnpm test` PASS      | ✅   |
| AC-6   | `pnpm --filter @repo/desktop typecheck` が通る                                                                                               | typecheck PASS        | ✅   |
| AC-7   | 関連テストファイル3種が全 PASS（`.test.ts`, `.plan.test.ts`, `.improve.test.ts`）                                                            | `pnpm test` PASS      | ✅   |

---

## 根拠・証拠

### AC-1: healthPolicy? 追加確認

```
apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts:133
  /** 起動時に注入する HealthPolicy（UT-HEALTH-POLICY-RUNTIME-INJECTION-001） */
  healthPolicy?: HealthPolicy;
```

### AC-2: 3番目引数渡し確認

```
apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts:256-259
  this.resolver = new RuntimePolicyResolver(
    deps.authKeyService,
    deps.subscriptionAuthProvider,
    deps.healthPolicy,   ← 3番目引数として渡している
  );
```

### AC-3: index.ts での生成・注入確認

```
apps/desktop/src/main/ipc/index.ts:721-727
  const runtimeHealthPolicy = resolveHealthPolicy({
    connectionStatus: "connected",
    isApiKeyValid: true,
    apiKeyDegraded: false,
    isRateLimited: false,
    lastHealthCheck: null,
  });

apps/desktop/src/main/ipc/index.ts:1055
  healthPolicy: options?.healthPolicy ?? runtimeHealthPolicy,
```

undefined フォールバックあり → `undefined` 不可条件を満たす

### AC-4〜AC-7: テスト実行結果

3テストファイル（100テスト）全 PASS、typecheck PASS — 詳細は outputs/phase-9/ 参照
