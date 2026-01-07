# エンティティ抽出サービス (NER) - 実装ガイド

## メタ情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| 機能名   | Entity Extraction Service(NER) |
| 作成日   | 2026-01-05                     |
| 対象読者 | 開発者・技術者・学習者         |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. エンティティ抽出って何？

### 1.1 身近な例で考えてみよう

図書館の司書さんを想像してください。新しい本が届くと、司書さんは：

- **著者名を見つける**（人名）
- **出版社を確認する**（組織名）
- **発売日をチェックする**（日付）
- **プログラミング言語を特定する**（技術名）

これらの情報をカードに記録して、後で検索できるようにします。

```
┌─────────────────────────────────────────────────┐
│  テキスト:                                       │
│  「TypeScriptはMicrosoftが2012年に開発した      │
│   プログラミング言語です。」                     │
└─────────────────────────────────────────────────┘
                    ↓ 司書さん（エンティティ抽出）
┌─────────────────────────────────────────────────┐
│  見つけた情報:                                   │
│  ・TypeScript → 技術名                          │
│  ・Microsoft → 組織名                           │
│  ・2012年 → 日付                                │
└─────────────────────────────────────────────────┘
```

エンティティ抽出サービスは、この司書さんと同じことをテキストに対して自動で行います。

### 1.2 なぜ必要なの？

**問題**: 大量の文書があるとき、人の手で全部読んで情報を整理するのは大変。

**解決**: コンピュータが自動で「重要な名前」を見つけ出し、整理してくれる。

| 状況                        | エンティティ抽出がないと | あると           |
| --------------------------- | ------------------------ | ---------------- |
| 1000件のドキュメント検索    | 全部読む必要あり         | キーワードで一発 |
| 「Reactを使った記事」を探す | 目視で探す               | 自動で分類済み   |
| 関連する会社名を抽出        | 手作業でメモ             | 自動でリスト化   |

### 1.3 今回作ったもの

| 日本語       | 英語       | 役割                     |
| ------------ | ---------- | ------------------------ |
| エンティティ | Entity     | 見つけた「重要な名前」   |
| 抽出器       | Extractor  | 名前を見つけるプログラム |
| メンション   | Mention    | 文中での出現位置         |
| 信頼度       | Confidence | どれくらい確かか（0〜1） |
| エイリアス   | Alias      | 別名（TSとTypeScript等） |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
┌─────────────────────────────────────────────────┐
│  Step 1: テキストを受け取る                      │
│  「ReactとVueはJavaScriptフレームワークです」   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Step 2: パターンで探す（ルールベース）          │
│  「React」→ 技術名パターンに一致！              │
│  「Vue」→ 技術名パターンに一致！                │
│  「JavaScript」→ 技術名パターンに一致！         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Step 3: 結果を整理する                          │
│  - 重複を除去                                    │
│  - 出現位置を記録                                │
│  - 信頼度を付与                                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Step 4: 結果を返す                              │
│  [                                               │
│    { name: "React", type: "technology" },        │
│    { name: "Vue", type: "technology" },          │
│    { name: "JavaScript", type: "technology" }    │
│  ]                                               │
└─────────────────────────────────────────────────┘
```

### 2.2 2つの探し方

#### 方法1: ルールベース（高速・確実）

予め登録されたパターンで探す方法。

```
「React」という単語 → 技術名として登録済み → 見つかった！
```

**メリット**: 速い、確実
**デメリット**: 登録されていないものは見つけられない

#### 方法2: LLMベース（賢い・柔軟）

AI（大規模言語モデル）に聞く方法。

```
AI: 「このテキストから重要な名前を教えて」
AI: 「React、Vue、JavaScriptが技術名として見つかりました」
```

**メリット**: 未知の名前も見つけられる
**デメリット**: 少し時間がかかる

---

## 3. 作ったものの全体像

```
┌─────────────────────────────────────────────────┐
│         エンティティ抽出サービス                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐   ┌─────────────────┐      │
│  │  LLM抽出器      │   │  ルール抽出器   │      │
│  │  (AIで探す)     │   │  (パターンで探す)│     │
│  └────────┬────────┘   └────────┬────────┘      │
│           │                     │                │
│           └──────────┬──────────┘                │
│                      ↓                           │
│           ┌─────────────────┐                    │
│           │  結果マージ     │←── 重複を除去     │
│           │  (統合)         │                    │
│           └────────┬────────┘                    │
│                    ↓                             │
│           ┌─────────────────┐                    │
│           │  エンティティ   │←── 見つかった名前 │
│           │  リスト         │                    │
│           └─────────────────┘                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
packages/shared/src/services/extraction/
├── __tests__/                    # テストコード
│   ├── mocks/
│   │   └── llm-provider.mock.ts  # LLMプロバイダーモック
│   ├── entity-extractor.test.ts  # LLM抽出器テスト
│   ├── rule-based-extractor.test.ts # ルール抽出器テスト
│   ├── utils.test.ts             # ユーティリティテスト
│   └── errors.test.ts            # エラークラステスト
├── prompts/
│   └── entity-extraction.ts      # LLMプロンプト生成
├── entity-extractor.ts           # LLMベース抽出器
├── rule-based-extractor.ts       # ルールベース抽出器
├── errors.ts                     # カスタムエラー定義
├── interfaces.ts                 # インターフェース定義
├── types.ts                      # 型定義（Zodスキーマ）
├── utils.ts                      # ユーティリティ関数
└── index.ts                      # バレルエクスポート
```

### 1.2 クラス図

```
┌──────────────────────────────────────────────────────────┐
│                    <<interface>>                          │
│                   IEntityExtractor                        │
├──────────────────────────────────────────────────────────┤
│ + extract(chunk, options): Result<ExtractionResult>       │
│ + extractBatch(chunks, options): Result<BatchResult>      │
│ + mergeEntities(results): ExtractedEntity[]               │
└──────────────────────────────────────────────────────────┘
                          △
                          │ implements
          ┌───────────────┴───────────────┐
          │                               │
