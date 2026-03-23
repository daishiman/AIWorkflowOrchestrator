# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 11                                |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 機能名   | w1b-sc-runtime-policy-closure     |
| 作成日   | 2026-03-22                        |

## 目的

Electron アプリを実際に起動し、API Key 設定/未設定の2状態で `RuntimePolicyResolver` の分岐動作を確認する。3パターンが期待通りのモードを返すことを E2E 観点で検証する。

## 実行タスク

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. パターンA テスト（API Key 設定済み）:
   - 設定画面で有効な API Key を設定する
   - RuntimePolicy が `integrated_api` モードになることをログ or UI で確認する
   - Skill Creator の実行が API Key 経由で行われることを確認する
3. パターンB テスト（API Key 未設定・subscription なし）:
   - 設定画面で API Key を削除する
   - RuntimePolicy が `terminal_handoff (no-auth)` モードになることを確認する
   - TerminalHandoffBundle が生成されることをログで確認する
4. パターンC テスト（subscription 有効、可能な場合）:
   - subscription アカウントでログインする
   - RuntimePolicy が `terminal_handoff (subscription)` モードになることを確認する
5. エラーケーステスト: 無効な API Key（スペースのみ）を設定した場合にパターンB になることを確認する
6. コンソールにエラーが出ていないことを確認する
7. CLI 環境の場合は Playwright スクリプトで代替検証を行う（P53対策）

## 参照資料

- `.claude/rules/06-known-pitfalls.md#P53`（CLI環境スクリーンショット制約）
- `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG fallback 禁止）

## 成果物

- 手動テスト実施記録（チェックリスト形式）
- 各パターンの動作ログ（テキスト）
- 発見した不具合のリスト（0件でも記録）

## 完了条件

- [ ] Electron アプリが正常起動している
- [ ] パターンA（integrated_api）の動作が確認されている
- [ ] パターンB（no-auth terminal_handoff）の動作が確認されている
- [ ] パターンC（subscription terminal_handoff）の動作が確認されているか、確認不可の場合はその理由が記録されている
- [ ] 無効 API Key での分岐動作が確認されている
- [ ] コンソールにエラーが出ていない

## 次のPhase

Phase 12: ドキュメント
