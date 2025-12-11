---
description: |
  API仕様書(OpenAPI 3.x)とSwagger UIの自動生成。
  ソースコードから開発者向けAPI仕様書を作成し、インタラクティブなドキュメントを構築します。

  🤖 起動エージェント:
  - `.claude/agents/api-doc-writer.md`: OpenAPI仕様とAPI DX専門エージェント

  📚 利用可能スキル（api-doc-writerエージェントが必要時に参照）:
  **Phase 1（API理解時）:** openapi-specification, api-versioning
  **Phase 2（仕様書設計時）:** openapi-specification, request-response-examples
  **Phase 3（DX向上時）:** authentication-docs, api-documentation-best-practices
  **Phase 4（インタラクティブ化時）:** swagger-ui

  ⚙️ このコマンドの設定:
  - argument-hint: ソースコードパス（オプション、デフォルト: src/app/api）
  - allowed-tools: エージェント起動と読み取り・書き込み用
    • Task: api-doc-writerエージェント起動
    • Read: ソースコード、既存仕様の確認
    • Write(openapi.yaml|docs/api/**): API仕様書、統合ガイド
    • Grep: エンドポイント検索、型定義抽出
  - model: sonnet（API仕様書作成タスク）

  トリガーキーワード: api, documentation, openapi, swagger, endpoint
argument-hint: "[source-path]"
allowed-tools:
  - Task
  - Read
  - Write(openapi.yaml|docs/api/**)
  - Grep
model: sonnet
---

# API仕様書自動生成コマンド

あなたは `/ai:generate-api-docs` コマンドを実行します。

## 目的

ソースコードからOpenAPI 3.x仕様書を自動生成し、Swagger UIでインタラクティブなAPI開発者向けドキュメントを構築します。

## 実行フロー

### Phase 1: エージェント起動準備

**ユーザー引数の処理:**

- `$1` (source-path): ソースコードパス（未指定時: `src/app/api`）

**コンテキスト収集:**

```bash
# API実装ファイルの確認
grep -r "export async function" $SOURCE_PATH
```

### Phase 2: api-doc-writer エージェント起動

```typescript
`.claude/agents/api-doc-writer.md` を起動し、以下を依頼:

**タスク**: API仕様書の自動生成
**入力情報**:
- ソースコードパス: $SOURCE_PATH
- プロジェクトコンテキスト: master_system_design.md の API設計原則(8章)

**期待成果物**:
1. `openapi.yaml`: OpenAPI 3.x準拠の完全な仕様書
2. `docs/api/integration-guide.md`: 統合ガイド
3. `docs/api/authentication.md`: 認証フロードキュメント
4. Swagger UI 設定ファイル（Next.js統合）

**成果物要件**:
- すべてのエンドポイントが文書化されていること
- リクエスト/レスポンス例が含まれること
- 認証フローが明確に説明されていること
- OpenAPI 3.x バリデーションに合格すること
```

### Phase 3: 完了報告

エージェントからの成果物を受け取り、ユーザーに以下を報告:

- ✅ 生成されたファイル一覧
- 📊 ドキュメント化されたエンドポイント数
- 🔍 バリデーション結果
- 🚀 Swagger UI アクセス方法

## 注意事項

- このコマンドは仕様書生成のみを行い、詳細な実装はエージェントに委譲します
- スキル参照はエージェントが自動的に行います
- API実装コードの変更は行いません
