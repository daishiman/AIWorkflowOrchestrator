# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| 前提Phase  | なし（開始Phase）       |
| 後続Phase  | Phase 2（設計）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | embedding-late-chunking |

---

## 目的

Late Chunkingの機能要件・非機能要件・受け入れ基準を明文化し、設計と実装の判断基準を固定する。

## 背景

既存のチャンキング手法ではチャンク境界で文脈が失われ、検索品質が低下する課題がある。トークンレベル埋め込みを活用したLate Chunkingを導入するため、要件を整理する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件・非機能要件の抽出

**目的**: Late Chunkingに必要な要件を明確化する

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-embedding-late-chunking.md` を読み要件を抽出
2. トークン埋め込み取得、チャンク境界検出、プーリング戦略、Pipeline統合を機能要件として整理
3. パフォーマンス/メモリ/プロバイダー制約を非機能要件として整理
4. `outputs/phase-1/requirements-definition.md` に記録

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 受け入れ基準の定義

**目的**: 実装後に検証可能な受け入れ基準を定義する

**実行手順**:

1. Late Chunkingの切り替え可否、プーリング戦略動作、品質向上指標を基準化
2. ベンチマーク指標（検索精度、処理時間、メモリ）を明確化
3. `outputs/phase-1/acceptance-criteria.md` に記録

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: スコープと依存関係の確定

**目的**: 対象範囲と依存条件を明確にする

**実行手順**:

1. 対応モデルの範囲（トークン埋め込み対応）を明記
2. UI/UX変更や自動最適化がスコープ外であることを明記
3. `outputs/phase-1/scope-definition.md` に記録

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                                    | パス                                                                                   | 内容                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| Embedding Generation Pipelineアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | パイプライン構成とチャンキング/埋め込みの責務 |
| Embedding Generation API                    | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | EmbeddingPipeline/ChunkingServiceのAPI仕様    |
| チャンク・埋め込み型定義                    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`  | チャンク/埋め込みエンティティと設定値         |

**ユーザー指示**

| 参照資料            | パス                                                                | 内容                       |
| ------------------- | ------------------------------------------------------------------- | -------------------------- |
| Late Chunking指示書 | `docs/30-workflows/unassigned-task/task-embedding-late-chunking.md` | 背景・目的・スコープの整理 |

---

## 成果物

| 成果物       | パス                                         | 内容                  |
| ------------ | -------------------------------------------- | --------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 機能/非機能要件の整理 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な合否基準    |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象/非対象/依存条件  |

---

## 統合テスト連携（Phase 1〜11は必須）

- Late Chunking有効時のデータフロー（chunking→embedding→storage）要件を明記
- トークン埋め込み対応プロバイダー前提を統合テスト前提条件として記載

---

## 完了条件

- [ ] 機能要件と非機能要件が明文化されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] スコープと依存条件が明確化されている
- [ ] 参照仕様との整合が確認されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/embedding-late-chunking --phase 1
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

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

- **前提**: なし（開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/embedding-late-chunking/phase-2-design.md`
