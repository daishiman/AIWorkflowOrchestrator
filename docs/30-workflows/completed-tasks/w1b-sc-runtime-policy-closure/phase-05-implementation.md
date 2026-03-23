# Phase 5: 実装

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 5                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

Phase 2 で設計した subscription 判定ロジックを `RuntimePolicyResolver.ts` に統合実装する。全3パターンの分岐が動作し、graceful degradation も正しく機能することを Phase 4 のテストで確認する。

## 実行タスク

1. `RuntimePolicyResolver.ts` に subscription 判定ロジックを実装する:
   - `AuthKeyService`（または `SecureStorage`）から subscription 状態を取得する
   - `hasApiKey()` の判定に P42準拠の trim チェックを適用する（空白文字のみの apiKey を無効と判定する）
2. `resolve()` メソッドを以下の3分岐で実装する（`RuntimeDecision` の `type` フィールドを使用）:
   - パターンA: `hasValidApiKey()` が true → `{ type: 'integrated_api', apiKey }` を返す
   - パターンC: `subscriptionAuthProvider.validateToken()` が true → `{ type: 'terminal_handoff', bundle }` を返す（subscription 経由）
   - パターンB: 上記いずれでもない → `{ type: 'terminal_handoff', bundle }` を返す（no-auth）
3. `TerminalHandoffBuilder.ts` を更新し、subscription / no-auth 各モードの `TerminalHandoffBundle` を生成する
4. エラー時のフォールバックを実装する（P62対策: DEFAULT_CONFIG への fallback 禁止）:
   - `AuthKeyService` 例外時は `terminal_handoff (no-auth)` にフォールバックする
   - エラーはログに記録するが Renderer へのレスポンスはサニタイズする
5. `Result<T, E>` パターンでエラーを返却する（try/catch で握りつぶさない）
6. Phase 4 のテストを実行し Green になることを確認する

## 参照資料

- `docs/30-workflows/w1b-sc-runtime-policy-closure/phase-02-design.md`
- `docs/30-workflows/w1b-sc-runtime-policy-closure/phase-04-test-creation.md`
- `packages/shared/src/types/auth-mode.ts`（`ISubscriptionAuthProvider` インターフェース）
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`（既存 `RuntimeDecision` 型定義: `type` フィールド使用）
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG fallback 禁止）
- `.claude/rules/06-known-pitfalls.md#P42`（trim バリデーション）
- `.claude/rules/02-code-quality.md#エラーハンドリング`

## 成果物

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`（更新）
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`（更新）

## 完了条件

- [ ] パターンA（integrated_api）が正しく動作している
- [ ] パターンB（no-auth terminal_handoff）が正しく動作している
- [ ] パターンC（subscription terminal_handoff）が正しく動作している
- [ ] apiKey のトリムチェックが実装されている（P42準拠）
- [ ] `DEFAULT_CONFIG` への暗黙 fallback がない（P62準拠）
- [ ] エラー時は `terminal_handoff (no-auth)` にフォールバックする
- [ ] Phase 4 のテストが全て Green になっている
- [ ] `pnpm typecheck` が PASS している

## 次のPhase

Phase 6: テスト拡充
