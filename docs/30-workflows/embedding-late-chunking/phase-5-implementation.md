# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| 前提Phase  | Phase 4（テスト作成）   |
| 後続Phase  | Phase 6（テスト拡充）   |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | embedding-late-chunking |

---

## 目的

テストを通すための最小限のLate Chunking実装を行う。

## 背景

Phase 4で定義したテストを満たす実装を行い、EmbeddingPipelineに統合する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: Late Chunking用の型定義を追加する

**実行手順**:

1. `packages/shared/src/services/embedding/types/late-chunking.types.ts` を作成
2. TokenEmbedding/ChunkBoundary/LateChunkingResult/PoolingStrategyを実装
3. 型のエクスポートを既存のtypesエントリに追加

**期待される成果物**:

- `packages/shared/src/services/embedding/types/late-chunking.types.ts`

---

### タスク2: チャンク境界検出器の実装

**目的**: トークン列からチャンク境界を生成する

**実行手順**:

1. `packages/shared/src/services/chunking/chunk-boundary-detector.ts` を実装
2. maxSize/overlapSize/preserveBoundariesのロジックを実装
3. 境界検出テストをGreenにする

**期待される成果物**:

- `packages/shared/src/services/chunking/chunk-boundary-detector.ts`

---

### タスク3: Late Chunkingサービスの実装

**目的**: プーリング戦略に基づくチャンク埋め込み生成を実装する

**実行手順**:

1. `packages/shared/src/services/embedding/late-chunking-service.ts` を実装
2. mean/max/clsプーリングを実装
3. 単一ドキュメントの埋め込み生成結果を返す

**期待される成果物**:

- `packages/shared/src/services/embedding/late-chunking-service.ts`

---

### タスク4: EmbeddingPipeline統合

**目的**: Late ChunkingモードをPipelineに追加する

**実行手順**:

1. PipelineConfigに `enableLateChunking` と `lateChunkingPooling` を追加
2. プロバイダーがトークン埋め込みに対応しない場合のフォールバックを実装
3. Pipeline統合テストをGreenにする

**期待される成果物**:

- `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`

---

### タスク5: 実装サマリー作成

**目的**: 実装内容を整理する

**実行手順**:

1. 追加/変更したファイルと要点をまとめる
2. `outputs/phase-5/implementation-summary.md` に記録

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

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

| 参照資料       | パス                                         | 内容         |
| -------------- | -------------------------------------------- | ------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      | テスト観点   |
| テストケース   | `outputs/phase-4/test-cases.md`              | ケース一覧   |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | 統合シナリオ |

---

## 成果物

| 成果物                | パス                                                                    | 内容                |
| --------------------- | ----------------------------------------------------------------------- | ------------------- |
| 型定義                | `packages/shared/src/services/embedding/types/late-chunking.types.ts`   | Late Chunking型定義 |
| 境界検出器            | `packages/shared/src/services/chunking/chunk-boundary-detector.ts`      | 境界検出ロジック    |
| Late Chunkingサービス | `packages/shared/src/services/embedding/late-chunking-service.ts`       | プーリング実装      |
| Pipeline統合          | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts` | モード切り替え      |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                             | 実装要点            |

---

## 統合テスト連携（Phase 1〜11は必須）

- Pipeline統合テストでLate Chunking有効/無効の差分を確認
- 非対応プロバイダー時のフォールバック挙動を統合テストで確認

---

## 完了条件

- [ ] 境界検出器が実装されている
- [ ] プーリング戦略が実装されている
- [ ] Pipeline統合が完了している
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装サマリーが作成されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 5
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1:
- タスク2:
- タスク3:
- タスク4:
- タスク5:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 4（テスト作成）の完了
- **後続**: Phase 6（テスト拡充）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm test -- late-chunking
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-6-test-expansion.md`
