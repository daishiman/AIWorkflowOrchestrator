# コミュニティ検出インターフェース仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: .claude/skills/aiworkflow-requirements/references/

---

## 概要

### 目的

コミュニティ検出サービスはRAGパイプラインにおけるKnowledge Graphの構造分析を担当する。Leidenアルゴリズムを使用して、意味的に関連するエンティティのクラスタ（コミュニティ）を自動検出する。

### スコープ

| スコープ内                   | スコープ外                                        |
| --------------------------- | ------------------------------------------------- |
| Leidenアルゴリズム実装       | グラフ可視化                                       |
| 階層的コミュニティ構造       | リアルタイム更新検出                               |
| コミュニティ永続化           | 分散グラフ処理                                     |
| エンティティ→コミュニティ検索 | **コミュニティ要約（→ interfaces-rag-community-summarization.md）** |

---

## 要件

### 機能要件

| ID     | 要件                       | 優先度 | 説明                                               |
| ------ | -------------------------- | ------ | -------------------------------------------------- |
| FR-001 | コミュニティ検出           | 必須   | Leidenアルゴリズムによるコミュニティ検出           |
| FR-002 | 階層構造サポート           | 必須   | 複数レベルの階層的コミュニティ                     |
| FR-003 | 永続化                     | 必須   | 検出結果のデータベース保存                         |
| FR-004 | エンティティ検索           | 必須   | エンティティIDからコミュニティ取得                 |
| FR-005 | レベル検索                 | 必須   | 階層レベルでコミュニティフィルタリング             |
| FR-006 | メンバー取得               | 必須   | コミュニティのメンバーエンティティ取得             |
| FR-007 | 再現性サポート             | 推奨   | seedパラメータによる結果再現                       |

### 非機能要件

| 項目           | 要件                     | 基準                     |
| -------------- | ------------------------ | ------------------------ |
| パフォーマンス | 検出処理時間             | 100ノード < 500ms        |
| メモリ効率     | 隣接リスト表現           | O(V + E)                 |
| 型安全性       | Branded Types使用        | EntityId, CommunityId    |
| エラー処理     | Result型パターン         | ok/err による明示的処理  |

---

## 設計

### アーキテクチャ

**実装場所**: `packages/shared/src/services/graph/`

```
┌────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (GraphRAG Query, Community Summary Generation)         │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│              ICommunityDetector (Interface)             │
│  - detect() コミュニティ検出                            │
│  - saveResults() 結果永続化                             │
│  - getCommunitiesForEntity() エンティティ→コミュニティ  │
│  - getCommunitiesByLevel() レベル別取得                 │
│  - getCommunityMembers() メンバー取得                   │
└────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌───────────────────────┐    ┌───────────────────────┐
│    LeidenAlgorithm    │    │ ICommunityRepository  │
│    (Pure Function)    │    │    (Persistence)      │
│  - detect()           │    │  - insert()           │
│  - localMovePhase()   │    │  - findById()         │
│  - refinementPhase()  │    │  - findByEntityId()   │
│  - buildHierarchy()   │    │  - findByLevel()      │
└───────────────────────┘    │  - deleteAll()        │
                             └───────────────────────┘
                                        │
                                        ▼
                             ┌───────────────────────┐
                             │    SQLite Database    │
                             │  - communities        │
                             │  - entity_communities │
                             └───────────────────────┘
```

### Leidenアルゴリズムフロー

1. **Local Move Phase**: 各ノードを最適なコミュニティへ移動
2. **Refinement Phase**: コミュニティ内でさらに最適化
3. **Aggregation Phase**: コミュニティをノードとして集約
4. **Hierarchy Build**: 階層構造を構築

---

## インターフェース定義

### ICommunityDetector

コミュニティ検出サービスのメインインターフェース。

| メソッド                         | 戻り値                                           | 説明                               |
| -------------------------------- | ------------------------------------------------ | ---------------------------------- |
| detect(options?)                 | Result<CommunityDetectionResult, Error>          | コミュニティを検出                 |
| saveResults(structure)           | Result<void, Error>                              | 検出結果をDBに保存                 |
| getCommunitiesForEntity(entityId)| Result<Community[], Error>                       | エンティティのコミュニティ取得     |
| getCommunitiesByLevel(level)     | Result<Community[], Error>                       | レベル別コミュニティ取得           |
| getCommunityMembers(communityId) | Result<StoredEntity[], Error>                    | コミュニティのメンバー取得         |

### ICommunityRepository

コミュニティデータの永続化インターフェース。

| メソッド                         | 戻り値                                | 説明                               |
| -------------------------------- | ------------------------------------- | ---------------------------------- |
| insert(community)                | Result<Community, Error>              | コミュニティ挿入                   |
| insertMany(communities)          | Result<Community[], Error>            | 一括挿入                           |
| findById(id)                     | Result<Community \| null, Error>      | IDで取得                           |
| findByEntityId(entityId)         | Result<Community[], Error>            | エンティティIDで取得               |
| findByLevel(level)               | Result<Community[], Error>            | レベルで取得                       |
| deleteAll()                      | Result<void, Error>                   | 全削除                             |
| addEntityCommunityMapping(...)   | Result<void, Error>                   | マッピング追加                     |
| addEntityCommunityMappings(...)  | Result<void, Error>                   | マッピング一括追加                 |

---

## 型定義

### Community型

