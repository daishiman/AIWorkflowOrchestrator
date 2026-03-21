# RuntimePolicyResolver subscription service 統合タスク

| 項目       | 値                                                                |
| ---------- | ----------------------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001        |
| 優先度     | 中                                                                |
| 依存       | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                     |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 |

---

## 目的

`RuntimePolicyResolver.resolveFromServices()` が subscription 状態を service 経由で判定できるようにし、`terminalSurface` / `both` を current service path でも再現可能にする。

## 背景

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` の `resolveFromServices()` は `subscriptionValid = false` を固定している
- そのため service path では API キー以外の capability を正しく表現できない
- direct caller lane の capability bridge は完成しているが、service integration が未接続のため 4状態モデルが end-to-end では閉じていない

## 実行範囲

1. subscription 状態取得 service interface を定義する
2. `RuntimePolicyResolver` へ DI する
3. `resolveFromServices()` の判定を hardcode から service 呼び出しへ置き換える
4. unit test / spec / lessons を current behavior へ同期する

## 実行手順

1. subscription 状態の正本となる service / store / API を特定する
2. `IAuthKeyService` と同等の DI 境界で subscription service interface を追加する
3. `resolveFromServices()` で `ExecutionCapabilityInput` を service 値から構築する
4. `silent: true` / `false` の両経路で `terminalSurface` / `both` / `none` を検証する
5. workflow spec / contract spec / backlog / lessons を same-wave sync する

## 完了条件

- [ ] `resolveFromServices()` が `subscriptionValid` を hardcode しない
- [ ] service path で `terminalSurface` / `both` が再現できる
- [ ] unit test が subscription service 統合後の分岐をカバーする
- [ ] system spec が service path の capability 判定を current implementation と一致させる
