# 内部API・RAG API 仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントは内部サービスAPIの索引です。各APIの詳細は個別ファイルを参照してください。

## API一覧

| API | ファイル | 説明 |
|-----|----------|------|
| ConversionService API | [api-internal-conversion.md](./api-internal-conversion.md) | RAG変換システムの内部サービスAPI |
| チャンク検索API | [api-internal-chunk-search.md](./api-internal-chunk-search.md) | FTS5全文検索機能のチャンク検索 |
| Embedding Generation API | [api-internal-embedding.md](./api-internal-embedding.md) | 埋め込みベクトル生成API |
| Search Service API | [api-internal-search.md](./api-internal-search.md) | テキスト検索・置換機能API |

## 各APIの概要

### ConversionService API

- **実装場所**: `packages/shared/src/services/conversion/`
- **主要機能**: ファイル変換、バッチ変換、MIMEタイプ管理
- **詳細**: See [api-internal-conversion.md](./api-internal-conversion.md)

### チャンク検索API

- **実装場所**: `packages/shared/src/db/queries/chunks-search.ts`
- **主要機能**: キーワード検索、フレーズ検索、NEAR検索
- **詳細**: See [api-internal-chunk-search.md](./api-internal-chunk-search.md)

### Embedding Generation API

- **実装場所**: `packages/shared/src/services/embedding/`
- **主要機能**: ドキュメント埋め込み、バッチ埋め込み、チャンク生成
- **詳細**: See [api-internal-embedding.md](./api-internal-embedding.md)

### Search Service API

- **実装場所**: `packages/shared/src/search/`
- **主要機能**: ファイル内検索、ワークスペース検索、置換
- **詳細**: See [api-internal-search.md](./api-internal-search.md)

---

## 関連ドキュメント

- [エラーハンドリング仕様](./error-handling.md)
- [コアインターフェース仕様](./interfaces-core.md)
- [セキュリティガイドライン](./security-guidelines.md)
