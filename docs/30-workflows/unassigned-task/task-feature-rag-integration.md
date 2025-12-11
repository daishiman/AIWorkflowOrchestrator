# RAG連携実装 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-RAG                                             |
| タスク名         | RAG連携実装(ベクトル化・セマンティック検索)             |
| 分類             | 新規機能                                                |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 中                                                      |
| 見積もり規模     | 大規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | ユーザー要望                                            |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | -                                                       |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

ユーザーの元の指示では「このシステムではRAGのデータを保存して、ここのやり取り、このシステム上でその保存した情報と合わせてやり取りをする成果物を生成する」とあります。ワークスペースマネージャーは複数フォルダを参照する基盤を提供しましたが、RAG連携の実装は将来のスコープとして除外されています。

データモデル設計(DM-WS-001)では`FileNode`に`isRagIndexed`フラグが既に定義されており、RAG連携の準備は整っています。

### 1.2 問題点・課題

- ファイル内容のセマンティック検索ができない
- 複数フォルダにまたがる知識を統合的に活用できない
- AI成果物生成のためのコンテキスト収集が手動
- RAGインデックスの管理機能がない

### 1.3 放置した場合の影響

- **戦略的価値**: システムの核心機能が実装されず、製品価値が大幅に低下
- **競合優位性**: AI統合機能が差別化要因として機能しない
- **ユーザー価値**: 元の要望の主要部分が実現されない
- **影響度**: 高(戦略的に最重要だが、基盤機能完了後に実装)

---

## 2. 何を達成するか(What)

### 2.1 目的

ワークスペース内のファイルをRAGインデックスに追加し、セマンティック検索を可能にする。複数フォルダにまたがる知識を統合的に活用し、AI成果物生成の基盤を構築する。

### 2.2 最終ゴール

1. ファイル内容のベクトル化(Embedding生成)
2. ベクトルDBへのインデックス登録
3. セマンティック検索機能
4. ファイルの`isRagIndexed`ステータス管理
5. インデックス更新(ファイル変更検知時)
6. 検索UIとの統合

### 2.3 スコープ

#### 含むもの

- ファイル内容のベクトル化パイプライン(OpenAI Embeddings / sentence-transformers)
- ベクトルDBとの連携(Pinecone / Weaviate / ChromaDB から選定)
- `isRagIndexed`フラグの管理
- セマンティック検索API
- 検索UIの拡張(ファイル検索機能の SearchBar を再利用)
- インデックス更新トリガー(ファイル監視連携)

#### 含まないもの

- AI成果物生成機能(別タスク、RAG連携後に実装)
- マルチモーダルRAG(画像・音声等、将来検討)
- ベクトルDB の自前実装(外部サービス利用)
- RAGチャットUI(別タスク)

### 2.4 成果物

| 成果物               | パス                                                                       | 完了時の配置先     |
| -------------------- | -------------------------------------------------------------------------- | ------------------ |
| 機能要件書           | docs/30-workflows/workspace-manager-enhancements/task-step00-rag.md        | (完了後も同じ場所) |
| アーキテクチャ設計書 | docs/30-workflows/workspace-manager-enhancements/task-step01-rag-arch.md   | (完了後も同じ場所) |
| データベース設計書   | docs/30-workflows/workspace-manager-enhancements/task-step01-rag-db.md     | (完了後も同じ場所) |
| IPC API設計書        | docs/30-workflows/workspace-manager-enhancements/task-step01-rag-ipc.md    | (完了後も同じ場所) |
| Embeddingサービス    | apps/desktop/src/main/services/embeddingService.ts                         | (実装済み)         |
| VectorDBクライアント | apps/desktop/src/main/services/vectorDbClient.ts                           | (実装済み)         |
| RAGIPCハンドラー     | apps/desktop/src/main/ipc/ragHandlers.ts                                   | (実装済み)         |
| SemanticSearchUI     | apps/desktop/src/renderer/components/molecules/SemanticSearchBar/index.tsx | (実装済み)         |
| テストファイル       | apps/desktop/src/test/main/ragHandlers.test.ts                             | (実装済み)         |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- ファイル検索機能(TASK-WS-SEARCH)が完了していること(SearchBar再利用)
- ファイル監視機能(TASK-WS-NFR018)が完了していること(インデックス更新トリガー)

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)
- TASK-WS-SEARCH: ファイル検索機能(完了推奨)
- TASK-WS-NFR018: ファイル監視機能(完了推奨)

