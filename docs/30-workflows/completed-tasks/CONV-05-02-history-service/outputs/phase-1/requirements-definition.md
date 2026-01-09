# 履歴取得サービス - 要件定義書

> Phase 1: 要件定義 成果物
> 作成日: 2026-01-09
> スキル: requirements-engineering

---

## 1. 概要

### 1.1 目的

ファイルごとのバージョン履歴を取得し、特定バージョンへの復元機能を提供するサービスを実装する。

### 1.2 背景

- CONV-05（履歴/ログ管理）の一環として実装
- CONV-04-02（files/conversions テーブル）の実装に依存
- ファイル変換処理の履歴追跡とバージョン管理が必要

### 1.3 スコープ

#### スコープ内

| 項目               | 説明                                       |
| ------------------ | ------------------------------------------ |
| 履歴一覧取得       | ファイルIDに基づくバージョン履歴の取得     |
| ページネーション   | 大量履歴の効率的な取得                     |
| フィルタリング     | 日付範囲、MIMEタイプによる絞り込み         |
| バージョン詳細取得 | 特定バージョンの詳細情報取得               |
| バージョン差分取得 | 2バージョン間の差分情報取得                |
| バージョン復元     | 特定バージョンへの復元（新バージョン作成） |
| 最新バージョン取得 | ファイルの最新バージョン取得               |
| バージョン数取得   | ファイルのバージョン総数取得               |

#### スコープ外

| 項目                               | 理由                   |
| ---------------------------------- | ---------------------- |
| UI実装                             | CONV-05-03で実装予定   |
| バージョン削除                     | 設計対象外（別タスク） |
| 差分のビジュアル表示               | UIタスクで対応         |
| ファイルコンテンツのストリーミング | 別タスクで検討         |

---

## 2. ステークホルダー

| ステークホルダー | 役割           | 関心事                             |
| ---------------- | -------------- | ---------------------------------- |
| エンドユーザー   | サービス利用者 | 履歴の閲覧、バージョン復元         |
| 開発者           | システム開発   | API設計、パフォーマンス            |
| システム管理者   | 運用管理       | ログ、監視、トラブルシューティング |

---

## 3. 機能要件

### FR-001: 履歴一覧取得

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| 要件ID | FR-001                                                           |
| 説明   | ファイルIDを指定して、そのファイルのバージョン履歴一覧を取得する |
| 優先度 | 高                                                               |

**入力**:

- fileId: string（必須）
- filter?: HistoryFilter（オプション）
  - dateFrom?: Date
  - dateTo?: Date
  - mimeTypes?: string[]
- pagination?: PaginationOptions（オプション）
  - limit: number（1-100、デフォルト20）
  - offset: number（0以上、デフォルト0）

**出力**:

- Result<PaginatedResult<VersionHistoryItem>, Error>
  - items: VersionHistoryItem[]
  - total: number
  - hasMore: boolean

**依存関係**: ConversionRepository.findByFileId

---

### FR-002: バージョン詳細取得

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| 要件ID | FR-002                                               |
| 説明   | 変換IDを指定して、特定バージョンの詳細情報を取得する |
| 優先度 | 高                                                   |

**入力**:

- conversionId: string（必須）

**出力**:

- Result<VersionHistoryItem, Error>

**エラーケース**:

- 存在しない変換ID: Error("Conversion not found: {id}")

**依存関係**: ConversionRepository.findById

---

### FR-003: バージョン差分取得

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| 要件ID | FR-003                                |
| 説明   | 2つのバージョン間の差分情報を取得する |
| 優先度 | 中                                    |

**入力**:

- conversionIdA: string（必須）
- conversionIdB: string（必須）

**出力**:

- Result<VersionDiff, Error>
  - conversionIdA: string
  - conversionIdB: string
  - sizeChange: number
  - metadataChanges: MetadataChange[]
  - contentChanged: boolean

**エラーケース**:

- 変換Aが存在しない: Error("Conversion A not found: {id}")
- 変換Bが存在しない: Error("Conversion B not found: {id}")

**依存関係**: ConversionRepository.findById

---

### FR-004: バージョン復元

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| 要件ID | FR-004                                                 |
| 説明   | 特定バージョンに復元する（新しいバージョンとして作成） |
| 優先度 | 高                                                     |

**入力**:

- fileId: string（必須）
- conversionId: string（必須）

