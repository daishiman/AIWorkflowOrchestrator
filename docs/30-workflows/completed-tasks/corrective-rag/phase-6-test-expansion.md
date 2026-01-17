# Phase 6: テスト拡充

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 6              |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- ユニットテスト拡充: 境界値・異常系テストの追加
- 統合テスト実行: LLM連携・Web検索連携テストの実行
- E2Eテスト拡充: エンドツーエンドシナリオの追加

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| LLM API連携                  | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| Web検索連携ポイント          | 100% |

## 参照資料

| 資料名     | パス                                        | 説明          |
| ---------- | ------------------------------------------- | ------------- |
| テスト仕様 | `outputs/phase-4/test-specification.md`     | Phase 4成果物 |
| 実装コード | `packages/shared/src/services/search/crag/` | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ目標 |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/shared test:coverage
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### 3. 追加テスト作成

#### RelevanceEvaluator追加テスト

| テストID | シナリオ                           | カバレッジ対象          |
| -------- | ---------------------------------- | ----------------------- |
| RE-009   | maxEvaluateオプションのテスト      | evaluateIndividual      |
| RE-010   | 分散計算のテスト                   | calculateVariance       |
| RE-011   | JSONパースエラー時のフォールバック | parseEvaluationResponse |
| RE-012   | 閾値境界値テスト（0.7, 0.3境界）   | determineAction         |

#### CorrectiveRAG追加テスト

| テストID | シナリオ                            | カバレッジ対象   |
| -------- | ----------------------------------- | ---------------- |
| CR-008   | Web検索失敗時のエラーハンドリング   | performWebSearch |
| CR-009   | minResultsBeforeWebSearchオプション | handleAmbiguous  |
| CR-010   | webSearchLimitオプション            | performWebSearch |
| CR-011   | Web検索結果のフォーマット           | formatWebResults |

### 4. 統合テスト再実行

```bash
pnpm --filter @repo/shared test:integration
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                  | 目標 |
| ------------------ | ----------------------------------------- | ---- |
| LLM API接続テスト  | ILLMClient.complete()呼び出し・レスポンス | 100% |
| データフローテスト | FusedSearchResult[]→CRAGResult完全パス    | 100% |
| エラーハンドリング | LLM障害・Web検索障害時のResult.err()      | 80%+ |
| Web検索連携テスト  | IWebSearcher.search()呼び出し・レスポンス | 100% |

## 成果物

| 成果物             | パス                                                           | 説明               |
| ------------------ | -------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                           | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                          | 統合テスト実行結果 |
| テストファイル     | `packages/shared/src/services/search/crag/__tests__/*.test.ts` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] RelevanceEvaluator追加テスト（RE-009〜RE-012）が作成されている
- [ ] CorrectiveRAG追加テスト（CR-008〜CR-011）が作成されている
- [ ] 統合テストが全カテゴリで実行されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. カバレッジ測定
3. ギャップ分析
4. RelevanceEvaluator追加テスト作成
5. CorrectiveRAG追加テスト作成
6. 統合テスト拡充・実行
7. カバレッジレポート作成
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
