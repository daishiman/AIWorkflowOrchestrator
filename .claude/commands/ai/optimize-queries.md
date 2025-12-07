---
description: |
  データベースクエリの最適化を行う専門コマンド。

  Vlad Mihalceaの『High-Performance Java Persistence』の原則に基づき、
  N+1問題解消、実行計画分析、インデックス戦略、クエリ書き換えを適用して
  クエリパフォーマンスを最大化します。

  🤖 起動エージェント:
  - `.claude/agents/repo-dev.md`: Repository実装専門エージェント（クエリ最適化担当）
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント（パフォーマンスチューニング担当）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **分析フェーズ（repo-dev）:** query-optimization（N+1検出、実行計画分析）
  **チューニングフェーズ（dba-mgr）:** query-performance-tuning（EXPLAIN QUERY PLAN、インデックス最適化、クエリ書き換え）
  **検証フェーズ（dba-mgr）:** indexing-strategies（B-Tree最適化、SQLite制約考慮）、connection-pooling（コネクション最適化）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（対象ファイルパス、未指定時は対話形式）
  - allowed-tools: エージェント起動とクエリ分析用
    • Task: repo-dev/dba-mgrエージェント起動用
    • Read: 対象ファイル・スキーマ参照用
    • Edit: クエリ最適化実装用
    • Bash(pnpm drizzle-kit studio): Drizzle Studioでクエリ確認用
    • Grep: クエリパターン検索用
  - model: sonnet（標準的なクエリ最適化タスク）

  トリガーキーワード: query, optimization, N+1, EXPLAIN, performance, slow-query
argument-hint: "[file-path]"
allowed-tools:
  - Task
  - Read
  - Edit
  - Bash(pnpm drizzle-kit studio|pnpm test)
  - Grep
model: opus
---

# データベースクエリ最適化コマンド

## 目的

以下の観点からデータベースクエリを最適化します:

- **N+1問題解消**: 複数回のクエリを1回のJOINに統合
- **実行計画分析**: EXPLAIN QUERY PLANによるボトルネック特定
- **インデックス活用**: 適切なインデックス使用の確認と提案
- **クエリ書き換え**: 効率的なSQL生成パターンへの変更
- **フェッチ戦略**: 必要なデータのみ取得（SELECT \*回避）

## 使用方法

### 基本的な使用（対話形式）

```bash
/ai:optimize-queries
```

対話形式で最適化対象のクエリをヒアリングします。

### ファイル指定

```bash
/ai:optimize-queries src/shared/infrastructure/database/repositories/WorkflowRepository.ts
```

特定のRepositoryファイル内のクエリを最適化します。

## 実行フロー

### Phase 1: 起動準備

**エージェント選択と起動**:

```
対象に応じてエージェントを選択:

1. Repository実装の最適化 → `.claude/agents/repo-dev.md` エージェント起動
   - Drizzle ORMクエリの書き換え
   - N+1問題の検出と解消
   - フェッチ戦略の改善

2. データベース側のチューニング → `.claude/agents/dba-mgr.md` エージェント起動
   - EXPLAIN ANALYZE分析
   - インデックス追加/変更
   - スロークエリログ分析
```

### Phase 2: 最適化実行（repo-dev起動時）

**repo-dev エージェントが以下を実行**:

**Phase 1: コンテキスト理解**

- スキーマ確認（`schema.ts`）
- 既存Repository調査
- クエリパターン分析

**Phase 2: クエリ戦略設計**（query-optimization スキル参照）

- N+1問題検出

  ```typescript
  // ❌ Before: N+1問題
  const workflows = await db.select().from(workflows).all();
  for (const wf of workflows) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, wf.user_id))
      .get();
  }

  // ✅ After: JOIN使用
  const workflows = await db
    .select()
    .from(workflows)
    .leftJoin(users, eq(workflows.user_id, users.id))
    .all();
  ```

- 必要なデータのみ取得

  ```typescript
  // ❌ Before: SELECT *
  const workflows = await db.select().from(workflows).all();

  // ✅ After: 必要なカラムのみ
  const workflows = await db
    .select({
      id: workflows.id,
      type: workflows.type,
      status: workflows.status,
    })
    .from(workflows)
    .all();
  ```

**Phase 3: Repository実装**（orm-best-practices スキル参照）

- クエリビルダーパターン適用
- トランザクション最適化
- エラーハンドリング改善

**Phase 4: 検証**

- パフォーマンステスト実行
- N+1問題が解消されたことを確認

### Phase 3: 最適化実行（dba-mgr起動時）

**dba-mgr エージェントが以下を実行**:

**Phase 1: スキーマ分析**

- 既存インデックス確認
- アクセスパターン分析

**Phase 2: パフォーマンスチューニング**（query-performance-tuning スキル参照）

- EXPLAIN QUERY PLAN実行

  ```sql
  EXPLAIN QUERY PLAN
  SELECT w.id, w.type, w.status, u.name
  FROM workflows w
  LEFT JOIN users u ON w.user_id = u.id
  WHERE w.status = 'PENDING';
  ```

- インデックス最適化（indexing-strategies スキル参照）

  ```sql
  -- 複合インデックス追加（高選択性カラムを先頭）
  CREATE INDEX idx_workflows_status_created_at
  ON workflows(status, created_at DESC);

  -- JSON検索用インデックス（SQLiteの制約内で最適化）
  CREATE INDEX idx_workflows_input_payload
  ON workflows(json_extract(input_payload, '$.key'));
  ```

- クエリ書き換え提案
  - EXISTS vs IN vs JOIN の選択
  - サブクエリの最適化
  - ウィンドウ関数の活用

**Phase 3: 検証**

- 改善後のEXPLAIN QUERY PLAN確認
- パフォーマンスメトリクス測定

### Phase 4: 成果物

**エージェントが以下を提供**:

```
成果物:
- 最適化されたクエリ実装
- パフォーマンスレポート（改善前後の比較）
- インデックス追加提案（必要な場合）
- N+1問題解消の証明
```

## 期待される成果物

### パフォーマンスレポート例

````markdown
# クエリ最適化レポート: WorkflowRepository

## 最適化前

- クエリ実行時間: 1,200ms
- 発行クエリ数: 101回（N+1問題）
- 使用インデックス: なし（Table Scan）

## 最適化後

- クエリ実行時間: 45ms（96%改善）
- 発行クエリ数: 1回（JOIN使用）
- 使用インデックス: idx_workflows_status

## 適用した最適化

1. N+1問題解消（JOIN統合）
2. SELECT句の最適化（必要なカラムのみ）
3. インデックス活用（status カラム）

## EXPLAIN QUERY PLAN結果

```sql
SEARCH workflows USING INDEX idx_workflows_status (status=?)
  (rows=1)
```
````

```

## 注意事項

- **詳細な最適化**: すべての最適化ロジックはエージェントと各スキルが実行
- **コマンドの役割**: エージェント起動と対象の受け渡しのみ
- **測定駆動**: 推測ではなく EXPLAIN QUERY PLAN に基づいて最適化
- **回帰テスト**: 最適化後は必ずテストを実行

## 関連コマンド

- `/ai:create-db-schema`: スキーマ設計時にインデックス戦略を検討
- `/ai:create-migration`: インデックス追加をマイグレーションに反映
- `/ai:test`: 最適化後のテスト実行
```
