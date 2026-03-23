# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

`RuntimePolicyResolver` の現行 `resolve()` ロジックを調査し、subscription 判定の未実装箇所を特定する。3パターン（apiKey設定済み→integrated_api、apiKey未設定→terminal_handoff、subscription→terminal_handoff）を要件として確定し、AC-4（TerminalHandoff）の受入基準を定義する。

## 実行タスク

0. **P50チェック: 既実装状態の調査（必須）**
   - `git log --oneline apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` で変更履歴を確認する
   - 現行コードが既に3パターン分岐を実装しているか確認する
   - 既実装の場合は Phase 4-5 を「検証・補完」モードに切り替える
1. `RuntimePolicyResolver.ts` の現行 `resolve()` メソッドを調査する
2. 実装済みの分岐パターンと未実装の分岐パターンを一覧化する
3. subscription 判定に必要な情報ソース（`ISubscriptionAuthProvider` / `IAuthModeService` / `AuthKeyService` 等）を特定する
4. `TerminalHandoffBuilder.ts` の現行実装を調査し、`TerminalHandoffBundle` 生成ロジックを把握する
5. 3パターンの分岐定義を要件として文書化する:
   - パターンA: apiKey 設定済み → `integrated_api` モード
   - パターンB: apiKey 未設定（subscription なし）→ `terminal_handoff` モード
   - パターンC: subscription 有効 → `terminal_handoff` モード（Claude.ai 経由）
6. FR-5（RuntimePolicy）および AC-4（TerminalHandoff）の受入基準を文書化する
7. エッジケース（apiKey 無効・期限切れ、subscription 期限切れ、ネットワーク疎通不可）を洗い出す

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
- `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`（汎用版リゾルバ、差分確認用）
- `packages/shared/src/types/auth-mode.ts`（`AuthMode`, `ISubscriptionAuthProvider`, `IAuthModeService` 定義）
- `packages/shared/src/types/skillCreator.ts`（`TerminalHandoffBundle` 定義）
- `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`（元タスク `UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001`）
- `.claude/rules/02-code-quality.md#エラーハンドリング`
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG 暗黙 fallback 禁止）

## 成果物

- Phase 1 要件定義書（本ファイル）
- 現行 resolve() ロジックの調査レポート
- 3パターン分岐定義（要件レベル）
- エッジケース一覧
- FR-5・AC-4 の受入基準定義

## 完了条件

- [ ] 現行 `resolve()` の実装状況（実装済み/未実装分岐）が文書化されている
- [ ] subscription 判定の情報ソースが特定されている
- [ ] 3パターンの分岐定義が要件として記載されている
- [ ] エッジケースが5件以上洗い出されている
- [ ] FR-5 の機能要件が文書化されている
- [ ] AC-4（TerminalHandoff）の受入基準が明確に記載されている

## 次のPhase

Phase 2: 設計
