# 受け入れ基準 - Repository パターン実装

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| タスクID | CONV-04-06              |
| タスク名 | Repository パターン実装 |
| 作成日   | 2026-01-05              |

---

## 1. 全体基準

### AC-G: 全体受け入れ基準

| ID    | 基準                                            | 検証方法             |
| ----- | ----------------------------------------------- | -------------------- |
| AC-G1 | 全メソッドが `Result<T, RAGError>` を返却する   | 型チェック（tsc）    |
| AC-G2 | Branded ID型（FileId, ChunkId, EntityId）を使用 | 型チェック（tsc）    |
| AC-G3 | ErrorCodesの定義済みコードのみ使用              | コードレビュー       |
| AC-G4 | 全テストが成功する                              | `pnpm test`          |
| AC-G5 | テストカバレッジ80%以上                         | `pnpm test:coverage` |
| AC-G6 | Lintエラー0件                                   | `pnpm lint`          |
| AC-G7 | 型エラー0件                                     | `pnpm typecheck`     |

---

## 2. BaseRepository 受け入れ基準

### AC-B: 基底Repository

| ID     | 機能       | 受け入れ基準                                     | テスト方法 |
| ------ | ---------- | ------------------------------------------------ | ---------- |
| AC-B1  | findById   | 存在するIDで正しいエンティティを返す             | 単体テスト |
| AC-B2  | findById   | 存在しないIDで `ok(null)` を返す                 | 単体テスト |
| AC-B3  | findAll    | 指定したlimit/offsetでページネーション結果を返す | 単体テスト |
| AC-B4  | findAll    | hasMoreが正しく計算される                        | 単体テスト |
| AC-B5  | findAll    | デフォルトでlimit=20, offset=0                   | 単体テスト |
| AC-B6  | create     | 新規エンティティを作成し、作成結果を返す         | 単体テスト |
| AC-B7  | createMany | 複数エンティティを一括作成し、作成結果配列を返す | 単体テスト |
| AC-B8  | createMany | 空配列の場合は `ok([])` を返す                   | 単体テスト |
| AC-B9  | update     | 存在するIDで更新し、更新後のエンティティを返す   | 単体テスト |
| AC-B10 | update     | 存在しないIDで `RECORD_NOT_FOUND` エラーを返す   | 単体テスト |
| AC-B11 | delete     | 存在するIDで削除し、`ok(undefined)` を返す       | 単体テスト |
| AC-B12 | delete     | 存在しないIDで `RECORD_NOT_FOUND` エラーを返す   | 単体テスト |
| AC-B13 | exists     | 存在するIDで `ok(true)` を返す                   | 単体テスト |
| AC-B14 | exists     | 存在しないIDで `ok(false)` を返す                | 単体テスト |
| AC-B15 | count      | レコード総数を返す                               | 単体テスト |
| AC-B16 | エラー     | DB例外発生時に `DB_QUERY_ERROR` を返す           | 単体テスト |

---

## 3. FileRepository 受け入れ基準

### AC-F: FileRepository

| ID     | 機能           | 受け入れ基準                                     | テスト方法 |
| ------ | -------------- | ------------------------------------------------ | ---------- |
| AC-F1  | 継承           | BaseRepositoryの全メソッドが利用可能             | 単体テスト |
| AC-F2  | findByHash     | 指定ハッシュのファイルを返す（論理削除除外）     | 単体テスト |
| AC-F3  | findByHash     | 存在しない場合は `ok(null)` を返す               | 単体テスト |
| AC-F4  | findByPath     | 指定パスのファイルを返す（論理削除除外）         | 単体テスト |
| AC-F5  | findByPath     | 存在しない場合は `ok(null)` を返す               | 単体テスト |
| AC-F6  | findByCategory | 指定カテゴリの全ファイルを返す（論理削除除外）   | 単体テスト |
| AC-F7  | softDelete     | deletedAtを現在時刻に設定する                    | 単体テスト |
| AC-F8  | softDelete     | 論理削除後のファイルはfindByHash等で取得されない | 単体テスト |
| AC-F9  | findByIds      | 指定IDリストのファイルを全て返す（論理削除除外） | 単体テスト |
| AC-F10 | findByIds      | 空配列の場合は `ok([])` を返す                   | 単体テスト |

---

## 4. ChunkRepository 受け入れ基準

### AC-C: ChunkRepository

