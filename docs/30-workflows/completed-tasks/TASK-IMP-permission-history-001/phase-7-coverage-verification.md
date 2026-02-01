# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 7                               |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測と基準達成確認
- ギャップ確認: 未到達箇所の最終確認

## 参照資料

| 資料名             | パス                                    | 説明          |
| ------------------ | --------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`    | Phase 6成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装コード         | Phase 5で作成した各実装ファイル         | テスト対象    |

## 実行手順

### 1. カバレッジ再測定

```bash
pnpm --filter @repo/desktop test -- --coverage --coverageReporters=text-summary --coverageReporters=lcov
```

### 2. 基準達成確認

| 指標              | 基準 | 結果 |
| ----------------- | ---- | ---- |
| Line Coverage     | 95%+ | -    |
| Branch Coverage   | 80%+ | -    |
| Function Coverage | 95%+ | -    |

### 3. 未達の場合の対応

カバレッジ未達がある場合、Phase 6へ戻って追加テストを作成する。

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果 |
| ------------------------ | ---- | ---- |
| ユニットテストLine       | 95%+ | -    |
| ユニットテストBranch     | 80%+ | -    |
| ユニットテストFunction   | 95%+ | -    |
| データフローテスト       | PASS | -    |
| 永続化テスト             | PASS | -    |
| エラーハンドリングテスト | PASS | -    |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                         | 仕様参照先                                             |
| -------------- | -------------------------------- | ------------------------------------------------------ |
| パフォーマンス | カバレッジ測定のため適用         | -                                                      |
| セキュリティ   | safeString()テストカバレッジ確認 | `aiworkflow-requirements: security-skill-execution.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                         | 仕様参照先                                          |
| -------------------------- | -------------------------------- | --------------------------------------------------- |
| フロントエンド（Renderer） | Rendererテストカバレッジ確認     | `aiworkflow-requirements: ui-ux-settings.md`        |
| ローカルストレージ         | localStorage関連テストカバレッジ | `aiworkflow-requirements: arch-state-management.md` |

## 成果物

| 成果物             | パス                                 | 説明       |
| ------------------ | ------------------------------------ | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 再測定結果 |

## 完了条件

- [ ] Line Coverage 95%以上を達成
- [ ] Branch Coverage 80%以上を達成
- [ ] Function Coverage 95%以上を達成
- [ ] 全テストがPASS
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
