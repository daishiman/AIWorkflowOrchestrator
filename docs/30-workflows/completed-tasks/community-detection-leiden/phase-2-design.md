# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 2                          |
| Phase名    | 設計                       |
| 前提Phase  | Phase 1 (要件定義)         |
| 後続Phase  | Phase 3 (設計レビュー)     |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。Leidenアルゴリズムのアーキテクチャとドメインモデルを設計する。

## 背景

Leidenアルゴリズムは3フェーズ（ローカル移動、リファインメント、集約）で構成される。既存のKnowledge Graphストア（IKnowledgeGraphStore）と連携し、CommunityRepositoryを通じてDB保存を行う設計が必要。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: architectural-patterns

**パス**: `.claude/skills/architectural-patterns/SKILL.md`

**Trigger条件**:
システムアーキテクチャの設計、コンポーネント分割が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`（アーキテクチャ設計書）

---

### スキル2: domain-modeling

**パス**: `.claude/skills/domain-modeling/SKILL.md`

**Trigger条件**:
ドメインモデル（エンティティ、値オブジェクト、集約）の設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/domain-model.md`（ドメインモデル設計書）

---

### スキル3: clean-architecture-principles

**パス**: `.claude/skills/clean-architecture-principles/SKILL.md`

**Trigger条件**:
レイヤー分離、依存性逆転の原則に基づく設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/layer-design.md`（レイヤー設計書）

---

## 参照資料

| 参照資料            | パス                                                                           | 内容                      |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| Phase 1成果物       | `outputs/phase-1/requirements-definition.md`                                   | 要件定義                  |
| RAGアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`        | Knowledge Graph型定義     |
| RAGインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`          | RAG共通インターフェース   |
| データベース実装    | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Knowledge Graphテーブル群 |

---

## 成果物

| 成果物               | パス                                     | 内容                 |
| -------------------- | ---------------------------------------- | -------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | システム構造設計     |
| ドメインモデル       | `outputs/phase-2/domain-model.md`        | エンティティ・型設計 |
| レイヤー設計書       | `outputs/phase-2/layer-design.md`        | レイヤー分離設計     |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント                        | 契約定義                                   |
| ----------------------------------- | ------------------------------------------ |
| CommunityDetector → GraphStore      | IKnowledgeGraphStore.getEntity/getRelation |
| CommunityDetector → Repository      | CommunityRepository.insert/findByLevel     |
| LeidenAlgorithm → CommunityDetector | detect() → CommunityDetectionResult        |

---

## 設計指針

### コンポーネント構成

```
┌─────────────────────────────────────────────────────┐
│                  CommunityDetector                   │
│  (ICommunityDetector 実装)                           │
├─────────────────────────────────────────────────────┤
│  - detect()                                          │
│  - saveResults()                                     │
│  - getCommunitiesForEntity()                        │
│  - getCommunitiesByLevel()                          │
│  - getCommunityMembers()                            │
└────────────────┬────────────────────────────────────┘
                 │ 依存
                 ▼
┌─────────────────────────────────────────────────────┐
│              LeidenAlgorithm                         │
│  (純粋なアルゴリズム実装)                            │
├─────────────────────────────────────────────────────┤
│  - detect(nodes, edges, options)                    │
│  - localMovePhase()                                 │
│  - refinementPhase()                                │
│  - aggregateGraph()                                 │
│  - buildHierarchy()                                 │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  IKnowledgeGraphStore    │  CommunityRepository     │
│  (既存)                  │  (新規)                  │
└─────────────────────────────────────────────────────┘
```

### 主要型定義

```typescript
// Community エンティティ
interface Community {
  id: CommunityId;
  level: number;
  memberEntityIds: EntityId[];
  parentCommunityId?: CommunityId;
  childCommunityIds: CommunityId[];
  size: number;
  modularity: number;
  summary?: string;
  summaryEmbedding?: number[];
}

// 検出オプション
interface CommunityDetectionOptions {
  resolution?: number; // デフォルト: 1.0
  maxLevels?: number; // デフォルト: 3
  minCommunitySize?: number; // デフォルト: 2
  maxIterations?: number; // デフォルト: 100
  seed?: number; // 再現性用
}
```

---

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] ドメインモデルが作成されている（Community, CommunityStructure等）
- [ ] レイヤー分離が設計されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                        | 結果 | 備考 |
| ----------------------------- | ---- | ---- |
| architectural-patterns        |      |      |
| domain-modeling               |      |      |
| clean-architecture-principles |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-3-design-review.md`
