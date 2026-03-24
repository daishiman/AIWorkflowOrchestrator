# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 7                             |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 6 完了                  |

## 目的

テストカバレッジが基準値（Line 80%、Branch 60%、Function 80%）を充足しているか確認し、未達の場合は Phase 6 に戻ってテストを追加する。

## 実行タスク

### Task 1: カバレッジ計測

以下のコマンドでカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/creatorHandlers.ts \
  src/renderer/components/skill/ImprovementProposalItem.tsx \
  src/renderer/components/skill/ImprovementProposalList.tsx \
  src/renderer/components/skill/ImprovementApplyResult.tsx
```

### Task 2: カバレッジ評価

| 対象ファイル                                           | Line | Branch | Function | 判定 |
| ------------------------------------------------------ | ---- | ------ | -------- | ---- |
| `creatorHandlers.ts`（apply-improvement ハンドラ部分） | -%   | -%     | -%       | -    |
| `ImprovementProposalItem.tsx`                          | -%   | -%     | -%       | -    |
| `ImprovementProposalList.tsx`                          | -%   | -%     | -%       | -    |
| `ImprovementApplyResult.tsx`                           | -%   | -%     | -%       | -    |

最低基準:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 3: 未達時の対応

カバレッジが最低基準を下回るファイルがある場合:

1. 未カバレッジの行・分岐を特定する
2. Phase 6 に戻り、該当箇所のテストを追加する
3. 再度カバレッジを計測する

P41 注意: v8 カバレッジプロバイダはインライン arrow function を独立関数としてカウントする。コールバック関数（`getAllowedWindows: () => [mainWindow]` 等）が未カバレッジの場合、テストでコールバックの戻り値を明示的に検証する。

## 参照資料

- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md` P41（v8 カバレッジのインライン関数カウント）

## 成果物

- カバレッジレポート（本ファイルの Task 2 テーブルに記録）

## 完了条件

- [ ] 全対象ファイルで Line Coverage 80% 以上
- [ ] 全対象ファイルで Branch Coverage 60% 以上
- [ ] 全対象ファイルで Function Coverage 80% 以上
- [ ] カバレッジ計測結果が本ファイルに記録されている
- [ ] 未達の場合、Phase 6 へ戻りテスト追加→再計測が完了している

## 次の Phase

Phase 8: リファクタリング
