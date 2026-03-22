# Phase 2: 設計書

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 作成日   | 2026-03-22                        |

## 1. subscription 判定ロジック設計

### 判定方式

`ISubscriptionAuthProvider.validateToken()` を使用する。このメソッドはトークン形式と有効期限を確認する（APIリクエストは行わない）。

### resolveFromServices() の修正設計

現行の `resolveWithService()` を拡張し、subscription 判定を追加する:

```typescript
async resolveWithService(authMode: AuthMode): Promise<RuntimeDecision> {
  // 1. apiKey 取得（例外時は null にフォールバック）
  let apiKey: string | null = null;
  try {
    apiKey = this.authKeyService ? await this.authKeyService.getKey() : null;
  } catch {
    // AC-5: AuthKeyService 例外時はフォールバック
  }

  // 2. apiKey が有効ならパターンA
  if (typeof apiKey === "string" && apiKey.trim() !== "") {
    return { type: "integrated_api", apiKey: apiKey.trim(), permissionMode: "default" };
  }

  // 3. subscription 判定
  let isSubscriptionValid = false;
  try {
    isSubscriptionValid = this.subscriptionAuthProvider
      ? await this.subscriptionAuthProvider.validateToken()
      : false;
  } catch {
    // AC-5: SubscriptionAuthProvider 例外時はフォールバック
    isSubscriptionValid = false;
  }

  // 4. subscription 有効→パターンC、無効→パターンB
  const bundle = isSubscriptionValid
    ? this.buildSubscriptionBundle()
    : this.buildNoAuthBundle();
  return { type: "terminal_handoff", bundle };
}
```

### resolve() メソッドの拡張設計

既存の `resolve(authMode, apiKey)` も同様に subscription 判定を追加する:

```typescript
async resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision> {
  // パターンA: apiKey が有効
  if (this.hasValidApiKey(apiKey)) {
    return { type: "integrated_api", apiKey: apiKey!.trim(), permissionMode: "default" };
  }

  // パターンC/B: subscription 判定
  const isSubscriptionValid = await this.checkSubscription();
  const bundle = isSubscriptionValid
    ? this.buildSubscriptionBundle()
    : this.buildNoAuthBundle();
  return { type: "terminal_handoff", bundle };
}
```

## 2. resolve() 全分岐フローチャート

```
resolve(authMode, apiKey)
  │
  ├─ hasValidApiKey(apiKey)?
  │   ├─ Yes → return { type: "integrated_api", apiKey: trimmed, permissionMode: "default" }
  │   │        (AC-1)
  │   └─ No
  │       │
  │       ├─ checkSubscription()
  │       │   ├─ try subscriptionAuthProvider.validateToken()
  │       │   │   ├─ true → isSubscriptionValid = true
  │       │   │   ├─ false → isSubscriptionValid = false
  │       │   │   └─ throws → isSubscriptionValid = false (AC-5 graceful degradation)
  │       │   └─ provider undefined → isSubscriptionValid = false
  │       │
  │       ├─ isSubscriptionValid = true
  │       │   └─ return { type: "terminal_handoff", bundle: subscriptionBundle }
  │       │       (AC-3, AC-4)
  │       │
  │       └─ isSubscriptionValid = false
  │           └─ return { type: "terminal_handoff", bundle: noAuthBundle }
  │               (AC-2)
```

### hasValidApiKey() 判定ロジック（P42準拠）

```typescript
private hasValidApiKey(apiKey: string | null): boolean {
  return typeof apiKey === "string" && apiKey.trim() !== "";
}
```

### checkSubscription() 判定ロジック

```typescript
private async checkSubscription(): Promise<boolean> {
  if (!this.subscriptionAuthProvider) return false;
  try {
    return await this.subscriptionAuthProvider.validateToken();
  } catch {
    return false; // AC-5: graceful degradation
  }
}
```

## 3. TerminalHandoffBundle フィールド設計

### subscription モード

```typescript
private buildSubscriptionBundle(): TerminalHandoffBundle {
  return {
    launcher: "claude",
    promptBundle: "",
    cwd: process.cwd(),
    suggestedCommand: 'claude -p "（スキルのプロンプトを入力してください）"',
    manualRetryRule:
      "Claude Code サブスクリプションが有効です。以下のコマンドをターミナルで実行してください。",
    runbook:
      "1. ターミナルを開く\n2. 以下のコマンドを実行\n3. Claude Code CLI がサブスクリプション認証で実行されます",
  };
}
```

