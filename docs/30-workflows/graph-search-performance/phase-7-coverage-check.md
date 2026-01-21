# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 7                           |
| Phase名    | テストカバレッジ確認        |
| 前提Phase  | Phase 6（テスト拡充）       |
| 後続Phase  | Phase 8（リファクタリング） |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | graph-search-performance    |

---

## 目的

拡充したテスト結果を検証し、カバレッジ基準と統合テスト要件を満たしていることを確認する。

## 背景

Phase 6で追加したテストがカバレッジ基準を満たしているかを確認し、不足があれば拡充に戻る必要がある。

---

## 使用スキル

- `aiworkflow-requirements`: テスト結果が仕様に沿うか確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ再測定

**目的**: カバレッジ基準を満たしているか確認する。

**実行手順**:

1. `pnpm test:coverage` を実行する。
2. Line/Branch/Functionの達成状況を記録する。
3. `outputs/phase-7/coverage-report.md` に記録する。

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: 統合テスト再実行

**目的**: キャッシュ統合の接続テストが成功することを確認する。

**実行手順**:

1. `pnpm test:integration` を実行する。
2. `pnpm test:e2e` を実行する。
3. `outputs/phase-7/integration-test.md` に結果を記録する。

**期待される成果物**:

- `outputs/phase-7/integration-test.md`

---

### タスク3: 未達時の対応

**目的**: 基準未達の場合にPhase 6へ戻る判断を行う。

**実行手順**:

1. カバレッジ未達または統合テスト失敗がある場合、原因と不足箇所を記録する。
2. Phase 6に戻って追加テストを作成する判断を記録する。
3. `outputs/phase-7/gate-result.md` に判定を記録する。

**期待される成果物**:

- `outputs/phase-7/gate-result.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                          | 内容                            |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| 検索クエリ・結果型定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`  | GraphSearchStrategyと検索型定義 |
| Embedding Generation API | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md` | 埋め込み生成APIとキャッシュ指標 |

**前Phase成果物**

| 参照資料           | パス                                        | 内容           |
| ------------------ | ------------------------------------------- | -------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | 実装内容       |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`        | カバレッジ分析 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`       | 統合テスト結果 |

---

## 成果物

| 成果物             | パス                                  | 内容           |
| ------------------ | ------------------------------------- | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果     |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト結果 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`      | 判定結果       |

---

## 統合テスト連携（Phase 1〜11は必須）

| 判定項目                 | 基準 | 結果   |
| ------------------------ | ---- | ------ |
| ユニットテストLine       | 80%+ | 未記入 |
| ユニットテストBranch     | 60%+ | 未記入 |
| ユニットテストFunction   | 80%+ | 未記入 |
| 結合テストAPI            | 100% | 未記入 |
| 結合テストシナリオ正常系 | 100% | 未記入 |
| 結合テストシナリオ異常系 | 80%+ | 未記入 |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成している
- [ ] 結合テストカバレッジ基準を達成している
- [ ] 統合テストが全て成功している
- [ ] フロントエンド・バックエンド接続テストが成功している
- [ ] カバレッジレポートが出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

| スキル                  | 結果    | 備考                           |
| ----------------------- | ------- | ------------------------------ |
| aiworkflow-requirements | pending | 参照資料確認後に結果を記録する |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 7
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

| タスク           | 結果   | 備考 |
| ---------------- | ------ | ---- |
| カバレッジ再測定 | 未実施 |      |
| 統合テスト再実行 | 未実施 |      |
| 未達時の対応     | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 8: リファクタリング

`docs/30-workflows/graph-search-performance/phase-8-refactoring.md`
