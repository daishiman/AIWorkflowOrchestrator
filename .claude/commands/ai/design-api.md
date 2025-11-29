---
description: |
  REST API設計とOpenAPI 3.x仕様書の作成（エンドポイント定義、認証設計、スキーマ生成）。

  エンドポイント設計からOpenAPI仕様書まで、APIの完全な設計ドキュメントを生成します。

  🤖 起動エージェント:
  - `.claude/agents/gateway-dev.md`: Phase 1 - API設計パターン分析、エンドポイント設計
  - `.claude/agents/api-doc-writer.md`: Phase 2 - OpenAPI仕様書生成、ドキュメント作成

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **gateway-dev が参照:**
  - `.claude/skills/api-client-patterns/SKILL.md`: Adapter/Facade/Anti-Corruption Layer設計
  - `.claude/skills/http-best-practices/SKILL.md`: ステータスコード処理、べき等性、接続管理

  **api-doc-writer が参照:**
  - `.claude/skills/openapi-specification/SKILL.md`: OpenAPI 3.x仕様設計、スキーマ定義
  - `.claude/skills/swagger-ui/SKILL.md`: インタラクティブドキュメント、API Explorer構築
  - `.claude/skills/api-documentation-best-practices/SKILL.md`: DX設計、自己完結型ドキュメント
  - `.claude/skills/request-response-examples/SKILL.md`: cURLサンプル、SDK例、レスポンス例

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: gateway-dev、api-doc-writerエージェント起動用
    • Read: 既存API実装、プロジェクト仕様確認用
    • Write(docs/**|openapi.yaml): API設計書、OpenAPI仕様書生成用（パス制限）
    • Grep: 既存パターン検索、エンドポイント重複チェック用
  - model: sonnet（標準的な設計タスク）

  トリガーキーワード: api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API仕様書
argument-hint: "[resource-name]"
allowed-tools: [Task, Read, Write(docs/**|openapi.yaml), Grep]
model: sonnet
---

# API設計コマンド - REST API & OpenAPI仕様書生成

このコマンドは、REST API設計とOpenAPI 3.x仕様書の作成を自動化します。

## 起動エージェント

- **gateway-dev** (`.claude/agents/gateway-dev.md`): API設計パターン分析、エンドポイント設計
- **api-doc-writer** (`.claude/agents/api-doc-writer.md`): OpenAPI仕様書生成、ドキュメント作成

## 引数

- `$ARGUMENTS` または `$1`: リソース名（例: `users`, `tasks`, `projects`）
  - 未指定時: インタラクティブモードで要件ヒアリング

## 実行フロー

### Phase 0: 準備

1. **引数確認**: `$ARGUMENTS` でリソース名取得（未指定時はインタラクティブ）
2. **仕様参照**: `docs/00-requirements/master_system_design.md` 第8章（REST API 設計原則）
3. **既存パターン確認**: `src/app/api/` 配下の既存エンドポイント分析

---

### Phase 1: API設計 - gateway-dev起動

Task ツールで `.claude/agents/gateway-dev.md` を起動:

```
リソース: $ARGUMENTS

依頼:
REST APIエンドポイント設計（master_system_design.md第8章準拠）

期待成果物:
- エンドポイント一覧（CRUD + カスタム操作）
- リクエスト/レスポンススキーマ
- 認証・認可設計
- エラーハンドリング戦略
- Next.js App Router実装ガイド

保存先: docs/20-specifications/api-design-$ARGUMENTS.md
```

**gateway-dev が参照するスキル**（必要時のみ）:
- `.claude/skills/api-client-patterns/SKILL.md`
- `.claude/skills/http-best-practices/SKILL.md`

---

### Phase 2: OpenAPI仕様書生成 - api-doc-writer起動

Task ツールで `.claude/agents/api-doc-writer.md` を起動:

```
入力:
- Phase 1の設計結果（docs/20-specifications/api-design-$ARGUMENTS.md）

依頼:
OpenAPI 3.x仕様書とドキュメント生成

期待成果物:
- openapi.yaml（完全なスキーマ定義、example含む）
- 詳細ドキュメント（cURL例、SDK例）
- エラーレスポンス例
- Swagger UI設定ガイド（オプション）

保存先:
- openapi.yaml（プロジェクトルート）
- docs/20-specifications/api-documentation-$ARGUMENTS.md
```

**api-doc-writer が参照するスキル**（必要時のみ）:
- `.claude/skills/openapi-specification/SKILL.md`
- `.claude/skills/swagger-ui/SKILL.md`
- `.claude/skills/api-documentation-best-practices/SKILL.md`
- `.claude/skills/request-response-examples/SKILL.md`

---

### Phase 3: 検証と完了

1. **整合性チェック**: openapi.yaml構文検証、master_system_design.md準拠確認
2. **成果物確認**: 生成ファイルの存在確認
3. **完了報告**: エンドポイント数、設計決定事項、次のアクション提示

---

## 使用例

### 基本的な使用（引数あり）
```bash
/ai:design-api users
```
→ Usersリソースの完全なAPI設計 + OpenAPI仕様書生成

### インタラクティブモード（引数なし）
```bash
/ai:design-api
```
→ リソース名、CRUD要件、認証設計を対話的に確認

### 複数リソース設計
```bash
/ai:design-api tasks
/ai:design-api projects
```
→ 各リソースごとに独立したAPI設計

---

## 成果物一覧

| ファイル | 内容 | 生成フェーズ |
|---------|------|-------------|
| `docs/20-specifications/api-design-$ARGUMENTS.md` | API設計書（エンドポイント一覧、認証、エラーハンドリング） | Phase 1 |
| `openapi.yaml` | OpenAPI 3.x仕様書（完全なスキーマ定義） | Phase 2 |
| `docs/20-specifications/api-documentation-$ARGUMENTS.md` | 詳細ドキュメント（cURL例、SDK例） | Phase 2 |
| `src/app/api/[resource]/route.ts` | Next.js実装ガイド（オプション） | Phase 1 |

---

## トリガーキーワード

api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API仕様書

---

## 参考資料

- `docs/00-requirements/master_system_design.md` 第8章（REST API 設計原則）
- `.claude/skills/api-client-patterns/SKILL.md`
- `.claude/skills/openapi-specification/SKILL.md`
- `.claude/skills/http-best-practices/SKILL.md`