### 3.3 必要な知識・スキル

- ベクトルDB(Pinecone / Weaviate / ChromaDB)の知識
- Embedding生成(OpenAI API / sentence-transformers)
- セマンティック検索の原理
- 非同期処理とキューイング(大量ファイルのバッチ処理)

### 3.4 推奨アプローチ

**技術選定(候補)**:

1. **OpenAI Embeddings + Pinecone**: クラウドベース、高性能、簡単
2. **sentence-transformers + Weaviate**: オンプレミス、柔軟性高い
3. **OpenAI Embeddings + ChromaDB**: ローカル、プライバシー重視

**推奨**: 段階的実装

- Phase 1: OpenAI Embeddings + Pinecone(簡単、検証用)
- Phase 2: ローカルモデル対応(プライバシー考慮)

**実装戦略**:

1. ベクトルDB候補を検証(Pinecone / Weaviate / ChromaDB)
2. Embedding生成パイプラインを実装
3. インデックス登録APIを実装
4. セマンティック検索APIを実装
5. 検索UIを拡張(ファイル検索とタブ切り替え)

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義(RAG要件)
Phase 1: 設計(アーキテクチャ・DB設計・IPC API設計)
Phase 2: 設計レビューゲート
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証(セマンティック検索検証)
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements rag-integration
```

#### 使用エージェント

- **エージェント**: @db-architect
- **選定理由**: ベクトルDB設計の専門家

---

### Phase 1: 設計

#### T-01-1: アーキテクチャ設計

##### Claude Code スラッシュコマンド

```
/ai:design-architecture rag-pipeline
```

##### 使用エージェント

- **エージェント**: @arch-police

---

#### T-01-2: データベース設計

##### Claude Code スラッシュコマンド

```
/ai:create-db-schema rag-index
```

##### 使用エージェント

- **エージェント**: @db-architect

##### スキーマ概要

```typescript
interface RagIndexEntry {
  id: string; // FileIdと同じ
  filePath: string;
  content: string;
  embedding: number[]; // 1536次元(OpenAI) or 384次元(sentence-transformers)
  metadata: {
    fileName: string;
    fileType: string;
    lastModified: Date;
    folderId: FolderId;
  };
  indexedAt: Date;
}
```

---

#### T-01-3: IPC API設計

##### Claude Code スラッシュコマンド

```
/ai:design-api rag-ipc
```

##### IPC API概要

```typescript
export interface RagAPI {
  indexFile: (filePath: string) => Promise<void>;
  indexFolder: (folderPath: string) => Promise<void>;
  removeIndex: (filePath: string) => Promise<void>;
  search: (query: string, limit: number) => Promise<RagSearchResult[]>;
  getIndexStatus: (
    filePath: string,
  ) => Promise<{ isIndexed: boolean; indexedAt?: Date }>;
}
```

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: ベクトルDB選定・依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency @pinecone-database/pinecone
# または
/ai:add-dependency weaviate-ts-client
# または
/ai:add-dependency chromadb
```

---

#### T-04-2: Embeddingサービス実装

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic rag-vectorize
```

##### 実装内容(概要)

```typescript
export class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }
}
```

---

#### T-04-3: RAG検索実装

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic rag-search
```

---

