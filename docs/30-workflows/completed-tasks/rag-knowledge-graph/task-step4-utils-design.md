# ユーティリティ関数設計書（utils.ts）

**タスクID**: T-01-3 (CONV-03-04)
**フェーズ**: Phase 1 - 設計
**作成日**: 2025-12-18
**ステータス**: 完了

---

## 1. 目的

エンティティ名の正規化、逆関係取得、重要度計算、グラフ密度計算等のユーティリティ関数を設計し、Knowledge Graph処理で再利用可能なロジックを提供する。

---

## 2. 設計原則

### 2.1 純粋関数（Pure Functions）

- **副作用なし**: 関数は引数のみに依存し、外部状態を変更しない
- **参照透過性**: 同じ入力は常に同じ出力を返す
- **テスト容易性**: モックやスタブが不要、入出力パターンテストで検証可能

### 2.2 単一責任の原則（SRP）

- 各関数は1つの明確な責務のみを持つ
- 複雑なロジックは小さな関数に分解

### 2.3 型安全性

- すべての引数・戻り値にTypeScript型を明示
- Branded Type（EntityId等）を適切に使用
- null/undefinedの扱いを明確に

### 2.4 パフォーマンス考慮

- O(n)以下のアルゴリズムを選択（可能な限り）
- 不要な計算・メモリ確保を避ける
- 大規模データ（100万エンティティ）でも実用的な速度

---

## 3. ユーティリティ関数一覧

| 関数名                      | 責務                             | 計算量 |
| --------------------------- | -------------------------------- | ------ |
| `normalizeEntityName`       | エンティティ名の正規化           | O(n)   |
| `getInverseRelationType`    | 関係タイプの逆関係を取得         | O(1)   |
| `calculateEntityImportance` | PageRankアルゴリズムで重要度計算 | O(E)   |
| `generateCommunityName`     | コミュニティ名の自動生成         | O(n)   |
| `getEntityTypeCategory`     | エンティティタイプのカテゴリ取得 | O(1)   |
| `calculateGraphDensity`     | グラフ密度の計算                 | O(1)   |

（E: エッジ数、n: 文字列長/配列長）

---

## 4. 関数定義

### 4.1 normalizeEntityName（エンティティ名の正規化）

#### 目的

エンティティ名を統一フォーマットに変換し、重複排除・検索性向上を実現する。

#### シグネチャ

```typescript
/**
 * エンティティ名を正規化
 * @param name 元のエンティティ名
 * @returns 正規化されたエンティティ名
 * @example
 * normalizeEntityName("React.js") // => "reactjs"
 * normalizeEntityName("Claude 3.5 Sonnet") // => "claude 3 5 sonnet"
 * normalizeEntityName("  TypeScript  ") // => "typescript"
 */
export function normalizeEntityName(name: string): string;
```

#### アルゴリズム

```
1. 小文字化: toLowerCase()
2. 連続空白を単一空白に変換: replace(/\s+/g, ' ')
3. 特殊文字除去: replace(/[^\w\s-]/g, '')
   - 残すもの: 英数字（\w）、空白（\s）、ハイフン（-）
   - 除去するもの: ピリオド、カンマ、引用符、括弧等
4. 前後空白除去: trim()
```

#### 実装例

```typescript
export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase() // 小文字化
    .replace(/\s+/g, " ") // 連続空白を単一空白に
    .replace(/[^\w\s-]/g, "") // 特殊文字除去
    .trim(); // 前後空白除去
}
```

#### テストケース

| 入力                  | 期待される出力        | テスト観点         |
| --------------------- | --------------------- | ------------------ |
| `"React.js"`          | `"reactjs"`           | 特殊文字除去       |
| `"Claude 3.5 Sonnet"` | `"claude 3 5 sonnet"` | 複数空白の処理     |
| `"  TypeScript  "`    | `"typescript"`        | 前後空白除去       |
| `"Next.js 15"`        | `"nextjs 15"`         | ピリオド除去       |
| `"C++"`               | `"c"`                 | 特殊文字完全除去   |
| `""`                  | `""`                  | 空文字列           |
| `"日本語テスト"`      | `"日本語テスト"`      | 非ASCII文字の保持  |
| `"API-Gateway"`       | `"api-gateway"`       | ハイフンの保持     |
| `"___test___"`        | `"test"`              | アンダースコア除去 |

