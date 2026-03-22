# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 6                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 作成日   | 2026-03-22                        |

## 目的

Phase 4 のテストが扱えなかったエッジケースを補完する。apiKey 無効時の詳細な分岐、ネットワークエラー時のフォールバック、subscription 期限切れ時の挙動を追加テストで検証する。

## 実行タスク

1. 現在のカバレッジを計測し不足箇所を特定する（`pnpm vitest run --coverage`）
2. apiKey 無効パターンの詳細テストを追加する:
   - apiKey が空文字列の場合 → パターンB（no-auth）になることを確認する
   - apiKey がスペースのみの場合 → パターンB（no-auth）になることを確認する（P42対策）
   - apiKey が `undefined` / `null` の場合 → パターンB（no-auth）になることを確認する
3. subscription 期限切れテストを追加する:
   - `isSubscriptionActive()` が false を返した場合 → パターンB（no-auth）になることを確認する
4. ネットワークエラーテストを追加する:
   - `AuthKeyService` が例外を投げた場合 → パターンB（no-auth）にフォールバックすることを確認する
   - タイムアウト発生時に `advanceTimersByTime()` で段階的にテストする（P13対策）
5. `TerminalHandoffBundle` フィールドの完全性テストを追加する（必須フィールドが全て設定されることを確認する）
6. v8 カバレッジの arrow function カウントを考慮したテスト補完を行う（P41対策）

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/02-sc-runtime-policy-closure/phase-04-test-creation.md`
- `.claude/rules/06-known-pitfalls.md#P42`（trim バリデーション）
- `.claude/rules/06-known-pitfalls.md#P13`（タイマーテスト無限ループ）
- `.claude/rules/06-known-pitfalls.md#P41`（v8 カバレッジ）
- `.claude/rules/02-code-quality.md#カバレッジ基準`

## 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`（テスト追加）
- カバレッジレポート（追加前後の比較）

## 完了条件

- [ ] apiKey 空文字/スペース/null/undefined の各パターンテストが追加されている
- [ ] subscription 期限切れテストが追加されている
- [ ] ネットワークエラー時のフォールバックテストが追加されている
- [ ] タイマーテストに `advanceTimersByTime()` が使用されている
- [ ] `pnpm vitest run --coverage` でカバレッジが向上していることが確認されている

## 次のPhase

Phase 7: カバレッジ確認
