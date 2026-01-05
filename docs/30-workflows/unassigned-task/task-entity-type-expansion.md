# エンティティタイプ拡張 - タスク指示書

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | CONV-04-07                       |
| タスク名     | エンティティタイプ拡張           |
| 分類         | 要件                             |
| 対象機能     | Knowledge Graph エンティティ分類 |
| 優先度       | 中                               |
| 見積もり規模 | 中規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 10 実装ガイド作成時        |
| 発見日       | 2026-01-05                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-04-05で実装したエンティティタイプ（14種類）は技術文書・コード中心の分類体系になっている。
しかし、AIWorkflowOrchestratorは技術文書だけでなく、以下のような多様なコンテンツを扱う可能性がある:

- ブログ記事・ニュース記事
- 社内ドキュメント（議事録、報告書、社内Wiki）
- 一般的なナレッジベース
- マーケティング資料
- 法務・契約文書
- 学術論文・研究資料

### 1.2 現状の課題

現在の14種類のエンティティタイプ:

```typescript
// 一般カテゴリ（5種類）
("person", "organization", "location", "date", "event");

// 技術カテゴリ（3種類）
("technology", "concept", "product");

// コードカテゴリ（3種類）
("api", "function", "class");

// 文書カテゴリ（2種類）
("document", "section");

// フォールバック（1種類）
("other");
```

**問題点**:

- 一般的なビジネス文書の分類に必要なタイプが不足
- 法務・財務・マーケティング領域のエンティティが「other」に分類されてしまう
- 社内情報（プロジェクト、部署、役職など）の適切な分類ができない
- メディア・コンテンツ（画像、動画、音声）の参照が分類できない

### 1.3 放置した場合の影響

- 多様なコンテンツをKnowledge Graphに取り込む際、「other」タイプが増大
- エンティティタイプによるフィルタリング・検索の精度が低下
- GraphRAGの質問応答精度に悪影響
- ドメイン固有のナレッジ管理が困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

多様なコンテンツタイプに対応できるよう、エンティティタイプを拡張し、柔軟な分類体系を構築する。

### 2.2 最終ゴール

- ビジネス領域のエンティティタイプ追加
- メディア・コンテンツのエンティティタイプ追加
- ドメイン固有タイプの拡張可能な設計
- 既存データのマイグレーション対応

### 2.3 スコープ

#### 含むもの

**追加検討対象のエンティティタイプ**:

| カテゴリ           | 候補タイプ       | 説明                 |
| ------------------ | ---------------- | -------------------- |
| **ビジネス**       | `project`        | プロジェクト名       |
|                    | `department`     | 部署・チーム         |
|                    | `role`           | 役職・ジョブタイトル |
|                    | `metric`         | KPI・指標            |
|                    | `process`        | 業務プロセス         |
| **法務・財務**     | `contract`       | 契約書               |
|                    | `regulation`     | 法規制・ルール       |
|                    | `financial_term` | 財務用語             |
| **マーケティング** | `campaign`       | キャンペーン         |
|                    | `audience`       | ターゲット層         |
|                    | `channel`        | チャネル             |
| **メディア**       | `image`          | 画像への参照         |
|                    | `video`          | 動画への参照         |
|                    | `audio`          | 音声への参照         |
| **学術**           | `paper`          | 論文                 |
|                    | `citation`       | 引用                 |
|                    | `hypothesis`     | 仮説                 |
| **コンテンツ**     | `article`        | 記事                 |
|                    | `blog_post`      | ブログ記事           |
|                    | `news`           | ニュース             |
|                    | `faq`            | FAQ項目              |

#### 含まないもの

- 完全に新しいスキーマの再設計
- 既存の14タイプの削除
- 外部オントロジー（Schema.org等）との完全統合
- マルチ言語対応（日本語エンティティ名等）

### 2.4 成果物

| 成果物                     | パス                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| 拡張エンティティタイプ定義 | `packages/shared/src/db/schema/graph/entities.ts`                    |
| タイプマイグレーション     | `packages/shared/src/db/migrations/xxx-entity-types.ts`              |
| タイプ判定ユーティリティ   | `packages/shared/src/utils/entity-type-utils.ts`                     |
| テスト                     | `packages/shared/src/db/schema/graph/__tests__/entity-types.test.ts` |
| 設計ドキュメント           | `docs/30-workflows/conv-04-07-entity-type-expansion/`                |

---

## 3. どのように実現するか（How）

### 3.1 設計方針

