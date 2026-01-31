# Chunk Search API層実装 - タスク指示書

## メタ情報

```yaml
issue_number: 609
```


## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | -                                                       |
| タスク名     | Chunk Search API層実装                                  |
| 分類         | 要件                                                    |
| 対象機能     | RAG全文検索API（サービス層・REST API層・Desktop IPC層） |
| 優先度       | 中                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | Phase 12（api-internal-chunk-search.md 未実装API層）    |
| 発見日       | 2026-01-31                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

RAG全文検索のデータベース層（`packages/shared/src/db/queries/chunks-search.ts`）はFTS5を利用したキーワード検索・フレーズ検索・NEAR検索が実装済みである。しかし、`api-internal-chunk-search.md`に定義されたサービス層・REST API層・Desktop IPC層は未実装のままであり、UIやアプリケーションロジックからデータベース層を直接利用できない状態にある。

### 1.2 問題点・課題

- サービス層が未実装のため、検索ロジック（バリデーション、エラーハンドリング、キャッシュ）をUIコンポーネントが直接担うことになる
- REST API層が未実装のため、`apps/web`（Next.js）からチャンク検索を利用できない
- Desktop IPC層が未実装のため、ElectronアプリのRenderer Processから検索機能にアクセスできない
- 3層のAPIが欠落しているため、検索機能がアプリケーション全体に統合できない

### 1.3 放置した場合の影響

- RAG検索パイプラインの完成が遅延し、ユーザーが全文検索機能を利用できない
- データベース層への直接アクセスによりセキュリティリスクが発生する
- テスト困難な密結合コードが増加する
- `rag-query-pipeline.md`で定義されたHybrid Search Engine統合が進められない

---

## 2. 何を達成するか（What）

### 2.1 目的

`api-internal-chunk-search.md`で定義されたサービス層・REST API層・Desktop IPC層を実装し、アプリケーション全体からチャンク検索機能を利用可能にする。

### 2.2 最終ゴール

- サービス層がバリデーション・エラーハンドリング・キャッシュを提供している
- REST API層（Next.js App Router）が3種類の検索エンドポイントを公開している
- Desktop IPC層がElectronアプリのRenderer Processから検索機能へのアクセスを提供している
- 性能目標（キーワード検索 < 100ms, NEAR検索 < 150ms @10,000チャンク）を満たしている

### 2.3 スコープ

#### 含むもの

- サービス層実装（ChunkSearchService）
  - 入力バリデーション
  - エラーハンドリング
  - キャッシュ機構
- REST API層実装（Next.js App Router）
  - `POST /api/v1/chunks/search/keyword`
  - `POST /api/v1/chunks/search/phrase`
  - `POST /api/v1/chunks/search/near`
- Desktop IPC層実装
  - `chunk-search:keyword` チャンネル
  - `chunk-search:phrase` チャンネル
  - `chunk-search:near` チャンネル
- Preload API定義
- テスト（単体・統合）

#### 含まないもの

- データベース層の変更（既に実装済み）
- UIコンポーネント実装
- Hybrid Search Engineとの統合
- ベクトル検索との組み合わせロジック

### 2.4 成果物

