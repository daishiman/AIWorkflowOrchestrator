# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| Phase名    | カバレッジ確認                        |
| 前提Phase  | Phase 6（テスト拡充）                 |
| 後続Phase  | Phase 8（リファクタリング）           |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

テストカバレッジを計測し、目標基準を満たしているかを確認する。

## 背景

信頼性改善はテスト網羅性が重要であり、カバレッジ指標で品質を確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ測定

**目的**: GraphSearchStrategy関連のカバレッジを計測する

**実行手順**:

1. GraphSearchStrategyのテストカバレッジを測定
2. 結果を `outputs/phase-7/coverage-report.md` に記録

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: ギャップ分析

**目的**: カバレッジ不足箇所を特定する

**実行手順**:

1. coverage-reportを基に不足箇所を抽出
2. 改善が必要な箇所を `outputs/phase-7/coverage-gap-analysis.md` に記載

**期待される成果物**:

- `outputs/phase-7/coverage-gap-analysis.md`

---

### タスク3: ゲート判定

**目的**: カバレッジ目標達成の可否を判定する

**実行手順**:

1. 目標値（Line/Branch/Function）に対して判定
2. `outputs/phase-7/gate-result.md` に記録

**期待される成果物**:

- `outputs/phase-7/gate-result.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| GraphSearchStrategy仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | GraphSearchOptions/インターフェース仕様 |
| Knowledge Graph Store仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | GraphStoreインターフェースとエラー処理  |
| Embedding API仕様         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`               | 埋め込み生成のタイムアウト設定          |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系と分類                  |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | 検索パイプライン全体像                  |

**前Phase成果物**

| 参照資料           | パス                                       | 内容       |
| ------------------ | ------------------------------------------ | ---------- |
| テスト拡充結果     | `outputs/phase-6/test-expansion-result.md` | 拡充結果   |
| エッジケーステスト | `outputs/phase-6/edge-case-tests.md`       | 追加テスト |

**依存Phase成果物**

| 参照資料      | パス                                        | 内容       |
| ------------- | ------------------------------------------- | ---------- |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md` | 実装内容   |
| Green状態確認 | `outputs/phase-5/test-green-status.md`      | テスト結果 |

---

## 成果物

| 成果物             | パス                                       | 内容         |
| ------------------ | ------------------------------------------ | ------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | 計測結果     |
| ギャップ分析       | `outputs/phase-7/coverage-gap-analysis.md` | 不足箇所分析 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`           | 合否判定     |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テストの再実行結果をカバレッジ判定に含める
- GraphSearchタイムアウトの統合シナリオが含まれているか確認

---

## 完了条件

- [ ] カバレッジレポートが作成されている
- [ ] ギャップ分析が作成されている
- [ ] ゲート判定が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 7
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 6（テスト拡充）の完了
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-8-refactoring.md`
