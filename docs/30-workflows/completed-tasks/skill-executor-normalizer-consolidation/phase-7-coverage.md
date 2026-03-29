# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目      | 内容                 |
| --------- | -------------------- |
| Phase     | 7                    |
| Phase名   | テストカバレッジ確認 |
| カテゴリ  | 品質                 |
| 前提Phase | Phase 6              |
| 後続Phase | Phase 8              |

## 目的

`sdkMessageUtils.ts` のテストカバレッジが品質基準を満たしていることを確認する。

## 実行タスク

### タスク1: カバレッジ計測

**目的**: 変更対象ファイルのカバレッジを計測する

**手順**:

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/runtime/__tests__/sdkMessageUtils.test.ts
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

**カバレッジ基準**:

| メトリクス | 閾値 | 対象ファイル       |
| ---------- | ---- | ------------------ |
| Line       | 80%  | sdkMessageUtils.ts |
| Branch     | 60%  | sdkMessageUtils.ts |
| Function   | 80%  | sdkMessageUtils.ts |

### タスク2: カバレッジギャップ分析

**目的**: カバレッジ未達の場合、不足テストケースを特定する

**手順**:

1. カバレッジレポートの uncovered lines を特定
2. 不足するテストケースを一覧化
3. Phase 6 へ戻って追加するか、許容するかを判断

**判断基準**:

- Line 80% 未満 → Phase 6 へ戻りテスト追加
- Branch 60% 未満 → Phase 6 へ戻りテスト追加
- 基準達成 → Phase 8 へ進む

## 参照資料

| 参照資料       | パス                                       | 内容           |
| -------------- | ------------------------------------------ | -------------- |
| Phase 6 テスト | `outputs/phase-6/test-expansion-report.md` | テスト拡充結果 |

## 統合テスト連携

カバレッジ計測のみ。

## 成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] sdkMessageUtils.ts の Line カバレッジが 80% 以上であること
- [ ] sdkMessageUtils.ts の Branch カバレッジが 60% 以上であること
- [ ] sdkMessageUtils.ts の Function カバレッジが 80% 以上であること
- [ ] カバレッジ未達の場合、Phase 6 へ戻りテストを追加済みであること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: カバレッジ計測 → 完了
- [ ] タスク2: カバレッジギャップ分析 → 完了

## 次Phase

カバレッジ基準達成 → Phase 8（リファクタリング）へ進む。
カバレッジ未達 → Phase 6 へ戻る。
