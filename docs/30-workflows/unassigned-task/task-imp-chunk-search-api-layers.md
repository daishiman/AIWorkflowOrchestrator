# Chunk Search APIレイヤー実装 - タスク指示書

## メタ情報

```yaml
issue_number: 594
```

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-CHUNK-API-001                                          |
| タスク名     | Chunk Search APIレイヤー実装（Service/REST/IPC）            |
| 分類         | 改善                                                        |
| 対象機能     | RAG全文検索 / Chunk Search API                              |
| 優先度       | 中                                                          |
| 見積もり規模 | 中規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | Phase 12（api-internal-chunk-search.md 実装ステータス確認） |
| 発見日       | 2026-01-31                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

FTS5全文検索のデータベース層（`packages/shared/src/db/queries/chunks-search.ts`）は実装済みであり、キーワード検索・フレーズ検索・NEAR検索の3種類の検索が動作する。しかし、このデータベース層を利用するサービス層、REST API層、Desktop IPC層が未実装のため、アプリケーションから検索機能を利用できない状態にある。

### 1.2 問題点・課題

- データベース層のみ実装済みで、上位レイヤー（Service/REST/IPC）が未実装
- WebアプリからChunk検索を利用するREST APIが存在しない
- DesktopアプリからChunk検索を利用するIPC通信が存在しない
- ビジネスロジック（バリデーション、エラーハンドリング、ページネーション）を担うサービス層が未実装

### 1.3 放置した場合の影響

- RAG機能のコア部分であるチャンク検索がUI/APIから利用不可のまま
- ハイブリッド検索（ベクトル検索 + 全文検索）統合が進行できない
- ナレッジベース機能の実用化が遅延する

---

## 2. 何を達成するか（What）

### 2.1 目的

データベース層の上に、サービス層・REST API層・Desktop IPC層の3レイヤーを実装し、Web/Desktopアプリからチャンク検索機能を利用可能にする。

### 2.2 最終ゴール

- サービス層: バリデーション、エラーハンドリング、ページネーション対応
- REST API層: Next.js App Routerで3エンドポイント（keyword/phrase/near）を公開
- Desktop IPC層: Electron IPCで3チャンネルを登録し、Preload API経由でRendererから利用可能
- 各レイヤーのユニットテストがPASS
- 性能目標（10,000チャンクで100ms未満）を達成

### 2.3 スコープ

#### 含むもの

- サービス層の実装（`packages/shared/src/services/chunk-search/`）
- REST API層の実装（`apps/web/src/app/api/v1/chunks/search/`）
- Desktop IPC層の実装（`apps/desktop/src/main/ipc/` + Preload API）
- 入力バリデーション（クエリ長、limit/offset範囲、nearDistance範囲）
- エラーハンドリング（検索失敗時の適切なレスポンス）
- ページネーション対応（offset/limit/totalCount/hasMore）
- 各レイヤーのユニットテスト

#### 含まないもの

- データベース層の変更（既存のchunks-search.tsは変更しない）
- UI検索画面の実装（別タスク）
- ベクトル検索との統合（別タスク: task-hybridrag-factory-full-lite.md）
- FTS5パフォーマンスチューニング（別タスク: task-chunks-fts5-performance-testing.md）

### 2.4 成果物

| 成果物           | パス                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| サービス層実装   | `packages/shared/src/services/chunk-search/`                                    |
| REST API実装     | `apps/web/src/app/api/v1/chunks/search/`                                        |
| IPC Handler実装  | `apps/desktop/src/main/ipc/chunk-search-handlers.ts`                            |
| Preload API拡張  | `apps/desktop/src/preload/` 内の該当ファイル                                    |
| テストファイル群 | 各実装ファイルに対応するテストファイル                                          |
| 実装ガイド       | `docs/30-workflows/TASK-CHUNK-API-001/outputs/phase-12/implementation-guide.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared/src/db/queries/chunks-search.ts` が実装済み・テスト済み
- FTS5テーブルがDBマイグレーションで作成済み
- Next.js App Routerの基本構成が存在する
- Electron IPC通信パターン（safeInvoke/safeOn）が確立済み

### 3.2 依存タスク

| タスクID | 内容                    | ステータス |
| -------- | ----------------------- | ---------- |
| -        | chunks-search.ts実装    | 完了       |
| -        | FTS5 DBマイグレーション | 完了       |

### 3.3 必要な知識

- TypeScript（サービス層設計パターン）
- Next.js App Router（Route Handlers: `app/api/v1/...`）
- Electron IPC（ipcMain.handle / contextBridge / Preload API）
- FTS5全文検索（BM25スコアリング、ハイライト）
- Zodバリデーション（リクエストボディ検証）

### 3.4 推奨アプローチ

1. **サービス層を先に実装**: データベース層をラップし、バリデーション・エラーハンドリング・型変換を担当
2. **REST API層を実装**: Next.js Route Handlerでサービス層を呼び出す
3. **IPC層を実装**: 既存のsafeInvoke/safeOnパターンに従いチャンネル登録
4. 各レイヤーでTDDサイクル（Red→Green→Refactor）を適用

---

## 4. 実行手順

### Phase構成

task-specification-creatorの13-Phaseワークフローに従う。

### Phase 1-2: 設計

#### 目的

3レイヤーのインターフェース設計とAPI仕様の詳細化。

#### 手順

1. api-internal-chunk-search.mdの仕様を確認
2. サービス層のインターフェース（入出力型）を定義
3. REST APIのリクエスト/レスポンス型をZodスキーマで定義
4. IPCチャンネル名とペイロード型を定義

#### 成果物

- 型定義ファイル、Zodスキーマ

#### 完了条件

- 全レイヤーのインターフェースが定義されている

### Phase 5: 実装

#### 目的

