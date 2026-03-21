# UT-EXEC-02 - RuntimePolicyResolver.ts の 4 状態化

## メタ情報

```yaml
issue_number: 1422
```

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-EXEC-02                           |
| タスク名   | RuntimePolicyResolver.ts の 4 状態化 |
| 分類       | 未タスク（unassigned）               |
| 出典       | Phase 2 Concern A / Phase 5          |
| 優先度     | high                                 |
| 担当       | Task02 スコープ                      |
| ステータス | 未着手                               |
| 作成日     | 2026-03-20                           |

## 目的

`RuntimePolicyResolver.ts` に `resolveCapability()` を組み込み、4 状態の `AccessCapability` を返すように拡張する。また `assertNoSilentFallback()` の enforcement を確立することで、AI ランタイムの実行権限解決における暗黙 fallback（P62 パターン）を排除する。

Phase 2 設計審議にて Concern A として識別された実装不足。現在の `RuntimePolicyResolver` は 2 状態（許可/拒否）の単純な判定のみを行っており、4 状態（`canExecute` / `canRead` / `canDelegate` / `noAccess`）の細粒度制御が欠けている。この状態では、partial access な状況での silent fallback が発生する可能性がある。

## 実施内容

1. `RuntimePolicyResolver.ts` に `resolveCapability(context: RuntimeContext): AccessCapability` メソッドを追加する
2. 4 状態の `AccessCapability` 型（`packages/shared/src/types/execution-capability.ts` で定義済み）を返すように実装する
3. `assertNoSilentFallback(capability: AccessCapability): void` を実装し、`noAccess` 状態で処理が続行されないことを強制する
4. 既存の `resolve()` メソッドとの後方互換性を維持する

## 完了条件

- [ ] `RuntimePolicyResolver.ts` が `resolveCapability()` メソッドを持つ
- [ ] `resolveCapability()` が 4 状態の `AccessCapability` を返す
- [ ] `assertNoSilentFallback()` が `noAccess` 時に例外をスローする
- [ ] 既存テストが全 PASS すること
- [ ] 新規ユニットテストが追加され、4 状態それぞれのケースをカバーすること
- [ ] `pnpm typecheck` が通ること

## 関連タスク

- 親タスク: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
- 後続タスク: UT-EXEC-03（Renderer capability selector/hook の Consumer 統合）
- 関連仕様: `docs/30-workflows/ai-runtime-execution-responsibility-realignment/`
- 関連ファイル: `packages/shared/src/types/execution-capability.ts`