| 成果物             | 説明                                           |
| ------------------ | ---------------------------------------------- |
| ChunkSearchService | サービス層クラス（バリデーション・キャッシュ） |
| REST APIルート     | Next.js App Routerの3エンドポイント            |
| IPC Handlers       | Electron IPC ハンドラー3種                     |
| Preload API        | Renderer向けセキュアAPI                        |
| テストスイート     | 単体テスト + 統合テスト                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared/src/db/queries/chunks-search.ts`が実装済みであること
- FTS5テーブル（chunks_fts）が作成済みであること
- Next.js App Routerの基本構成が整っていること

### 3.2 依存タスク

- チャンク検索DB層実装（完了済み）

### 3.3 必要な知識

- Next.js App Router（Route Handlers）
- Electron IPC（Main/Preload/Renderer）
- FTS5全文検索の動作原理
- `safeInvoke`/`safeOn`セキュリティパターン

### 3.4 推奨アプローチ

1. サービス層を先に実装（DB層のラッパー + バリデーション + エラーハンドリング）
2. REST API層をサービス層の上に構築
3. Desktop IPC層を並行実装（サービス層を共有）
4. 統合テストで全レイヤーの連携を検証

---

## 4. 実行手順

### Phase構成

Phase 1（サービス層）→ Phase 2（REST API層 + IPC層、並列可）→ Phase 3（統合テスト・検証）

### Phase 1: サービス層実装

#### 目的

ChunkSearchServiceクラスを実装し、DB層へのアクセスをカプセル化する。

#### 手順

1. `packages/shared/src/services/`にChunkSearchServiceクラスを作成
2. 入力バリデーション実装（query長制限、limit範囲チェック、ULID形式検証）
3. エラーハンドリング実装（検索失敗、DB接続エラー）
4. キャッシュ機構実装（LRU、TTL: 5分、maxSize: 1000）
5. 単体テスト作成

#### 成果物

- `ChunkSearchService.ts`
- `ChunkSearchService.test.ts`

#### 完了条件

- 3種類の検索メソッドが実装されている
- バリデーションエラー時に適切なエラーレスポンスを返す
- 単体テスト全PASS

### Phase 2: REST API層 + IPC層実装

#### 目的

REST APIエンドポイントとElectron IPCチャンネルを実装する。

#### 手順

1. `apps/web/src/app/api/v1/chunks/search/keyword/route.ts`を作成
2. `apps/web/src/app/api/v1/chunks/search/phrase/route.ts`を作成
3. `apps/web/src/app/api/v1/chunks/search/near/route.ts`を作成
4. `apps/desktop/src/main/ipc/`にchunk-searchハンドラーを作成
5. `apps/desktop/src/preload/`にPreload APIを追加
6. 各層の単体テスト作成

#### 成果物

- REST APIルートファイル3件
- IPC Handlerファイル
- Preload APIファイル
- テストファイル

#### 完了条件

- 3エンドポイントが正常レスポンスを返す
- IPCチャンネル経由で検索が実行可能
- Preload APIが`contextBridge`経由で公開されている

### Phase 3: 統合テスト・性能検証

#### 目的

全レイヤーの連携を検証し、性能目標を確認する。

#### 手順

1. REST API統合テスト作成（エンドポイント→サービス→DB）
2. IPC統合テスト作成（Preload→Main→サービス→DB）
3. 性能テスト実行（10,000チャンクでの応答時間計測）
4. エラーケーステスト（DB接続失敗、不正入力等）

#### 成果物

- 統合テストスイート
- 性能テスト結果レポート

#### 完了条件

- 統合テスト全PASS
- キーワード検索 < 100ms（95パーセンタイル）
- NEAR検索 < 150ms（95パーセンタイル）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] サービス層の3種類検索メソッドが実装されている
- [ ] REST APIの3エンドポイントが正常に動作する
- [ ] Desktop IPCの3チャンネルが正常に動作する
- [ ] Preload APIが公開されている
- [ ] 入力バリデーションが機能している
- [ ] キャッシュ機構が動作している

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLint PASS
- [ ] 単体テスト全PASS（目標: Line Coverage 90%以上）
- [ ] 統合テスト全PASS
- [ ] 性能目標を満たしている

### ドキュメント要件

- [ ] `api-internal-chunk-search.md`の実装ステータスを更新
- [ ] Preload APIのIPCチャンネル一覧を仕様書に反映

---

## 6. 検証方法

### テストケース

| テストケース         | 検証内容                                  |
| -------------------- | ----------------------------------------- |
| キーワード検索E2E    | REST API→サービス→DB の正常フロー         |
| フレーズ検索E2E      | 完全一致検索の動作確認                    |
| NEAR検索E2E          | 近接検索パラメータの動作確認              |
| バリデーションエラー | 不正入力時の適切なエラーレスポンス        |
| IPC経由検索          | Preload API→Main→サービス→DB の正常フロー |
| キャッシュヒット     | 同一クエリ2回目の高速応答                 |
| 性能テスト           | 10,000チャンクでの応答時間測定            |

### 検証手順

1. `pnpm --filter @repo/shared test` でサービス層テストPASS
2. `pnpm --filter @repo/web test` でREST APIテストPASS
3. `pnpm --filter @repo/desktop test` でIPC層テストPASS
4. 性能テストで目標値以内を確認

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                     |
| ----------------------------------- | ------ | -------- | ---------------------------------------- |
| FTS5のクエリインジェクション        | 高     | 中       | 入力サニタイズとパラメータバインドを徹底 |
| 大量チャンクでの性能劣化            | 中     | 中       | インデックス最適化とキャッシュで対応     |
| REST APIとIPC層のレスポンス形式差異 | 低     | 低       | 共通レスポンス型をサービス層で定義       |
| キャッシュメモリ使用量の増大        | 中     | 低       | maxSize制限とTTLで管理                   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------- |
| チャンク検索API仕様             | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` |
| RAGアーキテクチャ概要           | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`          |
| セキュリティ原則（Preload API） | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`  |
| IPC設計                         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`             |

### 参考資料

- 既存Preload API実装: `apps/desktop/src/preload/skill-api.ts`（safeInvoke/safeOnパターン）
- 既存DB層実装: `packages/shared/src/db/queries/chunks-search.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
api-internal-chunk-search.md:
## 実装ステータス
| サービス層     | 未実装      | 将来追加予定               |
| REST API層     | 未実装      | Next.js App Router         |
| Desktop IPC層  | 未実装      | Electron IPC               |
```

### 補足事項

- 本タスクは`task-chat-history-fts5-search`（FTS5検索UI）の前提タスクとなる可能性がある
- Hybrid Search Engine（`task-07-hybrid-search-engine`）との統合は別タスクで対応する
- `rag-query-pipeline.md`で定義された`createFull()`/`createLite()`ファクトリとの連携は、本タスクのAPI層が前提となる