**出力**:

- Result<VersionHistoryItem, Error>（復元後の新バージョン）

**処理仕様**:

1. 復元対象のバージョンを取得
2. ファイルIDの一致を検証
3. 新しいバージョンとしてコピー作成
4. メタデータにrestoredFrom, restoredAtを追加
5. ログ記録

**エラーケース**:

- 変換が存在しない: Error("Conversion not found: {id}")
- ファイルIDが一致しない: Error("Conversion {id} does not belong to file {fileId}")

**依存関係**:

- ConversionRepository.findById
- ConversionRepository.create
- IConversionLogger

---

### FR-005: 最新バージョン取得

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 要件ID | FR-005                             |
| 説明   | ファイルの最新バージョンを取得する |
| 優先度 | 高                                 |

**入力**:

- fileId: string（必須）

**出力**:

- Result<VersionHistoryItem | null, Error>
  - 履歴がない場合はnull

**依存関係**: ConversionRepository.findByFileId

---

### FR-006: バージョン数取得

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 要件ID | FR-006                             |
| 説明   | ファイルのバージョン総数を取得する |
| 優先度 | 中                                 |

**入力**:

- fileId: string（必須）

**出力**:

- Result<number, Error>

**依存関係**: ConversionRepository.countByFileId

---

## 4. 非機能要件

### NFR-001: パフォーマンス

| 項目             | 基準                       |
| ---------------- | -------------------------- |
| 履歴取得応答時間 | 100件以下で500ms以内       |
| ページネーション | limit=100でも1秒以内       |
| 差分計算         | 2バージョン比較で500ms以内 |

### NFR-002: セキュリティ

| 項目               | 基準                            |
| ------------------ | ------------------------------- |
| 入力バリデーション | Zodスキーマによるランタイム検証 |
| エラーメッセージ   | 機密情報を含まない              |
| 認可               | 将来の拡張に備えた設計          |

### NFR-003: 信頼性

| 項目               | 基準                       |
| ------------------ | -------------------------- |
| エラーハンドリング | Result型による一貫した処理 |
| 復元の原子性       | 復元失敗時のロールバック   |
| ログ記録           | 重要操作のログ出力         |

### NFR-004: 保守性

| 項目             | 基準                         |
| ---------------- | ---------------------------- |
| テストカバレッジ | Line 80%以上、Branch 60%以上 |
| 型安全           | TypeScript strictモード準拠  |
| ドキュメント     | JSDocコメント必須            |

---

## 5. 制約条件

| 項目         | 制約                                  |
| ------------ | ------------------------------------- |
| 技術スタック | TypeScript 5.x, Zod, Vitest           |
| パッケージ   | packages/shared配下に配置             |
| Result型     | `@repo/shared/types/rag/result`を使用 |
| ログ         | IConversionLoggerを使用               |

---

## 6. 依存タスク

| タスクID   | 名称                       | 依存種別         |
| ---------- | -------------------------- | ---------------- |
| CONV-04-02 | files/conversions テーブル | 必須（データ層） |
| CONV-05-01 | ログ記録サービス           | 必須（ロギング） |

---

## 7. 統合テスト連携要件

### 7.1 接続要件

| インターフェース     | 連携先     | 方式       |
| -------------------- | ---------- | ---------- |
| ConversionRepository | データ層   | 依存性注入 |
| FileRepository       | データ層   | 依存性注入 |
| IConversionLogger    | ロギング層 | 依存性注入 |

### 7.2 データフロー

```
HistoryService
    ├── ConversionRepository.findByFileId()
    ├── ConversionRepository.findById()
    ├── ConversionRepository.create()
    ├── ConversionRepository.countByFileId()
    └── IConversionLogger.info()
```

### 7.3 エラー伝播パターン

- Repository層のエラーはResult.errorとして上位に伝播
- ビジネスロジックエラーは明確なエラーメッセージで返却
- ログ記録失敗は警告として処理（操作自体は継続）

---

## 8. 成功指標

| 指標                     | 目標値       |
| ------------------------ | ------------ |
| 全機能要件の実装完了     | 100%         |
| ユニットテストカバレッジ | Line 80%以上 |
| TypeScript型エラー       | 0件          |
| ESLint警告               | 0件          |
| 受け入れテスト通過率     | 100%         |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-09 | 1.0.0      | 初版作成 |
