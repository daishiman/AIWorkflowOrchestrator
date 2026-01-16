# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 前提Phase  | Phase 1               |
| 後続Phase  | Phase 3               |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

`services/graph/index.ts` のエクスポート構造を設計し、型の再エクスポートパターンを決定する。

## 背景

Phase 1で特定した型群を適切にエクスポートするため、バレルファイル（index.ts）の構造を設計する。TypeScriptの `export type` 構文を使用し、型のみのエクスポートを実現する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存パターンの調査

**目的**: プロジェクト内の既存バレルファイルパターンを把握する

**実行手順**:

1. `packages/shared/src/services/` 配下の他の `index.ts` を確認
2. 使用されているエクスポートパターンを分析
3. 一貫性のあるパターンを特定

**期待される成果物**:

- パターン分析書（出力: `outputs/phase-2/existing-patterns.md`）

**確認対象例**:

```bash
ls packages/shared/src/services/*/index.ts
```

---

### タスク2: エクスポート構造の設計

**目的**: `index.ts` の具体的な構造を設計する

**実行手順**:

1. エクスポートする型をカテゴリ別にグループ化
2. `export type` と `export` の使い分けを決定
3. 再エクスポート順序を決定

**設計方針**:

```typescript
// 型のみの再エクスポート
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
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
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
} from "./types";

// enum と class はそのまま export
export {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "./types";
```

**期待される成果物**:

- 設計書（出力: `outputs/phase-2/export-structure-design.md`）

---

### タスク3: 影響範囲の分析

**目的**: 変更による影響範囲を特定する

**実行手順**:

1. `services/graph/` 配下の既存インポート元を確認
2. 影響を受ける可能性のあるファイルを一覧化
3. 破壊的変更がないことを確認

**期待される成果物**:

- 影響分析書（出力: `outputs/phase-2/impact-analysis.md`）

---

## 参照資料

| 参照資料                             | パス                                                                                      | 内容                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------ |
| モノレポアーキテクチャ               | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | パッケージ依存関係ルール |
| コミュニティ検出インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | Community型の仕様        |
| Phase 1成果物                        | `outputs/phase-1/`                                                                        | 要件定義成果物           |

---

## 成果物

| 成果物             | パス                                         | 内容                       |
| ------------------ | -------------------------------------------- | -------------------------- |
| パターン分析書     | `outputs/phase-2/existing-patterns.md`       | 既存バレルファイルパターン |
| エクスポート設計書 | `outputs/phase-2/export-structure-design.md` | index.ts構造設計           |
| 影響分析書         | `outputs/phase-2/impact-analysis.md`         | 変更影響範囲               |

---

## 統合テスト連携（Phase 1〜11は必須）

### 統合ポイント・契約の設計反映

- `@repo/shared/services/graph` からの型インポートパス設計
- 既存の `services/graph/*.ts` ファイルとの互換性確保
- `types.ts` の内部構造を変更しない（再エクスポートのみ）

---

## 完了条件

- [ ] 既存のバレルファイルパターンが分析されている
- [ ] エクスポート構造が詳細に設計されている
- [ ] `export type` と `export` の使い分けが明確
- [ ] 影響範囲が特定されている
- [ ] 破壊的変更がないことが確認されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 2 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-3-design-review.md`
