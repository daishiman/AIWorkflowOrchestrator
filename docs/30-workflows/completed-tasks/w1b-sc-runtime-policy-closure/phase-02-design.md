# Phase 2: 設計

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

subscription 判定ロジックを設計し、`AuthKeyService` / `SecureStorage` との連携方式を確定する。`resolve()` メソッドの全分岐を網羅したフローチャートを作成し、Phase 4 のテスト設計の基盤とする。

## 実行タスク

1. subscription 判定ロジックを設計する:
   - `ISubscriptionAuthProvider.validateToken()` / `IAuthModeService.getStatus()` を使用した判定方式を決定する
   - `resolveFromServices()` の `subscriptionValid` hardcode を解消する設計を行う
   - 判定に必要なフィールド（`AuthModeStatus.hasCredentials`, `AuthModeStatus.isValid` 等）を明確化する
2. `resolve()` メソッドの全分岐フローチャートを設計する:
   ```
   resolve()
     ├─ hasApiKey? → Yes → integrated_api
     └─ No → isSubscriptionActive? → Yes → terminal_handoff (subscription)
                                  └─ No → terminal_handoff (no-auth)
   ```
3. `TerminalHandoffBundle` の生成設計を行う:
   - subscription モード時のフィールド構成
   - no-auth モード時のフィールド構成
4. エラー時の graceful degradation 設計を行う:
   - AuthKeyService 呼び出し失敗時 → `terminal_handoff` にフォールバック（P62対策: DEFAULT_CONFIG への fallback 禁止）
   - ネットワークエラー時のタイムアウト設計（何秒でタイムアウトするかを明示する）
5. DI 設計: `RuntimePolicyResolver` のコンストラクタが受け取る依存オブジェクトの型をインターフェースに定義する
6. `Result<T, E>` パターンを使ったエラー返却設計を行う

## 参照資料

- `docs/30-workflows/w1b-sc-runtime-policy-closure/phase-01-requirements.md`
- `packages/shared/src/types/auth-mode.ts`（`ISubscriptionAuthProvider`, `IAuthModeService`, `AuthModeStatus` 定義）
- `packages/shared/src/types/skillCreator.ts`（`TerminalHandoffBundle` フィールド定義）
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`（現行: `RuntimeDecision` は `type` フィールドを使用）
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG fallback 禁止）
- `.claude/rules/02-code-quality.md#エラーカテゴリ`
- `.claude/rules/01-architecture.md#設計原則`（DIP）

## 成果物

- Phase 2 設計書（本ファイル）
- `resolve()` 全分岐フローチャート
- `TerminalHandoffBundle` フィールド設計（subscription / no-auth 別）
- graceful degradation 設計（エラーカテゴリ別フォールバック方針）
- DI インターフェース定義

## 完了条件

- [ ] subscription 判定の情報ソースが設計に明示されている
- [ ] `resolve()` の全3分岐（A/B/C）がフローチャートに記載されている
- [ ] TerminalHandoffBundle の各モード別フィールドが定義されている
- [ ] graceful degradation の動作（何が失敗したら何にフォールバックするか）が明示されている
- [ ] タイムアウト秒数が数値で明示されている
- [ ] DIP準拠のインターフェース定義が含まれている

## 次のPhase

Phase 3: 設計レビュー
