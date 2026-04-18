# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 6                         |
| 後続Phase  | Phase 8                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## 目的

型昇格に関連するテストのカバレッジを確認し、不足がある場合は Phase 6 に戻って補完する。
型定義のみのタスクのため、カバレッジの主な確認対象は `SkillCreatorService.ts` の既存テスト維持と、
`packages/shared/src/types/skillCreator.ts` の型契約維持である。

## 実行タスク

- [ ] `@repo/shared/types` のテストカバレッジ確認
- [ ] `@repo/desktop` の `SkillCreatorService.ts` に関するテストカバレッジ確認
- [ ] カバレッジ目標達成確認（Line 80%+, Branch 60%+）
- [ ] 未達の場合は Phase 6 に戻り補完
- [ ] カバレッジレポートの記録

## 参照資料

| 資料名                 | パス                                                          | 用途                 |
| ---------------------- | ------------------------------------------------------------- | -------------------- |
| Phase 6 テスト拡充結果 | `outputs/phase-6/test-expansion.md`                           | テストケース一覧確認 |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | カバレッジ対象確認   |
| skillCreator.ts        | `packages/shared/src/types/skillCreator.ts`                   | 型定義の確認対象     |

## 実行手順

### 1. カバレッジ取得

```bash
# @repo/shared/types のカバレッジ
pnpm --filter @repo/shared exec vitest run --coverage src/types/__tests__/skillCreator.contract-parity.test.ts

# @repo/desktop の SkillCreatorService.ts カバレッジ
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts

# 型チェック（最終確認）
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/desktop exec tsc --noEmit
```

### 2. カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

> 注意: 型定義のみのファイル（`skillCreator.ts`）はコード行がなく、
> カバレッジは実質 100% または N/A になる場合がある。
> `SkillCreatorService.ts` の既存テストカバレッジの維持が主な目標。

## 統合テスト連携

| 観点           | 内容                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| カバレッジ維持 | 型昇格後に既存テストのカバレッジが低下していないこと                       |
| 型契約維持     | `skillCreator.ts` への追加が既存の `@repo/shared/types` 契約を壊さないこと |

## 多角的チェック観点（AIが判断）

- **型定義ファイルのカバレッジ**: `skillCreator.ts` は型定義のみのため実行可能コードがなく、カバレッジ測定の対象外になる場合がある
- **既存テストへの影響**: `SkillCreatorService.ts` のカバレッジが型昇格前後で変化しないことを確認する

## サブタスク管理

| サブタスクID | 名称                   | ステータス |
| ------------ | ---------------------- | ---------- |
| T-07-1       | カバレッジ取得・確認   | skipped    |
| T-07-2       | カバレッジレポート記録 | skipped    |

## 成果物

| 成果物名           | パス                                 | 種別         |
| ------------------ | ------------------------------------ | ------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ドキュメント |

## 完了条件

- [ ] カバレッジ目標（Line 80%+）を達成していること
- [ ] 未達の場合は Phase 6 に戻り補完が完了していること
- [ ] `outputs/phase-7/coverage-report.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] @repo/shared カバレッジ確認完了
- [ ] @repo/desktop カバレッジ確認完了
- [ ] 目標達成確認完了
- [ ] カバレッジレポート記録完了

## 次Phase

- **目標達成**: [Phase 8: リファクタリング](phase-8-refactoring.md)
- **未達**: [Phase 6: テスト拡充](phase-6-test-expansion.md) に戻る