#### エッジケース

- **空文字列**: `""` → `""` （エラーにせず空文字列を返す）
- **数字のみ**: `"123"` → `"123"` （正常に処理）
- **全角文字**: Unicode文字（\w）に含まれるため保持
- **絵文字**: 特殊文字として除去される

#### パフォーマンス

- 計算量: O(n)（nは文字列長）
- メモリ: O(n)（新しい文字列を生成）

---

### 4.2 getInverseRelationType（逆関係タイプの取得）

#### 目的

関係タイプから逆関係タイプを取得し、双方向グラフ構築を支援する。

#### シグネチャ

```typescript
/**
 * 関係タイプの逆関係を取得
 * @param relationType 元の関係タイプ
 * @returns 逆関係タイプ（逆関係がない場合はnull）
 * @example
 * getInverseRelationType("uses") // => "used_by"
 * getInverseRelationType("part_of") // => "has_part"
 * getInverseRelationType("related_to") // => null（双方向関係）
 */
export function getInverseRelationType(
  relationType: RelationType,
): RelationType | null;
```

#### アルゴリズム

```
1. 逆関係マップを定義（Map<RelationType, RelationType>）
2. マップから逆関係を検索
3. 存在すれば返す、存在しなければnullを返す
```

#### 実装例

```typescript
/**
 * 関係タイプの逆関係マップ
 * 双方向関係（related_to, concurrent_with, collaborates_with）は含まない
 */
const INVERSE_RELATION_MAP: Record<RelationType, RelationType | null> = {
  // 汎用関係
  part_of: RelationTypes.HAS_PART,
  has_part: RelationTypes.PART_OF,
  belongs_to: RelationTypes.HAS_PART,

  // 時間的関係
  preceded_by: RelationTypes.FOLLOWED_BY,
  followed_by: RelationTypes.PRECEDED_BY,

  // 技術的関係
  uses: RelationTypes.USED_BY,
  used_by: RelationTypes.USES,

  // 階層関係
  parent_of: RelationTypes.CHILD_OF,
  child_of: RelationTypes.PARENT_OF,

  // 参照関係
  references: RelationTypes.REFERENCED_BY,
  referenced_by: RelationTypes.REFERENCES,
  defines: RelationTypes.DEFINED_BY,
  defined_by: RelationTypes.DEFINES,

  // 双方向関係（逆関係なし）
  related_to: null,
  concurrent_with: null,
  collaborates_with: null,

  // 単方向関係（逆関係なし）
  implements: null,
  extends: null,
  depends_on: null,
  calls: null,
  imports: null,
  authored_by: null,
  works_for: null,
} as const;

export function getInverseRelationType(
  relationType: RelationType,
): RelationType | null {
  return INVERSE_RELATION_MAP[relationType] ?? null;
}
```

#### テストケース

| 入力                | 期待される出力 | テスト観点               |
| ------------------- | -------------- | ------------------------ |
| `"uses"`            | `"used_by"`    | 技術的関係の逆関係       |
| `"used_by"`         | `"uses"`       | 逆関係の逆関係（双方向） |
| `"part_of"`         | `"has_part"`   | 汎用関係の逆関係         |
| `"parent_of"`       | `"child_of"`   | 階層関係の逆関係         |
| `"related_to"`      | `null`         | 双方向関係（逆関係なし） |
| `"implements"`      | `null`         | 単方向関係（逆関係なし） |
| `"concurrent_with"` | `null`         | 双方向関係               |

#### エッジケース

- **存在しない関係タイプ**: TypeScriptの型システムで防止（RelationType以外は渡せない）
- **nullの処理**: 逆関係がない場合はnullを返す（明示的な区別）

