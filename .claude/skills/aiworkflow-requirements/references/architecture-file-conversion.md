# ファイル変換 アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## A ファイル変換基盤アーキテクチャ

> **詳細設計**: `docs/30-workflows/completed-tasks/conversion-base/`
> **実装**: `packages/shared/src/services/conversion/`

### A.1 概要

ファイル変換基盤は、RAGシステムにおける多様なファイル形式（テキスト、Markdown、PDF等）を統一的に処理するための共通基盤を提供する。

**主要コンポーネント**:

| コンポーネント      | 責務                                                     |
| ------------------- | -------------------------------------------------------- |
| `IConverter`        | 変換処理のインターフェース定義                           |
| `BaseConverter`     | 共通変換処理の抽象基底クラス（Template Methodパターン）  |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択（Repositoryパターン） |
| `ConversionService` | 変換処理の統括（タイムアウト・同時実行制御）             |
| `MetadataExtractor` | テキストからのメタデータ抽出                             |

### A.2 アーキテクチャパターン

| パターン        | 適用箇所                  | 目的                       |
| --------------- | ------------------------- | -------------------------- |
| Template Method | `BaseConverter.convert()` | 変換フローの標準化         |
| Repository      | `ConverterRegistry`       | コンバーター管理の抽象化   |
| Factory         | `createConverterInput()`  | 型安全なオブジェクト生成   |
| Singleton       | `globalConverterRegistry` | グローバルインスタンス提供 |

### A.2B 実装済みコンバーター

**実装場所**: `packages/shared/src/services/conversion/converters/`

| コンバーター       | サポートMIME                                      | 優先度 | 主要機能                             | 実装状況  |
| ------------------ | ------------------------------------------------- | ------ | ------------------------------------ | --------- |
| HTMLConverter      | text/html                                         | 10     | HTML→Markdown、script/style除去      | ✅ 実装済 |
| MarkdownConverter  | text/markdown, text/x-markdown                    | 10     | 見出し・リンク・コードブロック抽出   | ✅ 実装済 |
| CodeConverter      | text/x-typescript, text/javascript, text/x-python | 10     | 関数・クラス・インポート抽出         | ✅ 実装済 |
| YAMLConverter      | application/x-yaml, text/yaml, text/x-yaml        | 10     | 構造解析、トップレベルキー抽出       | ✅ 実装済 |
| CSVConverter       | text/csv, text/tab-separated-values               | 5      | CSV/TSV→テーブル、区切り文字自動検出 | ✅ 実装済 |
| JSONConverter      | application/json                                  | 5      | JSON→構造化Markdown、ネスト対応      | ✅ 実装済 |
| PlainTextConverter | text/plain                                        | 0      | BOM除去、改行コード正規化            | ⏸️ 未実装 |

#### HTMLConverter

**ファイル**: `html-converter.ts`

**機能**:

- Turndownライブラリを使用したHTML→Markdown変換
- `<script>`/`<style>`タグの自動除去
- HTMLエンティティのデコード
- メタデータ抽出（title, description, keywords, lang属性）

**メタデータ抽出**:

- `title`: `<title>`タグから抽出
- `description`: `<meta name="description">`から抽出
- `keywords`: `<meta name="keywords">`から抽出
- `lang`: `<html lang="...">`属性から抽出

#### CSVConverter

**ファイル**: `csv-converter.ts`

**機能**:

- CSV/TSV形式→Markdownテーブル変換
- 区切り文字の自動検出（カンマ/タブ）
- ダブルクォートによるエスケープ処理
- 改行を含むセルの対応

**メタデータ抽出**:

- `rowCount`: データ行数（ヘッダー除く）
- `columnCount`: 列数
- `delimiter`: 検出された区切り文字

#### JSONConverter

**ファイル**: `json-converter.ts`

**機能**:

- JSON→構造化Markdown変換
- ネスト構造対応（オブジェクト・配列）
- 再帰的な階層表現
- プリミティブ値の適切なフォーマット

**メタデータ抽出**:

- `depth`: JSONの最大ネスト深度
- `keyCount`: 総キー数（オブジェクトのみ）

#### MarkdownConverter

**ファイル**: `markdown-converter.ts`

**機能**:

