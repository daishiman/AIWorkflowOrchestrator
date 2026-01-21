# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成                    |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-18                    |
| 機能名     | embedding-late-chunking       |

---

## 目的

Late Chunkingの境界検出・プーリング・Pipeline統合を検証するテストを先に作成し、Red状態を確認する。

## 背景

アルゴリズムの実装前にテストで期待値を固定し、実装と品質保証の指針を明確にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 境界検出器のユニットテスト作成

**目的**: チャンク境界検出の挙動を検証する

**実行手順**:

1. 最大チャンクサイズ/オーバーラップ/文境界保持のテストケースを作成
2. `packages/shared/src/services/chunking/__tests__/chunk-boundary-detector.test.ts` を作成
3. `outputs/phase-4/test-specification.md` に観点を記載

**期待される成果物**:

- `packages/shared/src/services/chunking/__tests__/chunk-boundary-detector.test.ts`
- `outputs/phase-4/test-specification.md`

---

### タスク2: プーリング戦略のユニットテスト作成

**目的**: mean/max/clsプーリングの計算結果を検証する

**実行手順**:

1. 疑似トークン埋め込みを用いた期待値を定義
2. `packages/shared/src/services/embedding/__tests__/late-chunking-service.test.ts` を作成
3. `outputs/phase-4/test-cases.md` にテストケースを記載

**期待される成果物**:

- `packages/shared/src/services/embedding/__tests__/late-chunking-service.test.ts`
- `outputs/phase-4/test-cases.md`

---

### タスク3: EmbeddingPipeline統合テスト作成

**目的**: Late Chunking有効/無効の挙動を検証する

**実行手順**:

1. PipelineConfigの切り替えで出力が変化することを確認
2. `packages/shared/src/services/embedding/__tests__/pipeline/embedding-pipeline-late-chunking.test.ts` を作成
3. `outputs/phase-4/integration-test-design.md` に統合シナリオを記載

**期待される成果物**:

- `packages/shared/src/services/embedding/__tests__/pipeline/embedding-pipeline-late-chunking.test.ts`
- `outputs/phase-4/integration-test-design.md`

---

### タスク4: Red状態の記録

**目的**: テストが失敗する状態を記録する

**実行手順**:

1. テストを実行しRed状態であることを確認
2. `outputs/phase-4/test-red-status.md` に記録

**期待される成果物**:

- `outputs/phase-4/test-red-status.md`

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

| 参照資料             | パス                                          | 内容            |
| -------------------- | --------------------------------------------- | --------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`      | 処理フロー設計  |
| インターフェース設計 | `outputs/phase-2/interface-design.md`         | 型/設定設計     |
| 境界検出設計         | `outputs/phase-2/chunk-boundary-algorithm.md` | 境界/プール仕様 |

**依存Phase成果物**

| 参照資料             | パス                                         | 内容         |
| -------------------- | -------------------------------------------- | ------------ |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md` | 要件整理     |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否基準     |
| Phase 3 設計レビュー | `outputs/phase-3/design-review-result.md`    | レビュー結果 |

---

## 成果物

| 成果物              | パス                                                                                                 | 内容             |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                                                              | テスト観点整理   |
| テストケース        | `outputs/phase-4/test-cases.md`                                                                      | ケース一覧       |
| 統合テスト設計      | `outputs/phase-4/integration-test-design.md`                                                         | 統合シナリオ     |
| Red状態記録         | `outputs/phase-4/test-red-status.md`                                                                 | Red結果          |
| 境界検出テスト      | `packages/shared/src/services/chunking/__tests__/chunk-boundary-detector.test.ts`                    | 境界検出のテスト |
| Late Chunkingテスト | `packages/shared/src/services/embedding/__tests__/late-chunking-service.test.ts`                     | プーリング検証   |
| Pipeline統合テスト  | `packages/shared/src/services/embedding/__tests__/pipeline/embedding-pipeline-late-chunking.test.ts` | 統合検証         |

---

## 統合テスト連携（Phase 1〜11は必須）

- PipelineConfig切り替えと出力差分を統合テストシナリオに含める
- エラーハンドリング（非対応プロバイダー時のフォールバック）を統合テスト観点に追加

---

## 完了条件

- [ ] 境界検出器のユニットテストが作成されている
- [ ] プーリング戦略のユニットテストが作成されている
- [ ] Pipeline統合テストが作成されている
- [ ] Red状態が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 4
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

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

- **前提**: Phase 3（設計レビューゲート）の完了
- **後続**: Phase 5（実装）へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
pnpm test -- late-chunking
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-5-implementation.md`
