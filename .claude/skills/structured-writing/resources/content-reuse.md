# コンテンツ再利用

## 概要

同じ情報を複数箇所で使い回す技術です。更新コストを削減し、一貫性を維持します。

## 再利用のレベル

### レベル1: テキストスニペット

短いテキスト断片の再利用。

```markdown
<!-- _shared/product-name.md -->
MyProduct™

<!-- 使用 -->
{{snippet:product-name}} は最新の技術を採用しています。
```

### レベル2: 段落ブロック

複数の文や段落の再利用。

```markdown
<!-- _shared/security-notice.md -->
> 🔒 **セキュリティに関する注意**
>
> パスワードは暗号化して保存してください。
> 平文での保存は推奨されません。

<!-- 使用 -->
{{include:_shared/security-notice.md}}
```

### レベル3: セクション

見出しを含む完全なセクションの再利用。

```markdown
<!-- _shared/sections/prerequisites.md -->
## 前提条件

- Node.js 18以上
- npm 9以上
- Git

<!-- 使用 -->
{{include:_shared/sections/prerequisites.md}}
```

### レベル4: トピック全体

完全なトピックの再利用（マップで参照）。

```yaml
# user-guide-map.yaml
topics:
  - _shared/topics/getting-started.md
  - _shared/topics/troubleshooting.md
```

## 再利用パターン

### 1. 変数置換

```markdown
<!-- テンプレート -->
API endpoint: {{BASE_URL}}/{{VERSION}}/users

<!-- 変数定義 -->
BASE_URL: https://api.example.com
VERSION: v1

<!-- 出力 -->
API endpoint: https://api.example.com/v1/users
```

### 2. 条件付き表示

```markdown
{{if platform="windows"}}
`C:\Program Files\MyApp\`
{{/if}}

{{if platform="mac"}}
`/Applications/MyApp.app/`
{{/if}}

{{if platform="linux"}}
`/opt/myapp/`
{{/if}}
```

### 3. ループ展開

```markdown
<!-- データ -->
features:
  - name: 認証
    desc: OAuth 2.0対応
  - name: API
    desc: RESTful設計
  - name: UI
    desc: レスポンシブ対応

<!-- テンプレート -->
{{#each features}}
### {{name}}
{{desc}}
{{/each}}
```

### 4. キー参照（conkeyref）

```markdown
<!-- 定義 -->
<!-- keys.yaml -->
product_name: MyProduct
support_email: support@example.com
docs_url: https://docs.example.com

<!-- 使用 -->
{{key:product_name}} のドキュメントは {{key:docs_url}} を参照してください。
お問い合わせは {{key:support_email}} まで。
```

## 再利用設計チェックリスト

### 再利用候補の特定

| 条件 | 再利用する |
|:-----|:-----------|
| 3箇所以上で同じ内容 | ✅ |
| 製品名・バージョン番号 | ✅ |
| 警告・注意文 | ✅ |
| 共通の手順 | ✅ |
| 法的文言・免責事項 | ✅ |
| 1箇所でのみ使用 | ❌ |
| 文脈依存の内容 | ❌ |

### 再利用可能にするための加工

```markdown
❌ 文脈依存（再利用困難）
「前の手順で取得したトークンを使用して...」

✅ 文脈非依存（再利用可能）
「アクセストークンを使用して...」
```

## ディレクトリ構造

```
_shared/
├── snippets/           # 1行程度の短いテキスト
│   ├── product-name.md
│   ├── version.md
│   └── support-email.md
├── blocks/             # 段落レベルのブロック
│   ├── security-notice.md
│   ├── backup-warning.md
│   └── deprecated-notice.md
├── sections/           # セクション単位
│   ├── prerequisites.md
│   ├── installation-verify.md
│   └── troubleshooting-common.md
├── procedures/         # 手順の集合
│   ├── login-steps.md
│   ├── export-data.md
│   └── reset-password.md
└── topics/             # 完全なトピック
    ├── getting-started.md
    ├── faq.md
    └── release-notes.md
```

## 管理のベストプラクティス

### 1. 命名規則

```
{category}-{purpose}.md

例:
warning-backup-required.md
procedure-oauth-login.md
snippet-api-endpoint.md
```

### 2. メタデータの付与

```yaml
---
id: warning-backup
type: block
used-in:
  - guides/admin-guide.md
  - guides/migration-guide.md
last-updated: 2025-01-15
owner: docs-team
---
```

### 3. 使用箇所の追跡

```markdown
<!-- 再利用モジュールに使用箇所をコメント -->
<!-- Used in: admin-guide.md, user-guide.md, api-guide.md -->
```

### 4. 変更時の影響分析

```bash
# このモジュールを使用しているファイルを検索
grep -r "include:_shared/security-notice.md" docs/
```

## アンチパターン

### 過度な断片化

```
❌ 細かすぎる
├── word-the.md
├── word-a.md
└── word-is.md

✅ 適切な粒度
└── common-phrases.md
```

### 不適切な再利用

```
❌ 文脈が異なるのに同じモジュールを使用
管理者ガイド: {{include:user-warning.md}}
開発者ガイド: {{include:user-warning.md}}
（対象読者が異なる）

✅ 対象別にモジュールを分離
管理者ガイド: {{include:admin-warning.md}}
開発者ガイド: {{include:dev-warning.md}}
```
