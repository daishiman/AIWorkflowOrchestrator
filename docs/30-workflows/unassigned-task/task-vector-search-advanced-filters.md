# ベクトル検索フィルター拡張 - タスク指示書

## メタ情報

```yaml
issue_number: 616
```

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | -                                                                        |
| タスク名     | ベクトル検索フィルター拡張                                               |
| 分類         | 改善                                                                     |
| 対象機能     | RAGベクトル類似検索（VectorSearchService）                               |
| 優先度       | 低                                                                       |
| 見積もり規模 | 中規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | Phase 12（rag-vector-search.md / rag-search-vector.md 未対応フィルター） |
| 発見日       | 2026-01-31                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`rag-vector-search.md`で定義されたベクトル類似検索サービス（VectorSearchService）は、`fileIds`・`minRelevance`・`limit`フィルターが実装済みだが、`dateRange`・`fileTypes`・`workspaceIds`の3フィルターは「将来対応予定」として未実装である。VectorSearchServiceは83テストケース（Line Coverage 98.71%）で高品質な状態にあるが、検索の絞り込み機能が不足している。

### 1.2 問題点・課題

- 日時範囲での検索絞り込みができず、最新のドキュメントに限定した検索ができない
- ファイル種別（`.md`、`.ts`、`.json`等）での絞り込みができず、特定種別のドキュメントのみを対象にした検索ができない
- ワークスペース単位での検索スコープ制限ができず、関連性の低い結果が混入する
- Hybrid Search Engine統合時に、フィルター機能の不足がボトルネックになる

### 1.3 放置した場合の影響

- ユーザーが検索結果の精度を制御できず、無関係な結果が多く返される
- 大量ドキュメント環境での検索効率が低下する
- Hybrid Search Engineの統合時に機能不足が顕在化する

---

## 2. 何を達成するか（What）

### 2.1 目的

VectorSearchServiceに`dateRange`・`fileTypes`・`workspaceIds`フィルターを追加し、ユーザーの検索精度を向上させる。

### 2.2 最終ゴール

- `dateRange`フィルター（開始日・終了日）が機能し、指定期間内のドキュメントのみが検索対象となる
- `fileTypes`フィルター（MIMEタイプ配列）が機能し、指定種別のファイルのみが検索対象となる
- `workspaceIds`フィルター（ワークスペースID配列）が機能し、指定ワークスペース内のドキュメントのみが検索対象となる
- 既存のテスト83件に回帰がない
- 性能目標（既存フィルターと同等の応答時間）を満たしている

### 2.3 スコープ

#### 含むもの

- `dateRange`フィルター実装（`{ start?: Date, end?: Date }`）
- `fileTypes`フィルター実装（`string[]` MIMEタイプ配列）
- `workspaceIds`フィルター実装（`string[]` ワークスペースID配列）
- VectorSearchOptions型の拡張
- SQLクエリのWHERE句拡張
- 新規フィルターの単体テスト・統合テスト

#### 含まないもの

- UIコンポーネント（検索フィルターパネル）の実装
- ベクトルインデックスの再構築
- 検索アルゴリズムの変更
- キャッシュ戦略の変更

### 2.4 成果物

| 成果物                    | 説明                                  |
| ------------------------- | ------------------------------------- |
| VectorSearchOptions型拡張 | 3フィルターの型定義追加               |
| VectorSearchService更新   | フィルター適用ロジック実装            |
| SQLクエリ拡張             | WHERE句にフィルター条件追加           |
| テストスイート            | フィルター別テスト + 組み合わせテスト |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- VectorSearchServiceが実装済みであること（83テスト、98.71% Line Coverage）
- chunksテーブルに`created_at`、`file_type`（またはファイルメタデータテーブル）、`workspace_id`カラムが存在すること
- DiskANNベクトルインデックスが構築済みであること

### 3.2 依存タスク

- VectorSearchService実装（完了済み）
- ベクトル検索DiskANN実装（完了済み）

### 3.3 必要な知識

- SQLiteのWHERE句とJOIN
- DiskANNベクトル検索のポストフィルタリング
- VectorSearchServiceの既存実装パターン
- LRUキャッシュのキー設計（フィルター条件をキーに含める必要）

### 3.4 推奨アプローチ

1. VectorSearchOptions型を拡張（3フィルターのオプショナルプロパティ追加）
2. SQLクエリビルダーにフィルター条件のWHERE句追加
3. ポストフィルタリング方式（ベクトル検索後のSQL JOIN）で実装
4. キャッシュキー生成ロジックにフィルター条件を反映
5. 各フィルター単独 + 組み合わせテストで検証

---

## 4. 実行手順

### Phase構成

Phase 1（型定義・dateRange）→ Phase 2（fileTypes・workspaceIds）→ Phase 3（組み合わせテスト・検証）

### Phase 1: 型定義拡張 + dateRangeフィルター

#### 目的

VectorSearchOptions型を拡張し、dateRangeフィルターを実装する。

#### 手順

1. `VectorSearchOptions`型に`dateRange?: { start?: Date; end?: Date }`を追加
2. SQLクエリにWHERE句追加（`created_at >= ? AND created_at <= ?`）
3. `start`のみ指定、`end`のみ指定、両方指定の3パターンを実装
4. キャッシュキー生成にdateRange条件を反映
5. テスト作成（正常系 + 境界値 + 空結果）

#### 成果物

- 更新されたVectorSearchOptions型
- dateRangeフィルター実装
- テストケース

#### 完了条件

- dateRangeフィルターが3パターン全てで正常動作
- 既存83テストに回帰なし