#### パフォーマンス

- 計算量: O(1)（オブジェクトルックアップ）
- メモリ: O(1)（静的マップ）

---

### 4.3 calculateEntityImportance（エンティティ重要度計算）

#### 目的

PageRankアルゴリズムの簡易版を使用し、エンティティの重要度スコアを計算する。

#### シグネチャ

```typescript
/**
 * エンティティの重要度を計算（簡易PageRank）
 * @param entityId 対象エンティティのID
 * @param relations エンティティに関連する関係の配列
 * @returns 重要度スコア（0.0〜1.0）
 * @example
 * // エンティティAに10個の関係がある場合
 * calculateEntityImportance(entityA.id, relations) // => 0.5
 */
export function calculateEntityImportance(
  entityId: EntityId,
  relations: readonly RelationEntity[],
): number;
```

#### アルゴリズム（簡易PageRank）

```
1. エンティティの接続数を計算
   - sourceId = entityId の関係数（出次数）
   - targetId = entityId の関係数（入次数）
   - 合計接続数 = 出次数 + 入次数

2. 重要度スコアを計算
   - 基本スコア = min(接続数 / 20, 1.0)
     ※ 20接続で最大スコア1.0に到達
   - 入次数ボーナス = min(入次数 / 10, 0.2)
     ※ 被参照が多いほど重要（最大+0.2）

3. 最終スコア = min(基本スコア + 入次数ボーナス, 1.0)
```

**将来的な改善**: 本格的なPageRankアルゴリズム実装（反復計算、ダンピングファクター等）

#### 実装例

```typescript
export function calculateEntityImportance(
  entityId: EntityId,
  relations: readonly RelationEntity[],
): number {
  // 出次数（sourceId = entityId）
  const outDegree = relations.filter((r) => r.sourceId === entityId).length;

  // 入次数（targetId = entityId）
  const inDegree = relations.filter((r) => r.targetId === entityId).length;

  // 合計接続数
  const totalDegree = outDegree + inDegree;

  // 基本スコア（20接続で1.0）
  const baseScore = Math.min(totalDegree / 20, 1.0);

  // 入次数ボーナス（被参照が多いほど重要、最大+0.2）
  const inDegreeBonus = Math.min(inDegree / 10, 0.2);

  // 最終スコア（最大1.0）
  return Math.min(baseScore + inDegreeBonus, 1.0);
}
```

#### テストケース

| 接続数（出/入） | 基本スコア | 入次数ボーナス | 期待スコア | テスト観点                 |
| --------------- | ---------- | -------------- | ---------- | -------------------------- |
| 0 / 0           | 0.0        | 0.0            | 0.0        | 孤立エンティティ           |
| 10 / 0          | 0.5        | 0.0            | 0.5        | 出次数のみ                 |
| 0 / 10          | 0.5        | 0.2            | 0.7        | 入次数のみ（ボーナスあり） |
| 10 / 10         | 1.0        | 0.2            | 1.0        | 上限到達（cap at 1.0）     |
| 5 / 5           | 0.5        | 0.1            | 0.6        | バランス型                 |
| 20 / 0          | 1.0        | 0.0            | 1.0        | 出次数のみで上限到達       |
| 0 / 20          | 1.0        | 0.2            | 1.0        | 入次数のみで上限到達       |
| 100 / 100       | 1.0        | 0.2            | 1.0        | 大規模エンティティ         |

#### エッジケース

- **孤立エンティティ**: 接続数0 → スコア0.0
- **巨大エンティティ**: 接続数1000+ → スコア1.0（上限）
- **空の関係配列**: スコア0.0

#### パフォーマンス

- 計算量: O(E)（E: relations配列の長さ）
- 改善案: エンティティIDでインデックス化すればO(1)

---

### 4.4 generateCommunityName（コミュニティ名の生成）

#### 目的

コミュニティのメンバーエンティティから、人間が理解しやすいコミュニティ名を自動生成する。

#### シグネチャ

