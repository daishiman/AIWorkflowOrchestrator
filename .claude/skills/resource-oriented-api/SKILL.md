---
name: resource-oriented-api
description: |
  MCPのリソース指向API設計パターンに関する専門知識。
  ファイル、データベース、外部サービスをリソースとして抽象化し、
  一貫したAPIインターフェースを提供するための設計指針を提供します。

  使用タイミング:
  - MCPリソースの設計時
  - データアクセスパターンの統一設計時
  - リソースURIスキームの設計時
  - キャッシュ戦略の検討時
version: 1.0.1
tags: [mcp, resource, api-design, uri-scheme, caching]
related_skills:
  - .claude/skills/mcp-protocol/SKILL.md
  - .claude/skills/api-connector-design/SKILL.md
---

# Resource Oriented API スキル

## 概要

MCPにおけるリソース指向API設計の専門知識を提供します。ファイル、データベース、外部サービスなど様々なデータソースを統一的なリソースとして扱い、一貫性のあるアクセスパターンを実現します。

## リソースモデル

```
┌─────────────────────────────────────────────────────┐
│                  MCP Resource Layer                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│   URI Scheme: protocol://authority/path?query       │
│                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│   │    Files    │  │  Database   │  │   Remote    │ │
│   │  file://... │  │  db://...   │  │  http://... │ │
│   └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│   共通インターフェース:                              │
│   - read(uri) → content                             │
│   - list(pattern) → resources[]                     │
│   - subscribe(uri) → updates                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 1. リソースURIスキーム

### 標準URIフォーマット

```
scheme://authority/path?query#fragment

例:
file:///project/src/main.ts
db://postgres/users?id=123
git://repo/main/README.md
memory://session/context
```

### スキーム別設計指針

| スキーム | 用途 | 例 |
|---------|------|-----|
| `file://` | ローカルファイル | `file:///home/user/doc.md` |
| `db://` | データベースレコード | `db://mysql/users/123` |
| `git://` | Gitリポジトリ | `git://repo/branch/path` |
| `memory://` | セッションメモリ | `memory://session/vars` |
| `http://` | 外部API | `http://api.example.com/data` |
| `custom://` | カスタムソース | `custom://provider/resource` |

### URI正規化ルール

```
1. パス正規化
   - 末尾スラッシュを統一（なし推奨）
   - 相対パスを絶対パスに変換
   - .. および . を解決

2. クエリパラメータ
   - アルファベット順にソート
   - 重複を除去
   - 空値を除去

3. エンコーディング
   - 非ASCII文字はパーセントエンコード
   - スペースは%20（+ではなく）
```

## 2. リソース定義パターン

### 基本リソース定義

```typescript
interface Resource {
  uri: string;           // 一意識別子
  name: string;          // 人間可読な名前
  description?: string;  // 説明
  mimeType?: string;     // コンテンツタイプ
}

interface ResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;         // テキストコンテンツ
  blob?: string;         // Base64バイナリ
}

interface ResourceTemplate {
  uriTemplate: string;   // URIテンプレート
  name: string;
  description?: string;
  mimeType?: string;
}
```

### リソースタイプ別実装

```yaml
# ファイルリソース
file_resource:
  uri: "file:///project/config.json"
  name: "Project Configuration"
  mimeType: "application/json"
  capabilities:
    - read
    - watch

# データベースリソース
database_resource:
  uri: "db://postgres/users"
  name: "User Records"
  mimeType: "application/json"
  capabilities:
    - read
    - list
    - query

# 動的リソース（テンプレート）
template_resource:
  uriTemplate: "api://github/repos/{owner}/{repo}/issues"
  name: "GitHub Issues"
  mimeType: "application/json"
  parameters:
    - name: owner
      required: true
    - name: repo
      required: true
```

## 3. リソースアクセスパターン

### 読み取りパターン

```
単一リソース読み取り:
  read(uri) → ResourceContent

リソース一覧取得:
  list(pattern?) → Resource[]

変更監視:
  subscribe(uri) → ResourceUpdateStream
```

### アクセスフロー

