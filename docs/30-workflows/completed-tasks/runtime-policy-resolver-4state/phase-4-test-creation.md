# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| Phase名    | テスト作成                                    |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 機能名     | runtime-policy-resolver-4state                |
| 作成日     | 2026-03-21                                    |
| 前提Phase  | Phase 3（設計レビュー）                       |
| 後続Phase  | Phase 5（実装）                               |
| ステータス | completed                                     |

## 目的

RuntimePolicyResolver の4状態判定と assertNoSilentFallback enforcement を検証するテストケースを作成する。

## 実行タスク

- 判定テスト作成: 4状態入力と期待 capability を固定する
- enforcement テスト作成: `assertNoSilentFallback()` の fail-fast を確認する
- direct caller テスト作成: facade 側の capability 分岐を検証する
- 旧語彙検証作成: grep 条件をテスト証跡へ落とす

## 参照資料

- Phase 1 要件: `docs/30-workflows/runtime-policy-resolver-4state/phase-1-requirements.md`
- Phase 2 設計書: `docs/30-workflows/runtime-policy-resolver-4state/phase-2-design.md`
- Phase 3 レビュー: `docs/30-workflows/runtime-policy-resolver-4state/phase-3-design-review.md`
- 既存テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`
- execution-capability 契約テスト: `packages/shared/src/types/__tests__/execution-capability-contract.test.ts`

## 実行手順

### ステップ1: 4状態判定テストケース

以下のテストケースを作成する（`apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts` を更新）。

| TC    | 入力                                                                    | 期待出力              |
| ----- | ----------------------------------------------------------------------- | --------------------- |
| TC-01 | `{ apiKeyValid: true, subscriptionValid: false }`                       | `"integratedRuntime"` |
| TC-02 | `{ apiKeyValid: false, subscriptionValid: true }`                       | `"terminalSurface"`   |
| TC-03 | `{ apiKeyValid: true, subscriptionValid: true }`                        | `"both"`              |
| TC-04 | `{ apiKeyValid: false, subscriptionValid: false }`                      | `"none"`              |
| TC-05 | `{ apiKeyValid: true, subscriptionValid: false, apiKeyDegraded: true }` | `"none"`              |
| TC-06 | `{ apiKeyValid: true, subscriptionValid: true, apiKeyDegraded: true }`  | `"terminalSurface"`   |

### ステップ2: assertNoSilentFallback テスト

- capability が `"none"` のとき例外が throw されること
- capability が `"integratedRuntime"` / `"terminalSurface"` / `"both"` のとき例外が throw されないこと

### ステップ3: 呼び出し元の4状態ハンドリングテスト

`RuntimeSkillCreatorFacade.test.ts` を更新し、4状態の switch 文が正しく処理されるテストを追加する。

### ステップ4: 旧語彙残存 grep 検証テスト

```bash
grep -rn "authMode" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts
# 期待: 0件
```

## 成果物

- 更新: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`
- 更新: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

## 統合テスト連携

- shared contract: `packages/shared/src/types/__tests__/execution-capability-contract.test.ts` の期待値と direct caller suite の期待値を同じ capability 語彙でそろえる
- desktop direct caller: `RuntimePolicyResolver.test.ts` と `RuntimeSkillCreatorFacade.test.ts` を Phase 5 の GREEN gate にする
- boundary note: `creatorHandlers.ts` の統合検証は Phase 6 へ送り、この phase では direct caller RED suite に集中する

## 完了条件

- [ ] 4状態判定テスト（TC-01〜TC-06）が作成されている
- [ ] assertNoSilentFallback enforcement テストが作成されている
- [ ] 呼び出し元の4状態ハンドリングテストが作成されている
- [ ] テストが RED 状態（実装前のため失敗すること）であることを確認

## 次 Phase

Phase 5（実装）へ進む。
