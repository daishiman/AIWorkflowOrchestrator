# プロンプト設計書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 2（設計）            |

---

## 1. プロンプト構築関数

### 1.1 関数シグネチャ

```typescript
// packages/shared/src/services/graph/prompts/community-summary-prompt.ts

import type { StoredEntity, StoredRelation } from "../knowledge-graph-store";
import type { CommunitySummary, CommunitySummarizationOptions } from "../types";

/**
 * コミュニティ要約生成用のLLMプロンプトを構築する
 *
 * @param entities - コミュニティ内のエンティティ（上位20件のみ使用）
 * @param relations - コミュニティ内の関係（上位30件のみ使用）
 * @param childSummaries - 子コミュニティの要約（useChildSummaries=true時）
 * @param options - 要約生成オプション
 * @returns LLMに送信するプロンプト文字列
 */
export function buildCommunitySummaryPrompt(
  entities: StoredEntity[],
  relations: StoredRelation[],
  childSummaries: CommunitySummary[],
  options: CommunitySummarizationOptions,
): string;
```

---

## 2. プロンプト構造

### 2.1 全体構成

```
┌─────────────────────────────────────────────┐
│  1. システム指示（スタイルガイド）          │
├─────────────────────────────────────────────┤
│  2. エンティティ一覧（上位20件）            │
├─────────────────────────────────────────────┤
│  3. 関係一覧（上位30件）                    │
├─────────────────────────────────────────────┤
│  4. 子コミュニティ要約（オプション）        │
├─────────────────────────────────────────────┤
│  5. 出力形式指定（JSON）                    │
├─────────────────────────────────────────────┤
│  6. 注意事項                                │
└─────────────────────────────────────────────┘
```

### 2.2 プロンプトテンプレート

```
以下のエンティティと関係のグループについて要約を作成してください。

{スタイルガイド}

エンティティ一覧:
{エンティティリスト}

関係一覧:
{関係リスト}

{子コミュニティ要約セクション（オプション）}

JSON形式で出力してください:
{JSON出力形式}

注意:
{注意事項}
```

---

## 3. セクション詳細設計

### 3.1 スタイルガイド

| スタイル  | ガイドテキスト                                   |
| --------- | ------------------------------------------------ |
| detailed  | 詳細で包括的な要約を作成してください。           |
| concise   | 簡潔で要点を押さえた要約を作成してください。     |
| technical | 技術的な観点から専門的な要約を作成してください。 |

**実装**:

```typescript
const styleGuide = {
  detailed: "詳細で包括的な要約を作成してください。",
  concise: "簡潔で要点を押さえた要約を作成してください。",
  technical: "技術的な観点から専門的な要約を作成してください。",
}[options.summaryStyle ?? "concise"];
```

### 3.2 エンティティリスト構築

**入力制限**: 上位20件

**ソート基準**: importance（重要度）降順

**フォーマット**:

```
- {エンティティ名} ({エンティティタイプ}): {説明文 or "説明なし"}
```

**実装**:

```typescript
const entityList = entities
  .sort((a, b) => b.importance - a.importance)
  .slice(0, 20)
  .map((e) => `- ${e.name} (${e.type}): ${e.description ?? "説明なし"}`)
  .join("\n");
```

**出力例**:

```
- TypeScript (technology): Microsoft開発の静的型付けプログラミング言語
- JavaScript (technology): Web開発の主要言語
- Node.js (technology): JavaScriptランタイム環境
```

### 3.3 関係リスト構築

**入力制限**: 上位30件

**ソート基準**: confidence（信頼度）降順

**フォーマット**:

```
- {起点エンティティ名} → {関係タイプ} → {終点エンティティ名}
```

**実装**:

```typescript
const relationList = relations
  .sort((a, b) => b.confidence - a.confidence)
  .slice(0, 30)
  .map((r) => {
    const source = entities.find((e) => e.id === r.sourceEntityId)?.name;
    const target = entities.find((e) => e.id === r.targetEntityId)?.name;
    return `- ${source} → ${r.relationType} → ${target}`;
  })
  .join("\n");
```

**出力例**:

```
- TypeScript → SUPERSET_OF → JavaScript
- Node.js → USES → JavaScript
- React → DEPENDS_ON → JavaScript
```

### 3.4 子コミュニティ要約セクション

**条件**: `childSummaries.length > 0` の場合のみ含める

**フォーマット**:

```
子コミュニティの要約:
- {子コミュニティ1の要約}
- {子コミュニティ2の要約}
...
```

**実装**:

```typescript
const childSummarySection =
  childSummaries.length > 0
    ? `\n子コミュニティの要約:\n${childSummaries.map((s) => `- ${s.summary}`).join("\n")}`
    : "";
```

### 3.5 JSON出力形式