- Markdown正規化（BOM除去、改行統一、連続空行制限）
- フロントマター抽出・除去（YAML形式）
- 見出し階層の抽出（h1～h6）
- リンク抽出（外部URLのみ）
- コードブロック検出と言語タグ認識
- 言語自動判定（日本語/英語、閾値: 100文字）

**メタデータ抽出**:

- `title`: 最初のh1見出しまたはフロントマターから抽出
- `headers`: 見出し階層（level, text）
- `links`: 外部URLリスト（重複除去済み）
- `codeBlocks`: コードブロック数
- `language`: 自動判定された言語（"ja" | "en"）
- `hasFrontmatter`: フロントマターの有無
- `hasCodeBlocks`: コードブロックの有無

**正規化処理**:

- BOM除去
- 改行コード統一（CRLF→LF）
- 連続空行を2行までに制限
- コードブロック内の空白は保持
- コードブロック外の行末空白を除去

#### CodeConverter

**ファイル**: `code-converter.ts`

**機能**:

- 多言語ソースコード対応（TypeScript, JavaScript, Python）
- 言語自動判定（ファイル拡張子ベース）
- 正規表現ベースの構造抽出
- 関数定義検出（通常関数、アロー関数、async関数）
- クラス定義検出
- インポート/エクスポート文の抽出
- Markdown形式での構造化出力

**対応言語と拡張子**:

- TypeScript: `.ts`, `.tsx`, `.mts`, `.cts`
- JavaScript: `.js`, `.jsx`, `.mjs`, `.cjs`
- Python: `.py`

**メタデータ抽出**:

- `language`: プログラミング言語名（typescript, javascript, python）
- `functions`: 関数名リスト
- `classes`: クラス名リスト
- `imports`: インポート元モジュール名リスト
- `exports`: エクスポート名リスト
- `classCount`: クラス定義数
- `functionCount`: 関数定義数
- `importCount`: インポート文数
- `exportCount`: エクスポート数

**構造抽出パターン**:

- 関数: `function functionName(...)`, `const functionName = (...) =>`
- クラス: `class ClassName`
- インポート: `import ... from 'module'`, `from module import ...`
- エクスポート: `export function/class/const/type/interface`

#### YAMLConverter

**ファイル**: `yaml-converter.ts`

**機能**:

- YAML正規化（BOM除去、行末正規化、連続空行削減）
- YAML構造解析（トップレベルキー、インデント、コメント）
- Markdown形式での構造化出力
- インデント深さ計算（スペース数ベース）
- コメント検出

**メタデータ抽出**:

- `topLevelKeys`: トップレベルキーのリスト
- `hasComments`: コメントの有無
- `maxIndentDepth`: 最大インデント深さ（スペース数）
- `totalLines`: 総行数（空行除く）

**正規化処理**:

- BOM除去（0xFEFFチェック）
- 行末正規化（CRLF→LF）
- 行末空白除去
- 連続空行を2行までに制限

**Markdown出力形式**:

- YAML Structure セクション（構造サマリー）
- YAML Content セクション（YAML本体をコードブロックで表示）

#### PlainTextConverter（未実装）

**タスク**: QUALITY-02（品質向上タスク）
**実装予定機能**:

- UTF-8/UTF-16/UTF-32 BOM除去
- 改行コード正規化（CRLF/CR → LF）
- 文字エンコーディング検出

### A.3 品質指標

| 指標             | 実績      |
| ---------------- | --------- |
| テストカバレッジ | 100%      |
| テスト数         | 201ケース |
| 実装行数         | 2,400行   |
| ドキュメント     | 19件      |

**最新実装状況（2025-12-25時点）**:

- HTMLConverter, CSVConverter, JSONConverter: Phase 0-2で実装済み
- MarkdownConverter, CodeConverter, YAMLConverter: Phase 3-8で実装・検証完了
- 全コンバーター: 100%テストカバレッジ、ESLint 0エラー、TypeScript 0エラー
- 品質評価: A+（本番環境デプロイ準備完了）

### A.4 新規コンバーター追加手順

新しいファイル形式に対応するコンバーターを追加する際の標準手順。

#### Step 1: 要件定義

**確認事項**:

- 対応するファイル形式とMIMEタイプ
- 抽出すべきメタデータの種類
- 優先度の決定（既存コンバーターとの競合を考慮）
- パフォーマンス要件（想定ファイルサイズ、処理時間）

