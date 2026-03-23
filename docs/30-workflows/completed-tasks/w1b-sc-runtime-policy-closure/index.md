# TASK-SC-02-RUNTIME-POLICY-CLOSURE

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-SC-02-RUNTIME-POLICY-CLOSURE                          |
| 機能名     | w1b-sc-runtime-policy-closure                              |
| ステータス | implementation_ready                                       |
| 作成日     | 2026-03-22                                                 |
| 元タスク   | UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001 |

## 概要

`RuntimePolicyResolver` の `resolveFromServices()` における `subscriptionValid` hardcode を解消し、`ISubscriptionAuthProvider.validateToken()` による実サブスクリプション判定を統合する。3パターン分岐（integrated_api / terminal_handoff subscription / terminal_handoff no-auth）を安定化し、AC-4（TerminalHandoff）を充足する。

## スコープ

### 含む

- `RuntimePolicyResolver.resolve()` への subscription 判定ロジック統合
- `TerminalHandoffBuilder` の subscription/no-auth モード別 bundle 生成
- graceful degradation（AuthKeyService 例外時のフォールバック）
- P62 準拠（DEFAULT_CONFIG への暗黙 fallback 排除）

### 含まない

- Renderer 側 UI 変更
- IPC ハンドラの新規追加
- AuthMode 切替 UI の変更

## 受入基準

| ID   | 基準                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | apiKey 設定済み時に `integrated_api` モードが返る                         |
| AC-2 | apiKey 未設定・subscription なし時に `terminal_handoff (no-auth)` が返る  |
| AC-3 | subscription 有効時に `terminal_handoff (subscription)` が返る            |
| AC-4 | `TerminalHandoffBundle` が正しいフィールドで生成される                    |
| AC-5 | AuthKeyService 例外時に `terminal_handoff (no-auth)` にフォールバックする |
| AC-6 | `DEFAULT_CONFIG` への暗黙 fallback が存在しない（P62）                    |

## Phase 構成

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | pending    |
| 2     | 設計             | pending    |
| 3     | 設計レビュー     | pending    |
| 4     | テスト作成       | pending    |
| 5     | 実装             | pending    |
| 6     | テスト拡充       | pending    |
| 7     | カバレッジ確認   | pending    |
| 8     | リファクタリング | pending    |
| 9     | 品質検証         | pending    |
| 10    | 最終レビュー     | pending    |
| 11    | 手動テスト       | pending    |
| 12    | ドキュメント     | pending    |
| 13    | PR作成           | pending    |

## 参照資料

| 資料名                        | パス                                                                                      | 説明                               |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| RuntimePolicyResolver         | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                         | 対象ファイル（resolve() メソッド） |
| TerminalHandoffBuilder        | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                        | TerminalHandoffBundle 生成         |
| AuthMode 型定義               | `packages/shared/src/types/auth-mode.ts`                                                  | ISubscriptionAuthProvider 等       |
| execution capability contract | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | 元タスク定義                       |
| P62                           | `.claude/rules/06-known-pitfalls.md#P62`                                                  | DEFAULT_CONFIG fallback 禁止       |
