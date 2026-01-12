# ファイル変換基盤アーキテクチャ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

ファイル変換基盤は、RAGシステムにおける多様なファイル形式（テキスト、Markdown、PDF等）を統一的に処理するための共通基盤を提供する。

**詳細設計**: `docs/30-workflows/completed-tasks/conversion-base/`
**実装**: `packages/shared/src/services/conversion/`

## 主要コンポーネント

| コンポーネント | 責務 |
|----------------|------|
| `IConverter` | 変換処理のインターフェース定義 |
| `BaseConverter` | 共通変換処理の抽象基底クラス（Template Methodパターン） |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択（Repositoryパターン） |
| `ConversionService` | 変換処理の統括（タイムアウト・同時実行制御） |
| `MetadataExtractor` | テキストからのメタデータ抽出 |
| `ConversionLogger` | 変換処理のログ記録（バッファリング対応） |
| `HistoryService` | 変換履歴のバージョン管理（履歴取得・差分比較・復元） |

## ログ記録サービス（ConversionLogger）

**実装場所**: `packages/shared/src/services/logging/`
**詳細設計**: `docs/30-workflows/logging-service/`

変換処理の監査・トラブルシューティング用のログ記録サービス。

### 主要機能

| 機能 | 説明 |
|------|------|
| INFOログ | 正常な処理の記録（開始、完了、進捗） |
| WARNログ | 注意が必要な状況（パフォーマンス警告等） |
| ERRORログ | エラー発生時の記録（スタックトレース保存） |
| バッファリング | メモリバッファによる効率的なDB書き込み |
| 自動フラッシュ | サイズベース・時間ベースの自動書き込み |

### アーキテクチャ

```
ConversionLogger → buffer[] → ILogRepository → Database
                    ↑
              サイズ/時間トリガーでflush
```

### インターフェース

- `IConversionLogger`: ログ記録のインターフェース
- `ILogRepository`: 永続化層のインターフェース（DIP適用）

### 設定オプション

| オプション | デフォルト | 説明 |
|------------|------------|------|
| bufferSize | 100 | バッファサイズ（件数） |
| flushIntervalMs | 5000 | 自動フラッシュ間隔（ミリ秒） |

### 品質指標

| 指標 | 実績 |
|------|------|
| テストカバレッジ（Line） | 96.69% |
| テストカバレッジ（Branch） | 94.59% |
| テスト数 | 22ケース |

## 履歴管理サービス（HistoryService）

**実装場所**: `packages/shared/src/services/history/`
**詳細設計**: `docs/30-workflows/CONV-05-02-history-service/`

変換履歴のバージョン管理用サービス。履歴一覧取得、バージョン間差分比較、過去バージョンへの復元機能を提供。

### 主要機能

| 機能 | 説明 |
|------|------|
| 履歴一覧取得 | ファイル単位のバージョン履歴をページネーション付きで取得 |
| バージョン詳細取得 | 特定バージョンの詳細情報を取得 |
| 差分比較 | 2つのバージョン間のサイズ・メタデータ・コンテンツ変更を比較 |
| バージョン復元 | 過去バージョンの状態に新規変換として復元 |
| 最新バージョン取得 | ファイルの最新変換結果を取得 |
| バージョン数取得 | ファイルの総バージョン数をカウント |

### アーキテクチャ

```
HistoryService → ConversionRepository → Database (conversions table)
                        ↑
                  Result型でエラーハンドリング
```

### インターフェース

- `IHistoryService`: 履歴管理のサービスインターフェース（6メソッド）
- `ConversionRepository`: 永続化層のインターフェース（DIP適用）

### 設計パターン

| パターン | 適用箇所 | 目的 |
|----------|----------|------|
| Repository | `ConversionRepository` | データアクセス抽象化 |
| Result Type | 全メソッド戻り値 | 明示的エラーハンドリング |
| Dependency Injection | コンストラクタ | テスタビリティ向上 |

### 品質指標

| 指標 | 実績 |
|------|------|
| テストカバレッジ（Line） | 100% |
| テストカバレッジ（Branch） | 100% |
| テスト数 | 41ケース |

## Electron統合（history-service-db-integration）

**実装場所**: `apps/desktop/src/main/services/HistoryService.ts`
**詳細設計**: `docs/30-workflows/history-service-db-integration/`
**統合日**: 2026-01-12

Electron MainプロセスのHistoryServiceがshared HistoryServiceと統合され、DB接続が実現。

### 統合アーキテクチャ

