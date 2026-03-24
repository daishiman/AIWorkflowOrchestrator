# UT-SC-03-003-M01: subscriptionAuthProvider DI 配線追加

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| タスクID   | UT-SC-03-003-M01                 |
| 親タスクID | UT-SC-03-003                     |
| 発見元     | Phase 10 最終レビュー MINOR 指摘 |
| 優先度     | Low                              |
| 発見日     | 2026-03-24                       |
| ステータス | unassigned                       |

## Why（なぜ必要か）

`RuntimeSkillCreatorFacade` のコンストラクタ `deps` には `subscriptionAuthProvider?: ISubscriptionAuthProvider` がオプショナルとして定義されているが、`ipc/index.ts` での DI 配線時に `subscriptionAuthProvider` が注入されていない。現状は graceful degradation 範囲内で動作するが、サブスクリプション判定が常に fallback パスを通るため、`integrated_api` レーンの判定精度が低下する。

## What（何をするか）

`ipc/index.ts` の RuntimeSkillCreatorFacade 生成部分で `subscriptionAuthProvider` を DI 配線に追加する。

## How（どのように実装するか）

1. `ipc/index.ts` で `ISubscriptionAuthProvider` の実装インスタンスを取得する
2. `RuntimeSkillCreatorFacade` のコンストラクタ引数に `subscriptionAuthProvider` を追加する
3. 既存テスト（TC-5, TC-6）に `subscriptionAuthProvider` 注入パターンを追加する

## 完了条件

- [ ] `subscriptionAuthProvider` が `ipc/index.ts` で注入されている
- [ ] RuntimePolicyResolver が実サブスクリプション判定を使用している
- [ ] 既存テストが全て PASS する

## 関連資料

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `arch-execution-capability-contract.md` (UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001)