| プロパティ         | 型                    | 必須 | 説明                           |
| ------------------ | --------------------- | ---- | ------------------------------ |
| id                 | CommunityId           | ✅   | 一意識別子（Branded Type）     |
| level              | number                | ✅   | 階層レベル（0が最下層）        |
| memberEntityIds    | EntityId[]            | ✅   | 直接メンバーエンティティID     |
| childCommunityIds  | CommunityId[]         | ✅   | 子コミュニティID               |
| parentCommunityId  | CommunityId?          | -    | 親コミュニティID               |
| size               | number                | ✅   | コミュニティサイズ             |
| internalEdges      | number                | ✅   | 内部エッジ数                   |
| externalEdges      | number                | ✅   | 外部エッジ数                   |
| modularity         | number                | ✅   | モジュラリティ貢献             |
| summary            | string?               | -    | コミュニティ要約（LLM生成）    |
| createdAt          | Date                  | ✅   | 作成日時                       |
| updatedAt          | Date                  | ✅   | 更新日時                       |

### CommunityDetectionOptions型

| プロパティ         | 型      | デフォルト | 説明                           |
| ------------------ | ------- | ---------- | ------------------------------ |
| resolution         | number  | 1.0        | 解像度（大→小コミュニティ多）  |
| maxLevels          | number  | 3          | 最大階層レベル数               |
| minCommunitySize   | number  | 2          | 最小コミュニティサイズ         |
| maxIterations      | number  | 100        | 最大イテレーション数           |
| seed               | number? | -          | 乱数シード（再現性用）         |

### CommunityDetectionResult型

| プロパティ         | 型                            | 説明                           |
| ------------------ | ----------------------------- | ------------------------------ |
| structure          | CommunityStructure            | コミュニティ構造               |
| processingTimeMs   | number                        | 処理時間（ミリ秒）             |
| options            | Required<DetectionOptions>    | 使用オプション                 |
| stats              | CommunityDetectionStats       | 処理統計                       |

### CommunityStructure型

| プロパティ         | 型                                       | 説明                           |
| ------------------ | ---------------------------------------- | ------------------------------ |
| communities        | Community[]                              | 全コミュニティ                 |
| levels             | number                                   | 階層レベル数                   |
| totalModularity    | number                                   | グラフ全体のモジュラリティ     |
| entityToCommunity  | Map<EntityId, CommunityId[]>             | エンティティ→コミュニティ      |

---

## エラー型

| エラーコード         | 説明                                 |
| -------------------- | ------------------------------------ |
| GRAPH_LOAD_FAILED    | グラフデータ読み込み失敗             |
| DETECTION_FAILED     | 検出処理失敗                         |
| SAVE_FAILED          | 永続化失敗                           |
| NOT_FOUND            | コミュニティが見つからない           |
| INVALID_PARAMETER    | 無効なパラメータ                     |

---

## 使用例

### インポート方法

```typescript
// 型のインポート（推奨：バレルファイルから）
import type {
  Community,
  CommunitySummary,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityStructure,
} from "@repo/shared/services/graph";

// 値のインポート（エラー型、enum、関数）
import {
  CommunityErrorCode,
  CommunityDetectionError,
  normalizeEntityName,
} from "@repo/shared/services/graph";
```

### 基本的なコミュニティ検出

```typescript
import type { CommunityDetectionResult } from "@repo/shared/services/graph";
import { CommunityDetector } from "@repo/shared/services/graph";

const detector = new CommunityDetector(
  leidenAlgorithm,
  graphStore,
  communityRepo
);

// 検出実行
const result = await detector.detect({ resolution: 1.0 });
if (result.ok) {
  console.log(`Found ${result.value.structure.communities.length} communities`);
  console.log(`Modularity: ${result.value.structure.totalModularity}`);

  // 結果を永続化
  await detector.saveResults(result.value.structure);
}
```

### エンティティのコミュニティ取得

```typescript
// エンティティが属するコミュニティを取得（全階層）
const communities = await detector.getCommunitiesForEntity(entityId);

// 特定レベルのコミュニティを取得
const level0Communities = await detector.getCommunitiesByLevel(0);
```

---

## 実装ガイドライン

### コーディング規約

| 項目           | 規約                        | 理由                               |
| -------------- | --------------------------- | ---------------------------------- |
| エラー処理     | Result<T, Error>パターン    | 明示的なエラーハンドリング         |
| ID型           | Branded Types使用           | コンパイル時の型安全性確保         |
| 純粋関数       | LeidenAlgorithmは副作用なし | テスタビリティ向上                 |
| DI             | インターフェース注入        | テストとメンテナンス性向上         |

### テスト要件

| テスト種別 | 対象                       | カバレッジ目標 | 必須ケース                     |
| ---------- | -------------------------- | -------------- | ------------------------------ |
| 単体テスト | LeidenAlgorithm            | 80%+           | 正常系、境界値、収束テスト     |
| 単体テスト | CommunityDetector          | 80%+           | CRUD、エラーハンドリング       |
| 統合テスト | E2Eフロー                  | -              | 検出→保存→取得                 |

**達成済みカバレッジ**: Line 92.06%, Branch 81.30%, Function 100%

---

## 関連ドキュメント

| ドキュメント                             | 説明                                 |
| ---------------------------------------- | ------------------------------------ |
| interfaces-rag.md                        | RAG全体インターフェース仕様          |
| interfaces-rag-knowledge-graph-store.md  | Knowledge Graphストア仕様            |
| **interfaces-rag-community-summarization.md** | **コミュニティ要約インターフェース仕様** |
| architecture-rag.md                      | RAGアーキテクチャ設計                |
| database-schema.md                       | データベーススキーマ定義             |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-01-22 | 1.2.0      | バレルファイルからのインポート例追加（SHARED-TYPE-EXPORT-01完了） |
| 2026-01-11 | 1.1.0      | コミュニティ要約仕様への参照追加（CONV-08-03完了）     |
| 2026-01-10 | 1.0.0      | 初版作成（CONV-08-02タスク完了に伴い）                 |
