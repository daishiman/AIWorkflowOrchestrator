# コミュニティ要約生成 - 実装ガイド

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| 機能名   | コミュニティ要約生成   |
| タスクID | CONV-08-03             |
| 作成日   | 2026-01-11             |
| 対象読者 | 開発者・技術者・学習者 |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. コミュニティ要約って何？

### 1.1 身近な例で考えてみよう

学校のクラブ活動を想像してください。

```
サッカー部     ←── グループ（コミュニティ）
├── 田中くん    ←── メンバー（エンティティ）
├── 鈴木くん    ←── メンバー
└── 佐藤くん    ←── メンバー
```

このサッカー部には「サッカーが好きな人の集まり」という特徴があります。
この特徴を短い文章でまとめたものが「コミュニティ要約」です。

**コミュニティ要約の例**:

> 「サッカー部は運動が得意な3年生を中心に、週5日練習している活発なグループです。」

### 1.2 なぜ必要なの？

たくさんの情報（文書やデータ）から知識を取り出すとき、関連する情報がグループ化されます。
でも、グループの中身を一つ一つ見るのは大変です。

**要約があると**:

- グループ全体の特徴が一目でわかる
- 「このグループは自分が探しているものと関係あるか？」がすぐ判断できる
- 大量のグループから必要なものを素早く見つけられる

### 1.3 今回作ったもの

| 日本語             | 英語                | 役割                         |
| ------------------ | ------------------- | ---------------------------- |
| コミュニティ要約   | CommunitySummary    | グループの特徴をまとめた文章 |
| 要約サービス       | CommunitySummarizer | AIを使って要約を作る仕組み   |
| セマンティック検索 | Semantic Search     | 意味で検索する機能           |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
グループの情報（メンバーと関係）
        ↓
   AI（LLM）に送信
        ↓
  AIが要約を生成
        ↓
  埋め込みベクトル作成（意味を数値化）
        ↓
  データベースに保存
        ↓
 「意味で検索」が可能に！
```

### 2.2 階層的な処理

グループには「親子関係」があります。子グループから先に処理することで、
親グループの要約に子の情報を含められます。

```
レベル0（子）: 小さなグループ → 先に要約作成
    ↓
レベル1（親）: 大きなグループ → 子の要約を使って作成
    ↓
レベル2（祖父母）: さらに大きなグループ
```

### 2.3 データの保存

**community_summaries（コミュニティ要約）テーブル**:

| 列名         | 説明                           |
| ------------ | ------------------------------ |
| community_id | どのグループの要約か           |
| summary      | 要約文                         |
| keywords     | 検索用キーワード（配列）       |
| embedding    | 意味を数値化したもの（検索用） |
| confidence   | AIの自信度（0〜1）             |

---

## 3. 作ったものの全体像

```
┌─────────────────────────────────────────────────────────┐
│             CommunitySummarizer（要約サービス）           │
│  - summarize()    : 1つのグループを要約                  │
│  - summarizeAll() : 全グループを一括要約（子→親順）       │
│  - searchSummaries() : 意味で検索                        │
│  - updateSummary(): 要約を更新                           │
└─────────────────────────────────────────────────────────┘
        ↑                  ↑                    ↑
        │                  │                    │
┌───────┴───────┐  ┌───────┴───────┐  ┌────────┴────────┐
│  LLMProvider  │  │EmbeddingProvider│ │CommunityRepository│
│  （AI呼び出し）│  │（埋め込み生成）  │ │（DB保存・取得）    │
└───────────────┘  └─────────────────┘  └──────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
packages/shared/src/services/graph/
├── community-summarizer.ts                # メインサービス
├── interfaces/
│   └── community-summarizer.interface.ts  # インターフェース定義
├── prompts/
│   └── community-summary-prompt.ts        # プロンプト生成
├── types.ts                               # 型定義（追加分）
└── __tests__/
    ├── community-summarizer.test.ts       # サービステスト
    └── community-summary-prompt.test.ts   # プロンプトテスト
