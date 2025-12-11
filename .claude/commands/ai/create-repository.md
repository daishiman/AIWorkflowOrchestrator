---
description: |
  新しいRepositoryパターン実装を作成する専門コマンド。

  src/shared/infrastructure/database/repositories/ 配下にRepository実装ファイルと
  src/shared/core/interfaces/ 配下にRepositoryインターフェースを生成します。

  🤖 起動エージェント:
  - `.claude/agents/repo-dev.md`: Repositoryパターン実装専門エージェント

  📚 利用可能スキル（repo-devエージェントが必要時に参照）:
  **Phase 1（コンテキスト理解時）:** repository-pattern（設計原則）, orm-best-practices（Drizzleスキーマ確認）
  **Phase 2（Repository設計時）:** repository-pattern（インターフェース設計）, query-optimization（N+1解消）
  **Phase 3（Repository実装時）:** repository-pattern（実装パターン）, orm-best-practices（クエリビルダー）, transaction-management（ACID・楽観的ロック）
  **Phase 4（検証時）:** query-optimization（実行計画分析）, connection-pooling（リソース最適化）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（エンティティ名、未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: repo-devエージェント起動用
    • Read: 既存Repository・スキーマ・スキル参照確認用
    • Write(src/shared/**): Repositoryファイル・インターフェース生成用（パス制限）
    • Edit: 既存Repository修正用
    • Grep: 既存パターン検索・重複チェック用
  - model: sonnet（標準的なRepository実装タスク）

  トリガーキーワード: repository, data access, データアクセス, CRUD, ORM

argument-hint: "[entity-name] (optional) - エンティティ名（例: Workflow, User）"
allowed-tools:
  - Task
  - Read
  - Write(src/shared/**)
  - Edit
  - Grep
model: opus
---

# Repository Pattern Implementation Command

このコマンドは **repo-dev エージェント** を起動し、Repositoryパターン実装プロセスを委譲します。

## Phase 1: エージェント起動と要件収集

**1.1 repo-dev エージェント起動**

```
@.claude/agents/repo-dev.md を起動してください。

以下のパラメータで依頼:
- エンティティ名: $1（引数が指定されている場合）
- 配置先:
  - インターフェース: src/shared/core/interfaces/
  - 実装: src/shared/infrastructure/database/repositories/
- プロジェクト仕様: master_system_design.md 準拠
- アーキテクチャ制約: ハイブリッドアーキテクチャ（shared/core → shared/infrastructure 依存方向）
```

**1.2 引数がない場合の対話的収集**

引数 `$1` が空の場合、repo-dev が以下を対話的に収集:

- エンティティ名
- Repository責務（CRUD操作、検索メソッド要件）
- トランザクション境界要件
- クエリパフォーマンス要件

## Phase 2: スキル参照とRepository設計

repo-dev エージェントが以下のスキルを参照しながら設計:

**必須スキル（Phase 1-2）:**

- `.claude/skills/repository-pattern/SKILL.md`: Repository設計原則、インターフェース設計
- `.claude/skills/orm-best-practices/SKILL.md`: Drizzle ORMスキーマ確認、型安全クエリ
- `.claude/skills/query-optimization/SKILL.md`: N+1問題解消、フェッチ戦略

**必須スキル（Phase 3）:**

- `.claude/skills/transaction-management/SKILL.md`: ACID特性、分離レベル、楽観的ロック
- `.claude/skills/repository-pattern/resources/implementation-patterns.md`: 実装パターン
- `.claude/skills/repository-pattern/resources/entity-mapping.md`: エンティティマッピング

**推奨スキル（Phase 4）:**

- `.claude/skills/connection-pooling/SKILL.md`: コネクションプール最適化（必要時）
- `.claude/skills/query-optimization/templates/optimization-checklist.md`: パフォーマンス検証

## Phase 3: 成果物生成と検証

**期待成果物:**

- `src/shared/core/interfaces/I[EntityName]Repository.ts`: Repositoryインターフェース
- `src/shared/infrastructure/database/repositories/[EntityName]Repository.ts`: Repository実装
- TypeScript型定義、CRUD操作、検索メソッド、トランザクション管理
- ユニットテストテンプレート（推奨）

**検証項目（repo-devが実施）:**

- ハイブリッドアーキテクチャ準拠（依存関係方向が正しい）
- Repository パターン準拠（コレクション風API、ドメイン型返却）
- N+1問題なし（効率的なフェッチ戦略）
- トランザクション境界が適切
- master_system_design.md のディレクトリ構造遵守

---

**注記:**

- このコマンドは **ハブ専用** です。詳細な設計・実装は repo-dev エージェントに完全委譲されます。
- すべてのRepositoryロジック、ORM活用、パフォーマンス最適化は参照スキルに定義されています。
