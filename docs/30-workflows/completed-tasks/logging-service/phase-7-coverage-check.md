# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 7               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 使用スキル

| スキル                   | 選定理由             |
| ------------------------ | -------------------- |
| `test-coverage-analysis` | カバレッジ検証と判定 |

## 参照資料

| 資料名             | パス                                  | 説明          |
| ------------------ | ------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | Phase 6成果物 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | Phase 6成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |

## 実行手順

### ステップ1: カバレッジ再測定

```bash
pnpm --filter @repo/shared test:coverage
```

### ステップ2: 基準達成確認

以下の基準を満たしていることを確認:

**ユニットテスト**:

- Line Coverage: 80%以上
- Branch Coverage: 60%以上
- Function Coverage: 80%以上

**結合テスト**:

- モジュール間インターフェース: 100%
- 正常系シナリオ: 100%
- 異常系シナリオ: 80%以上

### ステップ3: 未達の場合の対応

カバレッジ未達がある場合、Phase 6へ戻って拡充する。

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果 |
| ------------------------ | ---- | ---- |
| ユニットテストLine       | 80%+ | [ ]  |
| ユニットテストBranch     | 60%+ | [ ]  |
| ユニットテストFunction   | 80%+ | [ ]  |
| Repository接続テスト     | 100% | [ ]  |
| データフローテスト正常系 | 100% | [ ]  |
| データフローテスト異常系 | 80%+ | [ ]  |

## 成果物

| 成果物             | パス                                 | 説明       |
| ------------------ | ------------------------------------ | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 再測定結果 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`     | 判定結果   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 全テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 6成果物）
2. test-coverage-analysisスキルの実行
3. カバレッジ再測定
4. 基準達成確認
5. ゲート判定
6. カバレッジレポートの作成
7. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 7
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                 | 結果                        | 備考                        |
| ---------------------- | --------------------------- | --------------------------- |
| test-coverage-analysis | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
