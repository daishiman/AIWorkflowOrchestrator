# 検証対象リスト

## 作成日

2026-01-23

## Phase 1 - Task 1-1: 検証対象の明確化

---

## 1. @repo/shared の型エクスポート対象

### 1.1 Graph Service エクスポート一覧

**ファイル**: `packages/shared/src/services/graph/index.ts`

#### 型エクスポート（type export）

| カテゴリ      | 型名                            | 説明                               |
| ------------- | ------------------------------- | ---------------------------------- |
| Entity関連    | `StoredEntity`                  | DBに保存されたエンティティ         |
| Entity関連    | `ExtractedEntity`               | テキストから抽出されたエンティティ |
| Entity関連    | `EntityMention`                 | エンティティの出現箇所             |
| Relation関連  | `StoredRelation`                | DBに保存された関係                 |
| Relation関連  | `ExtractedRelation`             | テキストから抽出された関係         |
| Relation関連  | `RelationEvidence`              | 関係の根拠情報                     |
| Graph関連     | `GraphNode`                     | グラフの頂点                       |
| Graph関連     | `GraphEdge`                     | グラフの辺                         |
| Graph関連     | `GraphPath`                     | グラフ上のパス                     |
| Graph関連     | `GraphTraversalResult`          | トラバーサル結果                   |
| Graph関連     | `GraphStats`                    | グラフ統計情報                     |
| Community関連 | `Community`                     | コミュニティ構造                   |
| Community関連 | `CommunitySummary`              | コミュニティの要約                 |
| Community関連 | `CommunityStructure`            | 階層的コミュニティ構造             |
| Community関連 | `CommunityDetectionOptions`     | 検出オプション                     |
| Community関連 | `CommunityDetectionResult`      | 検出結果                           |
| Community関連 | `CommunityDetectionStats`       | 検出統計                           |
| Community関連 | `CommunitySummarizationOptions` | 要約オプション                     |
| Community関連 | `CommunitySummarizationResult`  | 要約結果                           |
| Query関連     | `EntityQuery`                   | エンティティ検索クエリ             |
| Query関連     | `TraversalOptions`              | グラフトラバーサルオプション       |
| Query関連     | `RelationQueryOptions`          | 関係検索オプション                 |

#### 値エクスポート（enum, class, function）

| カテゴリ       | 名前                              | 種別     | 説明                   |
| -------------- | --------------------------------- | -------- | ---------------------- |
| Community検出  | `CommunityErrorCode`              | enum     | エラーコード           |
| Community検出  | `CommunityDetectionError`         | class    | 検出エラー             |
| Community要約  | `CommunitySummarizationErrorCode` | enum     | エラーコード           |
| Community要約  | `CommunitySummarizationError`     | class    | 要約エラー             |
| ユーティリティ | `normalizeEntityName`             | function | エンティティ名の正規化 |

### 1.2 メインエントリからのエクスポート

**ファイル**: `packages/shared/index.ts`

上記全ての型・値がメインエントリからもエクスポートされていることを確認済み。

---

## 2. @repo/desktop のインポート箇所

### 2.1 Community型を使用しているファイル

| ファイル                                                                      | インポートパターン                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/hooks/useCommunities.ts`                           | `import type { Community } from "@repo/shared";` |
| `apps/desktop/src/renderer/hooks/__tests__/useCommunities.test.ts`            | Community型の使用                                |
| `apps/desktop/src/renderer/hooks/__tests__/useCommunities.edge-cases.test.ts` | Community型の使用                                |
| `apps/desktop/src/renderer/components/community/**/*.tsx`                     | Community関連コンポーネント                      |
| `apps/desktop/src/preload/index.ts`                                           | Community API定義                                |
| `apps/desktop/src/preload/types.ts`                                           | Community型参照                                  |
| `apps/desktop/src/main/ipc/communityHandlers.ts`                              | CommunityハンドラのIPCハンドラ                   |
| `apps/desktop/src/renderer/__tests__/community-integration.test.tsx`          | 統合テスト                                       |

### 2.2 インポートパターン

現在のインポートパターン:

```typescript
import type { Community } from "@repo/shared";
```

期待される動作:

- `@repo/shared` から直接 `Community` 型をインポート可能
- 型チェック時にエラーが発生しない

---

## 3. 検証対象ファイルリスト

### 3.1 @repo/shared（エクスポート元）

| 優先度 | ファイルパス                                   |
| ------ | ---------------------------------------------- |
| P0     | `packages/shared/index.ts`                     |
| P0     | `packages/shared/src/services/graph/index.ts`  |
| P1     | `packages/shared/src/services/graph/types.ts`  |
| P1     | `packages/shared/src/services/graph/errors.ts` |

### 3.2 @repo/desktop（インポート先）

| 優先度 | ファイルパス                                              |
| ------ | --------------------------------------------------------- |
| P0     | `apps/desktop/src/renderer/hooks/useCommunities.ts`       |
| P1     | `apps/desktop/src/preload/types.ts`                       |
| P1     | `apps/desktop/src/main/ipc/communityHandlers.ts`          |
| P2     | `apps/desktop/src/renderer/components/community/**/*.tsx` |

---

## 完了確認

- [x] `@repo/shared` の型エクスポート対象が明確になっている
- [x] `@repo/desktop` のインポート箇所が特定されている
- [x] 検証対象ファイルがリストアップされている
