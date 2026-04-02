# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 10                                                |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 受入条件の最終確認

| ID   | 条件                                                      | 判定 |
| ---- | --------------------------------------------------------- | ---- |
| AC-1 | `sessionId` から実際のターミナルログを取得できる          | [ ]  |
| AC-2 | `getCopyCommand` が再実行可能なコマンド文字列を返す       | [ ]  |
| AC-3 | `sanitizeForApiKeys()` を通した値のみ返す                 | [ ]  |
| AC-4 | セッション未存在時に `SESSION_NOT_FOUND` エラーで応答する | [ ]  |
| AC-5 | 既存 ADV-12〜ADV-15 テストが全 PASS                       | [ ]  |

## コードレビューチェックリスト

- [ ] `getClaudeCliManager()` に JSDoc コメントが付いている
- [ ] `TODO(DI)` コメントが削除されている
- [ ] 新規追加コードに `any` 型が使われていない
- [ ] エラーコード `SESSION_NOT_FOUND` が定数または明示的な文字列リテラルとして定義されている

## 完了条件チェックリスト

- [ ] 全受入条件が満たされていることを確認した
- [ ] コードレビューチェックリストが全て完了
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

受入条件 AC-1 〜 AC-5 を最終確認し、Phase 11 / 12 へ進めるかを固定する。

## 実行タスク

- 受入条件を確認する。
- コードレビューチェックリストを確認する。
- blockers がないかを確認する。

## 参照資料

- `phase-9-quality-assurance.md`
- `phase-11-manual-test.md`
- `phase-12-documentation.md`

## 成果物/実行手順

- 受入条件の判定結果をチェックリストへ記録する。
- Phase 11 / 12 の完了前提を記録する。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
