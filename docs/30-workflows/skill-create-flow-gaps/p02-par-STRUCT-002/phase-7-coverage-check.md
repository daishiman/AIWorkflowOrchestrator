# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 6                                       |
| 後続Phase  | Phase 8                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## 目的

テストカバレッジを計測し、目標基準（Line 80%+・Branch 60%+・Function 80%+）を達成しているか確認する。
未達の場合は Phase 6 へ戻りテストを追加する。

## 実行タスク

- テストカバレッジの計測
- カバレッジ目標との比較（AC 対応表を含む）
- branch coverage の特定確認（`structurePlan !== null` の分岐）
- ゲート判定（PASS / 未達）

## 参照資料

| 資料名         | パス                                                                         | 用途               |
| -------------- | ---------------------------------------------------------------------------- | ------------------ |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | カバレッジ計測対象 |
| 実装ファイル   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | カバレッジ計測対象 |

## 実行手順

### 1. カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/__tests__/
```

### 2. カバレッジ目標との比較

| 指標              | 最低基準 | 推奨基準 | 計測結果 | 判定   |
| ----------------- | -------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | TBD      | 確認要 |
| Branch Coverage   | 60%      | 70%      | TBD      | 確認要 |
| Function Coverage | 80%      | 90%      | TBD      | 確認要 |

### 3. AC 対応表の確認

| AC   | テストカバレッジの担保                                            | 状態   |
| ---- | ----------------------------------------------------------------- | ------ |
| AC-1 | `void structurePlan` 削除後に `structurePlan` が参照される branch | 確認要 |
| AC-2 | `structurePlan !== null` の true branch（create モード）          | 確認要 |
| AC-3 | `structurePlan === null` の false branch（フォールバック）        | 確認要 |
| AC-4 | `structurePlan` が null のフォールバック branch                   | 確認要 |
| AC-5 | `collaborative` モードでの `structurePlan === null` branch        | 確認要 |

### 4. branch coverage の重点確認

`structurePlan !== null` の条件分岐が最重要の branch:

- `true` branch（create モード + `structurePlan` 非 null）: TC-01〜TC-04 で担保
- `false` branch（null フォールバック）: TC-05・TC-09 で担保
- `anchors ?? []` の null 結合分岐: TC-08 で担保

### 5. ゲート判定

- **PASS**: 全指標が最低基準以上 → Phase 8 へ進む
- **未達**: いずれかの指標が最低基準未満 → Phase 6 へ戻る

## 統合テスト連携【必須】

統合テストの再実行とゲート判定。

| 判定項目          | 基準 | 結果    |
| ----------------- | ---- | ------- |
| Line Coverage     | 80%+ | pending |
| Branch Coverage   | 60%+ | pending |
| Function Coverage | 80%+ | pending |

## 多角的チェック観点

| 観点         | チェック内容                                                          |
| ------------ | --------------------------------------------------------------------- |
| 分岐網羅     | `structurePlan !== null` の true/false 両ブランチがテストされているか |
| anchors 分岐 | `anchors ?? []` の null 結合演算子の両パスがテストされているか        |
| AC 対応      | AC-1〜AC-5 が全て branch coverage で担保されているか                  |

## 成果物

| 成果物             | パス                                 | 説明                                                  |
| ------------------ | ------------------------------------ | ----------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・AC 対応表・branch coverage 確認・ゲート判定 |

## 完了条件

- [ ] カバレッジ計測が完了済み
- [ ] 全指標が最低基準（Line 80%+・Branch 60%+・Function 80%+）を満たしている
- [ ] AC 対応表が記録されている
- [ ] ゲート判定が PASS
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行
2. 目標基準との比較
3. AC 対応表の確認
4. branch coverage の重点確認
5. ゲート判定（PASS / Phase 6 へ戻る）
6. カバレッジレポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
