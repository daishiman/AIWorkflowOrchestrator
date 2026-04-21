# Phase 4: テスト設計

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 4              |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 3        |
| 後続Phase  | Phase 5        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                          | 実行形態 |
| ---------- | --------------------------------------------- | -------- |
| SubAgent-A | 既存テスト一覧の確認（selectedOptionIds関連） | **直列** |

## テスト方針

JSDoc のコメント追加のみであるため、新規テストの作成は不要。以下の既存テストが引き続き通過することを確認する。

```bash
# 既存テストが通過することを確認
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test -- --reporter=verbose
```

## 確認ポイント

- `SkillCreatorWorkflowEngine.test.ts` の `selectedOptionIds` 関連テストが通過すること
- `useInterviewState.test.ts` の `selectedOptionIds` / `selectedValues` 相互フォールバックテストが通過すること

## テストケース一覧

| テストID | 対象                               | 内容                                                             | 期待結果                         |
| -------- | ---------------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| TC-1     | SkillCreatorWorkflowEngine.test.ts | normalizeSelectedOptionIds が selectedOptionIds を優先する       | selectedOptionIds の値が返される |
| TC-2     | SkillCreatorWorkflowEngine.test.ts | selectedOptionIds が null のとき selectedValues にフォールバック | selectedValues の値が返される    |
| TC-3     | useInterviewState.test.ts          | selectedValues を含む回答が処理される                            | エラーなしで処理される           |

## 完了条件

- [ ] 既存テスト一覧が確認済みである
- [ ] 新規テストが不要であることが判断済みである
- [ ] TC-1〜TC-3 が実行対象として特定されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装
