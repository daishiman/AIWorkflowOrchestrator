# Phase 1: 要件定義書

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 作成日   | 2026-03-22                        |

## P50チェック: 既実装状態の調査

### 変更履歴

```
77abcbc7f feat(ipc): Runtime Skill Creator public IPC wiring統合 (#1447)
9106abb57 feat(runtime): RuntimePolicyResolver capability bridge 4状態モデル実装 (#1442)
80223d65e feat(runtime): Skill/Agent/Creator runtime routing 統一と handoff 導線を実装 (#1231)
```

### 現行実装の状態

| 項目                                      | 状態     | 詳細                                                                     |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------ |
| パターンA (integrated_api)                | 実装済み | `authMode === "api-key"` かつ `apiKey.trim() !== ""` で正しく分岐する    |
| パターンB (no-auth terminal_handoff)      | 部分実装 | terminal_handoff として分岐するが、subscription 有効/無効を区別しない    |
| パターンC (subscription terminal_handoff) | 未実装   | `ISubscriptionAuthProvider.validateToken()` が未注入・未呼び出し         |
| subscription 判定ロジック                 | 未実装   | `subscriptionValid` のハードコードではなく、判定ロジック自体が存在しない |
| TerminalHandoffBundle の分化              | 未実装   | subscription/no-auth 共通の `buildDefaultBundle()` のみ                  |
| graceful degradation                      | 未実装   | AuthKeyService 例外時のフォールバックが未設計                            |

### 結論

Phase 4-5 は**新規実装**モードで進める。パターンA は既存実装を活用し、パターンB/C の分化と subscription 判定の統合が必要。

## 現行 resolve() ロジック調査レポート

### RuntimePolicyResolver.resolve() のフロー

```
resolve(authMode, apiKey)
  ├─ authMode === "api-key" && apiKey.trim() !== "" → integrated_api { apiKey, permissionMode: "default" }
  └─ else → terminal_handoff { bundle: buildDefaultBundle() }
```

- `buildDefaultBundle()` は固定の汎用 bundle を生成する（subscription/no-auth の区別なし）
- `resolveWithService()` は `authKeyService.getKey()` で apiKey を取得してから `resolve()` を呼ぶ

### RuntimeResolver（汎用版）との差分

`RuntimeResolver` は `IAuthModeService.getMode()` で authMode を自動取得する。`RuntimePolicyResolver` は引数で受け取る。両者の subscription 判定は同じく未実装。

## subscription 判定の情報ソース

| ソース                        | インターフェース            | メソッド                              | 場所                                                |
| ----------------------------- | --------------------------- | ------------------------------------- | --------------------------------------------------- |
| subscription トークン有効性   | `ISubscriptionAuthProvider` | `validateToken(): Promise<boolean>`   | `packages/shared/src/types/auth-mode.ts`            |
| subscription トークン存在確認 | `ISubscriptionAuthProvider` | `hasToken(): Promise<boolean>`        | 同上                                                |
| subscription トークン取得     | `ISubscriptionAuthProvider` | `getToken(): Promise<string \| null>` | 同上                                                |
| 認証モード取得                | `IAuthModeService`          | `getMode(): AuthMode`                 | `apps/desktop/src/main/services/auth/types.ts`      |
| 認証状態取得                  | `IAuthModeService`          | `getStatus(): Promise<AuthStatus>`    | 同上                                                |
| API Key 取得                  | `IAuthKeyService`           | `getKey(): Promise<string \| null>`   | 同上                                                |
| capability 導出               | `resolveCapability()`       | `(input) => AccessCapability`         | `packages/shared/src/types/execution-capability.ts` |

## 3パターン分岐定義（要件レベル）

### パターンA: integrated_api

| 項目     | 値                                                                          |
| -------- | --------------------------------------------------------------------------- |
| 判定条件 | `apiKey` が有効な非空文字列（trim 後も非空）                                |
| 戻り値   | `{ type: "integrated_api", apiKey: trimmedKey, permissionMode: "default" }` |
| 対応 AC  | AC-1                                                                        |
| 既存実装 | あり（変更不要）                                                            |

### パターンB: terminal_handoff (no-auth)

| 項目     | 値                                                                    |
| -------- | --------------------------------------------------------------------- |
| 判定条件 | apiKey が無効 AND `subscriptionAuthProvider.validateToken()` が false |
| 戻り値   | `{ type: "terminal_handoff", bundle: { ...noAuthBundle } }`           |
| 対応 AC  | AC-2                                                                  |
| 既存実装 | 部分的（bundle に no-auth 固有のフィールドがない）                    |

