# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| Phase名    | 要件定義                         |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-18                       |
| 機能名     | CONV-06-04-entity-extraction-ner |

---

## 目的

エンティティ抽出サービス（NER）の機能要件・非機能要件を明確化し、実装の指針を定める。

## 背景

HybridRAGパイプラインでGraphRAGによる高精度検索（90%+）を実現するために、ドキュメントからエンティティを抽出しKnowledge Graphを構築する必要がある。本Phaseでは、NERサービスに求められる全ての要件を洗い出し文書化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: NERサービスに必要な機能を網羅的に定義する

**実行手順**:

1. IEntityExtractorインターフェースの必要メソッドを定義
2. 対応するエンティティタイプ（person, organization, technology, concept, location, event）を定義
3. 抽出オプション（ExtractionOptions）の項目を定義
4. 出力形式（ExtractedEntity）の構造を定義
5. バッチ処理の仕様を定義

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`

---

### タスク2: 非機能要件の定義

**目的**: 性能・信頼性・セキュリティ等の非機能要件を定義する

**実行手順**:

1. 性能要件（処理速度、スループット）を定義
2. 信頼性要件（エラーハンドリング、フォールバック）を定義
3. セキュリティ要件（入力検証、出力サニタイズ）を定義
4. 可用性要件（オフライン対応、LLM障害時の挙動）を定義
5. テスト容易性要件（モック可能性、依存注入）を定義

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md`

---

### タスク3: 受け入れ基準の定義

**目的**: タスク完了を判定するための明確な基準を定義する

**実行手順**:

1. 必須機能の受け入れ基準を定義
2. テストカバレッジ基準を定義
3. 品質基準（Lint、型チェック）を定義
4. ドキュメント基準を定義

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料             | パス                                                                              | 内容                |
| -------------------- | --------------------------------------------------------------------------------- | ------------------- |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`           | NERサービス設計仕様 |
| APIエンドポイント    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | NER API仕様         |
| エンティティスキーマ | `packages/shared/src/types/rag/knowledge-graph/`                                  | EntityEntity型定義  |
| アーキテクチャ概要   | `docs/30-workflows/unassigned-task/task-**-architecture-overview-rag-pipeline.md` | HybridRAG全体設計   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                    | 内容                    |
| ------------------- | ----------------------------------------------------------------------- | ----------------------- |
| architecture-rag.md | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | NERサービス位置づけ     |
| database-schema.md  | `.claude/skills/aiworkflow-requirements/references/database-schema.md`  | entities/chunk_entities |
| interfaces-rag.md   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`   | RAG共通インターフェース |

---

## 成果物

| 成果物         | パス                                             | 内容             |
| -------------- | ------------------------------------------------ | ---------------- |
| 機能要件書     | `outputs/phase-1/functional-requirements.md`     | 機能要件定義     |
| 非機能要件書   | `outputs/phase-1/non-functional-requirements.md` | 非機能要件定義   |
| 受け入れ基準書 | `outputs/phase-1/acceptance-criteria.md`         | 受け入れ基準定義 |

---

## 統合テスト連携

- LLM API接続要件を明記（Claude API / OpenAI API）
- チャンク入力インターフェース（ChunkEntity）を定義
- entities/chunk_entitiesテーブルへの永続化要件を定義
- Knowledge Graphサービスとの連携インターフェースを定義

---

## 完了条件

- [ ] 機能要件書が作成され、全機能が網羅されている
- [ ] 非機能要件書が作成され、性能・信頼性・セキュリティ要件が定義されている
- [ ] 受け入れ基準書が作成され、明確な完了判定基準が定義されている
- [ ] 全成果物がoutputs/phase-1/に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-06-04-entity-extraction-ner/phase-2-design.md`
