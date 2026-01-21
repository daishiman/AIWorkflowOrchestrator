# Knowledge Graph バッチ操作トランザクションサポート - タスク指示書

## メタ情報

```yaml
issue_number: 268
```

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | CONV-08-01-02                         |
| タスク名     | Batch Transaction Rollback Support    |
| 分類         | 改善                                  |
| 対象機能     | Knowledge Graph Store                 |
| 優先度       | 低                                    |
| 見積もり規模 | 小規模                                |
| ステータス   | 未実施                                |
| 発見元       | Phase 12（CONV-08-01タスク）          |
| 発見日       | 2026-01-09                            |
| 親タスク     | CONV-08-01 Knowledge Graph ストア実装 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Knowledge Graph Store実装（CONV-08-01）において、バッチ操作（`batchAddEntities`, `batchAddRelations`）は部分的な失敗時にロールバック機能を持たない。現在の実装では、バッチ処理中にエラーが発生しても、既に挿入されたデータは残り続ける。

### 1.2 問題点・課題

- バッチ操作の原子性（Atomicity）が保証されていない
- 部分的な失敗時のデータ整合性が損なわれる可能性がある
- `it.todo("should rollback on partial failure")`としてテストがスキップされている

### 1.3 放置した場合の影響

- 大量データ投入時にエラーが発生すると、中途半端な状態のデータが残る
- データクリーンアップの手動作業が必要になる
- 本番環境でのデータ品質問題につながる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

バッチ操作にトランザクションサポートを追加し、部分的な失敗時に自動ロールバックを実行する機能を実装する。

### 2.2 最終ゴール

```typescript
// バッチ操作の原子性保証
const result = await store.batchAddEntities(entities);
// エラー発生時は全ての変更がロールバックされる
```

### 2.3 スコープ

#### 含むもの

- SQLiteトランザクション機能の活用
- `batchAddEntities()`のトランザクションラップ
- `batchAddRelations()`のトランザクションラップ
- ロールバックテストの実装

#### 含まないもの

- 分散トランザクション
- 複数ストア間のトランザクション
- 非同期バッチ処理

### 2.4 成果物

| 成果物       | 説明                       |
| ------------ | -------------------------- |
| 実装コード   | トランザクションラップ処理 |
| テストコード | ロールバック検証テスト     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Knowledge Graph Store基本実装が完了していること
- SQLiteのトランザクション機能が利用可能であること

### 3.2 依存タスク

| タスクID   | タスク名                   | ステータス |
| ---------- | -------------------------- | ---------- |
| CONV-08-01 | Knowledge Graph ストア実装 | 完了       |

### 3.3 必要な知識・スキル

- SQLiteトランザクション
- Drizzle ORM
- TypeScript
- エラーハンドリングパターン

### 3.4 推奨アプローチ

1. Drizzle ORMのトランザクションAPIを確認
2. `batchAddEntities()`をトランザクションでラップ
3. `batchAddRelations()`をトランザクションでラップ
4. 部分的失敗シナリオのテストを実装

---

## 4. 実行手順

### Phase構成

標準のPhase 1-13フローに従う。

### 使用スキル

| スキル名     | パス                                   | 選定理由         |
| ------------ | -------------------------------------- | ---------------- |
| tdd-workflow | `.claude/skills/tdd-workflow/SKILL.md` | テスト駆動で実装 |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] batchAddEntities()がトランザクション内で実行される
- [ ] batchAddRelations()がトランザクション内で実行される
- [ ] 部分的失敗時にロールバックが発生する

### 品質要件

- [ ] `it.todo()`テストが実装され成功する
- [ ] 既存テストが全て通過する

### ドキュメント要件

- [ ] API仕様の更新（トランザクション動作の説明）

---

## 6. 検証方法

### テストケース

1. バッチ操作が正常に完了する
2. 途中でエラーが発生した場合、全ての変更がロールバックされる
3. ロールバック後、データベースの状態が操作前と同一

### 検証手順

```bash
pnpm vitest run packages/shared/src/services/graph/__tests__/ --grep "rollback"
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                       |
| -------------------------- | ------ | -------- | -------------------------- |
| パフォーマンス低下         | 低     | 低       | ベンチマークで影響を測定   |
| ネストトランザクション問題 | 中     | 低       | セーブポイントの活用を検討 |

---

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/services/graph/knowledge-graph-store.ts:220` - batchAddEntities()
- `packages/shared/src/services/graph/knowledge-graph-store.ts:261` - batchAddRelations()
- `packages/shared/src/services/graph/__tests__/knowledge-graph-store.test.ts` - it.todo()テスト

---

## 9. 備考

### 現在のテスト状態

```typescript
it.todo("should rollback on partial failure");
```

### 補足事項

- このタスクは優先度が低いため、他の重要タスク完了後に実施
- SQLiteのSAVEPOINTを使用したネストトランザクションも検討可能