### パターンC: terminal_handoff (subscription)

| 項目     | 値                                                                   |
| -------- | -------------------------------------------------------------------- |
| 判定条件 | apiKey が無効 AND `subscriptionAuthProvider.validateToken()` が true |
| 戻り値   | `{ type: "terminal_handoff", bundle: { ...subscriptionBundle } }`    |
| 対応 AC  | AC-3                                                                 |
| 既存実装 | なし                                                                 |

### 分岐フロー（要件レベル）

```
resolve(authMode, apiKey)
  ├─ hasValidApiKey(apiKey)? → Yes → パターンA: integrated_api
  └─ No
       ├─ isSubscriptionValid()? → Yes → パターンC: terminal_handoff (subscription)
       └─ No → パターンB: terminal_handoff (no-auth)
```

## FR-5（RuntimePolicy）機能要件

| ID     | 要件                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| FR-5-1 | `RuntimePolicyResolver` は `authMode` と `apiKey` に基づいて実行経路を決定する                             |
| FR-5-2 | apiKey が有効な場合は `integrated_api` モードを返す                                                        |
| FR-5-3 | subscription が有効な場合は `terminal_handoff (subscription)` モードを返し、Claude.ai 経由の実行を誘導する |
| FR-5-4 | 認証情報が一切ない場合は `terminal_handoff (no-auth)` モードを返し、セットアップガイドを表示する           |
| FR-5-5 | AuthKeyService / SubscriptionAuthProvider の例外時は安全側（terminal_handoff no-auth）にフォールバックする |
| FR-5-6 | `DEFAULT_CONFIG` への暗黙 fallback を行わない（P62準拠）                                                   |

## AC-4（TerminalHandoff）受入基準

| ID     | 基準                                                                                                      | 検証方法                          |
| ------ | --------------------------------------------------------------------------------------------------------- | --------------------------------- |
| AC-4-1 | subscription モードの `TerminalHandoffBundle` は `manualRetryRule` に subscription 固有のガイダンスを含む | テストで `manualRetryRule` を検証 |
| AC-4-2 | no-auth モードの `TerminalHandoffBundle` は `manualRetryRule` にセットアップガイドを含む                  | テストで `manualRetryRule` を検証 |
| AC-4-3 | 両モードとも `launcher`, `promptBundle`, `cwd`, `suggestedCommand` が必須フィールドとして存在する         | テストで全フィールド存在確認      |
| AC-4-4 | subscription モードの bundle は `runbook` にログイン手順を含む（任意だが推奨）                            | テストで確認                      |

## エッジケース一覧

| #    | ケース                                             | 期待動作                                     | 優先度 |
| ---- | -------------------------------------------------- | -------------------------------------------- | ------ |
| E-1  | apiKey が空文字列 `""`                             | パターンB or C（subscription 判定に進む）    | 高     |
| E-2  | apiKey がスペースのみ `"   "`                      | パターンB or C（P42準拠 trim チェック）      | 高     |
| E-3  | apiKey が `null`                                   | パターンB or C                               | 高     |
| E-4  | apiKey が `undefined`                              | パターンB or C                               | 高     |
| E-5  | subscription トークンが期限切れ                    | パターンB（no-auth）                         | 高     |
| E-6  | `ISubscriptionAuthProvider.validateToken()` が例外 | パターンB（no-auth）にフォールバック（AC-5） | 高     |
| E-7  | `IAuthKeyService.getKey()` が例外                  | パターンB（no-auth）にフォールバック         | 中     |
| E-8  | subscription と apiKey の両方が有効                | パターンA（apiKey 優先）                     | 中     |
| E-9  | ネットワーク疎通不可で Keychain アクセスが遅延     | タイムアウト後パターンB                      | 低     |
| E-10 | authMode が未知の文字列                            | パターンB（安全側フォールバック）            | 低     |

## 完了条件チェック

- [x] 現行 `resolve()` の実装状況（実装済み/未実装分岐）が文書化されている
- [x] subscription 判定の情報ソースが特定されている
- [x] 3パターンの分岐定義が要件として記載されている
- [x] エッジケースが5件以上洗い出されている（10件）
- [x] FR-5 の機能要件が文書化されている
- [x] AC-4（TerminalHandoff）の受入基準が明確に記載されている