| ID     | 機能           | 受け入れ基準                                       | テスト方法 |
| ------ | -------------- | -------------------------------------------------- | ---------- |
| AC-C1  | 継承           | BaseRepositoryの全メソッドが利用可能               | 単体テスト |
| AC-C2  | findByFileId   | 指定ファイルIDの全チャンクをインデックス順で返す   | 単体テスト |
| AC-C3  | findByFileId   | 存在しないファイルIDで空配列を返す                 | 単体テスト |
| AC-C4  | deleteByFileId | 指定ファイルIDの全チャンクを削除し、削除件数を返す | 単体テスト |
| AC-C5  | deleteByFileId | 存在しないファイルIDで `ok(0)` を返す              | 単体テスト |
| AC-C6  | findByHash     | 指定ハッシュのチャンクを返す                       | 単体テスト |
| AC-C7  | findByHash     | 存在しない場合は `ok(null)` を返す                 | 単体テスト |
| AC-C8  | findByIds      | 指定IDリストのチャンクを全て返す                   | 単体テスト |
| AC-C9  | findByIds      | 空配列の場合は `ok([])` を返す                     | 単体テスト |
| AC-C10 | findAdjacent   | 前後のチャンクを返す（存在する場合）               | 単体テスト |
| AC-C11 | findAdjacent   | 前後が存在しない場合はnullを返す                   | 単体テスト |
| AC-C12 | findAdjacent   | 存在しないチャンクIDで `{prev: null, next: null}`  | 単体テスト |

---

## 5. EntityRepository 受け入れ基準

### AC-E: EntityRepository

| ID     | 機能                        | 受け入れ基準                                 | テスト方法 |
| ------ | --------------------------- | -------------------------------------------- | ---------- |
| AC-E1  | 継承                        | BaseRepositoryの全メソッドが利用可能         | 単体テスト |
| AC-E2  | findByNormalizedNameAndType | 正規化名+タイプで一意のエンティティを返す    | 単体テスト |
| AC-E3  | findByNormalizedNameAndType | 存在しない場合は `ok(null)` を返す           | 単体テスト |
| AC-E4  | findByType                  | 指定タイプの全エンティティを重要度降順で返す | 単体テスト |
| AC-E5  | findByType                  | 存在しないタイプで空配列を返す               | 単体テスト |
| AC-E6  | searchByName                | 部分一致で最大50件のエンティティを返す       | 単体テスト |
| AC-E7  | searchByName                | 結果は重要度降順でソートされる               | 単体テスト |
| AC-E8  | findTopByImportance         | 重要度上位N件を降順で返す                    | 単体テスト |
| AC-E9  | findTopByImportance         | デフォルトでlimit=20                         | 単体テスト |
| AC-E10 | upsert                      | 新規の場合は作成して返す                     | 単体テスト |
| AC-E11 | upsert                      | 既存の場合は更新してmentionCount+1して返す   | 単体テスト |

---

## 6. ファクトリ関数 受け入れ基準

### AC-A: createRepositories

| ID    | 機能     | 受け入れ基準                                            | テスト方法 |
| ----- | -------- | ------------------------------------------------------- | ---------- |
| AC-A1 | 生成     | FileRepository, ChunkRepository, EntityRepositoryを生成 | 単体テスト |
| AC-A2 | 型       | Repositories型を返す                                    | 型チェック |
| AC-A3 | readonly | プロパティがreadonlyである                              | 型チェック |

---

## 7. 非機能受け入れ基準

### AC-NF: 非機能要件

| ID     | カテゴリ       | 受け入れ基準                                     | 検証方法             |
| ------ | -------------- | ------------------------------------------------ | -------------------- |
| AC-NF1 | 型安全         | 全public APIにJSDocコメントがある                | コードレビュー       |
| AC-NF2 | 型安全         | `as any`使用箇所にコメントで理由が記載されている | コードレビュー       |
| AC-NF3 | エラー         | エラーcontextに十分なデバッグ情報が含まれる      | コードレビュー       |
| AC-NF4 | エラー         | 原因エラーがcauseフィールドに保持されている      | 単体テスト           |
| AC-NF5 | パフォーマンス | createManyで1000件挿入が10秒以内                 | パフォーマンステスト |
| AC-NF6 | テスト         | モックDBで全テストが実行可能                     | 単体テスト           |

---

## 8. テストマトリクス

### 8.1 単体テストケース概要

| Repository       | 正常系 | 異常系 | エッジケース | 合計   |
| ---------------- | ------ | ------ | ------------ | ------ |
| BaseRepository   | 8      | 5      | 3            | 16     |
| FileRepository   | 6      | 2      | 2            | 10     |
| ChunkRepository  | 7      | 2      | 3            | 12     |
| EntityRepository | 7      | 2      | 2            | 11     |
| Factory          | 2      | 0      | 0            | 2      |
| **合計**         | **30** | **11** | **10**       | **51** |

### 8.2 カバレッジ目標

| 項目           | 目標    |
| -------------- | ------- |
| ステートメント | 80%以上 |
| ブランチ       | 75%以上 |
| 関数           | 90%以上 |
| 行             | 80%以上 |

---

## 9. 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-05 | 1.0        | 初版作成 |