**ドキュメント作成**:

- `docs/30-workflows/[converter-name]/task-[converter-name].md` - タスク仕様書

#### Step 2: TDD Red - テストファースト

**テストファイル作成**: `packages/shared/src/services/conversion/converters/__tests__/[name]-converter.test.ts`

**必須テストケース**:

- 基本的な変換処理（正常系）
- サポートMIMEタイプの検証（`canHandle`メソッド）
- 空ファイル処理
- 不正な入力の拒否
- メタデータ抽出の正確性
- オプション引数の動作（`maxContentLength`, `preserveFormatting`等）
- 最大コンテンツ長のトリミング
- エラーハンドリング

**カバレッジ要件**: 100%（Statements, Branches, Functions, Lines）

#### Step 3: TDD Green - 実装

**ファイル作成**: `packages/shared/src/services/conversion/converters/[name]-converter.ts`

**実装必須要素**:

```typescript
export class [Name]Converter extends BaseConverter {
  // 必須プロパティ
  readonly id = "[name]-converter";
  readonly name = "[Name] Converter";
  readonly supportedMimeTypes = ["mime/type1", "mime/type2"] as const;
  readonly priority = [0-10];  // 優先度を設定

  // 必須メソッド（protected）
  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions
  ): Promise<Result<ConverterOutput, RAGError>> {
    // 1. テキストコンテンツ取得
    // 2. 正規化処理
    // 3. 構造抽出
    // 4. Markdown形式で整形
    // 5. 最大長トリミング
    // 6. メタデータ生成
  }

  // オプション: コンバーター説明
  protected getDescription(): string {
    return "説明文";
  }
}
```

**実装パターン**:

- `getTextContent(input)`: BaseConverterのヘルパーメソッドでテキスト取得
- `trimContent(content, maxLength)`: BaseConverterのヘルパーメソッドでトリミング
- try-catchでエラーをキャッチし、`createRAGError()`でRAGError型に変換
- `ok(result)` / `err(error)` でResult型を返す

#### Step 4: コンバーター登録

**ファイル更新**: `packages/shared/src/services/conversion/converters/index.ts`

**追加内容**:

1. インポート文を追加
2. エクスポート文を追加
3. `registerDefaultConverters()`の配列に追加
4. `registeredCount`の期待値を更新

**テスト更新**: `__tests__/index.test.ts`

- 登録数のアサーションを更新（例: 6 → 7）
- 新規コンバーターのエクスポートテストを追加

#### Step 5: TDD Refactor - リファクタリング

**リファクタリング観点**:

- 重複コードの抽出（BaseConverterへの移動を検討）
- メソッドの単一責任原則の確認
- 複雑度の低減（Cyclomatic Complexity < 10）
- ネーミングの一貫性

#### Step 6: ドキュメント更新

**更新対象**:

1. `specs/05-architecture.md` - コンバーター一覧に追加
2. `specs/06-core-interfaces.md` - 実装クラスと使用例追加
3. `docs/30-api/converters/[name]-converter.md` - API仕様書作成
4. `docs/40-manuals/rag-conversion-guide.md` - 使用ガイドに追加

#### Step 7: 品質ゲート

**必須チェック項目**:

- ✅ ESLint: 0エラー
- ✅ TypeScript型チェック: 0エラー
- ✅ ユニットテスト: 100%カバレッジ
- ✅ 手動テスト: 全テストケースPASS
- ✅ ビルド成功
- ✅ ドキュメント完備

### A.5 コンバーター優先度設定ガイドライン

**優先度の意味**:

複数のコンバーターが同じMIMEタイプをサポートする場合、優先度が高いコンバーターが選択されます。

**優先度レベル**:

| 優先度 | 用途                               | 例                                                             |
| ------ | ---------------------------------- | -------------------------------------------------------------- |
| 10     | 専用コンバーター（形式固有の処理） | MarkdownConverter, CodeConverter, YAMLConverter, HTMLConverter |
| 5-9    | 汎用的な構造化データ               | JSONConverter (5), CSVConverter (5)                            |
| 1-4    | フォールバック                     | （将来の拡張用）                                               |
| 0      | デフォルトハンドラー               | PlainTextConverter（未実装）                                   |

**設定の考え方**:

- **priority: 10**: 特定形式に特化した処理を持つ場合（構造抽出、メタデータ解析）
- **priority: 5**: シンプルな変換ロジックだが有用な場合
- **priority: 0**: すべてのファイル形式に対応可能な汎用ハンドラー

**競合時の選択**:

1. MIMEタイプが完全一致するコンバーターを抽出
2. 優先度の降順でソート
3. 最も優先度が高いコンバーターを選択

### A.6 ExtractedMetadata拡張ガイドライン

**基本メタデータ（全コンバーター共通）**:

必須フィールド:

- `title`: ドキュメントタイトル（nullable）
- `author`: 著者名（nullable）
- `language`: 言語コード（"ja" | "en"）
- `wordCount`: 単語数
- `lineCount`: 行数
- `charCount`: 文字数

**拡張可能フィールド**:

- `headers`: 見出し構造（配列）
- `codeBlocks`: コードブロック数
- `links`: リンク情報（配列）
- `custom`: コンバーター固有のメタデータ（オブジェクト）

**custom フィールドの活用**:

```typescript
// 例: MarkdownConverter
custom: {
  hasFrontmatter: boolean,
  hasCodeBlocks: boolean,
  headerCount: number
}

// 例: CodeConverter
custom: {
  language: string,
  classCount: number,
  functionCount: number,
  importCount: number,
  classes: string[],
  functions: string[]
}

// 例: YAMLConverter
custom: {
  hasComments: boolean,
  maxIndentDepth: number,
  topLevelKeys: string[],
  totalLines: number
}
```

**拡張時の注意点**:

- `custom`フィールドは自由に拡張可能
- 基本フィールド（title, author等）は型定義を変更しない
- 将来的に共通化すべきフィールドは基本メタデータへの昇格を検討

### A.7 既知の制限事項と技術的負債

**制限事項**:

| 項目               | 内容                          | 影響範囲                                                 |
| ------------------ | ----------------------------- | -------------------------------------------------------- |
| 正規表現ベース解析 | AST（抽象構文木）を使用しない | CodeConverter - 複雑な構文の一部が抽出されない可能性     |
| 言語検出閾値       | 日本語文字100文字以上で判定   | MarkdownConverter - 短い日本語テキストは英語と判定される |
| 大容量ファイル     | 10MB超のファイル未検証        | 全コンバーター - パフォーマンス特性が不明                |
| 同期処理           | 非同期ストリーミング未対応    | ConversionService - 超大容量ファイルでメモリ枯渇の可能性 |

**技術的負債**:

| ID            | 内容                                  | 優先度 | 見積工数 |
| ------------- | ------------------------------------- | ------ | -------- |
| CONV-DEBT-001 | PlainTextConverter未実装              | Medium | 4h       |
| CONV-DEBT-002 | AST-basedコード解析への移行           | Low    | 16h      |
| CONV-DEBT-003 | 大容量ファイル対応（ストリーミング）  | Low    | 12h      |
| CONV-DEBT-004 | 正規表現タイムアウト実装（ReDoS対策） | Low    | 4h       |

### A.8 将来の拡張ポイント

**追加予定のコンバーター**:

| コンバーター       | 対応形式                       | 優先度 | ユースケース       | 見積工数 |
| ------------------ | ------------------------------ | ------ | ------------------ | -------- |
| PDFConverter       | application/pdf                | 10     | 学術論文、レポート | 24h      |
| DocxConverter      | application/vnd.openxmlformats | 8      | Word文書           | 16h      |
| ExcelConverter     | application/vnd.ms-excel       | 8      | スプレッドシート   | 16h      |
| PlainTextConverter | text/plain                     | 0      | フォールバック     | 4h       |
| XMLConverter       | application/xml                | 7      | 構造化データ       | 8h       |

**機能拡張候補**:

- **ストリーミング処理**: 大容量ファイル対応（>10MB）
- **バッチ最適化**: 同一形式の複数ファイルをまとめて処理
- **キャッシング**: 変換結果のキャッシュ機構
- **プラグインシステム**: サードパーティコンバーターの動的ロード
- **AST統合**: TypeScript Compiler API、Python ast モジュールの活用

**アーキテクチャ改善候補**:

- **Worker Threads**: CPU集約的な処理をバックグラウンド実行
- **メトリクス収集**: 変換時間、エラー率、ファイルサイズ分布の記録
- **A/Bテスト基盤**: 新旧コンバーターの品質比較