1. **後方互換性**: 既存の14タイプは変更しない
2. **カテゴリ分類**: タイプをカテゴリでグループ化し、管理しやすくする
3. **拡張可能性**: 将来のドメイン固有タイプ追加を容易にする
4. **型安全性**: TypeScriptの型システムで新タイプもカバー

### 3.2 実装アプローチ案

#### Option A: フラット拡張（推奨）

```typescript
export const entityTypes = [
  // 既存タイプ（14種類）
  "person",
  "organization",
  "location",
  "date",
  "event",
  "technology",
  "concept",
  "product",
  "api",
  "function",
  "class",
  "document",
  "section",
  "other",

  // 新規タイプ（ビジネス）
  "project",
  "department",
  "role",
  "metric",
  "process",

  // 新規タイプ（コンテンツ）
  "article",
  "blog_post",
  "news",
  "faq",

  // 新規タイプ（メディア）
  "image",
  "video",
  "audio",
] as const;
```

**メリット**: シンプル、後方互換性が高い
**デメリット**: タイプ数が増えると管理が煩雑

#### Option B: カテゴリ付きタイプ

```typescript
export const entityTypeCategories = {
  general: ["person", "organization", "location", "date", "event"],
  technical: ["technology", "concept", "product"],
  code: ["api", "function", "class"],
  document: ["document", "section"],
  business: ["project", "department", "role", "metric", "process"],
  content: ["article", "blog_post", "news", "faq"],
  media: ["image", "video", "audio"],
  fallback: ["other"],
} as const;

export const entityTypes = Object.values(entityTypeCategories).flat();
```

**メリット**: カテゴリでグループ化、フィルタリングが容易
**デメリット**: 若干複雑

### 3.3 Phase構成案

| Phase | 内容                             |
| ----- | -------------------------------- |
| 1     | 要件分析・追加タイプ選定         |
| 2     | スキーマ設計・カテゴリ設計       |
| 3     | 設計レビュー                     |
| 4     | テスト設計（TDD Red）            |
| 5     | 実装（TDD Green）                |
| 6     | リファクタリング（TDD Refactor） |
| 7     | 統合テスト                       |
| 8     | E2Eテスト                        |
| 9     | 手動テスト                       |
| 10    | ドキュメント更新                 |
| 11    | PR作成                           |

---

## 4. 依存関係

### 4.1 前提タスク

| タスクID   | タスク名                         | ステータス |
| ---------- | -------------------------------- | ---------- |
| CONV-04-05 | Knowledge Graph テーブル群実装   | 完了       |
| CONV-04-06 | Knowledge Graph マイグレーション | 未実施     |

### 4.2 後続タスク

| タスクID   | タスク名                   | 影響                          |
| ---------- | -------------------------- | ----------------------------- |
| CONV-08-01 | Knowledge Graph Store 実装 | タイプ判定ロジックに影響      |
| （未定）   | Entity Extraction          | LLMプロンプトに新タイプを追加 |

---

## 5. 検討事項

### 5.1 オープンクエスチョン

1. **タイプ数の上限**: 何種類まで増やすべきか？（推奨: 30-40種類以内）
2. **階層構造**: タイプに親子関係を持たせるべきか？（例: `blog_post` is-a `article`）
3. **カスタムタイプ**: ユーザーが独自タイプを追加できるようにするか？
4. **マルチラベル**: 1つのエンティティに複数タイプを許可するか？

### 5.2 リスク

| リスク                      | 影響 | 対策                           |
| --------------------------- | ---- | ------------------------------ |
| タイプ増加による複雑化      | 中   | カテゴリ分類で管理             |
| Entity Extractionの精度低下 | 高   | LLMプロンプトの段階的改善      |
| 既存データとの整合性        | 中   | マイグレーションスクリプト作成 |

---

## 6. 参考情報

### 6.1 外部リソース

- [Schema.org Types](https://schema.org/docs/full.html): 標準的なエンティティタイプ体系
- [Wikidata Entity Types](https://www.wikidata.org/wiki/Wikidata:WikiProject_Ontology): 大規模ナレッジグラフの分類体系
- [Microsoft Graph API Entities](https://learn.microsoft.com/en-us/graph/overview): ビジネス向けエンティティ設計の参考

### 6.2 関連ファイル

| ファイル                                          | 説明                         |
| ------------------------------------------------- | ---------------------------- |
| `packages/shared/src/db/schema/graph/entities.ts` | 現在のエンティティタイプ定義 |
| `outputs/phase-10/implementation-guide.md`        | 実装ガイド（設計理由記載）   |

---

## 7. 承認

| 役割       | 承認者 | 日付 |
| ---------- | ------ | ---- |
| 技術リード | -      | -    |
| PM         | -      | -    |
