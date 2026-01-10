# コミュニティ検出 (Leiden) 実装ガイド

## メタ情報

| 項目   | 内容                       |
| ------ | -------------------------- |
| Phase  | 12                         |
| 作成日 | 2026-01-10                 |
| 機能名 | community-detection-leiden |

---

# Part 1: 概念的説明（中学生でもわかる版）

## Leidenアルゴリズムとは何か？

### 友達グループを見つける方法

学校のクラスを想像してください。30人のクラスメイトがいて、休み時間に誰と誰が一緒にいるかを観察します。

- Aさん、Bさん、Cさんはいつも一緒にお昼を食べる
- Dさん、Eさん、Fさんはサッカー仲間
- Gさん、Hさんは読書好き仲間

このように「よく一緒にいるグループ」を自動的に見つけるのが**コミュニティ検出**です。

### Leidenアルゴリズムの特徴

Leidenアルゴリズムは、このグループ分けを**コンピュータが自動で行う方法**です。

1. **最初**: 全員をバラバラにする（1人1グループ）
2. **試行**: 隣の人と同じグループになったら、全体の「まとまり度」が上がるか計算
3. **改善**: まとまり度が上がるなら、グループを統合
4. **繰り返し**: これ以上良くならないまで繰り返す

### 階層的な構造

さらにLeidenは「グループのグループ」も見つけられます：

```
学年全体
  └── 3年1組（コミュニティ）
       ├── サッカー部グループ
       ├── 読書好きグループ
       └── ゲーム好きグループ
```

## なぜコミュニティ検出が必要なのか？

### Knowledge Graphの課題

AIが文書を読んで作る「知識のネットワーク」（Knowledge Graph）には、何千もの「人」「場所」「概念」がつながっています。

**問題**: 「この文書全体のテーマは何？」と聞かれたとき、何千ものつながりを1つずつ見ていくのは大変。

**解決**: コミュニティ検出で「似たもの同士」をグループ化し、グループ単位で「テーマ」を把握する。

### GraphRAGでの役割

```
ユーザー: 「この会社の主な事業領域は？」

従来のAI: 個別の事実を列挙（断片的）
GraphRAI: コミュニティ単位で要約（全体像）
```

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ

### システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                     CommunityDetector                        │
│                  (ICommunityDetector実装)                    │
├─────────────────────────────────────────────────────────────┤
│  detect()           │ 検出実行（GraphStore連携）             │
│  saveResults()      │ 結果をDBに永続化                       │
│  getCommunitiesForEntity() │ エンティティのコミュニティ取得 │
│  getCommunitiesByLevel()   │ レベル別コミュニティ取得       │
│  getCommunityMembers()     │ コミュニティメンバー取得       │
└───────────┬─────────────────────────────────────────────────┘
            │
            │ 使用
            ▼
┌─────────────────────────────────────────────────────────────┐
│                     LeidenAlgorithm                          │
├─────────────────────────────────────────────────────────────┤
│  detect()           │ Leidenアルゴリズム本体                 │
│  localMovePhase()   │ ローカル移動（モジュラリティ最適化）   │
│  refinementPhase()  │ リファインメント（Leiden特有）         │
│  buildHierarchy()   │ 階層構造構築                           │
└─────────────────────────────────────────────────────────────┘
            │
            │ 依存
            ▼
┌─────────────────────────────────────────────────────────────┐
│  IKnowledgeGraphStore  │  ICommunityRepository               │
│  (グラフデータ取得)    │  (コミュニティ永続化)               │
└─────────────────────────────────────────────────────────────┘
```

### レイヤー構成

```
packages/shared/src/services/graph/
├── leiden-algorithm.ts      # アルゴリズム実装（Pure）
├── community-detector.ts    # サービス層（DI対応）
├── interfaces/
│   ├── community-detector.interface.ts
│   └── community-repository.interface.ts
└── types.ts                 # 型定義
```

## API仕様

### ICommunityDetector

```typescript
interface ICommunityDetector {
  /**
   * グラフからコミュニティを検出
   * @param options - 検出オプション
   * @returns 検出結果（コミュニティ構造、処理時間、イテレーション数）
   */
  detect(
    options?: CommunityDetectionOptions,
  ): Promise<Result<CommunityDetectionResult, Error>>;

  /**
   * 検出結果をDBに保存（既存データは削除）
   * @param structure - 保存するコミュニティ構造
   */
  saveResults(structure: CommunityStructure): Promise<Result<void, Error>>;

  /**
   * エンティティが属するコミュニティを取得
   * @param entityId - エンティティID
   * @returns 全階層レベルのコミュニティ配列
   */
  getCommunitiesForEntity(
    entityId: EntityId,
  ): Promise<Result<Community[], Error>>;

  /**
   * 特定レベルのコミュニティ一覧を取得
   * @param level - 階層レベル（0が最細粒度）
   */
  getCommunitiesByLevel(level: number): Promise<Result<Community[], Error>>;

