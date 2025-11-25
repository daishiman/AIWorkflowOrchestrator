# DITA原則

## 概要

DITA (Darwin Information Typing Architecture) は、トピックベースの構造化文書作成アーキテクチャです。コンテンツの再利用性と保守性を最大化します。

## 基本原則

### 1. トピックベース

コンテンツを独立した「トピック」単位で作成します。

```
✅ 正しいアプローチ
├── concept/what-is-authentication.md（認証とは）
├── task/configure-oauth.md（OAuth設定手順）
└── reference/auth-api-reference.md（認証API仕様）

❌ 避けるべきアプローチ
└── authentication-guide.md（すべてを1ファイルに）
```

### 2. 情報型の分離

| 情報型 | 目的 | 質問への回答 |
|:-------|:-----|:-------------|
| **Concept** | 理解を深める | 「それは何か？」「なぜ重要か？」 |
| **Task** | 手順を示す | 「どうやるか？」 |
| **Reference** | 事実を提供 | 「詳細は何か？」 |

### 3. 単一ソース

同じ情報は1箇所で管理し、必要な場所で参照します。

```markdown
<!-- 定義箇所 -->
<!-- snippets/api-base-url.md -->
`https://api.example.com/v1`

<!-- 使用箇所 -->
APIのベースURLは {{snippet:api-base-url}} です。
```

### 4. コンテキスト非依存

各トピックは単独で意味が通じるよう作成します。

```markdown
✅ 「OAuth 2.0を設定するには、以下の手順に従います。」
❌ 「前章で説明した内容に基づき、次の手順を実行します。」
```

## トピック構造

### 基本構造

```markdown
# トピックタイトル

## 概要
[トピックの目的を1-2文で説明]

## 本文
[主要コンテンツ]

## 関連情報
- [関連トピック1](./related1.md)
- [関連トピック2](./related2.md)
```

### メタデータ

```yaml
---
type: concept | task | reference
audience: developer | admin | user
product: product-name
version: 1.0
keywords: [keyword1, keyword2]
---
```

## 再利用パターン

### コンテンツ参照（conref）

```markdown
<!-- 共通の警告文を定義 -->
<!-- _shared/warnings.md -->
> ⚠️ この操作は元に戻せません。実行前にバックアップを取得してください。

<!-- 参照して使用 -->
{{conref:_shared/warnings.md#backup-warning}}
```

### 条件付きテキスト

```markdown
<!-- 製品別に表示を切り替え -->
{{if product="enterprise"}}
エンタープライズ版では追加機能が利用可能です。
{{/if}}

{{if audience="developer"}}
APIキーは開発者ポータルで発行できます。
{{/if}}
```

## マッピング

複数のトピックを組み合わせて文書を構成します。

```yaml
# user-guide-map.yaml
title: ユーザーガイド
topics:
  - title: はじめに
    topics:
      - concept/what-is-product.md
      - concept/key-features.md
  - title: セットアップ
    topics:
      - task/install.md
      - task/configure.md
  - title: リファレンス
    topics:
      - reference/cli-commands.md
      - reference/config-options.md
```

## ベストプラクティス

1. **粒度を適切に**: 1トピック = 1つの明確な目的
2. **依存を最小化**: 他トピックへの直接参照を避ける
3. **再利用を設計**: 共通要素は最初から分離
4. **メタデータを活用**: フィルタリングと検索を容易に
5. **一貫性を維持**: 命名規則とフォーマットを統一
