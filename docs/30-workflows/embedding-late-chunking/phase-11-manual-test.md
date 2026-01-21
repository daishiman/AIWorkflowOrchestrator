# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト                     |
| 前提Phase  | Phase 10（最終レビューゲート） |
| 後続Phase  | Phase 12（ドキュメント更新）   |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | embedding-late-chunking        |

---

## 目的

自動テストで検証できない品質指標（検索品質・性能・体感）を手動で確認する。

## 背景

Late Chunkingは検索品質向上が主目的であり、ベンチマークと実データでの確認が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ベンチマークの実行

**目的**: Late Chunkingの検索品質と性能を手動で評価する

**実行手順**:

1. ベンチマークスクリプトを実行
2. 通常モードとの比較結果を取得
3. `outputs/phase-11/manual-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク2: 実データでの検証

**目的**: 実際のドキュメントで品質改善を確認する

**実行手順**:

1. 長文ドキュメントを対象に検索結果を比較
2. 文脈を跨ぐ検索が改善されているか確認
3. `outputs/phase-11/manual-test-result.md` に追記

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク3: 発見課題の記録

**目的**: 手動テストで発見した課題を整理する

**実行手順**:

1. 失敗ケースや改善点を記録
2. `outputs/phase-11/discovered-issues.md` に記録

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                                    | パス                                                                                   | 内容                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| Embedding Generation Pipelineアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | パイプライン構成とチャンキング/埋め込みの責務 |
| Embedding Generation API                    | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | EmbeddingPipeline/ChunkingServiceのAPI仕様    |
| チャンク・埋め込み型定義                    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`  | チャンク/埋め込みエンティティと設定値         |

**前Phase成果物**

| 参照資料         | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

**依存Phase成果物**

| 参照資料                 | パス                                         | 内容           |
| ------------------------ | -------------------------------------------- | -------------- |
| Phase 1 要件定義         | `outputs/phase-1/requirements-definition.md` | 要件整理       |
| Phase 2 設計             | `outputs/phase-2/architecture-design.md`     | 設計まとめ     |
| Phase 5 実装             | `outputs/phase-5/implementation-summary.md`  | 実装サマリー   |
| Phase 6 テスト拡充       | `outputs/phase-6/integration-test.md`        | 統合テスト結果 |
| Phase 7 カバレッジ確認   | `outputs/phase-7/coverage-report.md`         | 再測定結果     |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-log.md`         | 変更記録       |
| Phase 9 品質保証         | `outputs/phase-9/quality-summary.md`         | 品質まとめ     |

---

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | ベンチマーク結果 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 未完了課題リスト |

---

## 統合テスト連携（Phase 1〜11は必須）

| テスト項目       | 確認内容                     | 期待結果           | 実行結果 |
| ---------------- | ---------------------------- | ------------------ | -------- |
| Pipeline切り替え | Late Chunking有効/無効の切替 | 正常切替           | 未実施   |
| 文脈跨ぎ検索     | 隣接チャンクの関連検索       | 精度向上           | 未実施   |
| 性能指標         | 処理時間/メモリの許容範囲    | 目標内             | 未実施   |
| フォールバック   | 非対応モデル時の通常処理     | 正常フォールバック | 未実施   |

---

## 完了条件

- [ ] 手動テストが完了している
- [ ] ベンチマーク結果が記録されている
- [ ] 発見課題が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 11
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- タスク1:
- タスク2:
- タスク3:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 10（最終レビューゲート）の完了
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-12-documentation.md`
