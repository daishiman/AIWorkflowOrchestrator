# システムIPC・AIプロバイダーAPI連携 / detail specification

> 親仕様書: [api-ipc-system.md](api-ipc-system.md)
> 役割: detail specification

## エンティティ抽出サービス (NER)

### 概要

チャンクからエンティティを抽出する内部サービス。現在はElectronアプリ内部で使用され、外部REST APIは未公開。

**実装場所**: `packages/shared/src/services/extraction/`

### IEntityExtractor インターフェース

| メソッド          | 説明                             | 戻り値                                 |
| ----------------- | -------------------------------- | -------------------------------------- |
| `extract()`       | 単一チャンクからエンティティ抽出 | `Result<ExtractionResult, Error>`      |
| `extractBatch()`  | 複数チャンクからバッチ抽出       | `Result<BatchExtractionResult, Error>` |
| `mergeEntities()` | 抽出結果のマージ（重複除去）     | `ExtractedEntity[]`                    |

### EntityExtractionOptions

| オプション           | 型       | デフォルト | 説明                         |
| -------------------- | -------- | ---------- | ---------------------------- |
| types                | string[] | 全タイプ   | 抽出対象のエンティティタイプ |
| minConfidence        | number   | 0.5        | 最小信頼度閾値               |
| maxEntitiesPerChunk  | number   | 20         | チャンクあたり最大抽出数     |
| minNameLength        | number   | 2          | 最小名前長                   |
| generateDescriptions | boolean  | true       | 説明生成（LLMのみ）          |
| useLLM               | boolean  | true       | LLM使用フラグ                |

### エラーハンドリング

| エラークラス       | 説明                    | 対処                         |
| ------------------ | ----------------------- | ---------------------------- |
| `LLMProviderError` | LLM API呼び出し失敗     | ルールベースにフォールバック |
| `JsonParseError`   | LLMレスポンスのJSON不正 | ルールベースにフォールバック |
| `ValidationError`  | 入力バリデーション失敗  | エラーメッセージを返却       |

---