#### T-04-4: UI統合

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/molecules/SearchBar/index.tsx rag-integration
```

##### UI拡張内容

- 検索タブに「ファイル名」「内容」「セマンティック」を追加
- セマンティック検索結果の表示
- インデックス状況のバッジ表示

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ | テスト項目               | 前提条件                           | 操作手順                                              | 期待結果                                         |
| --- | -------- | ------------------------ | ---------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| 1   | 機能     | ファイルインデックス登録 | ドキュメントファイル存在           | 1.ファイルを選択 2.「RAGにインデックス」をクリック    | ファイルがベクトル化されてインデックス登録される |
| 2   | 機能     | インデックス状況表示     | インデックス登録済み               | 1.ファイルツリーを表示                                | ファイルに「インデックス済み」バッジが表示される |
| 3   | 機能     | セマンティック検索       | 複数ファイルインデックス済み       | 1.検索バーで「セマンティック」タブを選択 2.クエリ入力 | 意味的に関連するファイルが検索結果に表示される   |
| 4   | 機能     | インデックス更新         | インデックス登録済みファイルを変更 | 1.外部エディタでファイル変更・保存                    | ファイルが自動的に再インデックスされる           |
| 5   | 機能     | インデックス削除         | インデックス登録済み               | 1.ファイルを削除                                      | インデックスからも削除される                     |
| 6   | 機能     | 複数フォルダ横断検索     | 複数フォルダインデックス済み       | 1.セマンティック検索を実行                            | すべてのフォルダから関連ファイルが取得される     |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイルのベクトル化が実装されている
- [ ] ベクトルDBへのインデックス登録ができる
- [ ] セマンティック検索が動作する
- [ ] `isRagIndexed`フラグが管理されている
- [ ] インデックス更新トリガーが実装されている
- [ ] 検索UIでセマンティック検索が可能

### 品質要件

- [ ] インデックス登録時間: 10KBファイルで2秒以内
- [ ] 検索レスポンス時間: 1秒以内
- [ ] ユニットテストカバレッジ80%以上
- [ ] Lintエラー、型エラーなし

### ドキュメント要件

- [ ] RAGアーキテクチャ設計書が作成されている
- [ ] ベクトルDB設計書が作成されている
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### 統合テスト

```typescript
describe("RAG Integration", () => {
  it("should index file and make it searchable", async () => {
    // Given: ドキュメントファイル
    const filePath = "/test/docs/authentication.md";
    const content = "OAuth 2.0 authentication flow...";

    // When: インデックスに登録
    await window.electronAPI.rag.indexFile(filePath);

    // Then: セマンティック検索でヒット
    const results = await window.electronAPI.rag.search("user login", 5);
    expect(results.some((r) => r.filePath === filePath)).toBe(true);
  });
});
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                        |
| ------------------------------ | ------ | -------- | ------------------------------------------- |
| ベクトルDB選定遅延             | 高     | 高       | 複数候補を並行検証、段階的実装              |
| Embeddingコスト                | 中     | 高       | ローカルモデル(sentence-transformers)も検討 |
| 大量ファイルのインデックス時間 | 中     | 中       | バックグラウンドキュー、バッチ処理          |
| ベクトルDBの運用コスト         | 中     | 中       | ローカルDB(ChromaDB)を優先検討              |
| 検索精度の不足                 | 中     | 中       | ハイブリッド検索(キーワード+セマンティック) |

---

## 8. 参照情報

### 関連ドキュメント

- [DM-WS-001: データモデル設計書](../workspace-manager/task-step01-1-data-model.md) - isRagIndexedフラグ
- [task-workspace-manager.md](../workspace-manager/task-workspace-manager.md) - ユーザー元の指示

### 参考資料

- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- Pinecone: https://www.pinecone.io/
- Weaviate: https://weaviate.io/
- ChromaDB: https://www.trychroma.com/
- sentence-transformers: https://www.sbert.net/

---

## 9. 備考

### 補足事項

**戦略的優先度(Advanced)**:

- システムの核心価値を提供
- 製品差別化の主要要因
- 大規模な実装(4-6週間見積)
- 基盤機能(検索・監視)完了後に実装

**ベクトルDB選定の判断基準**:

| 要素             | Pinecone | Weaviate | ChromaDB |
| ---------------- | -------- | -------- | -------- |
| ホスティング     | クラウド | 両方     | ローカル |
| プライバシー     | 中       | 高       | 高       |
| スケーラビリティ | 高       | 中       | 低       |
| コスト           | 有料     | 無料可   | 無料     |
| 学習曲線         | 低       | 中       | 低       |

**推奨**: ChromaDB(ローカル、無料、プライバシー重視)

**将来拡張**:

- AI成果物生成機能(RAG検索結果を基にコンテンツ生成)
- マルチモーダルRAG(画像・音声のインデックス)
- RAGチャットUI(会話形式での検索)
- ハイブリッド検索(キーワード検索 + セマンティック検索の組み合わせ)

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                    |
| ---------- | ---------- | ------------ | --------------------------- |
| 1.0.0      | 2025-12-11 | @req-analyst | 初版作成(RAG連携単一タスク) |
