# Phase 9: 品質保証

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 9              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 8        |
| 後続Phase  | Phase 10       |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                 | 実行形態               |
| ---------- | ------------------------------------ | ---------------------- |
| SubAgent-A | typecheck・lint 最終実行             | **並列**               |
| SubAgent-B | 受け入れ基準 AC-1〜AC-6 全件チェック | **並列**               |
| SubAgent-C | 統合品質判定                         | **直列**（A・B完了後） |

## 品質チェックコマンド

```bash
# 型チェック
pnpm typecheck

# lint チェック
pnpm lint

# テスト全件実行
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test
```

## 受け入れ基準 最終確認

| AC   | 内容                                                                                                                          | 結果    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------- |
| AC-1 | workflowSnapshot の更新経路が「invoke 優先、push は補完かつ古い場合は無視」と一本化され、コードおよびコメントで明示されること | pending |
| AC-2 | isSubmitting === true の間に push イベントが届いた場合、pendingPushRef にキューイングされ、即時 state 更新が発生しないこと    | pending |
| AC-3 | push イベントの seqNo（または updatedAt）が現在の workflowSnapshot の seqNo 以下の場合、更新がスキップされること              | pending |
| AC-4 | packages/shared/src/types/skillCreator.ts に seqNo フィールドが型定義として追加されること                                     | pending |
| AC-5 | pnpm typecheck がエラーなしで通過すること                                                                                     | pending |
| AC-6 | pnpm lint がエラーなしで通過すること（exhaustive-deps 警告含む）                                                              | pending |

## 完了条件

- [ ] typecheck がエラーなしで通過
- [ ] lint がエラーなしで通過（exhaustive-deps 警告ゼロ）
- [ ] 全テストが PASS
- [ ] AC-1〜AC-6 が全件 PASS

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10: 最終レビュー
