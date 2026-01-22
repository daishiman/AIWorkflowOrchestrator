# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| Phase名    | 設計                             |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-18                       |
| 機能名     | CONV-06-04-entity-extraction-ner |

---

## 目的

エンティティ抽出サービス（NER）のアーキテクチャ設計・詳細設計を行い、実装の青写真を作成する。

## 背景

Phase 1で定義した要件に基づき、IEntityExtractorインターフェース、LLMEntityExtractor、RuleBasedEntityExtractorの設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: NERサービスの全体構造を設計する

**実行手順**:

1. コンポーネント図を作成
2. IEntityExtractorインターフェースを設計
3. LLMEntityExtractorのクラス設計
4. RuleBasedEntityExtractorのクラス設計
5. 依存関係（LLMプロバイダー、リポジトリ）を設計

**期待される成果物**:

- `outputs/phase-2/architecture.md`

---

### タスク2: 詳細設計

**目的**: 各コンポーネントの詳細仕様を設計する

**実行手順**:

1. IEntityExtractor各メソッドの入出力仕様を定義
2. ExtractionOptions型の詳細設計
3. ExtractedEntity型の詳細設計
4. エラー型（EntityExtractionError）の設計
5. プロンプト設計（LLMEntityExtractor用）

**期待される成果物**:

- `outputs/phase-2/detailed-design.md`

---

### タスク3: データフロー設計

**目的**: NERサービスのデータフローを設計する

**実行手順**:

1. 入力（ChunkEntity）から出力（ExtractedEntity[]）までのフローを設計
2. LLM呼び出しフローを設計
3. バッチ処理フローを設計
4. エラーハンドリングフローを設計
5. 永続化フロー（entities/chunk_entitiesテーブル）を設計

**期待される成果物**:

- `outputs/phase-2/data-flow.md`

---

### タスク4: ディレクトリ構成設計

**目的**: 実装ファイルの配置を設計する

**実行手順**:

1. packages/shared/src/services/extraction/配下の構成を設計
2. 型定義ファイル（types.ts）の構成を設計
3. プロンプトファイル（prompts/）の構成を設計
4. テストファイル（**tests**/）の構成を設計

**期待される成果物**:

- `outputs/phase-2/directory-structure.md`

---

## 参照資料

| 参照資料          | パス                                                                    | 内容                |
| ----------------- | ----------------------------------------------------------------------- | ------------------- |
| Phase 1成果物     | `outputs/phase-1/`                                                      | 要件定義            |
| RAGアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | NERサービス設計仕様 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                    | 内容                    |
| ------------------- | ----------------------------------------------------------------------- | ----------------------- |
| architecture-rag.md | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | NERサービス位置づけ     |
| interfaces-rag.md   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`   | RAG共通インターフェース |

---

## 成果物

| 成果物             | パス                                     | 内容                 |
| ------------------ | ---------------------------------------- | -------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture.md`        | 全体構造設計         |
| 詳細設計           | `outputs/phase-2/detailed-design.md`     | 各コンポーネント仕様 |
| データフロー設計   | `outputs/phase-2/data-flow.md`           | データフロー図       |
| ディレクトリ構成   | `outputs/phase-2/directory-structure.md` | ファイル配置設計     |

---

## 統合テスト連携

- IEntityExtractor統合ポイントを設計に明記
- LLMプロバイダーとの連携インターフェースを設計
- entities/chunk_entitiesテーブルへの永続化フローを設計

---

## 完了条件

- [ ] アーキテクチャ設計書が作成されている
- [ ] 詳細設計書が作成されている
- [ ] データフロー設計書が作成されている
- [ ] ディレクトリ構成設計書が作成されている
- [ ] 全成果物がoutputs/phase-2/に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-06-04-entity-extraction-ner/phase-3-design-review.md`
