# システムプロンプト監査ログ実装 - タスク実行仕様書

## メタ情報

```yaml
issue_number: 444
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | UNASSIGNED-SYSPROMPT-005            |
| タスク名     | システムプロンプト監査ログ実装      |
| 分類         | セキュリティ                        |
| 対象機能     | チャット - システムプロンプト設定   |
| 優先度       | 低                                  |
| 見積もり規模 | **中規模**                          |
| ステータス   | 未実施                              |
| 発見元       | TASK-CHAT-SYSPROMPT-DB-001 Phase 12 |
| 発見日       | 2026-01-22                          |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

システムプロンプトのDB永続化機能では、テンプレートのCRUD操作が実装されています。しかし、これらの操作を記録する監査ログ機能は未実装です。

### 問題点・課題

| 問題                 | 影響                             |
| -------------------- | -------------------------------- |
| 操作ログなし         | 誰がいつ何をしたか追跡できない   |
| デバッグ困難         | 問題発生時の原因特定が困難       |
| セキュリティ監査不可 | コンプライアンス要件を満たせない |

### 放置した場合の影響

- 不正操作の検出ができない
- インシデント対応が遅れる
- 監査要件を満たせない

---

## 2. 何を達成するか（What）

### 目的

テンプレートの重要操作（作成・更新・削除）を記録し、追跡可能にする。

### 最終ゴール

| ゴール               | 詳細                               |
| -------------------- | ---------------------------------- |
| 操作ログ記録         | CRUD操作を全て記録                 |
| 検索・フィルタリング | 日時・ユーザー・操作種別で検索可能 |
| ログ保持             | 設定可能な保持期間                 |

### スコープ

**含むもの**:

- 作成・更新・削除操作のログ記録
- ログテーブル設計
- ログ検索API
- ログ保持期間設定

**含まないもの**:

- ログのエクスポート機能
- リアルタイムアラート
- 外部ログサービス連携

### 成果物一覧

| 種別   | 成果物               | 配置先                                                     |
| ------ | -------------------- | ---------------------------------------------------------- |
| 実装   | AuditLogRepository   | `packages/shared/src/repositories/audit-log-repository.ts` |
| 実装   | ログ記録ミドルウェア | `apps/desktop/src/main/middleware/audit-logger.ts`         |
| DB     | audit_logsテーブル   | `packages/shared/src/db/schema/`                           |
| テスト | AuditLogテスト       | `packages/shared/src/repositories/*.test.ts`               |

---

## 3. どのように実行するか（How）

### 前提条件

| 条件                   | 状態   |
| ---------------------- | ------ |
| SystemPromptRepository | ✅完了 |
| IPC Handlers           | ✅完了 |

### 依存タスク

- なし

### 必要な知識・スキル

| スキル           | レベル |
| ---------------- | ------ |
| Drizzle ORM      | 中級   |
| TypeScript       | 中級   |
| セキュリティ設計 | 基礎   |

---

## 4. 実行手順

### DBスキーマ

```typescript
// packages/shared/src/db/schema/audit-logs.ts
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // 'create' | 'update' | 'delete'
  entityType: text("entity_type").notNull(), // 'system_prompt_template'
  entityId: text("entity_id").notNull(),
  oldValue: text("old_value"), // JSON
  newValue: text("new_value"), // JSON
  metadata: text("metadata"), // JSON (IP, User-Agent等)
  createdAt: text("created_at").notNull(),
});
```

### ログ記録例

```typescript
// apps/desktop/src/main/middleware/audit-logger.ts
export async function logAudit(params: {
  userId: string;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await auditLogRepository.create({
    id: crypto.randomUUID(),
    ...params,
    oldValue: JSON.stringify(params.oldValue),
    newValue: JSON.stringify(params.newValue),
    createdAt: new Date().toISOString(),
  });
}
```

---

## 5. 完了条件チェックリスト

- [ ] audit_logsテーブルが作成されている
- [ ] 作成・更新・削除操作がログ記録される
- [ ] ログ検索APIが実装されている
- [ ] ログ保持期間の設定が可能
- [ ] テストカバレッジ80%以上

---

## 6. 検証方法

| ID   | テストケース     | 期待結果                     |
| ---- | ---------------- | ---------------------------- |
| TC01 | テンプレート作成 | 作成ログが記録される         |
| TC02 | テンプレート更新 | 更新ログ（変更前後）が記録   |
| TC03 | テンプレート削除 | 削除ログが記録される         |
| TC04 | ログ検索         | 条件に合致するログが返される |

---

## 更新履歴

| 日付       | 版  | 変更内容                   | 作成者 |
| ---------- | --- | -------------------------- | ------ |
| 2026-01-22 | 1.0 | 初版作成（Phase 12で検出） | Claude |