  /**
   * コミュニティのメンバーエンティティを取得
   * @param communityId - コミュニティID
   */
  getCommunityMembers(
    communityId: CommunityId,
  ): Promise<Result<StoredEntity[], Error>>;
}
```

### CommunityDetectionOptions

```typescript
interface CommunityDetectionOptions {
  /** 解像度パラメータ（大きいほど小さいコミュニティ）デフォルト: 1.0 */
  resolution?: number;

  /** 最大階層レベル デフォルト: 3 */
  maxLevels?: number;

  /** 最小コミュニティサイズ デフォルト: 2 */
  minCommunitySize?: number;

  /** 乱数シード（再現性のため） */
  seed?: number;

  /** 最大イテレーション数 デフォルト: 100 */
  maxIterations?: number;
}
```

### Community型

```typescript
interface Community {
  id: CommunityId;
  level: number; // 階層レベル（0が最細粒度）
  memberEntityIds: EntityId[]; // メンバーエンティティ
  parentCommunityId?: CommunityId; // 親コミュニティ（レベル1+）
  childCommunityIds: CommunityId[]; // 子コミュニティ
  size: number; // メンバー数
  internalEdges: number; // 内部エッジ数
  externalEdges: number; // 外部エッジ数
  modularity: number; // モジュラリティスコア
  createdAt: Date;
  updatedAt: Date;
}
```

## 使用例

### 基本的なコミュニティ検出

```typescript
import { CommunityDetector } from "./community-detector";
import { LeidenAlgorithm } from "./leiden-algorithm";

// 初期化
const leiden = new LeidenAlgorithm();
const detector = new CommunityDetector(
  leiden,
  graphStore, // IKnowledgeGraphStore
  communityRepo, // ICommunityRepository
);

// 検出実行
const result = await detector.detect({ resolution: 1.0 });

if (result.ok) {
  console.log(
    `検出コミュニティ数: ${result.value.structure.communities.length}`,
  );
  console.log(`モジュラリティ: ${result.value.structure.totalModularity}`);
  console.log(`処理時間: ${result.value.processingTimeMs}ms`);

  // 結果を永続化
  await detector.saveResults(result.value.structure);
}
```

### 階層的コミュニティの取得

```typescript
// レベル0（最細粒度）のコミュニティを取得
const level0 = await detector.getCommunitiesByLevel(0);

// エンティティが属するコミュニティを取得（全階層）
const communities = await detector.getCommunitiesForEntity(entityId);

// コミュニティのメンバーを取得
const members = await detector.getCommunityMembers(communityId);
```

### パラメータ調整

```typescript
// 小さいコミュニティを多く検出
const fineGrained = await detector.detect({ resolution: 2.0 });

// 大きいコミュニティを少なく検出
const coarseGrained = await detector.detect({ resolution: 0.5 });

// 再現性のためseed指定
const reproducible = await detector.detect({ seed: 42 });
```

## 設計決定の理由

### 1. Hexagonal Architecture（Ports and Adapters）の採用

**理由**:

- テスト容易性: モックによる単体テストが容易
- 依存性の分離: アルゴリズムとインフラを分離
- 将来の拡張性: DB変更時の影響を最小化

### 2. Result型によるエラーハンドリング

**理由**:

- 型安全なエラー処理
- 例外の明示的な伝播
- Railway-Oriented Programming

### 3. Branded型（EntityId, CommunityId）

**理由**:

- コンパイル時の型安全性
- 文字列との混同防止
- ドメインの明確化

### 4. Pure Function + DI

**理由**:

- LeidenAlgorithmは純粋関数的（副作用なし）
- CommunityDetectorはDIでインフラ層と結合
- テストとメンテナンス性の向上

## 用語集

| 用語             | 説明                                           |
| ---------------- | ---------------------------------------------- |
| コミュニティ     | グラフ内で密に接続されたノードの集合           |
| モジュラリティ   | コミュニティ分割の品質指標（-0.5〜1.0）        |
| 解像度           | 検出するコミュニティの粒度を制御するパラメータ |
| 階層レベル       | コミュニティの入れ子の深さ（0が最細粒度）      |
| リファインメント | Leiden特有の品質改善フェーズ                   |
| EntityId         | エンティティの一意識別子（Branded型）          |
| CommunityId      | コミュニティの一意識別子（Branded型）          |

## パフォーマンス特性

| グラフサイズ | 処理時間目安 |
| ------------ | ------------ |
| 10ノード     | < 50ms       |
| 50ノード     | < 200ms      |
| 100ノード    | < 500ms      |
| 1000ノード   | < 10秒       |

## 制約事項

- **最大ノード数**: メモリ依存（隣接リスト表現）
- **最大レベル数**: 実用上は3-5レベル
- **seed未指定時**: 結果は非決定的

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
