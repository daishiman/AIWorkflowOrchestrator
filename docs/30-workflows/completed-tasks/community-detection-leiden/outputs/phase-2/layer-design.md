# レイヤー設計書: コミュニティ検出 (Leiden)

## メタ情報

| 項目     | 内容                          |
| -------- | ----------------------------- |
| タスクID | CONV-08-02                    |
| タスク名 | コミュニティ検出 (Leiden)     |
| 作成日   | 2026-01-10                    |
| スキル   | clean-architecture-principles |

---

## 1. レイヤー構成

### 1.1 概要

Clean Architectureの原則に基づき、依存関係は外側から内側へ向かう。

```
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  (Frameworks & Drivers)                                          │
│  ─────────────────────                                           │
│  - SQLiteCommunityRepository                                     │
│  - Drizzle ORM                                                   │
│  - Database schemas                                              │
├─────────────────────────────────────────────────────────────────┤
│                    Interface Adapters Layer                      │
│  (Controllers, Gateways, Presenters)                             │
│  ─────────────────────                                           │
│  - CommunityDetector (Application Service)                       │
│  - ICommunityRepository (Port)                                   │
│  - IKnowledgeGraphStore (Port)                                   │
├─────────────────────────────────────────────────────────────────┤
│                    Application Layer                             │
│  (Use Cases)                                                     │
│  ─────────────────────                                           │
│  - ICommunityDetector (Interface)                                │
│  - DetectCommunitiesUseCase                                      │
│  - SaveCommunitiesUseCase                                        │
│  - GetCommunitiesUseCase                                         │
├─────────────────────────────────────────────────────────────────┤
│                    Domain Layer                                  │
│  (Entities, Value Objects, Domain Services)                      │
│  ─────────────────────                                           │
│  - Community (Entity)                                            │
│  - CommunityStructure (Value Object)                             │
│  - CommunityDetectionOptions (Value Object)                      │
│  - LeidenAlgorithm (Domain Service)                              │
│  - Branded Types (EntityId, CommunityId)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 依存方向

```
Infrastructure → Interface Adapters → Application → Domain
      ↓                  ↓                ↓            ↓
   依存元           依存元           依存元        依存先（最内側）
```

---

## 2. 各レイヤーの詳細

### 2.1 Domain Layer（最内側）

**責務**: ビジネスロジックとドメイン概念の表現

**構成要素**:

| 要素                      | 種別           | ファイル            |
| ------------------------- | -------------- | ------------------- |
| Community                 | Entity         | types.ts            |
| CommunityStructure        | Value Object   | types.ts            |
| CommunityDetectionOptions | Value Object   | types.ts            |
| CommunityDetectionResult  | Value Object   | types.ts            |
| GraphEdge                 | Value Object   | types.ts            |
| LeidenAlgorithm           | Domain Service | leiden-algorithm.ts |
| CommunityId               | Branded Type   | types/branded.ts    |

**依存ルール**:

- 外部ライブラリに依存しない
- 他のレイヤーに依存しない
- TypeScriptの標準ライブラリのみ使用可

```typescript
// Domain Layer - 外部依存なし
// packages/shared/src/services/graph/leiden-algorithm.ts

export class LeidenAlgorithm {
  // 純粋な計算ロジックのみ
  // 外部依存なし、副作用なし
  detect(
    nodes: readonly EntityId[],
    edges: readonly GraphEdge[],
    options?: CommunityDetectionOptions,
  ): CommunityDetectionResult {
    // ...
  }
}
```

### 2.2 Application Layer

**責務**: ユースケースの調整、ドメインオブジェクトの協調

**構成要素**:

| 要素               | 種別      | ファイル                                   |
| ------------------ | --------- | ------------------------------------------ |
| ICommunityDetector | Interface | interfaces/community-detector.interface.ts |

**依存ルール**:

- Domain Layerにのみ依存可能
- インターフェース定義が中心
- 具象クラスへの依存禁止

```typescript
// Application Layer - Interface定義
// packages/shared/src/services/graph/interfaces/community-detector.interface.ts

