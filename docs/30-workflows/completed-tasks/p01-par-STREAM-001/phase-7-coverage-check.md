# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 7                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 6                                 |
| 後続Phase  | Phase 8                                 |
| 作成日     | 2026-04-15                              |
| ステータス | completed                               |

## 目的

`SkillCreatorService.ts` の変更箇所に対するテストカバレッジを確認し、
目標基準（Line 80%+、Branch 60%+、Function 80%+）を達成していることを検証する。
未達の場合は Phase 6 へ戻り追加テストを実施する。

## 実行タスク

- カバレッジ計測の実行
- 目標基準との比較
- 未達箇所の特定と Phase 6 への差し戻し判断
- カバレッジレポートの記録

## 参照資料

| 資料名         | パス                                                                                  | 用途               |
| -------------- | ------------------------------------------------------------------------------------- | ------------------ |
| Phase 6 テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | テストファイル参照 |
| 実装ファイル   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | カバレッジ対象     |

## 実行手順

### 1. カバレッジ計測

```bash
# SkillCreatorService のカバレッジ計測
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts

# カバレッジレポートの確認
# coverage/ ディレクトリに HTML レポートが生成される
```

### 2. カバレッジ目標基準との比較

| 指標              | 最低基準 | 推奨基準 | 実測値（実行時に記録） | 判定 |
| ----------------- | -------- | -------- | ---------------------- | ---- |
| Line Coverage     | 80%      | 90%      | -                      | PASS |
| Branch Coverage   | 60%      | 70%      | -                      | PASS |
| Function Coverage | 80%      | 90%      | -                      | PASS |

### 3. カバレッジゲート判定

| 判定 | 条件                                   | 次のアクション |
| ---- | -------------------------------------- | -------------- |
| PASS | 全指標が最低基準以上                   | Phase 8 へ進む |
| 未達 | いずれかの指標が最低基準を下回っている | Phase 6 へ戻る |

### 4. カバレッジレポートの記録

`outputs/phase-7/coverage-report.md` に以下を記録:

- 計測コマンドと実行結果
- Line / Branch / Function カバレッジの実測値
- 未カバー箇所のリスト（存在する場合）
- ゲート判定結果（PASS / 未達）

## 統合テスト連携【必須】

| 判定項目          | 基準 | 結果 |
| ----------------- | ---- | ---- |
| Line Coverage     | 80%+ | PASS |
| Branch Coverage   | 60%+ | PASS |
| Function Coverage | 80%+ | PASS |

## 多角的チェック観点

| 観点           | チェック内容                                                                  |
| -------------- | ----------------------------------------------------------------------------- |
| カバレッジ対象 | `createSkill()` の変更箇所（5段階の呼び出し）が計測対象に含まれるか           |
| ブランチ網羅   | `onProgress?.()` のオプショナルチェーン分岐が Branch カバレッジに反映されるか |
| 既存テスト貢献 | 既存テストファイルが既存コードのカバレッジに貢献しているか                    |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 実測値・ゲート判定・未達箇所一覧 |

## 完了条件

- [x] カバレッジ計測コマンドを実行した
- [x] Line / Branch / Function の実測値を記録した
- [x] 全指標が最低基準（Line 80%+、Branch 60%+、Function 80%+）を達成している
- [x] 未達の場合は Phase 6 へ戻り追加テストを実施した
- [x] `outputs/phase-7/coverage-report.md` が作成されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計測の実行
2. 目標基準との比較
3. ゲート判定（PASS / 未達）
4. カバレッジレポートの出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 8: リファクタリング（PASS の場合）
Phase 6: テスト拡充（未達の場合）
