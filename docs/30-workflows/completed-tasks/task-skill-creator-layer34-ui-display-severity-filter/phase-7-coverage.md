# Phase 7: テストカバレッジ確認 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 7                                                     |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 6                                               |
| 後続Phase | Phase 8                                               |

## 目的

severity フィルタ実装に対するテストカバレッジを計測し、品質基準を達成していることを確認する。カバレッジ対象は変更したファイル/ブロックに限定する。

## 実行タスク

### タスク1: カバレッジ計測

**目的**: 変更対象のカバレッジを計測する。

**手順**:

1. severity フィルタ関連コードのカバレッジを計測する
   ```bash
   pnpm --filter @repo/desktop test -- SkillLifecyclePanel --coverage
   ```
2. カバレッジ対象範囲（変更したファイル/ブロックに限定）:
   - `SkillLifecyclePanel.tsx` の severity filter 関連コード
     - `SeverityFilterValue` 型定義
     - `severityFilter` state
     - `shouldShowCheck` フィルタ関数
     - `filteredChecksByLayer` useMemo
     - セグメントコントロール UI
     - 集計バッジ更新ロジック

### タスク2: カバレッジ基準の判定

**目的**: 変更ブロックの line/branch カバレッジ実測値を確認する。

**カバレッジ基準**:

| メトリクス | 基準 | 対象                                  |
| ---------- | ---- | ------------------------------------- |
| Line       | 80%+ | severity filter 関連コード            |
| Branch     | 60%+ | filter 条件分岐（all/warning+/error） |
| Function   | 80%+ | shouldShowCheck, フィルタ useMemo     |

**手順**:

1. 変更した関数/ブロックの line カバレッジと branch カバレッジの実測値を記録する
2. 基準未達の場合は Phase 6 に戻り、テストを追加する

### タスク3: カバレッジレポート作成

**目的**: カバレッジ計測結果をレポートとして出力する。

**手順**:

1. 変更ブロック別のカバレッジ実測値を記録する
2. 全体のカバレッジサマリーを作成する

## 参照資料

| 資料名        | パス                                       | 説明           |
| ------------- | ------------------------------------------ | -------------- |
| Phase 6成果物 | `outputs/phase-6/test-expansion-report.md` | テスト拡充結果 |

## 統合テスト連携

| 判定項目                | 基準 | 結果       |
| ----------------------- | ---- | ---------- |
| ユニットテスト Line     | 80%+ | {{RESULT}} |
| ユニットテスト Branch   | 60%+ | {{RESULT}} |
| ユニットテスト Function | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                 | 説明     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果 |

## 完了条件

- [ ] severity filter 関連コードの line カバレッジが 80% 以上
- [ ] severity filter 関連コードの branch カバレッジが 60% 以上
- [ ] severity filter 関連コードの function カバレッジが 80% 以上
- [ ] 変更した関数/ブロックの line/branch 実測値を証跡に記録した
- [ ] カバレッジ基準未達の場合は Phase 6 に戻りテストを追加した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
