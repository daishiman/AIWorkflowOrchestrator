# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-18                    |
| 機能名     | embedding-late-chunking       |

---

## 目的

Late Chunkingのアーキテクチャ、インターフェース、アルゴリズム設計を確定する。

## 背景

Embedding Generation PipelineにLate Chunkingを統合するため、既存のチャンキング/埋め込み仕様と整合する設計が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: Late Chunkingの処理フローと責務分割を明確化する

**実行手順**:

1. トークン埋め込み取得→境界検出→プーリング→チャンク埋め込み生成の流れを図示
2. EmbeddingPipeline/ChunkingService/EmbeddingServiceの責務変更点を整理
3. `outputs/phase-2/architecture-design.md` に記録

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### タスク2: インターフェース設計

**目的**: 型定義と設定項目を決定する

**実行手順**:

1. `late-chunking.types.ts` に必要な型（TokenEmbedding, ChunkBoundary, PoolingStrategy等）を設計
2. EmbeddingPipelineの設定追加（enableLateChunking, lateChunkingPooling等）を定義
3. `outputs/phase-2/interface-design.md` に記録

**期待される成果物**:

- `outputs/phase-2/interface-design.md`

---

### タスク3: 境界検出・プーリング設計

**目的**: チャンク境界検出とプーリングアルゴリズムを確定する

**実行手順**:

1. 最大サイズ/オーバーラップ/文境界保持のルールを設計
2. mean/max/clsプーリングの計算方法と制約を定義
3. `outputs/phase-2/chunk-boundary-algorithm.md` に記録

**期待される成果物**:

- `outputs/phase-2/chunk-boundary-algorithm.md`

---

### タスク4: ベンチマーク設計

**目的**: Late Chunkingの効果検証方法を設計する

**実行手順**:

1. 評価データセット/評価指標（precision, recall, latency, memory）を定義
2. 現行手法との比較手順を定義
3. `outputs/phase-2/benchmark-plan.md` に記録

**期待される成果物**:

- `outputs/phase-2/benchmark-plan.md`

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

| 参照資料     | パス                                         | 内容            |
| ------------ | -------------------------------------------- | --------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 機能/非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準    |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲        |

---

## 成果物

| 成果物                  | パス                                          | 内容                       |
| ----------------------- | --------------------------------------------- | -------------------------- |
| アーキテクチャ設計      | `outputs/phase-2/architecture-design.md`      | データフローと責務分割     |
| インターフェース設計    | `outputs/phase-2/interface-design.md`         | 型定義と設定項目           |
| 境界検出/プーリング設計 | `outputs/phase-2/chunk-boundary-algorithm.md` | 境界ルールとプーリング仕様 |
| ベンチマーク計画        | `outputs/phase-2/benchmark-plan.md`           | 評価指標と比較手順         |

---

## 統合テスト連携（Phase 1〜11は必須）

- EmbeddingPipeline/ChunkingService/EmbeddingServiceの契約ポイントを明記
- Late Chunking有効時のデータフローを統合テスト観点に追加

---

## 完了条件

- [ ] アーキテクチャ設計が定義されている
- [ ] インターフェース設計が確定している
- [ ] 境界検出/プーリング設計が確定している
- [ ] ベンチマーク計画が作成されている
- [ ] 要件との整合性が確認されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 2
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1:
- タスク2:
- タスク3:
- タスク4:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 1（要件定義）の完了
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-3-design-review.md`