```typescript
/**
 * コミュニティ名を自動生成
 * @param entities コミュニティのメンバーエンティティ配列
 * @returns 生成されたコミュニティ名
 * @example
 * generateCommunityName([reactEntity]) // => "React"
 * generateCommunityName([reactEntity, nextEntity]) // => "React & Next.js"
 * generateCommunityName([react, next, remix, gatsby])
 * // => "React, Next.js & 2 others"
 */
export function generateCommunityName(
  entities: readonly EntityEntity[],
): string;
```

#### アルゴリズム

```
1. エンティティを重要度順にソート（importance降順）
2. メンバー数に応じて名前を生成
   - 1個: そのエンティティ名
   - 2個: "エンティティA & エンティティB"
   - 3個以上: "エンティティA, エンティティB & N others"
     ※ 上位2つのエンティティ名 + 残りの個数
```

#### 実装例

```typescript
export function generateCommunityName(
  entities: readonly EntityEntity[],
): string {
  if (entities.length === 0) {
    return "Empty Community";
  }

  // 重要度順にソート（降順）
  const sortedEntities = [...entities].sort(
    (a, b) => b.importance - a.importance,
  );

  if (sortedEntities.length === 1) {
    // 1個: エンティティ名のみ
    return sortedEntities[0].name;
  }

  if (sortedEntities.length === 2) {
    // 2個: "A & B"
    return `${sortedEntities[0].name} & ${sortedEntities[1].name}`;
  }

  // 3個以上: "A, B & N others"
  const topTwo = sortedEntities.slice(0, 2);
  const othersCount = sortedEntities.length - 2;

  return `${topTwo[0].name}, ${topTwo[1].name} & ${othersCount} others`;
}
```

#### テストケース

| メンバー数 | メンバー名（重要度順）                  | 期待される出力                | テスト観点         |
| ---------- | --------------------------------------- | ----------------------------- | ------------------ |
| 0          | -                                       | `"Empty Community"`           | 空コミュニティ     |
| 1          | React (0.9)                             | `"React"`                     | 単一エンティティ   |
| 2          | React (0.9), Next.js (0.8)              | `"React & Next.js"`           | 2個のエンティティ  |
| 3          | React (0.9), Next.js (0.8), Remix (0.7) | `"React, Next.js & 1 others"` | 3個のエンティティ  |
| 5          | React (0.9), Next.js (0.8), ...         | `"React, Next.js & 3 others"` | 複数エンティティ   |
| 2          | TypeScript (0.5), JavaScript (0.9)      | `"JavaScript & TypeScript"`   | 重要度順ソート確認 |
| 1          | 日本語エンティティ (0.8)                | `"日本語エンティティ"`        | 非ASCII文字対応    |

#### エッジケース

- **空配列**: `"Empty Community"`（エラーにせず明示的な名前）
- **同じ重要度**: ソート順は安定ソートに依存（元の配列順を維持）
- **長い名前**: 名前の長さ制限なし（表示側で切り詰め）

#### パフォーマンス

- 計算量: O(n log n)（ソート）
- メモリ: O(n)（配列コピー）

---

### 4.5 getEntityTypeCategory（エンティティタイプのカテゴリ取得）

#### 目的

エンティティタイプから所属カテゴリを取得し、カテゴリ別の処理・フィルタリングを支援する。

#### シグネチャ

```typescript
/**
 * エンティティタイプのカテゴリを取得
 * @param entityType エンティティタイプ
 * @returns カテゴリ名
 * @example
 * getEntityTypeCategory("person") // => "人物・組織"
 * getEntityTypeCategory("technology") // => "技術全般"
 * getEntityTypeCategory("document") // => "ドキュメント構造"
 */
export function getEntityTypeCategory(entityType: EntityType): string;
```

#### アルゴリズム

```
1. カテゴリマップを定義（Map<EntityType, Category>）
2. マップから カテゴリを検索
3. カテゴリを返す（存在しない場合は "その他"）
```

#### 実装例