┌─────────────────────┐       ┌─────────────────────┐
│  LLMEntityExtractor │       │ RuleBasedExtractor  │
├─────────────────────┤       ├─────────────────────┤
│ - llmProvider       │       │ - patterns          │
├─────────────────────┤       ├─────────────────────┤
│ + extract()         │       │ + extract()         │
│ + extractBatch()    │       │ + extractBatch()    │
│ + mergeEntities()   │       │ + mergeEntities()   │
└─────────────────────┘       └─────────────────────┘
          │
          │ uses
          ↓
┌─────────────────────┐
│  <<interface>>      │
│   ILLMProvider      │
├─────────────────────┤
│ + modelId: string   │
│ + generate(prompt)  │
└─────────────────────┘
```

### 1.3 データフロー

```
Chunk (テキスト断片)
    │
    ↓
┌─────────────────────────────────────────────────┐
│         IEntityExtractor.extract()               │
├─────────────────────────────────────────────────┤
│  1. オプションをマージ (mergeOptions)            │
│  2. テキストからエンティティ抽出                 │
│  3. フィルタリング (type, confidence, length)    │
│  4. メンション情報を追加                         │
│  5. Result<ExtractionResult> を返却              │
└─────────────────────────────────────────────────┘
    │
    ↓
ExtractionResult {
  entities: ExtractedEntity[],
  chunkId: string,
  processingTimeMs: number,
  modelUsed: string
}
```

---

## 2. 型定義詳細

### 2.1 ExtractedEntity（抽出されたエンティティ）

```typescript
export const ExtractedEntitySchema = z.object({
  // ===== 基本情報 =====
  name: z.string().min(1),
  // なぜmin(1): 空文字のエンティティは無意味なため

  normalizedName: z.string().min(1),
  // なぜ必要: 「TypeScript」と「typescript」を同一視するため
  // 正規化ルール: 小文字化 + 前後空白除去 + 複数空白を単一に

  type: z.enum(EntityTypeValues),
  // なぜenum: 52種類の定義済みタイプに限定（型安全）
  // 52種類: person, organization, technology, date, etc.

  confidence: z.number().min(0).max(1),
  // なぜ0-1範囲: 確率を表現（0=不確実、1=確実）
  // ルールベース: パターンに応じて0.8〜0.95
  // LLMベース: モデルの自信度を反映

  // ===== オプショナル情報 =====
  description: z.string().optional(),
  // なぜoptional: LLMのみが生成可能、ルールベースでは不要

  aliases: z.array(z.string()).default([]),
  // なぜ配列: 「TS」「TypeScript Language」等の複数別名
  // なぜdefault([]): 空配列で初期化してnullチェック不要に

  mentions: z.array(MentionSchema).default([]),
  // なぜ配列: 同一エンティティが複数回出現する可能性

  attributes: z.record(z.string(), z.unknown()).optional(),
  // なぜRecord: 拡張可能な属性格納（将来の拡張用）
  // なぜunknown: 任意の型を許容
});
```

### 2.2 EntityExtractionOptions（抽出オプション）

```typescript
export const EntityExtractionOptionsSchema = z.object({
  types: z.array(z.enum(EntityTypeValues)).optional(),
  // なぜoptional: 未指定時は全タイプを対象
  // 使用例: ["technology", "organization"] で絞り込み

  minConfidence: z.number().min(0).max(1).default(0.5),
  // なぜ0.5: 半分以上の確信がある結果のみ返す
  // 調整: 精度重視→0.8, 網羅性重視→0.3

  maxEntitiesPerChunk: z.number().int().positive().default(20),
  // なぜ20: 1チャンクあたりの上限（メモリ制限）
  // なぜint().positive(): 負数や小数は無効

  minNameLength: z.number().int().positive().default(2),
  // なぜ2: 1文字エンティティ（A, B等）を除外
  // 理由: ノイズが多い

  generateDescriptions: z.boolean().default(true),
  // なぜdefault(true): LLMの場合は説明生成を推奨
  // 無効化: パフォーマンス優先時

  useLLM: z.boolean().default(true),
  // なぜdefault(true): LLMの方が高精度
  // false: ルールベースのみ使用（高速・フォールバック）

  maxRetries: z.number().int().nonnegative().default(3),
  // なぜ3: LLM API障害時のリトライ回数
  // なぜnonnegative: 0以上（0=リトライなし）
});
```

### 2.3 入力型と出力型の分離

```typescript
/** 入力型: 部分的指定可能（ユーザー向けAPI） */
export type EntityExtractionOptionsInput = z.input<
  typeof EntityExtractionOptionsSchema