```
┌─────────────┐    IPC    ┌─────────────────────────┐    DI    ┌─────────────────────────┐
│  Renderer   │ ───────── │  Electron HistoryService │ ──────── │  shared HistoryService  │
│  (React UI) │           │     (アダプター層)        │          │   (ビジネスロジック)     │
└─────────────┘           └─────────────────────────┘          └─────────────────────────┘
                                     │                                    │
                                     │ DI                                 │ DI
                                     ▼                                    ▼
                          ┌─────────────────┐              ┌─────────────────────────┐
                          │  LogRepository  │              │  ConversionRepository   │
                          └─────────────────┘              └─────────────────────────┘
                                     │                                    │
                                     └──────────────┬─────────────────────┘
                                                    ▼
                                          ┌────────────────┐
                                          │    SQLite DB   │
                                          └────────────────┘
```

### アダプターパターン（型変換）

Electron HistoryServiceはshared型をRenderer型に変換するアダプター。

| 項目 | shared型 | Renderer型 |
|------|----------|------------|
| ファイルサイズ | `sizeBytes: number` | `size: number` |
| ハッシュ | `contentHash: string` | `hash: string` |
| 最新フラグ | `isCurrentVersion: boolean` | `isLatest: boolean` |
| 作成日時 | `createdAt: Date` | `createdAt: string` (ISO 8601) |

### IPCチャンネル

| チャンネル | 用途 | バリデーション |
|-----------|------|---------------|
| `history:getFileHistory` | 履歴一覧取得 | fileId必須 |
| `history:getVersionDetail` | バージョン詳細取得 | conversionId必須 |
| `history:getConversionLogs` | 変換ログ取得 | conversionId必須 |
| `history:restoreVersion` | バージョン復元 | fileId, conversionId必須 |

### 依存性注入

```typescript
// ファクトリ関数（本番用）
export function createHistoryServiceWithDI(
  sharedHistoryService: IHistoryService,
  logRepository: LogRepository,
  logger: IConversionLogger,
): HistoryService {
  return new HistoryService(sharedHistoryService, logRepository, logger);
}

// @deprecated DI必須
export function createHistoryService(): HistoryService {
  throw new Error("Use createHistoryServiceWithDI()");
}
```

### LogRepositoryインターフェース

shared HistoryServiceにはログ取得機能がないため、Electron側でLogRepositoryを追加定義。

```typescript
export interface LogRepository {
  findByConversionId(
    conversionId: string,
    options?: { limit?: number; offset?: number; level?: string }
  ): Promise<Result<PaginatedResult<ConversionLogRecord>, Error>>;
}
```

### 品質指標

| 指標 | 実績 |
|------|------|
| テストカバレッジ（Line） | 92.16% |
| テストカバレッジ（Branch） | 100% |
| テストカバレッジ（Function） | 91.66% |
| 統合テスト数 | 31ケース |
| IPCハンドラーテスト数 | 22ケース |

### セキュリティ

- 全チャンネルがホワイトリストに登録済み（`preload/channels.ts`）
- contextIsolation: true, nodeIntegration: false
- Result型パターンによるエラーハンドリング

## アーキテクチャパターン

| パターン | 適用箇所 | 目的 |
|----------|----------|------|
| Template Method | `BaseConverter.convert()` | 変換フローの標準化 |
| Repository | `ConverterRegistry`, `ConversionRepository` | コンバーター/変換履歴管理の抽象化 |
| Factory | `createConverterInput()`, `createHistoryService()` | 型安全なオブジェクト生成 |
| Singleton | `globalConverterRegistry` | グローバルインスタンス提供 |
| Result Type | `HistoryService` | 明示的エラーハンドリング |

## 実装済みコンバーター

**実装場所**: `packages/shared/src/services/conversion/converters/`

| コンバーター | サポートMIME | 優先度 | 実装状況 |
|--------------|--------------|--------|----------|
| HTMLConverter | text/html | 10 | ✅ 実装済 |
| MarkdownConverter | text/markdown, text/x-markdown | 10 | ✅ 実装済 |
| CodeConverter | text/x-typescript, text/javascript, text/x-python | 10 | ✅ 実装済 |
| YAMLConverter | application/x-yaml, text/yaml, text/x-yaml | 10 | ✅ 実装済 |
| CSVConverter | text/csv, text/tab-separated-values | 5 | ✅ 実装済 |
| JSONConverter | application/json | 5 | ✅ 実装済 |
| PlainTextConverter | text/plain | 0 | ⏸️ 未実装 |