```json
{
  "summary": "グループの特徴を説明する要約文（{maxSummaryTokens}トークン以内）",
  "keywords": ["キーワード1", "キーワード2", ...（最大{maxKeywords}個）],
  "mainEntities": ["主要エンティティ1", "主要エンティティ2", ...（最大5個）],
  "mainRelations": ["主要関係1（AとBの関係）", ...（最大5個）],
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0の信頼度
}
```

### 3.6 注意事項

```
注意:
- 要約はグループ全体のテーマや特徴を表現
- キーワードは検索に使用されるため、具体的な用語を選択
- 主要エンティティ・関係はグループを代表するもの
- sentimentは内容の全体的な傾向
```

---

## 4. 完全なプロンプト例

### 4.1 入力データ

```typescript
const entities: StoredEntity[] = [
  {
    name: "TypeScript",
    type: "technology",
    description: "静的型付け言語",
    importance: 0.9,
  },
  {
    name: "JavaScript",
    type: "technology",
    description: "動的型付け言語",
    importance: 0.85,
  },
  {
    name: "Node.js",
    type: "technology",
    description: "ランタイム環境",
    importance: 0.8,
  },
];

const relations: StoredRelation[] = [
  {
    sourceEntityId: "ts",
    targetEntityId: "js",
    relationType: "SUPERSET_OF",
    confidence: 0.95,
  },
  {
    sourceEntityId: "node",
    targetEntityId: "js",
    relationType: "USES",
    confidence: 0.9,
  },
];

const childSummaries: CommunitySummary[] = [];

const options: CommunitySummarizationOptions = {
  maxSummaryTokens: 200,
  maxKeywords: 10,
  summaryStyle: "technical",
};
```

### 4.2 生成されるプロンプト

```
以下のエンティティと関係のグループについて要約を作成してください。

技術的な観点から専門的な要約を作成してください。

エンティティ一覧:
- TypeScript (technology): 静的型付け言語
- JavaScript (technology): 動的型付け言語
- Node.js (technology): ランタイム環境

関係一覧:
- TypeScript → SUPERSET_OF → JavaScript
- Node.js → USES → JavaScript

JSON形式で出力してください:
{
  "summary": "グループの特徴を説明する要約文（200トークン以内）",
  "keywords": ["キーワード1", "キーワード2", ...（最大10個）],
  "mainEntities": ["主要エンティティ1", "主要エンティティ2", ...（最大5個）],
  "mainRelations": ["主要関係1（AとBの関係）", ...（最大5個）],
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0の信頼度
}

注意:
- 要約はグループ全体のテーマや特徴を表現
- キーワードは検索に使用されるため、具体的な用語を選択
- 主要エンティティ・関係はグループを代表するもの
- sentimentは内容の全体的な傾向
```

### 4.3 期待されるLLMレスポンス

```json
{
  "summary": "このグループはJavaScriptエコシステムに関連する技術で構成されています。TypeScriptはJavaScriptのスーパーセットとして静的型付けを提供し、Node.jsはサーバーサイドでJavaScriptを実行するランタイム環境です。",
  "keywords": [
    "TypeScript",
    "JavaScript",
    "Node.js",
    "静的型付け",
    "ランタイム",
    "Web開発"
  ],
  "mainEntities": ["TypeScript", "JavaScript", "Node.js"],
  "mainRelations": [
    "TypeScriptはJavaScriptのスーパーセット",
    "Node.jsはJavaScriptを使用"
  ],
  "sentiment": "positive",
  "confidence": 0.92
}
```

---

## 5. LLM呼び出しオプション

| オプション     | 値       | 理由                       |
| -------------- | -------- | -------------------------- |
| temperature    | 0.3      | 一貫性のある出力を確保     |
| maxTokens      | 400-1000 | maxSummaryTokens \* 2 程度 |
| responseFormat | "json"   | 構造化レスポンスを強制     |

---

## 6. トークン最適化

### 6.1 入力制限

| 要素             | 制限     | 理由                   |
| ---------------- | -------- | ---------------------- |
| エンティティ数   | 上位20件 | プロンプト長制限       |
| 関係数           | 上位30件 | プロンプト長制限       |
| 子コミュニティ数 | 制限なし | 階層要約に全情報が必要 |

### 6.2 推定トークン数

| セクション         | 推定トークン数 |
| ------------------ | -------------- |
| 固定テンプレート   | ~100           |
| エンティティリスト | ~200-400       |
| 関係リスト         | ~200-500       |
| 子要約セクション   | ~100-300       |
| **合計**           | ~600-1300      |

---

## 完了条件

- [x] プロンプト構造が設計されている
- [x] エンティティリスト構築（上位20件）が設計されている
- [x] 関係リスト構築（上位30件）が設計されている
- [x] 子コミュニティ要約の埋め込みが設計されている
- [x] スタイルガイド適用（detailed/concise/technical）が設計されている
- [x] JSON出力形式が定義されている
- [x] プロンプトテンプレート関数が設計されている
