# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目      | 内容     |
| --------- | -------- |
| Phase     | 9        |
| Phase名   | 品質保証 |
| カテゴリ  | 品質     |
| 前提Phase | Phase 8  |
| 後続Phase | Phase 10 |

## 目的

全品質ゲートを一括で判定し、Phase 10 への進行可否を確認する。

## 実行タスク

- タスク1: 品質ゲート一括検証
- タスク2: AC 充足確認

- タスク1で typecheck・lint・関連テスト・カバレッジを一括判定する
- タスク2で AC-1〜AC-6 の充足を証跡付きで確認する

### タスク1: 品質ゲート一括検証

**目的**: 全ての品質基準を一括で検証する

**検証コマンド**:

```bash
# 型チェック
pnpm typecheck

# lint
pnpm lint

# 関連テスト一括実行
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/sdkMessageUtils.test.ts src/main/services/runtime/__tests__/sdkMessageNormalizer.test.ts src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

**品質ゲートテーブル**:

| ゲート                      | コマンド          | 期待結果  | 実結果 |
| --------------------------- | ----------------- | --------- | ------ |
| TypeScript 型チェック       | `pnpm typecheck`  | PASS      | TBD    |
| ESLint                      | `pnpm lint`       | PASS      | TBD    |
| sdkMessageUtils テスト      | vitest run        | 全件 PASS | TBD    |
| sdkMessageNormalizer テスト | vitest run        | 全件 PASS | TBD    |
| SkillExecutor SDK テスト    | vitest run        | 全件 PASS | TBD    |
| カバレッジ (Line)           | vitest --coverage | ≥80%      | TBD    |
| カバレッジ (Branch)         | vitest --coverage | ≥60%      | TBD    |
| カバレッジ (Function)       | vitest --coverage | ≥80%      | TBD    |

### タスク2: AC 充足確認

**目的**: 全受け入れ基準が満たされているかを確認する

| AC   | 内容                                                               | 充足 |
| ---- | ------------------------------------------------------------------ | ---- |
| AC-1 | `unknown -> record` 判定と `type` 抽出が sdkMessageUtils.ts に集約 | TBD  |
| AC-2 | sdkMessageNormalizer.test.ts 全件 PASS                             | TBD  |
| AC-3 | SkillExecutor.sdk-types.test.ts 全件 PASS                          | TBD  |
| AC-4 | pnpm typecheck PASS                                                | TBD  |
| AC-5 | pnpm lint PASS                                                     | TBD  |
| AC-6 | 共通ユーティリティに JSDoc 記述済み                                | TBD  |
| AC-7 | `SkillStreamMessage` / `SkillCreatorSdkEvent` の public 契約が不変 | TBD  |

## 参照資料

| 参照資料                 | パス                                    | 内容                 |
| ------------------------ | --------------------------------------- | -------------------- |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`    | カバレッジ結果       |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-report.md` | リファクタリング結果 |

## 統合テスト連携

品質ゲートに含まれるテスト一括実行で確認。

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] 品質ゲートテーブルの全項目が PASS であること
- [ ] AC 充足確認の全項目が ✅ であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: 品質ゲート一括検証 → 完了
- [ ] タスク2: AC 充足確認 → 完了

## 次Phase

Phase 10（最終レビュー）へ進む。