### HTMLConverter

HTML→Markdown変換、script/styleタグ自動除去、メタデータ抽出（title, description, keywords, lang）

### CSVConverter

CSV/TSV→Markdownテーブル変換、区切り文字自動検出、エスケープ処理

### JSONConverter

JSON→構造化Markdown変換、ネスト構造対応、再帰的階層表現

### MarkdownConverter

Markdown正規化、フロントマター抽出、見出し階層抽出、言語自動判定（日本語/英語）

### CodeConverter

多言語ソースコード対応（TypeScript, JavaScript, Python）、関数・クラス・インポート抽出

### YAMLConverter

YAML正規化、構造解析、トップレベルキー抽出、インデント深さ計算

## 品質指標

| 指標 | 実績 |
|------|------|
| テストカバレッジ | 100% |
| テスト数 | 201ケース |
| 実装行数 | 2,400行 |
| ドキュメント | 19件 |

## 新規コンバーター追加手順

1. **要件定義**: 対応形式、MIMEタイプ、メタデータ種類、優先度を決定
2. **TDD Red**: テストファイル作成、100%カバレッジ要件
3. **TDD Green**: BaseConverter継承、doConvert()実装
4. **登録**: index.tsのregisterDefaultConverters()に追加
5. **リファクタリング**: 重複コード抽出、複雑度低減
6. **ドキュメント**: 仕様書更新
7. **品質ゲート**: ESLint 0エラー、TypeScript 0エラー、カバレッジ100%

## コンバーター優先度ガイドライン

| 優先度 | 用途 | 例 |
|--------|------|------|
| 10 | 専用コンバーター（形式固有の処理） | Markdown, Code, YAML, HTML |
| 5-9 | 汎用的な構造化データ | JSON (5), CSV (5) |
| 1-4 | フォールバック | （将来の拡張用） |
| 0 | デフォルトハンドラー | PlainText |

## パフォーマンス要件

| ファイルサイズ | 目標処理時間 | 実測値 | 状態 |
|----------------|--------------|--------|------|
| < 10KB | < 50ms | 3-12ms | ✅ 達成 |
| 10KB - 100KB | < 200ms | 50-100ms | ✅ 達成 |
| 100KB - 1MB | < 1s | 400ms | ✅ 達成 |
| 1MB - 10MB | < 5s | 未検証 | ⚠️ 要検証 |
| > 10MB | < 30s | 未検証 | ⚠️ 要検証 |

## 既知の制限事項

| 項目 | 内容 | 影響範囲 |
|------|------|----------|
| 正規表現ベース解析 | ASTを使用しない | CodeConverter |
| 言語検出閾値 | 日本語100文字以上で判定 | MarkdownConverter |
| 大容量ファイル | 10MB超未検証 | 全コンバーター |
| 同期処理 | ストリーミング未対応 | ConversionService |

## 技術的負債

| ID | 内容 | 優先度 | 見積工数 |
|----|------|--------|----------|
| CONV-DEBT-001 | PlainTextConverter未実装 | Medium | 4h |
| CONV-DEBT-002 | AST-basedコード解析への移行 | Low | 16h |
| CONV-DEBT-003 | 大容量ファイル対応（ストリーミング） | Low | 12h |
| CONV-DEBT-004 | 正規表現タイムアウト実装（ReDoS対策） | Low | 4h |

## 将来の拡張ポイント

**追加予定のコンバーター**:

| コンバーター | 対応形式 | 優先度 | 見積工数 |
|--------------|----------|--------|----------|
| PDFConverter | application/pdf | 10 | 24h |
| DocxConverter | application/vnd.openxmlformats | 8 | 16h |
| ExcelConverter | application/vnd.ms-excel | 8 | 16h |
| XMLConverter | application/xml | 7 | 8h |

**機能拡張候補**:

- ストリーミング処理（大容量ファイル対応）
- バッチ最適化（同一形式の複数ファイル処理）
- キャッシング（変換結果のキャッシュ機構）
- プラグインシステム（サードパーティコンバーターの動的ロード）
- AST統合（TypeScript Compiler API、Python astモジュール）

---

## 関連ドキュメント

- [Embedding Generation Pipeline](./architecture-embedding-pipeline.md)
- [RAGアーキテクチャ](./architecture-rag.md)
- [内部API仕様](./api-internal.md)
- [コンバーター型定義](./interfaces-converter.md)
- [ConversionLogger実装ガイド](../../../../../docs/30-workflows/logging-service/outputs/phase-12/implementation-guide.md)
