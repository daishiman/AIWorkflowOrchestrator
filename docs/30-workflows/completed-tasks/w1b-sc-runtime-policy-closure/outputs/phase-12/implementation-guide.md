# 実装ガイド: RuntimePolicyResolver subscription 判定統合

## Part 1: 中学生レベル概念説明

### RuntimePolicy って何？

電車に乗るとき、駅の窓口では乗り方を自動で決めてくれますよね。

- **定期券を持っている人**（apiKey）→ そのまま改札を通れます（`integrated_api`）
- **一般切符を買った人**（subscription）→ 切符売り場で切符を買ってから乗ります（`terminal_handoff subscription`）
- **何も持っていない人**（no-auth）→ 「切符を買ってください」と案内されます（`terminal_handoff no-auth`）

`RuntimePolicyResolver` は、この「窓口の係員」のような役割です。誰が来ても、その人に合った乗り方を教えてくれます。

### 3つの乗り方（パターン）

1. **パターンA**: 定期券（API Key）を持っている → 直接改札を通る
2. **パターンC**: 一般切符（サブスクリプション）を持っている → 切符売り場経由で乗る
3. **パターンB**: 何も持っていない → 「定期券か切符を買ってね」と案内される

### もし機械が壊れたら？

切符を確認する機械が壊れても、係員は「切符を買ってください」と安全な案内をします。これを「graceful degradation」と呼びます。壊れたからといって、勝手に通していい（DEFAULT_CONFIG fallback）わけではありません。

## Part 2: 開発者向け実装詳細

### 3パターン分岐ロジック

```typescript
// RuntimePolicyResolver.resolve()
const trimmedKey = typeof apiKey === "string" ? apiKey.trim() : "";
if (trimmedKey !== "") {
  // パターンA: integrated_api
  return {
    type: "integrated_api",
    apiKey: trimmedKey,
    permissionMode: "default",
  };
}

const isSubscriptionValid = await this.checkSubscription();
// パターンC or B
const bundle = isSubscriptionValid
  ? this.buildSubscriptionBundle() // パターンC
  : this.buildNoAuthBundle(); // パターンB
return { type: "terminal_handoff", bundle };
```

### TerminalHandoffBundle フィールド仕様

| フィールド       | subscription                | no-auth            | 必須 |
| ---------------- | --------------------------- | ------------------ | ---- |
| launcher         | "claude"                    | "claude"           | Yes  |
| promptBundle     | ""                          | ""                 | Yes  |
| cwd              | process.cwd()               | process.cwd()      | Yes  |
| suggestedCommand | claude -p "..."             | claude -p "..."    | Yes  |
| manualRetryRule  | subscription 固有ガイダンス | セットアップガイド | Yes  |
| runbook          | ログイン手順                | undefined          | No   |

### graceful degradation 方針

| エラー                                        | フォールバック先        |
| --------------------------------------------- | ----------------------- |
| AuthKeyService.getKey() 例外                  | subscription 判定に進む |
| SubscriptionAuthProvider.validateToken() 例外 | no-auth bundle          |
| SubscriptionAuthProvider 未注入               | no-auth bundle          |
| P62: DEFAULT_CONFIG への fallback             | 禁止                    |

### DI 構成

```typescript
new RuntimePolicyResolver(
  authKeyService?,              // IAuthKeyService (optional)
  subscriptionAuthProvider?,    // ISubscriptionAuthProvider (optional)
)
```

両方 optional のため後方互換性あり。