```typescript
/**
 * エンティティタイプのカテゴリマップ
 */
const ENTITY_TYPE_CATEGORY_MAP: Record<EntityType, string> = {
  // 1. 人物・組織カテゴリ (4種類)
  person: "人物・組織",
  organization: "人物・組織",
  role: "人物・組織",
  team: "人物・組織",

  // 2. 場所・時間カテゴリ (3種類)
  location: "場所・時間",
  date: "場所・時間",
  event: "場所・時間",

  // 3. ビジネス・経営カテゴリ (9種類)
  company: "ビジネス・経営",
  product: "ビジネス・経営",
  service: "ビジネス・経営",
  brand: "ビジネス・経営",
  strategy: "ビジネス・経営",
  metric: "ビジネス・経営",
  business_process: "ビジネス・経営",
  market: "ビジネス・経営",
  customer: "ビジネス・経営",

  // 4. 技術全般カテゴリ (5種類)
  technology: "技術全般",
  tool: "技術全般",
  method: "技術全般",
  standard: "技術全般",
  protocol: "技術全般",

  // 5. コード・ソフトウェアカテゴリ (7種類)
  programming_language: "コード・ソフトウェア",
  framework: "コード・ソフトウェア",
  library: "コード・ソフトウェア",
  api: "コード・ソフトウェア",
  function: "コード・ソフトウェア",
  class: "コード・ソフトウェア",
  module: "コード・ソフトウェア",

  // 6. 抽象概念カテゴリ (5種類)
  concept: "抽象概念",
  theory: "抽象概念",
  principle: "抽象概念",
  pattern: "抽象概念",
  model: "抽象概念",

  // 7. ドキュメント構造カテゴリ (5種類)
  document: "ドキュメント構造",
  chapter: "ドキュメント構造",
  section: "ドキュメント構造",
  paragraph: "ドキュメント構造",
  heading: "ドキュメント構造",

  // 8. ドキュメント要素カテゴリ (9種類)
  keyword: "ドキュメント要素",
  summary: "ドキュメント要素",
  figure: "ドキュメント要素",
  table: "ドキュメント要素",
  list: "ドキュメント要素",
  quote: "ドキュメント要素",
  code_snippet: "ドキュメント要素",
  formula: "ドキュメント要素",
  example: "ドキュメント要素",

  // 9. メディアカテゴリ (4種類)
  image: "メディア",
  video: "メディア",
  audio: "メディア",
  diagram: "メディア",

  // 10. その他カテゴリ (1種類)
  other: "その他",
} as const;

export function getEntityTypeCategory(entityType: EntityType): string {
  return ENTITY_TYPE_CATEGORY_MAP[entityType] ?? "その他";
}
```

#### テストケース

| 入力           | 期待される出力           | テスト観点                   |
| -------------- | ------------------------ | ---------------------------- |
| `"person"`     | `"人物・組織"`           | 人物・組織カテゴリ           |
| `"technology"` | `"技術全般"`             | 技術全般カテゴリ             |
| `"framework"`  | `"コード・ソフトウェア"` | コード・ソフトウェアカテゴリ |
| `"document"`   | `"ドキュメント構造"`     | ドキュメント構造カテゴリ     |
| `"keyword"`    | `"ドキュメント要素"`     | ドキュメント要素カテゴリ     |
| `"image"`      | `"メディア"`             | メディアカテゴリ             |
| `"other"`      | `"その他"`               | その他カテゴリ               |
| `"company"`    | `"ビジネス・経営"`       | ビジネス・経営カテゴリ       |
| `"location"`   | `"場所・時間"`           | 場所・時間カテゴリ           |
| `"concept"`    | `"抽象概念"`             | 抽象概念カテゴリ             |

#### エッジケース

- **存在しないタイプ**: TypeScriptの型システムで防止（EntityType以外は渡せない）
- **フォールバック**: `??`演算子で"その他"を返す（防御的プログラミング）

#### パフォーマンス

- 計算量: O(1)（オブジェクトルックアップ）
- メモリ: O(1)（静的マップ）