>;
// 使用場面: extract(chunk, { types: ["technology"] })
// デフォルト値は適用されていない

/** 出力型: デフォルト適用後（内部処理用） */
export type EntityExtractionOptions = z.infer<
  typeof EntityExtractionOptionsSchema
>;
// 使用場面: mergeOptions()後の内部処理
// 全フィールドが確定している
```

**なぜ分離するか**:

| 観点       | Input型            | Output型         |
| ---------- | ------------------ | ---------------- |
| 用途       | 外部APIパラメータ  | 内部処理         |
| デフォルト | 未適用（省略可能） | 適用済み（必須） |
| 型安全     | Partial風          | Required風       |

---

## 3. 実装詳細

### 3.1 LLMEntityExtractor

```typescript
export class LLMEntityExtractor implements IEntityExtractor {
  private readonly llmProvider: ILLMProvider;
  // なぜreadonly: 不変性を保証、インスタンス生成後の変更を防止
  // なぜprivate: 外部から直接アクセスさせない

  constructor(llmProvider: ILLMProvider) {
    this.llmProvider = llmProvider;
    // なぜコンストラクタ注入: テスト時にモックを差し込み可能
    // 依存性逆転の原則 (DIP) に準拠
  }

  async extract(chunk: Chunk, options?: EntityExtractionOptionsInput) {
    const startTime = performance.now();
    // なぜperformance.now(): 高精度なタイミング計測

    const mergedOptions = mergeOptions(options);
    // なぜマージ: デフォルト値を適用して型安全に

    // 空チャンク処理
    if (!chunk.content.trim()) {
      return ok({ entities: [], ... });
      // なぜ早期リターン: 無駄なLLM呼び出しを回避
    }

    // プロンプト生成
    const prompt = buildEntityExtractionPrompt(chunk.content, options);
    // なぜ分離: プロンプト変更時の影響を局所化

    // LLM呼び出し
    const llmResult = await this.llmProvider.generate(prompt, {
      responseFormat: "json",  // なぜjson: 構造化出力を期待
      temperature: 0.1,        // なぜ0.1: 再現性重視（低いほど決定的）
    });

    // エラーハンドリング
    if (!llmResult.success) {
      return err(new LLMProviderError(...));
      // なぜカスタムエラー: エラー種別の識別を容易に
    }

    // JSONパース + バリデーション
    const validated = LLMEntityResponseSchema.safeParse(rawParsed);
    // なぜsafeParse: 例外を投げずにResult型で返却
    // なぜZod: ランタイムでの型検証

    // エンティティ処理
    const entities = parsed.entities
      .map(e => ({ ...e, mentions: findMentionsInText(...) }))
      .filter(e => /* フィルタリング */)
      .slice(0, maxEntitiesPerChunk);
    // なぜmap→filter→slice: 変換→絞り込み→制限の順序

    return ok({ entities, chunkId, processingTimeMs, modelUsed });
  }
}
```

### 3.2 RuleBasedEntityExtractor

```typescript
const TECHNOLOGY_PATTERNS: PatternDefinition[] = [
  {
    pattern: /\b(JavaScript|TypeScript|...)\b/gi,
    // なぜ\b: 単語境界（"ATypeScript"を除外）
    // なぜgi: global（複数マッチ）+ case-insensitive
    type: "technology",
    confidence: 0.9,
    // なぜ0.9: パターンマッチは高い確度
  },
];

