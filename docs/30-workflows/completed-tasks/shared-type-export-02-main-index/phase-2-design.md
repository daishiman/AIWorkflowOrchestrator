# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| Phase名    | 設計                             |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-14                       |
| 機能名     | shared-type-export-02-main-index |

---

## 目的

`packages/shared/index.ts`に追加するエクスポート文を設計し、実装可能な形で定義する。

## 背景

Phase 1で特定した必要な型を、メインエントリポイントからエクスポートするための具体的なコード設計を行う。既存のエクスポート構造との整合性を保ちながら、新しいエクスポートを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エクスポート追加位置を決定

**目的**: 新しいエクスポートを追加する位置を決定する

**実行手順**:

1. 現在の`packages/shared/index.ts`の構造を確認:

```typescript
// Types
export * from "./types";

// Skill types from src/types
export * from "./src/types/skill";

// Agent Execution types (AGENT-005)
export * from "./src/types/agent-execution";

// Core
export * from "./core";

// Infrastructure
export * from "./infrastructure";

// Utils
export * from "./utils";

// Slide
export * from "./src/slide";
```

2. 追加位置の決定:
   - `// Services` セクションを新規追加
   - `// Infrastructure` の後に配置

**期待される成果物**:

- エクスポート追加位置の決定

---

### タスク2: エクスポート文を設計

**目的**: 追加するエクスポート文の具体的なコードを設計する

**実行手順**:

1. services/graph からの型エクスポートを設計:

```typescript
// =============================================================================
// Services
// =============================================================================

/**
 * Graph Service - Community関連型
 * @see packages/shared/src/services/graph/index.ts
 */
export type {
  // Entity関連
  StoredEntity,
  ExtractedEntity,
  EntityMention,
  // Relation関連
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
  // Graph関連
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  // Community関連
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
  // Query関連
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./src/services/graph";

/**
 * Graph Service - 値（enum, class, function）
 */
export {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "./src/services/graph";
```

2. types/rag/branded からの型エクスポートを確認:
   - 既存の `export * from "./types"` で含まれているか確認
   - 含まれていない場合は明示的にエクスポートを追加

**期待される成果物**:

- 設計されたエクスポート文のコード

---

### タスク3: 循環参照の可能性を分析

**目的**: 追加するエクスポートが循環参照を引き起こさないことを確認する

**実行手順**:

1. 依存関係を分析:
   - `index.ts` → `./src/services/graph/index.ts`
   - `services/graph/index.ts` → `./types`
   - `services/graph/types.ts` → `../../types/rag/branded` (CommunityId, EntityId)

2. 循環参照チェック:
   - `services/graph` は `index.ts` に依存していない ✓
   - `types/rag/branded` は `services/graph` に依存していない ✓

3. 結論: 循環参照は発生しない

**期待される成果物**:

- 循環参照分析結果

---

### タスク4: 設計書を作成

**目的**: Phase 3でレビューするための設計書を作成する

**実行手順**:

1. 以下の内容を含む設計書を作成:
   - 追加するエクスポート文
   - 追加位置
   - 影響範囲
   - 互換性への影響

**期待される成果物**:

- 設計書（`outputs/phase-2/design.md`）

---

## 参照資料

| 参照資料                | パス                                          | 内容             |
| ----------------------- | --------------------------------------------- | ---------------- |
| メインindex.ts          | `packages/shared/index.ts`                    | 更新対象ファイル |
| services/graph/index.ts | `packages/shared/src/services/graph/index.ts` | エクスポート元   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン |
| インターフェース仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`        | RAG型インターフェース  |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "type export"`

---

## 成果物

| 成果物 | パス                        | 内容                 |
| ------ | --------------------------- | -------------------- |
| 設計書 | `outputs/phase-2/design.md` | エクスポート文の設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での統合テスト連携

型エクスポートのみのタスクのため、統合ポイントは最小限:

- **インターフェース境界**: `@repo/shared` パッケージのエクスポートAPI
- **契約定義**: TypeScript型定義による静的契約

---

## 完了条件

- [ ] エクスポート追加位置が決定されている
- [ ] エクスポート文の具体的なコードが設計されている
- [ ] 循環参照が発生しないことが確認されている
- [ ] 設計書が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json`のPhase 2ステータスを更新

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-02-main-index/phase-3-design-review.md`