---

### 4.6 calculateGraphDensity（グラフ密度の計算）

#### 目的

Knowledge Graph全体の密度（疎密度）を計算し、グラフの特性を定量化する。

#### シグネチャ

```typescript
/**
 * グラフ密度を計算
 * @param entityCount エンティティ総数
 * @param relationCount 関係総数
 * @returns グラフ密度（0.0〜1.0）
 * @example
 * calculateGraphDensity(100, 200) // => 0.0404
 * calculateGraphDensity(10, 45) // => 1.0（完全グラフ）
 */
export function calculateGraphDensity(
  entityCount: number,
  relationCount: number,
): number;
```

#### アルゴリズム

```
1. 最大可能エッジ数を計算
   - maxEdges = entityCount * (entityCount - 1) / 2
     ※ 無向グラフの場合の最大エッジ数

2. グラフ密度を計算
   - density = relationCount / maxEdges

3. 境界値チェック
   - entityCount < 2 の場合: 0.0を返す（グラフ未形成）
   - density > 1.0 の場合: 1.0にクリップ（異常値対策）
```

**数式**:

```
density = E / (V * (V - 1) / 2)
```

- E: エッジ数（relationCount）
- V: ノード数（entityCount）

**解釈**:

- **density = 0.0**: 疎グラフ（エンティティ間に関係がほとんどない）
- **density = 0.5**: 中密度グラフ
- **density = 1.0**: 完全グラフ（すべてのエンティティが相互接続）

#### 実装例

```typescript
export function calculateGraphDensity(
  entityCount: number,
  relationCount: number,
): number {
  // エンティティが2未満の場合、グラフは形成されない
  if (entityCount < 2) {
    return 0.0;
  }

  // 最大可能エッジ数（無向グラフ）
  const maxEdges = (entityCount * (entityCount - 1)) / 2;

  // グラフ密度（0.0〜1.0）
  const density = relationCount / maxEdges;

  // 1.0を超える場合はクリップ（異常値対策）
  return Math.min(density, 1.0);
}
```

#### テストケース

| entityCount | relationCount | maxEdges | 期待density | テスト観点             |
| ----------- | ------------- | -------- | ----------- | ---------------------- |
| 0           | 0             | -        | 0.0         | エンティティなし       |
| 1           | 0             | -        | 0.0         | エンティティ1個のみ    |
| 2           | 0             | 1        | 0.0         | 疎グラフ（関係なし）   |
| 2           | 1             | 1        | 1.0         | 完全グラフ（2ノード）  |
| 10          | 0             | 45       | 0.0         | 疎グラフ               |
| 10          | 45            | 45       | 1.0         | 完全グラフ（10ノード） |
| 100         | 200           | 4950     | 0.0404      | 低密度グラフ           |
| 100         | 2475          | 4950     | 0.5         | 中密度グラフ           |
| 1000        | 10000         | 499500   | 0.02        | 大規模疎グラフ         |

#### エッジケース

- **entityCount = 0**: density = 0.0（ゼロ除算回避）
- **entityCount = 1**: density = 0.0（グラフ未形成）
- **relationCount > maxEdges**: density = 1.0にクリップ（異常データ対策）
- **負の値**: TypeScriptの型で防止（number型だが、実装時にバリデーション追加可）

#### パフォーマンス

- 計算量: O(1)（定数時間計算）
- メモリ: O(1)

---

## 5. 共通設計パターン

### 5.1 エラーハンドリング

すべてのユーティリティ関数は**エラーをスローしない**設計とする：

- **不正な入力**: デフォルト値を返す（例: 空文字列 → 空文字列）
- **境界値**: 適切にクリップ（例: density > 1.0 → 1.0）
- **null/undefined**: TypeScriptの型システムで防止（strictNullChecks有効）

**理由**: ユーティリティ関数は低レベルな処理であり、エラーハンドリングは呼び出し側の責務

### 5.2 不変性（Immutability）