import type { Result } from "@/types/result";
import type {
  Community,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
} from "../types";
import type { EntityId, CommunityId } from "@/types/branded";
import type { StoredEntity } from "@/services/graph/knowledge-graph-store";

export interface ICommunityDetector {
  detect(
    options?: CommunityDetectionOptions,
  ): Promise<Result<CommunityDetectionResult, Error>>;
  saveResults(structure: CommunityStructure): Promise<Result<void, Error>>;
  getCommunitiesForEntity(
    entityId: EntityId,
  ): Promise<Result<Community[], Error>>;
  getCommunitiesByLevel(level: number): Promise<Result<Community[], Error>>;
  getCommunityMembers(
    communityId: CommunityId,
  ): Promise<Result<StoredEntity[], Error>>;
}
```

### 2.3 Interface Adapters Layer

**責務**: 外部システムとドメインの橋渡し

**構成要素**:

| 要素                 | 種別                | ファイル                                     |
| -------------------- | ------------------- | -------------------------------------------- |
| CommunityDetector    | Application Service | community-detector.ts                        |
| ICommunityRepository | Port (Interface)    | interfaces/community-repository.interface.ts |
| IKnowledgeGraphStore | Port (Interface)    | 既存（knowledge-graph-store.ts）             |

**依存ルール**:

- Domain Layerに依存可能
- Application Layerに依存可能
- Infrastructure Layerには依存しない（依存性逆転）

```typescript
// Interface Adapters Layer - Application Service
// packages/shared/src/services/graph/community-detector.ts

import { LeidenAlgorithm } from "./leiden-algorithm";
import type { ICommunityDetector } from "./interfaces/community-detector.interface";
import type { ICommunityRepository } from "./interfaces/community-repository.interface";
import type { IKnowledgeGraphStore } from "./knowledge-graph-store";

export class CommunityDetector implements ICommunityDetector {
  constructor(
    private readonly leiden: LeidenAlgorithm,
    private readonly graphStore: IKnowledgeGraphStore, // Port
    private readonly communityRepo: ICommunityRepository, // Port
  ) {}

  // インターフェースに対してプログラミング
  // 具象クラスには依存しない
}
```

### 2.4 Infrastructure Layer（最外側）

**責務**: 外部システムとの具体的な通信、永続化

**構成要素**:

| 要素                      | 種別    | ファイル                        |
| ------------------------- | ------- | ------------------------------- |
| SQLiteCommunityRepository | Adapter | community-repository.ts         |
| communities schema        | Schema  | db/schema/communities.ts        |
| entity_communities schema | Schema  | db/schema/entity-communities.ts |

**依存ルール**:

- 全レイヤーに依存可能
- Drizzle ORM、SQLite等の外部ライブラリを使用
- インターフェースを実装

```typescript
// Infrastructure Layer - Repository Implementation
// packages/shared/src/services/graph/community-repository.ts

import { eq } from "drizzle-orm";
import { communities, entityCommunities } from "@/db/schema";
import type { ICommunityRepository } from "./interfaces/community-repository.interface";

export class SQLiteCommunityRepository implements ICommunityRepository {
  constructor(private readonly db: DrizzleDB) {}

  // Drizzle ORM等の外部ライブラリに依存
  // ICommunityRepositoryインターフェースを実装
}
```

---

## 3. 境界インターフェース

### 3.1 Port定義

| Port                 | 方向    | 説明                               |
| -------------------- | ------- | ---------------------------------- |
| ICommunityDetector   | Driving | 外部からサービスを呼び出す         |
| ICommunityRepository | Driven  | サービスから永続化層を呼び出す     |
| IKnowledgeGraphStore | Driven  | サービスからグラフストアを呼び出す |

### 3.2 Adapter定義

| Adapter                   | Port                 | 説明                   |
| ------------------------- | -------------------- | ---------------------- |
| SQLiteCommunityRepository | ICommunityRepository | SQLite永続化実装       |
| SQLiteKnowledgeGraphStore | IKnowledgeGraphStore | 既存のグラフストア実装 |

---

## 4. 依存関係マトリクス

```
            │ Domain │ Application │ Interface │ Infrastructure │