3レイヤーの実装。

#### 手順

1. サービス層: ChunkSearchService クラス実装
   - `searchByKeyword(options)`: キーワード検索
   - `searchByPhrase(options)`: フレーズ検索
   - `searchByNear(terms, options)`: NEAR検索
   - 入力バリデーション（query長1-500文字、limit 1-100、offset 0以上）
   - エラーハンドリング（DB接続エラー、タイムアウト）
2. REST API層: Next.js Route Handlers
   - `POST /api/v1/chunks/search/keyword`
   - `POST /api/v1/chunks/search/phrase`
   - `POST /api/v1/chunks/search/near`
3. IPC層: Electronハンドラー
   - `chunks:search:keyword`
   - `chunks:search:phrase`
   - `chunks:search:near`
   - Preload APIにsearchChunks系メソッドを公開

#### 成果物

- 実装ファイル群

#### 完了条件

- TypeScript strict PASS
- 全エンドポイント/チャンネルが正常動作

### Phase 6-7: テスト

#### 目的

各レイヤーのテスト作成・実行。

#### 手順

1. サービス層ユニットテスト（バリデーション、正常系、異常系）
2. REST APIテスト（リクエスト/レスポンス、ステータスコード）
3. IPCテスト（ハンドラー呼び出し、セキュリティ）
4. パフォーマンステスト（10,000チャンクで100ms目標）

#### 成果物

- テストファイル群

#### 完了条件

- Line Coverage 95%以上
- 性能目標達成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] サービス層: 3種類の検索メソッドが動作する
- [ ] サービス層: 入力バリデーションが正しく機能する
- [ ] REST API層: 3エンドポイントがレスポンスを返す
- [ ] REST API層: 不正リクエストに400エラーを返す
- [ ] IPC層: 3チャンネルが正常に動作する
- [ ] IPC層: Preload API経由でRendererから呼び出せる
- [ ] ページネーション（offset/limit/totalCount/hasMore）が正しい

### 品質要件

- [ ] TypeScript strict PASS
- [ ] ESLint PASS
- [ ] Prettier PASS
- [ ] Line Coverage 95%以上
- [ ] 性能目標: キーワード/フレーズ検索 < 100ms（10,000チャンク）
- [ ] 性能目標: NEAR検索 < 150ms（10,000チャンク）

### ドキュメント要件

- [ ] 実装ガイド（Phase 12）が作成されている
- [ ] api-internal-chunk-search.mdの実装ステータスが更新されている
- [ ] 関連するシステム仕様書に実装内容が反映されている

---

## 6. 検証方法

### テストケース

| #   | テストケース             | 期待結果                                |
| --- | ------------------------ | --------------------------------------- |
| 1   | キーワード検索（正常系） | 検索結果とスコアが返される              |
| 2   | フレーズ検索（完全一致） | 語順が一致する結果のみ返される          |
| 3   | NEAR検索（近接距離指定） | 指定距離内のチャンクが返される          |
| 4   | 空クエリでの検索         | 400バリデーションエラー                 |
| 5   | limit上限超過            | 400バリデーションエラー                 |
| 6   | ページネーション         | offset/limitに応じた結果とhasMoreフラグ |
| 7   | DB接続エラー             | 500エラーレスポンス                     |
| 8   | IPC経由での検索          | Preload API経由で結果取得可能           |

### 検証手順

1. `pnpm --filter @repo/shared test` でサービス層テスト実行
2. `pnpm --filter @repo/web test` でREST APIテスト実行
3. `pnpm --filter @repo/desktop test` でIPCテスト実行
4. パフォーマンステスト用スクリプトで性能目標を確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                         |
| ------------------------------ | ------ | -------- | ------------------------------------------------------------ |
| FTS5クエリのパフォーマンス劣化 | 中     | 低       | BM25スケールファクタの調整、インデックス最適化               |
| REST APIとIPC層の仕様不整合    | 中     | 中       | 共通のサービス層を経由し、上位レイヤーはサービス層のみに依存 |
| Zodスキーマと実行時型の不一致  | 低     | 低       | TypeScript strict + Zodのinfer型で型安全性を担保             |
| 大量チャンク時のメモリ使用量   | 中     | 低       | ストリーミング/カーソルベースのページネーションを検討        |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| Chunk Search API仕様 | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` |
| RAGベクトル検索仕様  | `.claude/skills/aiworkflow-requirements/references/rag-search-vector.md`         |
| ハイブリッド検索仕様 | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`         |
| DB queries実装       | `packages/shared/src/db/queries/chunks-search.ts`                                |
| FTS5品質改善タスク   | `docs/30-workflows/unassigned-task/task-chunks-fts5-quality-improvements.md`     |
| FTS5性能テストタスク | `docs/30-workflows/unassigned-task/task-chunks-fts5-performance-testing.md`      |

### 参考資料

- SQLite FTS5ドキュメント: BM25スコアリング、NEAR検索、ハイライト機能
- Next.js App Router Route Handlers パターン

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
api-internal-chunk-search.md L106-111:
| レイヤー       | 実装状況    | 備考                       |
| -------------- | ----------- | -------------------------- |
| データベース層 | ✅ 実装済み | `queries/chunks-search.ts` |
| サービス層     | 未実装      | 将来追加予定               |
| REST API層     | 未実装      | Next.js App Router         |
| Desktop IPC層  | 未実装      | Electron IPC               |
```

### 補足事項

- サービス層は `packages/shared/` に配置し、Web/Desktop両方から共通利用する
- REST API層のエンドポイントパスは仕様書通り `/api/v1/chunks/search/{type}` とする
- IPC層はTASK-5-1で確立されたsafeInvoke/safeOnパターンに従う
- データベース接続はDI（依存性注入）パターンで受け取り、テスタビリティを確保する