export class RuleBasedEntityExtractor implements IEntityExtractor {
  private readonly patterns: PatternDefinition[];

  constructor(customPatterns?: PatternDefinition[]) {
    this.patterns = customPatterns ?? ALL_PATTERNS;
    // なぜカスタムパターン: 拡張性（ユーザー定義パターン追加）
    // なぜ??演算子: nullish coalescing（null/undefinedのみフォールバック）
  }

  async extract(chunk: Chunk, options?: EntityExtractionOptionsInput) {
    const seenNames = new Set<string>();
    // なぜSet: O(1)で重複チェック可能

    for (const patternDef of this.patterns) {
      // タイプフィルタ（早期スキップ）
      if (options.types && !options.types.includes(patternDef.type)) {
        continue;
        // なぜcontinue: 不要なパターンマッチをスキップ
      }

      // 正規表現の再生成
      const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);
      // なぜ再生成: lastIndexをリセット（gフラグの副作用対策）

      let match: RegExpExecArray | null;
      while ((match = regex.exec(chunk.content)) !== null) {
        // なぜwhile + exec: 複数マッチを順次処理

        const normalizedName = normalizeEntityName(name);
        if (seenNames.has(normalizedName)) continue;
        // なぜ正規化後にチェック: 「React」と「react」を同一視

        seenNames.add(normalizedName);
        // マッチしたエンティティを追加...
      }
    }

    return ok({ entities, modelUsed: "rule-based", ... });
    // なぜ"rule-based": LLMと区別するため
  }
}
```

### 3.3 エンティティマージロジック

```typescript
export function deduplicateEntities(
  entities: ExtractedEntity[],
): ExtractedEntity[] {
  const entityMap = new Map<string, ExtractedEntity>();
  // なぜMap: normalizedNameをキーにO(1)アクセス

  for (const entity of entities) {
    const existing = entityMap.get(entity.normalizedName);

    if (existing) {
      // 既存エンティティを更新
      entityMap.set(entity.normalizedName, {
        ...existing,
        confidence: Math.max(existing.confidence, entity.confidence),
        // なぜmax: 最も確信度の高い値を採用

        aliases: [...new Set([...existing.aliases, ...entity.aliases])],
        // なぜSet: 重複エイリアスを除去

        mentions: [...existing.mentions, ...entity.mentions],
        // なぜ結合: 全出現位置を保持

        description: selectLongerDescription(
          existing.description,
          entity.description,
        ),
        // なぜ長い方: より詳細な説明を採用
      });
    } else {
      entityMap.set(entity.normalizedName, entity);
    }
  }

  return Array.from(entityMap.values());
  // なぜArray.from: Mapの値をイテレータから配列に変換
}
```

---

## 4. 使用例

### 4.1 基本的な使い方

```typescript
import { RuleBasedEntityExtractor } from "@repo/shared/services/extraction";

// 抽出器のインスタンス化
const extractor = new RuleBasedEntityExtractor();

// チャンクの準備
const chunk = {
  id: "chunk-1",
  content: "ReactとVueはJavaScriptフレームワークです。Microsoftも参入。",
  tokenCount: 20,
  position: { start: 0, end: 50 },
  metadata: { strategy: "fixed" as const },
};

// 抽出実行
const result = await extractor.extract(chunk);

if (result.success) {
  console.log(result.data.entities);
  // [
  //   { name: "React", type: "technology", confidence: 0.85 },
  //   { name: "Vue", type: "technology", confidence: 0.85 },
  //   { name: "JavaScript", type: "technology", confidence: 0.9 },
  //   { name: "Microsoft", type: "organization", confidence: 0.9 }
  // ]
}
```

### 4.2 オプション指定

```typescript
// 技術名のみ抽出
const result = await extractor.extract(chunk, {
  types: ["technology"],
  minConfidence: 0.8,
});

// 結果: React, Vue, JavaScript のみ（Microsoftは除外）
```

### 4.3 バッチ処理

```typescript
const chunks = [chunk1, chunk2, chunk3];
const batchResult = await extractor.extractBatch(chunks);

