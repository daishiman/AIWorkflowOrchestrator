# Phase 6: テスト拡充

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 6               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 使用スキル

| スキル                   | 選定理由                     |
| ------------------------ | ---------------------------- |
| `test-coverage-analysis` | カバレッジ分析と改善点の特定 |
| `integration-testing`    | 統合テスト設計・実行         |

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装コード   | `packages/shared/src/services/logging/` | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                                | 目標 |
| -------------------- | --------------------------------------- | ---- |
| Repository接続テスト | ConversionLogger → LogRepository疎通    | 100% |
| データフローテスト   | ログ生成→バッファ→フラッシュ→Repository | 100% |
| エラーハンドリング   | Repository障害時のエラー伝播            | 80%+ |
| バッファリングテスト | サイズ/時間ベースの自動フラッシュ       | 100% |
| 並行処理テスト       | 複数ログの同時記録                      | 80%+ |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/shared test:coverage
```

### ステップ2: ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### ステップ3: 追加テスト作成

以下のテストケースを追加:

- 異常系テスト（Repository障害時）
- エッジケーステスト（空バッファ、大量ログ）
- 並行処理テスト

### ステップ4: 統合テスト実行

```bash
pnpm --filter @repo/shared test:run
```

## 成果物

| 成果物             | パス                                                                       | 説明               |
| ------------------ | -------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                       | カバレッジ分析結果 |
| 追加テストファイル | `packages/shared/src/services/logging/__tests__/conversion-logger.test.ts` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストの追加が完了している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. test-coverage-analysisスキルの実行
3. カバレッジ測定とギャップ分析
4. integration-testingスキルの実行
5. 追加テストの作成
6. カバレッジ再測定
7. カバレッジレポートの作成
8. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 6
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                 | 結果                        | 備考                        |
| ---------------------- | --------------------------- | --------------------------- |
| test-coverage-analysis | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| integration-testing    | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 7: テストカバレッジ確認
