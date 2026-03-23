# Phase 3: 設計レビュー結果

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 3                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 作成日   | 2026-03-22                        |

## レビュー判定

### 判定: PASS

設計は全3パターンの分岐を網羅しており、エッジケース・graceful degradation・P62対策が適切に含まれている。

## レビュー詳細

### 1. 3パターン分岐の網羅性

| パターン           | 判定条件                                   | 明確性                               | 判定 |
| ------------------ | ------------------------------------------ | ------------------------------------ | ---- |
| A (integrated_api) | `apiKey.trim() !== ""`                     | 明確。P42準拠                        | OK   |
| B (no-auth)        | apiKey 無効 AND subscription 無効          | 明確。デフォルトフォールバック       | OK   |
| C (subscription)   | apiKey 無効 AND `validateToken()` === true | 明確。ISubscriptionAuthProvider 依存 | OK   |

パターン間の排他性: apiKey チェックが先行するため、E-8（両方有効）ではパターンA が選択される。設計に矛盾なし。

### 2. エッジケース網羅性

| ケース                          | 設計に含まれるか                                | 判定 |
| ------------------------------- | ----------------------------------------------- | ---- |
| apiKey 空文字列                 | hasValidApiKey() で false → subscription 判定へ | OK   |
| apiKey スペースのみ             | trim() チェックで false（P42準拠）              | OK   |
| subscription 期限切れ           | validateToken() が false → パターンB            | OK   |
| AuthKeyService 例外             | try/catch → null → subscription 判定へ          | OK   |
| SubscriptionAuthProvider 例外   | try/catch → false → パターンB                   | OK   |
| SubscriptionAuthProvider 未注入 | `if (!this.subscriptionAuthProvider)` → false   | OK   |
| タイムアウト                    | SubscriptionAuthProvider に委任（5,000ms）      | OK   |

### 3. P62チェック

- `resolve()` のどのパスからも `DEFAULT_CONFIG` を参照しない: 確認済み
- フォールバック先は明示的な `buildNoAuthBundle()` / `buildSubscriptionBundle()`: 確認済み
- 判定: P62 違反なし

### 4. AC-4チェック

| AC-4 要件                            | 設計対応                                                              | 判定 |
| ------------------------------------ | --------------------------------------------------------------------- | ---- |
| subscription bundle に固有ガイダンス | `manualRetryRule` に subscription 固有メッセージ                      | OK   |
| no-auth bundle にセットアップガイド  | `manualRetryRule` にセットアップ案内                                  | OK   |
| 必須フィールド存在                   | launcher, promptBundle, cwd, suggestedCommand, manualRetryRule 全定義 | OK   |
| subscription bundle の runbook       | ログイン手順を含む runbook フィールド                                 | OK   |

### 5. Result<T, E> 適用範囲

- `RuntimeDecision` は discriminated union でエラー状態を `terminal_handoff` として表現する設計
- 明示的なエラー型は不要（全パスが valid な `RuntimeDecision` を返す）
- catch ブロックでログ記録＋フォールバックするため「エラーの握りつぶし」には該当しない
- 判定: 適切

### 6. DIP準拠

- コンストラクタ引数: `IAuthKeyService`（インターフェース）、`ISubscriptionAuthProvider`（インターフェース）
- 具象クラスへの依存なし（P61対策）
- 判定: DIP準拠

## 完了条件チェック

- [x] 3パターンの分岐条件が網羅されており曖昧さがない
- [x] エッジケース（期限切れ、例外、タイムアウト）が全て設計に含まれている
- [x] P62 違反（DEFAULT_CONFIG への fallback）がないことが確認されている
- [x] AC-4 の受入基準と設計が整合していることが確認されている
- [x] Result<T, E> の適用範囲が適切と判断されている
- [x] レビュー判定（PASS）が明記されている
