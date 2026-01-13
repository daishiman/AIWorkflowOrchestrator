# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 12                         |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

実装完了後のドキュメント整備として、API リファレンス・使用例・READMEを更新する。開発者が容易に理解・使用できるドキュメントを提供する。

## 実行タスク

- **README更新**: 概要・インストール・基本使用法
- **APIリファレンス**: 各Store/ServiceのAPI仕様
- **使用例**: 一般的なユースケースのコード例
- **型定義ドキュメント**: エクスポートされた型の説明
- **移行ガイド**: 既存コードからの移行手順（該当時）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                               | パス                                                                                        | 内容          |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様 |

### 前Phase成果物

| 資料名               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| マニュアルテスト結果 | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |
| 実装コード           | `packages/shared/src/services/graph/`    | Phase 5成果物  |

## ドキュメント構成

### 1. README.md

```markdown
# Knowledge Graph Store

## 概要

Knowledge Graph Storeは、エンティティ・関係・コミュニティを管理するためのStore実装です。

## 主な機能

- EntityStore: エンティティのCRUD操作
- RelationStore: 関係の管理と証拠追跡
- CommunityStore: コミュニティの階層管理
- GraphQueryService: グラフ探索・最短経路

## インストール

\`\`\`bash
pnpm add @repo/shared
\`\`\`

## 基本使用法

\`\`\`typescript
import { createKnowledgeGraphStore } from '@repo/shared/services/graph';

const store = createKnowledgeGraphStore(db);

// エンティティの追加
const result = await store.addEntity({
name: 'John Doe',
type: 'person',
description: 'A software engineer',
});

if (result.isOk()) {
console.log('Created entity:', result.value);
}
\`\`\`

## API Reference

[詳細はAPI Referenceを参照](./docs/api-reference.md)
```

### 2. APIリファレンス

各Store/Serviceのメソッドを文書化:

| Store/Service     | ドキュメント内容                         |
| ----------------- | ---------------------------------------- |
| EntityStore       | addEntity, getEntity, updateEntity, etc. |
| RelationStore     | addRelation, getRelation, etc.           |
| CommunityStore    | create, findByLevel, addMember, etc.     |
| GraphQueryService | traverse, findShortestPath, etc.         |

### 3. 使用例

```markdown
## 使用例

### エンティティの作成と検索

\`\`\`typescript
// エンティティを作成
const entity = await store.addEntity({
name: 'TypeScript',
type: 'technology',
aliases: ['TS'],
});

// 名前で検索
const found = await store.getEntityByName('typescript');
\`\`\`

### 関係の作成

\`\`\`typescript
// 証拠付きで関係を作成
const relation = await store.addRelation({
sourceEntityId: entity1.id,
targetEntityId: entity2.id,
relationType: 'uses',
evidence: {
sourceDocumentId: 'doc-1',
excerpt: 'The project uses TypeScript...',
confidence: 0.95,
},
});
\`\`\`

### グラフ探索

\`\`\`typescript
// BFSトラバーサル
const result = await store.traverse(startEntityId, {
maxDepth: 3,
relationTypes: ['uses', 'depends_on'],
});

// 最短経路
const path = await store.findShortestPath(entityA, entityB);
\`\`\`
```

### 4. 型定義ドキュメント

| 型              | 説明                     |
| --------------- | ------------------------ |
| EntityId        | エンティティの一意識別子 |
| RelationId      | 関係の一意識別子         |
| CommunityId     | コミュニティの一意識別子 |
| StoredEntity    | 永続化されたエンティティ |
| StoredRelation  | 永続化された関係         |
| TraversalResult | グラフ探索の結果         |
| Result<T, E>    | 成功/失敗を表す型        |

## 統合テスト連携【必須】

ドキュメント品質チェックリスト:

| チェック項目    | 確認内容                           | 結果       |
| --------------- | ---------------------------------- | ---------- |
| README          | 概要・インストール・基本使用法     | {{RESULT}} |
| APIリファレンス | 全公開メソッドが文書化されている   | {{RESULT}} |
| 使用例          | 主要ユースケースがカバーされている | {{RESULT}} |
| 型定義          | エクスポート型が説明されている     | {{RESULT}} |
| コード例        | コード例が動作する                 | {{RESULT}} |

## 実行手順

### 1. 既存ドキュメントの確認

```bash
# 既存READMEの確認
cat packages/shared/src/services/graph/README.md

# 型定義の確認
cat packages/shared/src/services/graph/types.ts
```

### 2. ドキュメント作成

1. README.mdの作成または更新
2. APIリファレンスの作成
3. 使用例の追加
4. JSDocコメントの確認・追加

### 3. ドキュメント検証

```bash
# コード例の動作確認
pnpm --filter @repo/shared test:run src/services/graph/__tests__/examples.test.ts

# リンク切れチェック（該当する場合）
npx markdown-link-check README.md
```

## ドキュメントチェックリスト

| 項目            | 確認内容                         | 判定 |
| --------------- | -------------------------------- | ---- |
| 概要            | 機能概要が明確に記述されている   | □    |
| インストール    | インストール手順が記載されている | □    |
| 基本使用法      | 最小限の使用例が示されている     | □    |
| APIリファレンス | 全公開メソッドが文書化されている | □    |
| パラメータ説明  | 各パラメータの説明がある         | □    |
| 戻り値説明      | 戻り値の型と内容が説明されている | □    |
| エラーケース    | 発生しうるエラーが説明されている | □    |
| 使用例          | 実際に動作するコード例がある     | □    |
| 型定義          | エクスポート型が説明されている   | □    |

## 成果物

| 成果物          | パス                                           | 説明         |
| --------------- | ---------------------------------------------- | ------------ |
| README          | `packages/shared/src/services/graph/README.md` | 概要・使用法 |
| APIリファレンス | `outputs/phase-12/api-reference.md`            | API詳細仕様  |
| 使用例          | `outputs/phase-12/usage-examples.md`           | コード例集   |

## 完了条件

- [ ] READMEが作成/更新されている
- [ ] 全公開APIが文書化されている
- [ ] 主要ユースケースの使用例がある
- [ ] コード例が実際に動作する
- [ ] 型定義が説明されている
- [ ] ドキュメントチェックリストを満たしている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 既存ドキュメントの確認
3. README作成/更新
4. APIリファレンス作成
5. 使用例作成
6. 型定義ドキュメント作成
7. JSDocコメント確認・追加
8. コード例の動作確認
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] ドキュメントが出力されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 12
```

## 次のPhase

Phase 13: PR作成