### A.9 パフォーマンス要件とベンチマーク

**性能目標**:

| ファイルサイズ | 目標処理時間 | 実測値（平均）    | 状態      |
| -------------- | ------------ | ----------------- | --------- |
| < 10KB         | < 50ms       | 3-12ms            | ✅ 達成   |
| 10KB - 100KB   | < 200ms      | 50-100ms          | ✅ 達成   |
| 100KB - 1MB    | < 1s         | 400ms（Markdown） | ✅ 達成   |
| 1MB - 10MB     | < 5s         | 未検証            | ⚠️ 要検証 |
| > 10MB         | < 30s        | 未検証            | ⚠️ 要検証 |

**ベンチマーク実行方法**:

手動テストスクリプト: `packages/shared/src/services/conversion/__manual-tests__/run-manual-tests.ts`

**パフォーマンスボトルネック**:

- MarkdownConverter: 見出し・リンク抽出の正規表現（428ms）
- CodeConverter: 多数の正規表現マッチング（構造抽出）
- YAMLConverter: 行単位の解析（インデント計算）

**最適化候補**:

- 正規表現の最適化（事前コンパイル）
- 文字列操作の削減（StringBuilder パターン）
- 不要な中間変数の排除

### A.10 デザインパターン適用理由

**Template Method パターン（BaseConverter）**:

- **目的**: 変換処理フローの標準化
- **適用箇所**: `convert()` メソッド（final）→ `doConvert()` メソッド（abstract）
- **利点**: 共通処理（タイミング計測、エラーハンドリング）を基底クラスで統一
- **拡張方法**: サブクラスは `doConvert()` のみを実装すればよい

**Repository パターン（ConverterRegistry）**:

- **目的**: コンバーター管理の抽象化
- **適用箇所**: `ConverterRegistry.findConverter()`
- **利点**: コンバーター選択ロジックをカプセル化、テスト容易性
- **拡張方法**: 新規コンバーターは `register()` で追加するだけ

**Singleton パターン（globalConverterRegistry）**:

- **目的**: グローバルな共有インスタンス提供
- **適用箇所**: `globalConverterRegistry`, `globalConversionService`
- **利点**: アプリケーション全体で統一されたコンバーター集合を使用
- **拡張方法**: カスタムレジストリが必要な場合は `new ConverterRegistry()` で個別作成可能

**Factory パターン（暗黙的）**:

- **目的**: 型安全なオブジェクト生成
- **適用箇所**: `createConverterInput()`, `generateFileId()`
- **利点**: Branded型の生成を安全に
- **拡張方法**: 新しいBranded型にも同様のファクトリ関数を提供

**Railway Oriented Programming（Result型）**:

- **目的**: エラーハンドリングの明示化
- **適用箇所**: すべての変換メソッドの戻り値
- **利点**: 例外を使わない、エラーパスの可視化、型安全なエラー処理
- **拡張方法**: 新規メソッドも `Result<T, RAGError>` を返すように統一

### A.11 テスト戦略

**テストピラミッド**:

```
         /\
        /E2E\         手動テスト（7ケース）
       /------\
      /統合テスト\     ConversionService統合（含む）
     /----------\
    /ユニットテスト\   コンバーター個別（166ケース）
   /--------------\
```

**ユニットテストの構成**:

- 各コンバーターごとに50-60ケース
- 正常系、異常系、境界値を網羅
- AAA（Arrange-Act-Assert）パターン
- describe/itによる階層的なテスト構造

**テスト用ユーティリティ**:

- `beforeEach()` / `afterEach()` でレジストリをリセット
- `resetRegistrationState()` で二重登録フラグをクリア
- モックは最小限（実際のコンバーターインスタンスを使用）

**手動テスト**:

- 実際のファイルでの動作確認
- ConversionService経由での統合テスト
- パフォーマンス計測

**カバレッジ要件の厳守**:

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

未達の場合はPhase 6で修正が必要。

---

## B Embedding Generation Pipeline アーキテクチャ

> **詳細設計**: `docs/30-workflows/embedding-generation-pipeline/`
> **実装**: `packages/shared/src/services/embedding/`, `packages/shared/src/services/chunking/`

### B.1 概要

