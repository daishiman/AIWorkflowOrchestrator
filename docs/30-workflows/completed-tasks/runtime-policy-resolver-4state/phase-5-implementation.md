# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| Phase名    | 実装                                          |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 機能名     | runtime-policy-resolver-4state                |
| 作成日     | 2026-03-21                                    |
| 前提Phase  | Phase 4（テスト作成）                         |
| 後続Phase  | Phase 6（テスト拡充）                         |
| ステータス | completed                                     |

## 目的

RuntimePolicyResolver.ts を4状態モデルにリファクタリングし、呼び出し元を修正する。

## 実行タスク

- resolver 実装: `resolveCapability()` と `assertNoSilentFallback()` を authority として組み込む
- facade 実装: `decision.capability` 分岐へ切り替える
- IPC 境界実装: `creatorHandlers.ts` で `ExecutionCapabilityInput` を正規化する
- 語彙統一: branch key を `authMode` から capability へ寄せる

## 参照資料

- Phase 2 設計書: `docs/30-workflows/runtime-policy-resolver-4state/phase-2-design.md`（インターフェース設計・語彙マッピング表）
- Phase 4 テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`（作成済みテストケースに対して GREEN にする）

## 実行手順

### ステップ1: RuntimePolicyResolver.ts のリファクタリング

1. import を `@repo/shared/types/auth-mode` から `@repo/shared/types/execution-capability` に変更
2. `resolveCapability()`, `assertNoSilentFallback()`, `AccessCapability`, `ExecutionCapabilityInput` を import
3. `resolve(authMode, apiKey)` を `resolve(input: ExecutionCapabilityInput): AccessCapability` に変更
4. 本体を `resolveCapability(input)` + `assertNoSilentFallback()` に置換
5. `resolveWithService()` を `resolveFromServices()` に変更
6. `RuntimeDecision` 型を4状態対応に更新

### ステップ2: RuntimeSkillCreatorFacade.ts の修正

1. `import type { AuthMode }` を `import type { ExecutionCapabilityInput }` に変更
2. `plan()`, `execute()`, `improve()` の引数を `(skillSpec, input: ExecutionCapabilityInput)` に変更
3. 4状態 switch 文を実装（Phase 2 設計書 ステップ2-1 参照）

### ステップ3: creatorHandlers.ts の修正

1. `args.authMode` からの `AuthMode` 取得を `ExecutionCapabilityInput` 構築に変更
2. `apiKeyValid`, `subscriptionValid`, `apiKeyDegraded` の判定ロジックを実装

### ステップ4: テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

## 成果物

- 更新: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- 更新: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- 更新: `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 統合テスト連携

- targeted suite: `pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts` と `pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` を GREEN にする
- IPC boundary: `creatorHandlers.ts` の入力正規化は Phase 6 の統合テストで再確認し、ここでは branch key の変更に限定する
- parent boundary: `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` の旧 resolver 依存は親タスク backlog に残し、直接修正しない

## 完了条件

- [ ] RuntimePolicyResolver.ts が resolveCapability() を使用して4状態を返す
- [ ] assertNoSilentFallback() が判定パイプラインに組み込まれている
- [ ] direct caller が4状態 switch で処理している
- [ ] Phase 4 で作成したテストが全て GREEN になっている
- [ ] 旧語彙（authMode）が RuntimePolicyResolver.ts から排除されている

## 次 Phase

Phase 6（テスト拡充）へ進む。
