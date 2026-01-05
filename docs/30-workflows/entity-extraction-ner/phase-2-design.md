# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| Phase名    | 設計                         |
| 前提Phase  | Phase 1 (要件定義)           |
| 後続Phase  | Phase 3 (設計レビューゲート) |
| ステータス | 未実施                       |
| 作成日     | 2026-01-05                   |
| 機能名     | entity-extraction-ner        |

---

## 目的

エンティティ抽出サービスのアーキテクチャ設計、インターフェース設計、クラス設計を行う。

## 背景

Phase 1で定義した要件に基づき、Clean Architectureの原則に従った設計を行う。LLMベースとルールベースの2つの実装を共通インターフェースで抽象化する。

---

## 使用スキル

### スキル1: clean-architecture-principles

**パス**: `.claude/skills/clean-architecture-principles/SKILL.md`

**Trigger条件**: レイヤー分離、依存関係の方向、抽象化設計

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. レイヤー構造を設計
3. 依存関係の方向を確認

**期待される成果物**:

- レイヤー構造図
- 依存関係図

---

### スキル2: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**: TypeScript型定義、Branded Types、型安全性設計

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 型定義を設計
3. Branded Typesの適用を検討

**期待される成果物**:

- 型定義設計書

---

### スキル3: interface-segregation

**パス**: `.claude/skills/interface-segregation/SKILL.md`

**Trigger条件**: インターフェース分離、単一責務

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. インターフェースを設計
3. 責務を分離

**期待される成果物**:

- インターフェース定義

---

## 参照資料

| 参照資料       | パス                                                                    | 内容     |
| -------------- | ----------------------------------------------------------------------- | -------- |
| Phase 1成果物  | `outputs/phase-1/requirements.md`                                       | 要件定義 |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-06-04-entity-extraction-ner.md` | 実装仕様 |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                 | 内容                   |
| -------------- | -------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture.md`  | システムアーキテクチャ |
| サービス層     | `.claude/skills/aiworkflow-requirements/references/service-layer.md` | サービス設計パターン   |

---

## 成果物

| 成果物                 | パス                               | 内容                   |
| ---------------------- | ---------------------------------- | ---------------------- |
| アーキテクチャ設計書   | `outputs/phase-2/architecture.md`  | レイヤー構造・依存関係 |
| インターフェース設計書 | `outputs/phase-2/interfaces.md`    | インターフェース定義   |
| クラス図               | `outputs/phase-2/class-diagram.md` | クラス構造             |

---

## 設計仕様

### ディレクトリ構造

```
packages/shared/src/services/extraction/
├── index.ts                    # エクスポート
├── types.ts                    # 型定義
├── errors.ts                   # エラー定義
├── interfaces.ts               # インターフェース
├── entity-extractor.ts         # LLMEntityExtractor
├── rule-based-extractor.ts     # RuleBasedEntityExtractor
├── prompts/
│   └── entity-extraction-prompt.ts
└── __tests__/
    ├── entity-extractor.test.ts
    └── rule-based-extractor.test.ts
```

### インターフェース設計

```typescript
// IEntityExtractor インターフェース
export interface IEntityExtractor {
  extract(
    chunk: ContentChunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, Error>>;

  extractBatch(
    chunks: ContentChunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, Error>>;

  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[];
}
```

### クラス構造

```
IEntityExtractor (interface)
    ├── LLMEntityExtractor (class)
    │   ├── llmProvider: ILLMProvider
    │   └── entityRepository?: EntityRepository
    └── RuleBasedEntityExtractor (class)
        └── patterns: Map<EntityType, RegExp[]>
```

---

## 完了条件

- [ ] ディレクトリ構造が設計されている
- [ ] インターフェースが定義されている
- [ ] クラス構造が設計されている
- [ ] 型定義が設計されている
- [ ] 依存関係が明確化されている
- [ ] 設計書が `outputs/phase-2/` に出力されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 (設計レビューゲート) へ進む

---

## スキルフィードバック記録

```markdown
## Phase 2 実行記録

### 使用スキル

- clean-architecture-principles: {{result}}
- type-safety-patterns: {{result}}
- interface-segregation: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-3-design-review.md`
