# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 3                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

Phase 2 で設計した分岐ロジックの網羅性を検証する。全エッジケース（apiKey 無効、subscription 期限切れ、ネットワークエラー）が設計に含まれているかを確認し、AC-4（TerminalHandoff）との整合性をレビューする。

## 実行タスク

1. 3パターン分岐（A/B/C）の網羅性を確認する:
   - パターンA（integrated_api）の判定条件が明確か
   - パターンB（no-auth terminal_handoff）の判定条件が明確か
   - パターンC（subscription terminal_handoff）の判定条件が明確か
2. エッジケース網羅性を確認する:
   - apiKey の空文字列・スペースのみの場合の扱い（P42対策）
   - subscription が期限切れの場合（パターンB として扱うか）
   - AuthKeyService が例外を投げた場合のフォールバック
   - 全判定が完了するまでのタイムアウト設計
3. P62チェック: `DEFAULT_CONFIG` への暗黙 fallback がないことを確認する
4. AC-4チェック: TerminalHandoffBundle が AC-4 の要件を充足する設計になっているか確認する
5. `Result<T, E>` パターンの適用範囲が適切か確認する
6. レビュー判定（PASS / MINOR / MAJOR）を下す

## 参照資料

- `docs/30-workflows/w1b-sc-runtime-policy-closure/phase-02-design.md`
- `packages/shared/src/types/auth-mode.ts`（`ISubscriptionAuthProvider`, `AuthModeStatus` 型定義との整合性確認用）
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`（現行実装との差分確認用）
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG fallback 禁止）
- `.claude/rules/06-known-pitfalls.md#P42`（trim バリデーション）
- `.claude/rules/05-task-execution.md#Phase 3（設計レビュー）`
- `.claude/rules/02-code-quality.md#エラーカテゴリ`

## 成果物

- Phase 3 設計レビュー結果（本ファイル）
- レビュー判定（PASS / MINOR / MAJOR）と根拠
- MINOR以上の場合: 指摘事項リストと対応方針

## 完了条件

- [ ] 3パターンの分岐条件が網羅されており曖昧さがない
- [ ] エッジケース（期限切れ、例外、タイムアウト）が全て設計に含まれている
- [ ] P62 違反（DEFAULT_CONFIG への fallback）がないことが確認されている
- [ ] AC-4 の受入基準と設計が整合していることが確認されている
- [ ] `Result<T, E>` の適用範囲が適切と判断されている
- [ ] レビュー判定（PASS / MINOR / MAJOR）が明記されている

## 次のPhase

Phase 4: テスト作成（PASS / MINOR の場合）
Phase 2: 設計（MAJOR で設計問題の場合）
Phase 1: 要件定義（MAJOR で要件問題の場合）
