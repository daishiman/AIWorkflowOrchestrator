# Phase 1 Current State Inventory

## 監査時点の gap

| 区分             | 監査結果                                                                                                   | 根拠                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| consumer         | `agentHandlers.ts` と `skillHandlers.ts` が旧 `RuntimeResolver` 依存のまま残っていた                       | current code diff 前の import / `resolve()` 呼び出し             |
| composition root | auth mode service と central policy resolver の共通注入点が不足していた                                    | `apps/desktop/src/main/ipc/index.ts`                             |
| tests            | `RuntimePolicyResolver.resolveWithService()` ベースの runtime test が不足していた                          | `agentHandlers.runtime.test.ts`, `skillHandlers.runtime.test.ts` |
| cleanup          | `AI_CHECK_CONNECTION` と deprecated `RuntimeResolver` の削除条件が close-out 本体に混ざりやすかった        | canonical workflow / backlog                                     |
| public contract  | Agent / Skill は main process 内部消費の変更であり、public IPC / preload の payload 差分は確認されなかった | `apps/desktop/src/preload/*`, `packages/shared/src/types/*`      |

## 監査後の状態

| 項目             | 状態                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Agent consumer   | `IRuntimePolicyResolver` + `IAuthModeService` 注入へ移行済み                                            |
| Skill consumer   | `IRuntimePolicyResolver` + `IAuthModeService` 注入へ移行済み                                            |
| composition root | `RuntimePolicyResolver` / `createAuthModeService()` / `StubSubscriptionAuthProvider` を 1 箇所で構成    |
| runtime tests    | agent / skill の integrated と terminal handoff を `resolveWithService()` 基準で確認済み                |
| carry-over       | `AI_CHECK_CONNECTION` cleanup、deprecated `RuntimeResolver` cleanup、sanitize 配置判断は follow-up 管轄 |

## 監査メモ

- public `skill-creator:*` surface は既存 `registerSkillCreatorHandlers()` 経由で接続済みであり、この wave の main diff 対象ではなかった。
- `pnpm install --force` と `pnpm --filter @repo/shared build` はローカル検証環境の復旧措置であり、product contract 変更ではない。