if (batchResult.success) {
  console.log(`総エンティティ数: ${batchResult.data.totalEntities}`);
  console.log(`処理時間: ${batchResult.data.processingTimeMs}ms`);

  // マージして重複除去
  const merged = extractor.mergeEntities(batchResult.data.results);
}
```

### 4.4 LLM抽出器の使用

```typescript
import { LLMEntityExtractor } from "@repo/shared/services/extraction";

// LLMプロバイダーの実装（例）
const llmProvider: ILLMProvider = {
  modelId: "gpt-4",
  generate: async (prompt, options) => {
    // 実際のLLM API呼び出し
    return ok({ text: "...", tokensUsed: 100 });
  },
};

const extractor = new LLMEntityExtractor(llmProvider);
const result = await extractor.extract(chunk, {
  generateDescriptions: true, // 説明文も生成
});
```

---

## 5. エラーハンドリング

### 5.1 エラー種別

| エラークラス       | 発生条件                | 対処法                       |
| ------------------ | ----------------------- | ---------------------------- |
| `LLMProviderError` | LLM API呼び出し失敗     | リトライ or フォールバック   |
| `JsonParseError`   | LLMレスポンスのJSON不正 | ルールベースにフォールバック |

### 5.2 エラーハンドリング例

```typescript
const result = await llmExtractor.extract(chunk);

if (!result.success) {
  if (result.error instanceof LLMProviderError) {
    // LLM障害: ルールベースにフォールバック
    console.warn("LLM failed, falling back to rule-based");
    return ruleBasedExtractor.extract(chunk);
  }
  if (result.error instanceof JsonParseError) {
    // JSON不正: ログしてルールベースに
    console.error("Invalid JSON from LLM:", result.error.rawResponse);
    return ruleBasedExtractor.extract(chunk);
  }
  throw result.error;
}
```

---

## 6. テスト構成

| テストファイル                 | テスト数 | カバー範囲               |
| ------------------------------ | -------- | ------------------------ |
| `entity-extractor.test.ts`     | 19       | LLM抽出器の全メソッド    |
| `rule-based-extractor.test.ts` | 15       | ルール抽出器の全メソッド |
| `utils.test.ts`                | 19       | ユーティリティ関数       |
| `errors.test.ts`               | 16       | エラークラス             |
| **合計**                       | **69**   | カバレッジ 97.78%        |

---

## 7. パフォーマンス考慮

| 操作               | 目標    | 実測値 |
| ------------------ | ------- | ------ |
| 単一チャンク抽出   | < 3秒   | < 10ms |
| バッチ抽出 (10件)  | < 10秒  | < 50ms |
| エンティティマージ | < 100ms | < 5ms  |

### 最適化ポイント

1. **ルールベース優先**: LLMより高速
2. **早期リターン**: 空チャンクは即座に返却
3. **Set使用**: 重複チェックをO(1)に
4. **正規表現キャッシュ**: パターン再生成を最小化

---

## 8. 用語集

| 用語             | 読み方                | 説明                                               |
| ---------------- | --------------------- | -------------------------------------------------- |
| Entity           | エンティティ          | 識別可能な実体（人名、組織名、技術名など）         |
| NER              | ナー / エヌイーアール | Named Entity Recognition（固有表現認識）           |
| Chunk            | チャンク              | テキストを分割した断片                             |
| Confidence       | コンフィデンス        | 抽出結果の信頼度（0.0〜1.0）                       |
| Mention          | メンション            | エンティティのテキスト内での出現                   |
| Alias            | エイリアス            | エンティティの別名（TS = TypeScript）              |
| Zod              | ゾッド                | TypeScript用スキーマ検証ライブラリ                 |
| Result型         | リザルト型            | 成功/失敗を型安全に表現する共用体型                |
| Strategy Pattern | ストラテジーパターン  | アルゴリズムを交換可能にするデザインパターン       |
| DIP              | ディーアイピー        | 依存性逆転の原則（Dependency Inversion Principle） |
| Fallback         | フォールバック        | 主処理が失敗した時の代替処理                       |

---

## 9. 次のステップ

| タスクID | タスク名                       | 優先度 | 状態   |
| -------- | ------------------------------ | ------ | ------ |
| P3-001   | 人名抽出パターンの追加         | P3     | 未実施 |
| P3-002   | 日本語組織名パターンの追加     | P3     | 未実施 |
| P3-003   | 国際化（日付フォーマット対応） | P3     | 未実施 |
| P3-004   | ユーザー定義パターン機能       | P3     | 検討中 |
