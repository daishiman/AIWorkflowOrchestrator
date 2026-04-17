# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 6                                       |
| 後続Phase  | Phase 8                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

`SKILL_CATEGORY_LABELS` 定数と `getSkillCategoryLabel()` 関数のカバレッジを計測し、
未到達コードがないことを確認する。

> **`[Feedback BEFORE-QUIT-002]` 対応**: カバレッジは全ファイル一律指定ではなく、
> 変更したファイル/ブロックのみを対象範囲として明示する。

## 実行タスク

- カバレッジ計測: `skillCreator.ts` の変更ブロックを対象に計測
- 未到達コード分析: Line/Branch/Function カバレッジの確認
- カバレッジ目標との照合: 基準値充足確認

## 参照資料

| 資料名         | パス                                                              | 用途               |
| -------------- | ----------------------------------------------------------------- | ------------------ |
| 実装ファイル   | `packages/shared/src/types/skillCreator.ts`                       | カバレッジ対象確認 |
| テストファイル | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | テスト件数確認     |

## 実行手順

### 1. カバレッジ計測コマンド【`[Feedback 5]` 対応: 変更ブロック指定】

```bash
# 変更ファイル指定でカバレッジ計測
pnpm --filter @repo/shared exec vitest run \
  --coverage \
  --coverage.include="src/types/skillCreator.ts" \
  src/types/__tests__/skillCreator-wizard.test.ts
```

### 2. カバレッジ目標

> カバレッジ対象は変更した関数/ブロックのみ（`SKILL_CATEGORY_LABELS` 定数 + `getSkillCategoryLabel()` 関数）。

| 計測対象                       | Line | Branch | Function |
| ------------------------------ | ---- | ------ | -------- |
| `SKILL_CATEGORY_LABELS` 定数   | 100% | N/A    | N/A      |
| `getSkillCategoryLabel()` 関数 | 100% | 100%   | 100%     |
| `skillCreator.ts` 全体（参考） | 80%+ | 60%+   | 80%+     |

### 3. 計測結果記録（実行時に記入）

| 計測対象                       | Line | Branch | Function | 判定    |
| ------------------------------ | ---- | ------ | -------- | ------- |
| `SKILL_CATEGORY_LABELS` 定数   | -    | -      | -        | pending |
| `getSkillCategoryLabel()` 関数 | -    | -      | -        | pending |
| `skillCreator.ts` 全体（参考） | -    | -      | -        | pending |

### 4. 未到達コード分析

```bash
# カバレッジレポートから未到達行を確認
pnpm --filter @repo/shared exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/types/skillCreator.ts" \
  src/types/__tests__/skillCreator-wizard.test.ts 2>&1 | grep -A 5 "skillCreator.ts"
```

期待: `SKILL_CATEGORY_LABELS` および `getSkillCategoryLabel` の行が全て covered

## 統合テスト連携【必須】

| 判定項目                                  | 基準 | 結果    |
| ----------------------------------------- | ---- | ------- |
| getSkillCategoryLabel Line カバレッジ     | 100% | pending |
| getSkillCategoryLabel Branch カバレッジ   | 100% | pending |
| getSkillCategoryLabel Function カバレッジ | 100% | pending |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・未到達コード分析・判定 |

## 完了条件

- [ ] 変更ブロック（`SKILL_CATEGORY_LABELS` + `getSkillCategoryLabel`）のカバレッジ計測済み
- [ ] `getSkillCategoryLabel()` が Line/Branch/Function 100% 達成
- [ ] 未到達コードがない（または未到達がある場合は理由を記録）
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行
2. 計測結果の記録
3. 未到達コード分析
4. カバレッジ目標との照合
5. カバレッジレポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
