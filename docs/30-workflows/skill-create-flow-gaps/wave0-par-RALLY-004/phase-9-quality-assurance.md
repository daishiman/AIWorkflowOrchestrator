# Phase 9: 品質保証

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 9              |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 8        |
| 後続Phase  | Phase 10       |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                   | 実行形態               |
| ---------- | -------------------------------------- | ---------------------- |
| SubAgent-A | typecheck・lint 最終確認               | **並列**               |
| SubAgent-B | 受け入れ基準 AC-1〜AC-7 の全件チェック | **並列**               |
| SubAgent-C | 統合品質判定                           | **直列**（A・B完了後） |

## 品質チェックコマンド

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
pnpm typecheck

# lint チェック
pnpm --filter @repo/shared lint
pnpm lint

# テスト全件実行
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test
```

## 受け入れ基準 最終確認

| AC   | 内容                                                                                                                    | 結果    |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| AC-1 | `SkillCreatorUserInputSubmission.selectedOptionIds` に `@canonical` JSDoc が追加されている                              | pending |
| AC-2 | `SkillCreatorUserInputSubmission.selectedValues` に `@deprecated Use selectedOptionIds instead.` JSDoc が追加されている | pending |
| AC-3 | `InterviewUserAnswer.selectedOptionIds` に `@canonical` JSDoc が追加されている                                          | pending |
| AC-4 | `InterviewUserAnswer.selectedValues` に `@deprecated Use selectedOptionIds instead.` JSDoc が追加されている             | pending |
| AC-5 | IDE（VSCode 等）で `selectedValues` フィールドを参照するとデプリケーション警告が表示される                              | pending |
| AC-6 | `pnpm typecheck` がエラーなしで通過する                                                                                 | pending |
| AC-7 | `pnpm lint` がエラーなしで通過する                                                                                      | pending |

## 完了条件

- [ ] typecheck がエラーなしで通過
- [ ] lint がエラーなしで通過
- [ ] 全テストが PASS
- [ ] AC-1〜AC-7 が全件 PASS

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10: 最終レビュー