Embedding Generation Pipelineは、ドキュメントを意味的に検索可能なベクトル表現に変換するための統合処理基盤を提供する。

**処理フロー**:

```
ドキュメント → チャンキング → 埋め込み生成 → 重複排除 → ベクトルDB保存
```

**主要コンポーネント**:

| コンポーネント      | 責務                                           |
| ------------------- | ---------------------------------------------- |
| `EmbeddingPipeline` | パイプライン全体のオーケストレーション         |
| `ChunkingService`   | ドキュメントのチャンク分割（複数戦略サポート） |
| `EmbeddingService`  | 埋め込みベクトル生成（マルチプロバイダー）     |
| `BatchProcessor`    | バッチ処理と並列実行制御                       |
| `RetryHandler`      | リトライ機構（指数バックオフ）                 |
| `CircuitBreaker`    | サーキットブレーカー（障害遮断）               |
| `RateLimiter`       | レート制限（Token Bucket）                     |

### B.2 チャンキング戦略

**実装場所**: `packages/shared/src/services/chunking/strategies/`

| 戦略                      | 用途                 | チャンク単位         |
| ------------------------- | -------------------- | -------------------- |
| MarkdownChunkingStrategy  | Markdownドキュメント | セクション（見出し） |
| CodeChunkingStrategy      | ソースコード         | クラス/関数          |
| FixedSizeChunkingStrategy | プレーンテキスト     | 固定トークン数       |
| SemanticChunkingStrategy  | 意味的境界での分割   | 意味的まとまり       |

**共通設定**:

- チャンクサイズ: 512トークン（デフォルト）
- オーバーラップ: 50トークン（デフォルト）
- 最小チャンクサイズ: 100トークン

### B.3 埋め込みプロバイダー

**実装場所**: `packages/shared/src/services/embedding/providers/`

| プロバイダー   | モデル                 | 次元数 | 用途                 |
| -------------- | ---------------------- | ------ | -------------------- |
| OpenAIProvider | text-embedding-3-small | 1536   | 高品質埋め込み       |
| Qwen3Provider  | qwen3-embedding        | 768    | 軽量・フォールバック |

**フォールバックチェーン**:

1. OpenAIProvider（第一選択）
2. Qwen3Provider（フォールバック）

### B.4 信頼性機能

#### リトライ機構

- 最大リトライ回数: 3回
- 初期遅延: 1000ms
- バックオフ倍率: 2（指数バックオフ）
- ジッター: 有効

#### サーキットブレーカー

- 状態: CLOSED → OPEN → HALF_OPEN
- 失敗閾値: 5回
- タイムアウト: 60秒
- 成功閾値（HALF_OPEN→CLOSED）: 2回

#### レート制限

- アルゴリズム: Token Bucket
- OpenAI: 1M tokens/分
- バースト許容: 設定可能

### B.5 パフォーマンス最適化

#### キャッシング

- LRUキャッシュ: 埋め込み結果をメモリ内保持
- ハッシュベース: コンテンツのSHA-256ハッシュをキーとして使用
- ヒット率追跡: キャッシュ効率のメトリクス

#### 重複排除

1. **コンテンツハッシュ**: 完全一致の検出（SHA-256）
2. **コサイン類似度**: 類似コンテンツの検出（閾値: 0.95）

#### 差分更新

- ファイルハッシュによる変更検出
- 変更されたファイルのみ再処理
- 性能向上: 初回比4.34倍高速化

#### バッチ処理

- 推奨バッチサイズ: 50チャンク/バッチ
- 推奨並列度: 2
- スループット: 53,333 chunks/min（モック環境）

### B.6 品質メトリクス

**テストカバレッジ**:

- Statement Coverage: 91.39%
- Branch Coverage: 87.13%
- Function Coverage: 86.79%

**パフォーマンス**:

- 1000チャンク処理時間: 2.17秒（品質ゲート: 5分）
- メモリ使用量: 8.90MB（品質ゲート: 500MB）
- スループット: 27,667 chunks/min（品質ゲート: 100 chunks/min）

**信頼性**:

- リトライ成功率: 100%（50リクエスト中12回のレート制限を全てリカバリー）
- サーキットブレーカー: 3状態管理で障害遮断
- エラーハンドリング: 4種類のエラーケースを網羅

---
