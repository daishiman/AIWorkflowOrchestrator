# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 8                                     |
| Phase名    | リファクタリング                      |
| 前提Phase  | Phase 7（カバレッジ確認）             |
| 後続Phase  | Phase 9（品質保証）                   |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

タイムアウト処理とエラーコード処理の重複を排除し、可読性と保守性を向上させる。

## 背景

Phase 7でカバレッジが確認できたため、コード品質を改善しつつ挙動を維持するリファクタリングを実施する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: タイムアウト処理の整理

**目的**: タイムアウト処理の重複を削減する

**実行手順**:

1. GraphStore/Embeddingのタイムアウト処理を共通化
2. ユーティリティ関数に集約する場合は呼び出し箇所を統一
3. `outputs/phase-8/refactoring-log.md` に変更内容を記録

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク2: エラーコード処理の整理

**目的**: エラーコード付与処理を一貫させる

**実行手順**:

1. createRAGErrorの使用箇所を整理
2. エラーコンテキスト生成を統一
3. 変更点をログに記録

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク3: コード品質分析

**目的**: リファクタリング前後の品質差分を記録する

**実行手順**:

1. 複雑度/可読性の改善点を抽出
2. `outputs/phase-8/code-analysis.md` に記録

**期待される成果物**:

- `outputs/phase-8/code-analysis.md`

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

| 参照資料           | パス                                 | 内容     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`     | 判定     |

**依存Phase成果物**

| 参照資料             | パス                                         | 内容          |
| -------------------- | -------------------------------------------- | ------------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` | 要件一覧      |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | 合否基準      |
| スコープ定義         | `outputs/phase-1/scope-definition.md`        | 対象範囲      |
| タイムアウト設計     | `outputs/phase-2/timeout-design.md`          | timeoutMs設計 |
| エラーコード設計     | `outputs/phase-2/error-code-design.md`       | コード体系    |
| 設計ドキュメント     | `outputs/phase-2/design-document.md`         | 統合設計書    |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 実装内容      |
| Green状態確認        | `outputs/phase-5/test-green-status.md`       | テスト結果    |
| テスト拡充結果       | `outputs/phase-6/test-expansion-result.md`   | 拡充結果      |
| フォールバックテスト | `outputs/phase-6/fallback-tests.md`          | 追加テスト    |

---

## 成果物

| 成果物               | パス                                 | 内容         |
| -------------------- | ------------------------------------ | ------------ |
| コード品質分析       | `outputs/phase-8/code-analysis.md`   | 改善ポイント |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更記録     |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後にGraphSearch統合テストが継続して成功することを確認

---

## 完了条件

- [ ] タイムアウト処理が整理されている
- [ ] エラーコード処理が一貫化されている
- [ ] コード品質分析が記録されている
- [ ] リファクタ後もテストが成功している

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 8
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

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

- **前提**: Phase 7（カバレッジ確認）の完了
- **後続**: Phase 9（品質保証）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm test -- --filter="GraphSearchStrategy"
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-9-quality.md`