────────────┼────────┼─────────────┼───────────┼────────────────┤
Domain      │   -    │      ✗      │     ✗     │       ✗        │
Application │   ✓    │      -      │     ✗     │       ✗        │
Interface   │   ✓    │      ✓      │     -     │       ✗        │
Infrastructure │ ✓   │      ✓      │     ✓     │       -        │

✓ = 依存可能
✗ = 依存禁止
```

---

## 5. ディレクトリ構造

```
packages/shared/src/
├── services/
│   └── graph/
│       ├── types.ts                          # Domain: 型定義
│       ├── leiden-algorithm.ts               # Domain: アルゴリズム
│       ├── interfaces/
│       │   ├── community-detector.interface.ts  # Application: Interface
│       │   └── community-repository.interface.ts # Interface Adapters: Port
│       ├── community-detector.ts             # Interface Adapters: Service
│       ├── community-repository.ts           # Infrastructure: Adapter
│       └── __tests__/
│           ├── leiden-algorithm.test.ts
│           ├── community-detector.test.ts
│           └── community-repository.test.ts
├── db/
│   └── schema/
│       ├── communities.ts                    # Infrastructure: Schema
│       └── entity-communities.ts             # Infrastructure: Schema
└── types/
    └── branded.ts                            # Domain: Branded Types
```

---

## 6. 依存性注入（DI）

### 6.1 ファクトリ関数

```typescript
// packages/shared/src/services/graph/index.ts

import { LeidenAlgorithm } from "./leiden-algorithm";
import { CommunityDetector } from "./community-detector";
import { SQLiteCommunityRepository } from "./community-repository";
import type { IKnowledgeGraphStore } from "./knowledge-graph-store";
import type { DrizzleDB } from "@/db";

/**
 * CommunityDetectorのファクトリ関数
 * 依存性を注入してインスタンスを生成
 */
export function createCommunityDetector(
  db: DrizzleDB,
  graphStore: IKnowledgeGraphStore,
): ICommunityDetector {
  const leiden = new LeidenAlgorithm();
  const communityRepo = new SQLiteCommunityRepository(db);

  return new CommunityDetector(leiden, graphStore, communityRepo);
}
```

### 6.2 テスト時のモック

```typescript
// テスト時のモック注入例

const mockGraphStore: IKnowledgeGraphStore = {
  getEntity: vi.fn(),
  // ...
};

const mockCommunityRepo: ICommunityRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  // ...
};

const detector = new CommunityDetector(
  new LeidenAlgorithm(),
  mockGraphStore,
  mockCommunityRepo,
);
```

---

## 7. レイヤー違反の検出

### 7.1 禁止パターン

| 違反パターン                 | 説明                           |
| ---------------------------- | ------------------------------ |
| Domain → Infrastructure      | ドメインがDB操作を直接呼び出す |
| Domain → Interface Adapters  | ドメインがリポジトリを直接使用 |
| Application → Infrastructure | ユースケースが具象クラスに依存 |
| 循環参照                     | レイヤー間で相互依存           |

### 7.2 検出方法

```typescript
// ESLint import規約で検出

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
// Domain Layerでは以下のimportを禁止
// - drizzle-orm
// - @/db
// - 具象Repositoryクラス
```

---

## 8. レイヤー別テスト戦略

| レイヤー           | テスト種別       | モック対象                |
| ------------------ | ---------------- | ------------------------- |
| Domain             | Unit Test        | なし（純粋関数）          |
| Application        | Unit Test        | なし（Interface定義のみ） |
| Interface Adapters | Unit Test        | Repository, GraphStore    |
| Infrastructure     | Integration Test | 実DB（テスト用）          |

---

## 9. チェックリスト

### 9.1 レイヤー設計確認

- [x] Domain Layerは外部依存がない
- [x] Application Layerはインターフェース定義のみ
- [x] Interface AdaptersはPortを定義している
- [x] InfrastructureはPortを実装している
- [x] 依存方向が外側から内側になっている

### 9.2 依存性逆転確認

- [x] CommunityDetectorはICommunityRepositoryに依存
- [x] CommunityDetectorはIKnowledgeGraphStoreに依存
- [x] 具象クラスへの直接依存がない

---

## 10. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
