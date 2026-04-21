# Phase 6: テスト拡充

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 6              |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 5        |
| 後続Phase  | Phase 7        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                     | 実行形態 |
| ---------- | ------------------------ | -------- |
| SubAgent-A | 既存テスト実行・結果確認 | **直列** |

## テスト実行

```bash
# shared パッケージのテスト実行
pnpm --filter @repo/shared test

# desktop パッケージの関連テスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose
```

## 確認事項

- JSDoc 追加のみのため、新規テストは追加しない
- 既存テストが全件 PASS することを確認する
- `selectedValues` を参照するコードが deprecated 警告を受け取ることを IDE で確認する（自動テスト対象外）

## 完了条件

- [ ] `pnpm --filter @repo/shared test` が全件 PASS
- [ ] `pnpm --filter @repo/desktop test` の selectedOptionIds 関連テストが全件 PASS
- [ ] テスト失敗がゼロであることを確認済み

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: カバレッジ確認
