# Phase 13: PR 作成

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 13                                                |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## PR 作成前チェックリスト

- [ ] Phase 9（品質保証）の全チェックが PASS
- [ ] Phase 10（最終レビュー）の全受入条件が PASS
- [ ] Phase 11（手動テスト）の全シナリオが PASS
- [ ] Phase 12（ドキュメント）が完成

## PR タイトル（案）

```
feat(desktop): UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 — Advanced Console を実セッションログへ接続
```

## PR 本文テンプレート

```markdown
## 概要

Advanced Console の `getTerminalLog()` / `getCopyCommand()` IPC callback が
placeholder（空配列 / null）のままになっていた問題を修正。

`ClaudeCliManager.getSession()` 経由で `SessionManager` の実セッションログを取得し、
Advanced Console 画面で実際のターミナルログを確認・コピーできるようにした。

## 変更ファイル

- `apps/desktop/src/main/claude-cli/ipc-handler.ts`: `getClaudeCliManager()` エクスポート追加
- `apps/desktop/src/main/ipc/index.ts`: placeholder callback を実実装に差し替え

## テスト

- ADV-16〜ADV-25（新規テスト 10 件）追加
- ADV-12〜ADV-15（既存テスト）全 PASS 維持

## セキュリティ

- DENY-6: 全レスポンスに `sanitizeForApiKeys()` 適用済み（既存実装）
- SESSION_NOT_FOUND の内部契約と、`TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` の外向き契約を明確化

## 関連 Issue

Closes #1805
```

## ブランチ命名規則

```
feat/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001
```

## 完了条件チェックリスト

- [ ] PR 作成前チェックリストが全て PASS
- [ ] PR が作成されている
- [ ] GitHub Issue #1805 が Close されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

PR 作成は user approval がある場合にのみ進める。

## 実行タスク

- Phase 9 / 10 / 11 / 12 の完了を確認する。
- PR 本文とタイトル案を整える。
- user approval がなければ blocked のまま維持する。

## 参照資料

- `phase-12-documentation.md`
- `phase-11-manual-test.md`
- `phase-10-final-review.md`
- `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001.md`

## 成果物/実行手順

- `PR タイトル（案）`
- `PR 本文テンプレート`
- `feat(desktop): UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 — Advanced Console を実セッションログへ接続`

## 統合テスト連携

- PR 作成前に `pnpm --filter @repo/desktop test` の結果を確認する。