### no-auth モード

```typescript
private buildNoAuthBundle(): TerminalHandoffBundle {
  return {
    launcher: "claude",
    promptBundle: "",
    cwd: process.cwd(),
    suggestedCommand: 'claude -p "（スキルのプロンプトを入力してください）"',
    manualRetryRule:
      "認証情報が設定されていません。設定画面で API Key を設定するか、Claude Code CLI で /login を実行してください。",
  };
}
```

## 4. graceful degradation 設計

### エラーカテゴリ別フォールバック方針

| エラー源                                        | エラーカテゴリ         | コード範囲 | フォールバック               | リトライ               |
| ----------------------------------------------- | ---------------------- | ---------- | ---------------------------- | ---------------------- |
| `AuthKeyService.getKey()` 例外                  | External Service Error | 3000-3999  | `terminal_handoff (no-auth)` | 不可（呼び出し側判断） |
| `SubscriptionAuthProvider.validateToken()` 例外 | External Service Error | 3000-3999  | `terminal_handoff (no-auth)` | 不可                   |
| `SubscriptionAuthProvider` 未注入               | 正常系                 | -          | `terminal_handoff (no-auth)` | -                      |
| Keychain アクセスタイムアウト                   | Infrastructure Error   | 4000-4999  | `terminal_handoff (no-auth)` | 不可                   |

### P62対策: DEFAULT_CONFIG fallback 禁止

- `resolve()` のどのパスからも `DEFAULT_CONFIG` を参照しない
- フォールバック先は常に明示的な `terminal_handoff (no-auth)` bundle
- `assertNoSilentFallback()` は capability レイヤーのガードであり、RuntimePolicyResolver では直接使用しない

### タイムアウト設計

- `ISubscriptionAuthProvider.validateToken()` 自体にタイムアウト機構がある（Keychain の応答待ち）
- `RuntimePolicyResolver` レベルでは追加のタイムアウトを設けない（SubscriptionAuthProvider の責務に委任）
- Keychain アクセスの一般的な応答時間: 100ms 以内（macOS）
- **タイムアウト秒数**: SubscriptionAuthProvider 内部で 5,000ms を上限とする（既存実装に委任）

## 5. DI 設計

### コンストラクタ拡張

```typescript
export class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(
    private readonly authKeyService?: IAuthKeyService,
    private readonly subscriptionAuthProvider?: ISubscriptionAuthProvider,
  ) {}
}
```

### インターフェース定義（既存を活用）

- `IAuthKeyService`: `apps/desktop/src/main/services/auth/types.ts` L97
- `ISubscriptionAuthProvider`: `packages/shared/src/types/auth-mode.ts` L339

両方とも既存のインターフェース定義を使用するため、新規インターフェースの作成は不要。DIP準拠（具象クラスではなくインターフェースに依存）。

### IRuntimePolicyResolver インターフェースの拡張

```typescript
export interface IRuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
  resolveWithService(authMode: AuthMode): Promise<RuntimeDecision>;
}
```

## 6. Result<T, E> パターンの適用

本タスクでは `resolve()` メソッドの戻り値は `RuntimeDecision`（discriminated union）であり、エラー状態も `terminal_handoff` として表現される。

`Result<T, E>` パターンの適用範囲:

- `resolve()` / `resolveWithService()` の戻り値は `RuntimeDecision` のまま（エラーも valid な状態として表現）
- 内部の `checkSubscription()` は `boolean` を返す（例外は catch して false にマップ）
- エラーログは内部で記録するが、呼び出し元にはサニタイズされた結果のみ返す

エラーの握りつぶし防止策:

- catch ブロックでは `console.warn()` でエラーを記録する
- エラーメッセージにはパスやトークン情報を含めない（P55対策）

## 完了条件チェック

- [x] subscription 判定の情報ソースが設計に明示されている（ISubscriptionAuthProvider.validateToken()）
- [x] resolve() の全3分岐（A/B/C）がフローチャートに記載されている
- [x] TerminalHandoffBundle の各モード別フィールドが定義されている
- [x] graceful degradation の動作が明示されている
- [x] タイムアウト秒数が数値で明示されている（5,000ms、SubscriptionAuthProvider に委任）
- [x] DIP準拠のインターフェース定義が含まれている