### Phase 2: fileTypes・workspaceIdsフィルター

#### 目的

残り2つのフィルターを実装する。

#### 手順

1. `VectorSearchOptions`型に`fileTypes?: string[]`を追加
2. `VectorSearchOptions`型に`workspaceIds?: string[]`を追加
3. SQLクエリにWHERE句追加（`file_type IN (?, ?, ...)`、`workspace_id IN (?, ?, ...)`）
4. 空配列の場合はフィルター無効とする
5. キャッシュキー生成に条件を反映
6. 各フィルター単独テスト作成

#### 成果物

- fileTypesフィルター実装
- workspaceIdsフィルター実装
- テストケース

#### 完了条件

- 各フィルターが正常動作
- 空配列でフィルター無効

### Phase 3: 組み合わせテスト・検証

#### 目的

複数フィルターの組み合わせ動作と性能を検証する。

#### 手順

1. フィルター組み合わせテスト作成（dateRange + fileTypes、全3フィルター同時等）
2. 既存フィルター（fileIds、minRelevance）との組み合わせテスト
3. 性能テスト（フィルター有無での応答時間比較）
4. エッジケーステスト（空配列、無効な日付等）

#### 成果物

- 組み合わせテストスイート
- 性能テスト結果

#### 完了条件

- 全組み合わせパターンで正常動作
- 性能劣化が10%以内

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `dateRange`フィルターが機能する（start/end/両方指定）
- [ ] `fileTypes`フィルターが機能する（MIMEタイプ配列）
- [ ] `workspaceIds`フィルターが機能する（ID配列）
- [ ] 空配列指定時にフィルターが無効化される
- [ ] 既存フィルター（fileIds、minRelevance、limit）と組み合わせ可能
- [ ] キャッシュがフィルター条件を正しく反映している

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLint PASS
- [ ] 既存83テストに回帰なし
- [ ] 新規テスト全PASS
- [ ] Line Coverage 95%以上維持

### ドキュメント要件

- [ ] `rag-vector-search.md`のフィルターステータスを「実装済」に更新
- [ ] `rag-search-vector.md`のフィルターステータスを更新

---

## 6. 検証方法

### テストケース

| テストケース               | 検証内容                                           |
| -------------------------- | -------------------------------------------------- |
| dateRange: start + end指定 | 期間内のドキュメントのみ返される                   |
| dateRange: startのみ       | 指定日以降のドキュメントのみ返される               |
| dateRange: endのみ         | 指定日以前のドキュメントのみ返される               |
| fileTypes: 単一MIMEタイプ  | 指定種別のファイルのみ返される                     |
| fileTypes: 複数MIMEタイプ  | 指定種別のいずれかのファイルが返される             |
| workspaceIds: 単一ID       | 指定ワークスペースのドキュメントのみ返される       |
| フィルター組み合わせ       | 複数フィルターのAND条件で正しく絞り込まれる        |
| 空配列                     | フィルターが無効化される（全結果返却）             |
| キャッシュ整合性           | フィルター違いで異なるキャッシュエントリが使われる |

### 検証手順

1. 各フィルター単独テストを実行しPASS確認
2. 組み合わせテストを実行しPASS確認
3. 既存83テストの回帰テスト実行
4. 性能テストでフィルター有無の応答時間比較

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                          |
| ---------------------------------- | ------ | -------- | ------------------------------------------------------------- |
| chunksテーブルにカラム不足         | 高     | 中       | スキーマ確認を先行実施、必要ならマイグレーション追加          |
| ポストフィルタリングによる性能劣化 | 中     | 中       | ベクトル検索のlimitを余裕を持って設定し、フィルター後に再制限 |
| キャッシュキー肥大化               | 低     | 低       | フィルター条件のハッシュ化でキーサイズを制限                  |
| SQLインジェクション                | 高     | 低       | パラメータバインドを徹底                                      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                       | パス                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| ベクトル検索仕様                   | `.claude/skills/aiworkflow-requirements/references/rag-vector-search.md` |
| ベクトル検索実装詳細               | `.claude/skills/aiworkflow-requirements/references/rag-search-vector.md` |
| RAGアーキテクチャ                  | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`  |
| Hybrid Search Engine仕様（統合先） | `docs/30-workflows/unassigned-task/task-07-hybrid-search-engine.md`      |

### 参考資料

- VectorSearchService実装ガイド: `docs/30-workflows/vector-search-diskann/outputs/phase-12/implementation-guide.md`
- 既存テストスイート（83テスト）を参考にテスト構成を設計

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
rag-vector-search.md フィルターステータス:
| dateRange    | 未実装 | 将来対応予定        |
| fileTypes    | 未実装 | 将来対応予定        |
| workspaceIds | 未実装 | 将来対応予定        |

rag-search-vector.md フィルターステータス:
| dateRange    | ❌ 未対応            | 将来対応予定          |
| fileTypes    | ❌ 未対応            | 将来対応予定          |
| workspaceIds | ❌ 未対応            | 将来対応予定          |
```

### 補足事項

- 本タスクは`task-07-hybrid-search-engine`（Hybrid Search Engine）の前にに実施することが望ましい。Hybrid Searchでフィルターを統合する際、ベクトル検索側のフィルター機能が前提となるため。
- `workspaceIds`フィルターの実装にはワークスペースとファイルの関連テーブルが必要。スキーマにない場合は別途マイグレーションタスクが必要になる可能性がある。
- キャッシュ戦略（TTL: 5分、maxSize: 1000、LRU）は変更しないが、キャッシュキーにフィルター条件を含める必要がある。