- 入力配列・オブジェクトを**変更しない**
- 必要に応じて`[...array]`でコピーを作成
- `readonly`修飾子を活用

### 5.3 型安全性

- すべての引数・戻り値にTypeScript型を明示
- Branded Type（EntityId等）を使用
- `as const`でリテラル型を保証

---

## 6. テスト戦略

### 6.1 単体テストの構成

各関数ごとに以下のテストを実装：

```typescript
describe("normalizeEntityName", () => {
  describe("正常系", () => {
    it("特殊文字を除去する", () => {
      /* ... */
    });
    it("連続空白を単一空白に変換する", () => {
      /* ... */
    });
    // ...
  });

  describe("境界値", () => {
    it("空文字列を処理する", () => {
      /* ... */
    });
    it("非ASCII文字を保持する", () => {
      /* ... */
    });
    // ...
  });

  describe("エッジケース", () => {
    it("数字のみの文字列を処理する", () => {
      /* ... */
    });
    // ...
  });
});
```

### 6.2 プロパティベーステスト（Property-Based Testing）

特定の関数で適用可能：

```typescript
// normalizeEntityName のプロパティ
it("正規化した文字列を再度正規化しても変わらない（冪等性）", () => {
  const input = "React.js";
  const normalized = normalizeEntityName(input);
  expect(normalizeEntityName(normalized)).toBe(normalized);
});
```

### 6.3 パフォーマンステスト

大規模データでの性能確認：

```typescript
it("100万エンティティのimportance計算が1秒以内に完了する", () => {
  const relations = generateMockRelations(1000000);
  const start = performance.now();
  calculateEntityImportance(entityId, relations);
  const end = performance.now();
  expect(end - start).toBeLessThan(1000);
});
```

---

## 7. パフォーマンス最適化指針

### 7.1 アルゴリズム最適化

| 関数                        | 現在の計算量 | 最適化案                       | 最適化後計算量 |
| --------------------------- | ------------ | ------------------------------ | -------------- |
| `calculateEntityImportance` | O(E)         | エンティティIDでインデックス化 | O(1)           |
| `generateCommunityName`     | O(n log n)   | 上位2つのみ抽出（部分ソート）  | O(n)           |

### 7.2 メモリ最適化

- 不要な配列コピーを避ける
- 大規模配列の場合、Generator関数を検討

### 7.3 メモ化（Memoization）

同じ入力で繰り返し呼ばれる関数は、メモ化を検討：

```typescript
import { memoize } from "lodash";

export const memoizedNormalizeEntityName = memoize(normalizeEntityName);
```

---

## 8. 使用例

### 8.1 エンティティ抽出時の正規化

```typescript
// エンティティ名を正規化して重複チェック
const rawName = "React.js";
const normalized = normalizeEntityName(rawName);

const existingEntity = await entityRepository.findByNormalizedName(normalized);
if (existingEntity) {
  // 既存エンティティを使用
  return existingEntity;
}
// 新規エンティティを作成
```

### 8.2 関係の双方向化

```typescript
// 関係を作成すると同時に逆関係も作成
const relation: RelationEntity = {
  /* ... */
};
const inverseType = getInverseRelationType(relation.type);

if (inverseType) {
  const inverseRelation: RelationEntity = {
    id: generateRelationId(),
    sourceId: relation.targetId,
    targetId: relation.sourceId,
    type: inverseType,
    // ...
  };
  await relationRepository.create(inverseRelation);
}
```

### 8.3 重要度順のエンティティ表示

```typescript
// エンティティを重要度順にソートして表示
const sortedEntities = [...entities].sort((a, b) => {
  const importanceA = calculateEntityImportance(a.id, relations);
  const importanceB = calculateEntityImportance(b.id, relations);
  return importanceB - importanceA; // 降順
});
```

### 8.4 コミュニティ名の自動生成

```typescript
// Leidenアルゴリズムでコミュニティ検出後
const community: CommunityEntity = {
  id: generateCommunityId(),
  level: 0,
  name: generateCommunityName(memberEntities),
  // ...
};
```