```
クライアント                    MCP Server
    │                               │
    │  resources/list               │
    │ ────────────────────────────► │
    │                               │
    │  { resources: [...] }         │
    │ ◄──────────────────────────── │
    │                               │
    │  resources/read { uri: "..." }│
    │ ────────────────────────────► │
    │                               │
    │  { contents: [...] }          │
    │ ◄──────────────────────────── │
    │                               │
    │  resources/subscribe          │
    │ ────────────────────────────► │
    │                               │
    │  notifications/resources/updated │
    │ ◄──────────────────────────── │
```

## 4. キャッシュ戦略

### キャッシュレイヤー

```
┌─────────────────────────────────────┐
│          アプリケーション            │
├─────────────────────────────────────┤
│          L1: メモリキャッシュ        │
│          (短期間、高速アクセス)      │
├─────────────────────────────────────┤
│          L2: ファイルキャッシュ      │
│          (中期間、永続化)            │
├─────────────────────────────────────┤
│          L3: オリジンソース          │
│          (常に最新)                  │
└─────────────────────────────────────┘
```

### キャッシュ制御

| 戦略 | TTL | 用途 |
|------|-----|------|
| `no-cache` | 0 | 常に最新データが必要 |
| `short` | 1分 | 頻繁に更新されるデータ |
| `medium` | 5分 | 通常のデータ |
| `long` | 1時間 | 安定したデータ |
| `persistent` | 永続 | 静的リソース |

### 無効化パターン

```typescript
// 時間ベース無効化
cache.set(uri, content, { ttl: 300000 }); // 5分

// イベントベース無効化
onResourceUpdate(uri => {
  cache.invalidate(uri);
});

// パターンベース無効化
cache.invalidatePattern('db://postgres/users/*');
```

## 5. エラーハンドリング

### リソースエラーコード

| コード | 意味 | 対応 |
|-------|------|------|
| `ResourceNotFound` | リソースが存在しない | 404相当 |
| `ResourceAccessDenied` | アクセス権限なし | 403相当 |
| `ResourceUnavailable` | 一時的に利用不可 | リトライ |
| `ResourceInvalid` | 無効なURI形式 | クライアントエラー |
| `ResourceTimeout` | タイムアウト | リトライ |

### エラーレスポンス形式

```json
{
  "error": {
    "code": "ResourceNotFound",
    "message": "Resource not found: file:///missing.txt",
    "data": {
      "uri": "file:///missing.txt",
      "timestamp": "2025-11-27T10:30:00Z"
    }
  }
}
```

## 6. 設計チェックリスト

### URI設計

- [ ] スキームは明確で一貫している？
- [ ] パスは階層的で予測可能？
- [ ] クエリパラメータは適切に使用？
- [ ] エンコーディングは正しい？

### リソース定義

- [ ] 一意のURIが割り当てられている？
- [ ] mimeTypeは正確に指定？
- [ ] 説明は十分に明確？
- [ ] 必要な機能（read/list/subscribe）が定義？

### キャッシュ

- [ ] キャッシュ戦略は適切？
- [ ] 無効化メカニズムは実装？
- [ ] TTLは妥当な値？

### エラー処理

- [ ] 全てのエラーケースを網羅？
- [ ] エラーメッセージは明確？
- [ ] リトライ戦略は定義？

## リソース参照

詳細なパターンとガイドについては以下を参照:

- **URIスキーム設計ガイド**: `cat .claude/skills/resource-oriented-api/resources/uri-scheme-guide.md`
- **キャッシュ戦略ガイド**: `cat .claude/skills/resource-oriented-api/resources/caching-strategies.md`
- **リソース変換パターン**: `cat .claude/skills/resource-oriented-api/resources/resource-transformation.md`

## テンプレート参照

- **リソース定義テンプレート**: `cat .claude/skills/resource-oriented-api/templates/resource-definition-template.json`
- **リソースプロバイダーテンプレート**: `cat .claude/skills/resource-oriented-api/templates/resource-provider-template.ts`

## スクリプト実行

```bash
# URI検証
node .claude/skills/resource-oriented-api/scripts/validate-uri.mjs <uri>

# リソース定義検証
node .claude/skills/resource-oriented-api/scripts/validate-resource-definition.mjs <definition.json>
```

## 関連スキル

| スキル | 用途 |
|-------|------|
| `.claude/skills/mcp-protocol/SKILL.md` | MCPプロトコル基盤 |
| `.claude/skills/api-connector-design/SKILL.md` | API設計パターン |