```

### 1.2 依存関係

```
CommunitySummarizer
├── ILLMProvider          # LLM生成（DI）
├── IEmbeddingProvider    # 埋め込み生成（DI）
├── IKnowledgeGraphStore  # グラフデータ取得
└── ICommunityRepository  # コミュニティDB操作
```

---

## 2. インターフェース設計

### 2.1 ICommunitySummarizer

```typescript
export interface ICommunitySummarizer {
  /**
   * 単一コミュニティの要約を生成
   * @param community - 対象コミュニティ
   * @param entities - コミュニティ内エンティティ
   * @param relations - コミュニティ内関係
   * @param options - オプション設定
   */
  summarize(
    community: Community,
    entities: readonly StoredEntity[],
    relations: readonly StoredRelation[],
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummary, Error>>;

  /**
   * 全コミュニティを階層順（子→親）で要約
   * なぜ子から親: 親の要約に子の内容を含められるため
   */
  summarizeAll(
    communityStructure: CommunityStructure,
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummarizationResult, Error>>;

  /**
   * セマンティック検索
   * なぜ埋め込み検索: キーワード一致より意味的な類似性で検索できる
   */
  searchSummaries(
    query: string,
    options?: CommunitySummarySearchOptions,
  ): Promise<Result<CommunitySummary[], Error>>;

  /**
   * 要約を再生成
   */
  updateSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary, Error>>;
}
```

### 2.2 設計判断の根拠

| 設計判断       | 選択肢                 | 採用理由                                 |
| -------------- | ---------------------- | ---------------------------------------- |
| Result型       | Result / throw         | 明示的エラーハンドリング、型安全         |
| 階層順処理     | 子→親 / 任意順         | 子の要約を親プロンプトに含められる       |
| 並列処理       | Promise.all + チャンク | 同レベル内は並列で高速化、レベル間は順次 |
| 埋め込み失敗時 | エラー / 警告で続行    | 要約自体は成功させ、検索機能のみ制限     |

---

## 3. 型定義

### 3.1 CommunitySummary

```typescript
export interface CommunitySummary {
  communityId: CommunityId; // コミュニティID（Branded Type）
  level: number; // 階層レベル
  summary: string; // 要約文
  keywords: string[]; // 検索用キーワード
  mainEntities: string[]; // 主要エンティティ名
  mainRelations: string[]; // 主要関係
  sentiment: "positive" | "negative" | "neutral"; // 全体的なトーン
  confidence: number; // AI自信度（0.0〜1.0）
  tokenCount: number; // 使用トークン数
  embedding?: number[]; // 埋め込みベクトル
  createdAt: Date; // 作成日時
}
```

### 3.2 CommunitySummarizationOptions

```typescript
export interface CommunitySummarizationOptions {
  maxSummaryTokens?: number; // デフォルト: 200
  // なぜ200: 簡潔さと情報量のバランス

  maxKeywords?: number; // デフォルト: 10
  // なぜ10: 検索に十分かつ過多にならない

  summaryStyle?: "concise" | "detailed" | "technical";
  // なぜ3種類: ユースケースに応じた使い分け

  generateEmbedding?: boolean; // デフォルト: true
  // なぜデフォルトtrue: セマンティック検索を標準で有効化

  useChildSummaries?: boolean; // デフォルト: true
  // なぜデフォルトtrue: 階層的な情報伝播を実現

  maxConcurrency?: number; // デフォルト: 5
  // なぜ5: API制限と処理速度のバランス
}
```

### 3.3 エラーコード

```typescript
export enum CommunitySummarizationErrorCode {
  LLM_GENERATION_FAILED = "LLM_GENERATION_FAILED",
  // LLM APIエラー

  JSON_PARSE_FAILED = "JSON_PARSE_FAILED",
  // LLMレスポンスが不正なJSON

  EMBEDDING_FAILED = "EMBEDDING_FAILED",
  // 埋め込み生成エラー

  DB_SAVE_FAILED = "DB_SAVE_FAILED",
  // データベース保存エラー

  COMMUNITY_NOT_FOUND = "COMMUNITY_NOT_FOUND",
  // コミュニティが存在しない
}
```

---

## 4. プロンプト設計

### 4.1 プロンプト構造

```
以下のエンティティと関係のグループについて要約を作成してください。

{スタイルガイド: concise/detailed/technical}

エンティティ一覧:
- {エンティティ名} ({タイプ}): {説明}
...（上位20件）

関係一覧:
- {ソース} → {関係タイプ} → {ターゲット}
...（上位30件）

{子コミュニティ要約セクション（あれば）}

JSON形式で出力してください:
{
  "summary": "...",
  "keywords": [...],
  "mainEntities": [...],
  "mainRelations": [...],
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0
}
```

### 4.2 制限値の理由

| 制限              | 値   | 理由                           |
| ----------------- | ---- | ------------------------------ |
| エンティティ上限  | 20件 | トークン制限内で重要情報を網羅 |
| 関係上限          | 30件 | エンティティ間の接続を十分表現 |
| mainEntities上限  | 5件  | 要約に含めるには5件で十分      |
| mainRelations上限 | 5件  | 同上                           |

---

## 5. テスト構成

| テストファイル                   | テスト数 | カバー範囲                        |
| -------------------------------- | -------- | --------------------------------- |
| community-summarizer.test.ts     | 36       | サービス全メソッド + エッジケース |
| community-summary-prompt.test.ts | 20       | プロンプト生成関数                |
| **合計**                         | **56**   |                                   |

### 達成カバレッジ

| ファイル                    | Line Coverage | Branch Coverage | Function Coverage |
| --------------------------- | ------------- | --------------- | ----------------- |
| community-summarizer.ts     | 95.69%        | -               | 100%              |
| community-summary-prompt.ts | 100%          | -               | 100%              |

---

## 6. 使用上の注意

### 6.1 Result型のハンドリング

```typescript
// ❌ 使用禁止（プロパティ名が異なる）
if (result.ok) {
  console.log(result.value);
}

// ⭕ 正しい使い方
if (result.success) {
  console.log(result.data);
}
```

### 6.2 階層処理の順序

```typescript
// ❌ 任意順で処理（親が先に処理される可能性）
for (const community of communities) {
  await summarizer.summarize(community, ...);
}

// ⭕ レベル昇順で処理（子→親）
const sorted = communities.sort((a, b) => a.level - b.level);
for (const community of sorted) {
  await summarizer.summarize(community, ...);
}
```

---

## 7. 次のステップ

| タスクID   | タスク名             | 状態   |
| ---------- | -------------------- | ------ |
| CONV-08-04 | GraphRAGクエリ統合   | 未実施 |
| CONV-08-05 | コミュニティ可視化UI | 未実施 |

---

## 8. 用語集

| 用語                      | 読み方               | 説明                                               |
| ------------------------- | -------------------- | -------------------------------------------------- |
| Community                 | コミュニティ         | 意味的に関連するエンティティのグループ             |
| CommunitySummary          | コミュニティサマリー | コミュニティの特徴を要約した構造体                 |
| Leiden Algorithm          | ライデンアルゴリズム | コミュニティ検出に使用するグラフクラスタリング手法 |
| Semantic Search           | セマンティックサーチ | 意味的類似性に基づく検索（キーワード一致ではない） |
| Embedding                 | エンベディング       | テキストを数値ベクトルに変換したもの               |
| Result Type               | リザルトタイプ       | 成功/失敗を明示的に表現する型パターン              |
| Branded Type              | ブランデッドタイプ   | 型安全性を高めるためのTypeScript技法（EntityId等） |
| LLM                       | エルエルエム         | Large Language Model、大規模言語モデル             |
| DI (Dependency Injection) | ディーアイ           | 依存性注入、テスタビリティと拡張性のためのパターン |
| TDD                       | ティーディーディー   | Test-Driven Development、テスト駆動開発            |