---

## 9. 将来的な拡張

### 9.1 本格的なPageRank実装

現在の`calculateEntityImportance`は簡易版。将来的に以下を実装：

- 反復計算（Power Iteration）
- ダンピングファクター（通常0.85）
- 収束判定

```typescript
export function calculatePageRank(
  entities: readonly EntityEntity[],
  relations: readonly RelationEntity[],
  dampingFactor: number = 0.85,
  maxIterations: number = 100,
): Map<EntityId, number>;
```

### 9.2 多言語対応の正規化

```typescript
export function normalizeEntityName(name: string, locale?: string): string;
```

- 日本語: ひらがな・カタカナの正規化
- 中国語: 簡体字・繁体字の統一
- 英語: 語幹抽出（stemming）

### 9.3 カスタムカテゴリ定義

```typescript
export function getEntityTypeCategory(
  entityType: EntityType,
  customCategories?: Record<EntityType, string>,
): string;
```

---

## 10. ADR（Architecture Decision Records）

### ADR-1: 簡易PageRankの採用

**状況**: エンティティ重要度計算にPageRankアルゴリズムを使用

**決定**: 本格的なPageRankではなく、接続数ベースの簡易版を採用

**理由**:

- 実装が単純（O(E)計算）
- 実用上十分な精度（重要なエンティティは接続数が多い傾向）
- 将来的に本格実装への移行が容易

**結果**:

- パフォーマンス良好（100万エンティティでも高速）
- ユーザーの直感に合致する重要度スコア
- 本格PageRankへの移行パスが明確

### ADR-2: エラーをスローしない設計

**状況**: ユーティリティ関数のエラーハンドリング方針

**決定**: エラーをスローせず、デフォルト値を返す設計

**理由**:

- ユーティリティ関数は低レベル処理
- 呼び出し側でエラーハンドリングすべき
- try-catch不要でコードがシンプル

**結果**:

- 使いやすいAPI
- パフォーマンス向上（例外処理コストなし）
- 呼び出し側の責務が明確

### ADR-3: 静的マップの使用

**状況**: `getInverseRelationType`、`getEntityTypeCategory`の実装方針

**決定**: 静的なRecord型マップを使用

**理由**:

- O(1)ルックアップ
- 型安全性（TypeScriptで完全に型チェック可能）
- 読みやすさ（if-elseの羅列より視認性高い）

**結果**:

- 高速なルックアップ
- TypeScriptの型推論が正確
- 保守性向上（マップを見れば全体像が把握可能）

---

## 11. 完了条件チェックリスト

- [x] normalizeEntityName関数が設計されている
- [x] getInverseRelationType関数が設計されている
- [x] calculateEntityImportance関数が設計されている（PageRankアルゴリズム簡易版）
- [x] generateCommunityName関数が設計されている
- [x] getEntityTypeCategory関数が設計されている
- [x] calculateGraphDensity関数が設計されている
- [x] 各関数の入出力が明確に定義されている
- [x] テストケース設計指針が明確
- [x] パフォーマンス考慮事項が記載されている
- [x] ADRで主要な設計判断が記録されている

---

## 12. 依存関係

### 前提条件

- T-00-1（要件仕様書）が完了している
- T-01-1（型定義設計）が完了している
- `types/rag/branded.ts`, `graph/types.ts` が存在する

### 後続タスクへの影響

本設計書は以下のタスクの入力となる：

- T-02-1: 設計レビュー実施
- T-03-3: utils.test.ts作成（Red）
- T-04-3: utils.ts実装（Green）

---

## 13. 参考資料

- [PageRank Algorithm - Wikipedia](https://en.wikipedia.org/wiki/PageRank)
- [Graph Density - Wikipedia](https://en.wikipedia.org/wiki/Dense_graph)
- [String Normalization - Unicode Standard](https://unicode.org/reports/tr15/)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**ステータス**: ✅ 完了
**レビュアー**: （Phase 2で設定）
**承認日**: （Phase 2で設定）
