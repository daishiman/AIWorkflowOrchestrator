# @repo/shared Community型エクスポート（Part 1: 型整理） - タスク仕様書

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | SHARED-TYPE-EXPORT-01                          |
| タスク名     | @repo/shared Community型エクスポート（型整理） |
| 分類         | リファクタリング                               |
| 対象機能     | @repo/shared パッケージ                        |
| 優先度       | 高                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 実行中                                         |
| 発見元       | Phase 12 (CONV-08-05)                          |
| 発見日       | 2026-01-13                                     |
| 作成日       | 2026-01-13                                     |

---

## 概要

### 背景

CONV-08-05（Community Visualization UI）の実装において、`apps/desktop` から `@repo/shared` の Community 関連型をインポートしようとしたが、型が適切にエクスポートされていないためビルドエラーが発生した。

### 目的

`services/graph/types.ts` で定義されている Community 関連の型を `services/graph/index.ts` で再エクスポートし、他のパッケージからインポート可能にする。

### スコープ

#### 含むもの

- `services/graph/types.ts` の型確認
- `services/graph/index.ts` の作成・更新
- 型の再エクスポート構造の構築

#### 含まないもの

- メインの `index.ts` からのエクスポート（Part 2で実施: SHARED-TYPE-EXPORT-02）
- デスクトップアプリ側のインポート修正（Part 3で実施: SHARED-TYPE-EXPORT-03）

---

## Phase一覧

| Phase | 名称                 | 概要                                     | ステータス |
| ----- | -------------------- | ---------------------------------------- | ---------- |
| 1     | 要件定義             | 型エクスポート要件の明確化               | 未実施     |
| 2     | 設計                 | index.ts のエクスポート構造設計          | 未実施     |
| 3     | 設計レビューゲート   | 設計の妥当性検証                         | 未実施     |
| 4     | テスト作成           | 型インポートテストの作成（Red）          | 未実施     |
| 5     | 実装                 | index.ts の作成・型エクスポート（Green） | 未実施     |
| 6     | テスト拡充           | 追加テストによるカバレッジ向上           | 未実施     |
| 7     | テストカバレッジ確認 | カバレッジ基準達成確認                   | 未実施     |
| 8     | リファクタリング     | コード品質改善（Refactor）               | 未実施     |
| 9     | 品質保証             | 静的解析・型チェック                     | 未実施     |
| 10    | 最終レビューゲート   | 全体品質検証                             | 未実施     |
| 11    | 手動テスト検証       | 実環境動作確認                           | 未実施     |
| 12    | ドキュメント更新     | 仕様書更新・未タスク検出                 | 未実施     |
| 13    | PR作成               | コミット・PR作成・CI確認                 | 未実施     |

---

## 対象ファイル

| ファイル                                      | 役割               |
| --------------------------------------------- | ------------------ |
| `packages/shared/src/services/graph/types.ts` | 型定義元           |
| `packages/shared/src/services/graph/index.ts` | 作成対象（バレル） |

---

## 対象型

以下の型を `services/graph/index.ts` でエクスポートする:

### エンティティ関連

| 型名              | 説明                       |
| ----------------- | -------------------------- |
| `StoredEntity`    | 永続化されたエンティティ   |
| `ExtractedEntity` | 抽出されたエンティティ     |
| `EntityMention`   | エンティティメンション位置 |

### 関係関連

| 型名                | 説明             |
| ------------------- | ---------------- |
| `StoredRelation`    | 永続化された関係 |
| `ExtractedRelation` | 抽出された関係   |
| `RelationEvidence`  | 関係の証拠       |

### グラフ関連

| 型名                   | 説明             |
| ---------------------- | ---------------- |
| `GraphNode`            | グラフノード     |
| `GraphPath`            | グラフパス       |
| `GraphTraversalResult` | トラバーサル結果 |
| `GraphStats`           | グラフ統計情報   |
| `GraphEdge`            | グラフエッジ     |

### コミュニティ関連

| 型名                              | 説明                 |
| --------------------------------- | -------------------- |
| `Community`                       | コミュニティ         |
| `CommunitySummary`                | コミュニティ要約     |
| `CommunityStructure`              | コミュニティ構造     |
| `CommunityDetectionOptions`       | 検出オプション       |
| `CommunityDetectionResult`        | 検出結果             |
| `CommunityDetectionStats`         | 検出統計             |
| `CommunityErrorCode`              | エラーコード（enum） |
| `CommunityDetectionError`         | 検出エラークラス     |
| `CommunitySummarizationOptions`   | 要約オプション       |
| `CommunitySummarizationResult`    | 要約結果             |
| `CommunitySummarizationErrorCode` | 要約エラーコード     |
| `CommunitySummarizationError`     | 要約エラークラス     |

### クエリ関連

| 型名                   | 説明                   |
| ---------------------- | ---------------------- |
| `EntityQuery`          | エンティティ検索条件   |
| `TraversalOptions`     | トラバーサルオプション |
| `RelationQueryOptions` | 関係取得オプション     |

### ユーティリティ関数

| 関数名                | 説明                 |
| --------------------- | -------------------- |
| `normalizeEntityName` | エンティティ名正規化 |

---

## システム仕様参照

実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                             | パス                                                                                          | 内容                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------ |
| モノレポアーキテクチャ               | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                  | パッケージ依存関係ルール |
| コミュニティ検出インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | Community型の仕様        |
| コミュニティ要約インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | CommunitySummary型の仕様 |

---

## 関連タスク

| タスクID              | 内容                             | ステータス |
| --------------------- | -------------------------------- | ---------- |
| SHARED-TYPE-EXPORT-02 | メインindex.tsからのエクスポート | 未実施     |
| SHARED-TYPE-EXPORT-03 | 型チェック検証                   | 未実施     |

---

## 完了条件

### 機能要件

- [ ] `Community` 型がエクスポートされている
- [ ] `CommunitySummary` 型がエクスポートされている
- [ ] `StoredEntity` 型がエクスポートされている
- [ ] その他の型も適切にエクスポートされている

### 品質要件

- [ ] TypeScript型エラーがない（`pnpm typecheck` 成功）
- [ ] 既存のインポートが壊れていない
- [ ] ESLintエラーがない（`pnpm lint` 成功）
- [ ] 全テストが成功（`pnpm test` 成功）

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
