# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 7                                                |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

テストカバレッジがプロジェクト目標を達成しているか確認し、不足があれば補完する。

## 実行タスク

### タスク1: カバレッジ計測

- 目的: `SkillLifecyclePanel.tsx` のテストカバレッジを計測する
- 手順:
  1. `pnpm --dir apps/desktop test:coverage src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` を実行
  2. `SkillLifecyclePanel.tsx` の Line / Branch / Function カバレッジを記録
  3. カバレッジレポートを `outputs/phase-7/coverage-report.md` に出力
- 期待出力: カバレッジレポート

### タスク2: カバレッジ目標の確認

- 目的: カバレッジ目標（Line 80%+, Branch 60%+, Function 80%+）の達成を確認する
- 手順:
  1. 計測結果と目標値を比較
  2. 未達の場合: カバレッジが不足している行・分岐・関数を特定
  3. 未達の場合: 追加テストを作成してカバレッジを補完
  4. 再計測して目標達成を確認
- 期待出力: 目標達成の確認（または追加テスト）

## カバレッジ目標

| 指標     | 目標 | 備考                              |
| -------- | ---- | --------------------------------- |
| Line     | 80%+ | severity フィルタ関連行を含む     |
| Branch   | 60%+ | フィルタ条件分岐を網羅            |
| Function | 80%+ | `filterChecksBySeverity` 等を含む |

## 参照資料

| 資料名       | パス                                                                                | 説明             |
| ------------ | ----------------------------------------------------------------------------------- | ---------------- |
| テストコード | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | 全テスト         |
| 実装コード   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | カバレッジ対象   |
| 目標定義     | `index.md`                                                                          | カバレッジ目標値 |

## 成果物

| 成果物             | パス                                 | 説明               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果と目標比較 |

## 完了条件

- [ ] `SkillLifecyclePanel.tsx` のカバレッジを計測済み
- [ ] Line カバレッジが 80% 以上
- [ ] Branch カバレッジが 60% 以上
- [ ] Function カバレッジが 80% 以上
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に出力されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8: リファクタリング
