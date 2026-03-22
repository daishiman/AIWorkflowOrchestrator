# RuntimePolicy 仕様ドキュメント

## 概要

`RuntimePolicyResolver` は authMode と apiKey に基づいてスキル実行経路を決定する。
Skill / Agent / Skill Creator の全 surface が共通して参照する。

## 3パターン分岐

```
resolve(authMode, apiKey)
  ├─ apiKey.trim() !== "" → パターンA: integrated_api
  └─ apiKey 無効
       ├─ subscriptionAuthProvider.validateToken() === true
       │   → パターンC: terminal_handoff (subscription)
       └─ false / 例外 / 未注入
           → パターンB: terminal_handoff (no-auth)
```

### パターンA: integrated_api

| 項目   | 値                                                                          |
| ------ | --------------------------------------------------------------------------- |
| 条件   | `typeof apiKey === "string" && apiKey.trim() !== ""`                        |
| 戻り値 | `{ type: "integrated_api", apiKey: trimmedKey, permissionMode: "default" }` |
| 用途   | Anthropic API 直接呼び出し                                                  |

### パターンB: terminal_handoff (no-auth)

| 項目            | 値                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| 条件            | apiKey 無効 AND subscription 無効/例外/未注入                                                                     |
| 戻り値          | `{ type: "terminal_handoff", bundle: noAuthBundle }`                                                              |
| manualRetryRule | 「認証情報が設定されていません。設定画面で API Key を設定するか、Claude Code CLI で /login を実行してください。」 |

### パターンC: terminal_handoff (subscription)

| 項目            | 値                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------- |
| 条件            | apiKey 無効 AND `ISubscriptionAuthProvider.validateToken()` === true                         |
| 戻り値          | `{ type: "terminal_handoff", bundle: subscriptionBundle }`                                   |
| manualRetryRule | 「Claude Code サブスクリプションが有効です。以下のコマンドをターミナルで実行してください。」 |
| runbook         | ログイン手順を含む                                                                           |

## DI 構成

```typescript
class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(
    authKeyService?: IAuthKeyService, // API Key 取得
    subscriptionAuthProvider?: ISubscriptionAuthProvider, // subscription 判定
  );
}
```

両引数 optional のため後方互換性あり。未注入時は安全側（no-auth）にフォールバック。

## graceful degradation

| エラー源                                      | フォールバック先        |
| --------------------------------------------- | ----------------------- |
| AuthKeyService.getKey() 例外                  | subscription 判定に進む |
| SubscriptionAuthProvider.validateToken() 例外 | no-auth bundle          |
| SubscriptionAuthProvider 未注入               | no-auth bundle          |

P62対策: DEFAULT_CONFIG への暗黙 fallback は一切行わない。

## 関連タスク

| タスクID                          | ステータス                         |
| --------------------------------- | ---------------------------------- |
| TASK-SC-02-RUNTIME-POLICY-CLOSURE | 完了（2026-03-22）                 |
| UT-SC-02-001                      | 未着手（DI 配線）                  |
| UT-SC-02-002                      | 未着手（execute terminal_handoff） |
