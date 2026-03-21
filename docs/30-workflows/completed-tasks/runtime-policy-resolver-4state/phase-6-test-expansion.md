# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| Phase名    | テスト拡充                                    |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 機能名     | runtime-policy-resolver-4state                |
| 作成日     | 2026-03-21                                    |
| 前提Phase  | Phase 5（実装）                               |
| 後続Phase  | Phase 7（カバレッジ確認）                     |
| ステータス | completed                                     |

## 目的

Phase 4 で不足していた境界値テスト、統合テスト、エッジケーステストを追加する。

## 実行タスク

- 境界値拡張: `apiKeyDegraded` の値境界を追加で検証する
- service 統合拡張: `resolveFromServices()` の入力構築を検証する
- IPC 統合拡張: `creatorHandlers.ts` の boundary 正規化を検証する

## 参照資料

- Phase 4 テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`（既存テストケース）
- Phase 5 実装: `docs/30-workflows/runtime-policy-resolver-4state/phase-5-implementation.md`

## 実行手順

### ステップ1: apiKeyDegraded 境界値テスト

以下のテストケースを追加する。

| TC    | apiKeyValid | subscriptionValid | apiKeyDegraded | 期待出力              |
| ----- | ----------- | ----------------- | -------------- | --------------------- |
| TC-07 | true        | false             | undefined      | `"integratedRuntime"` |
| TC-08 | true        | false             | false          | `"integratedRuntime"` |
| TC-09 | true        | true              | undefined      | `"both"`              |
| TC-10 | true        | true              | false          | `"both"`              |
| TC-11 | false       | false             | true           | `"none"`              |

### ステップ2: resolveFromServices 統合テスト

以下のシナリオを追加する。

- `authKeyService.hasKey() = true`, `authKeyService.getKey() = "sk-..."` のとき `apiKeyValid: true` になること
- `authKeyService.hasKey() = false` のとき `apiKeyValid: false` になること
- `silent: true` オプション指定時に capability が `"none"` でも例外が throw されないこと

### ステップ3: creatorHandlers 統合テスト

creatorHandlers の args から `ExecutionCapabilityInput` が正しく構築されるかの統合テストを追加する。

## 成果物

- 更新: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`
- 更新: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

## 統合テスト連携

- direct caller suite: Phase 4 で作成した RED suite を維持しつつ境界値ケースを足す
- IPC boundary: `apps/desktop/src/main/ipc/creatorHandlers.ts` の入力構築を assertion 対象に含める
- regression gate: degraded path と `silent: true` path を固定し、P62 再発を防ぐ

## 完了条件

- [ ] apiKeyDegraded 境界値テスト（TC-07〜TC-11）が追加され PASS している
- [ ] resolveFromServices 統合テストが追加され PASS している
- [ ] 全テストが GREEN である

## 次 Phase

Phase 7（カバレッジ確認）へ進む。
