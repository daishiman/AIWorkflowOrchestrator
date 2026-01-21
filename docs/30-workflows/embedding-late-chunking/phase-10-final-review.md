# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 10                      |
| Phase名    | 最終レビューゲート      |
| 前提Phase  | Phase 9（品質保証）     |
| 後続Phase  | Phase 11（手動テスト）  |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | embedding-late-chunking |

---

## 目的

実装完了後、要件・設計・品質の最終整合性を検証する。

## 背景

Late Chunkingは品質と性能に影響するため、最終レビューで仕様準拠と品質ゲートを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 最終レビューの実施

**目的**: 実装が要件・設計・品質基準を満たすかを確認する

**実行手順**:

1. 要件/設計/品質成果物を突合
2. ベンチマーク結果が受け入れ基準を満たすか確認
3. `outputs/phase-10/final-review-result.md` に判定を記録

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

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

| 参照資料     | パス                                   | 内容       |
| ------------ | -------------------------------------- | ---------- |
| 品質サマリー | `outputs/phase-9/quality-summary.md`   | 品質まとめ |
| テスト結果   | `outputs/phase-9/final-test-result.md` | テスト結果 |

**依存Phase成果物**

| 参照資料         | パス                                         | 内容         |
| ---------------- | -------------------------------------------- | ------------ |
| Phase 1 要件定義 | `outputs/phase-1/requirements-definition.md` | 要件整理     |
| Phase 2 設計     | `outputs/phase-2/architecture-design.md`     | 設計まとめ   |
| Phase 5 実装     | `outputs/phase-5/implementation-summary.md`  | 実装サマリー |

---

## 成果物

| 成果物       | パス                                      | 内容     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト結果が最終レビューで確認されている
- ベンチマーク結果がレビュー判定に反映されている

---

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] 判定結果が記録されている
- [ ] 統合テスト結果が確認されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 10
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- タスク1:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 9（品質保証）の完了
- **後続**: Phase 11（手動テスト）へ進む

---

## レビューゲート（Phase 3, 10 の場合）

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト作成） |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-11-manual-test.md`
