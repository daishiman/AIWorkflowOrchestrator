# 検索・置換機能 トランザクション改善 - タスク指示書

## メタ情報

| 項目             | 内容                                 |
| ---------------- | ------------------------------------ |
| タスクID         | TRX-SR-001                           |
| タスク名         | トランザクションタイムアウト機能実装 |
| 分類             | 改善                                 |
| 対象機能         | TransactionManager                   |
| 優先度           | 中                                   |
| 見積もり規模     | 小規模                               |
| ステータス       | 未実施                               |
| 発見元           | Phase 7 - 最終レビューゲート         |
| 発見日           | 2025-12-12                           |
| 発見エージェント | .claude/agents/code-quality.md                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索・置換機能のT-07-1最終レビューにおいて、.claude/agents/code-quality.mdエージェントが`TransactionManager`にタイムアウト機能が未実装であることを指摘した。現在の実装では、トランザクションが長時間放置された場合に自動的にロールバックされず、リソースリークやデッドロックの原因となる可能性がある。

### 1.2 問題点・課題

- **リソースリーク**: 開始されたトランザクションがコミット/ロールバックされずに放置されると、バックアップファイルが残り続ける
- **デッドロックリスク**: 同一ファイルに対する複数トランザクションが競合する可能性
- **デバッグ困難**: 長時間放置されたトランザクションの原因特定が難しい
- **運用負荷**: 手動でのクリーンアップが必要になる場合がある

### 1.3 放置した場合の影響

- ディスク容量の無駄遣い（バックアップファイルの蓄積）
- アプリケーションの安定性低下
- ユーザーからの「動作が不安定」という報告増加

---

## 2. 何を達成するか（What）

### 2.1 目的

`TransactionManager`に自動タイムアウト機能を実装し、長時間放置されたトランザクションを自動的にロールバックする。

### 2.2 最終ゴール

- トランザクションにタイムアウト時間を設定可能
- タイムアウト超過時に自動ロールバックが実行される
- タイムアウトイベントがログに記録される
- デフォルトタイムアウト値が適切に設定される（例: 5分）

### 2.3 スコープ

#### 含むもの

- TransactionManagerへのタイムアウト機能追加
- タイムアウト設定オプションの追加
- 自動ロールバック処理の実装
- タイムアウトイベントのログ記録
- テストの追加

#### 含まないもの

- UIへのタイムアウト表示
- トランザクションの永続化（DB保存）
- 分散トランザクション対応

### 2.4 成果物

| 種別   | 成果物                       | 配置先                                                                   |
| ------ | ---------------------------- | ------------------------------------------------------------------------ |
| 機能   | 改修されたTransactionManager | `apps/desktop/src/main/transaction/TransactionManager.ts`                |
| テスト | タイムアウトテスト           | `apps/desktop/src/main/transaction/__tests__/TransactionManager.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 検索・置換機能のPhase 6品質ゲート通過済み
- 既存テストが全て成功していること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識・スキル

- TypeScript
- Node.jsのタイマー機能（setTimeout, clearTimeout）
- トランザクションパターン
- Vitestによるユニットテスト（タイマーモック）

### 3.4 推奨アプローチ

#### 設計方針

```typescript
// TransactionManager.ts - 推奨設計

interface TransactionOptions {
  timeout?: number; // ミリ秒、デフォルト: 300000 (5分)
}

interface Transaction {
  id: string;
  startTime: number;
  timeoutId?: NodeJS.Timeout;
  // ... 既存フィールド
}

class TransactionManager {
  private defaultTimeout = 300000; // 5分

  async begin(options: TransactionOptions = {}): Promise<string> {
    const transaction = this.createTransaction();
    const timeout = options.timeout ?? this.defaultTimeout;

    // タイムアウトタイマーを設定
    transaction.timeoutId = setTimeout(() => {
      this.handleTimeout(transaction.id);
    }, timeout);

    return transaction.id;
  }

  private async handleTimeout(transactionId: string): Promise<void> {
    console.warn(`Transaction ${transactionId} timed out, rolling back...`);
    await this.rollback(transactionId);
  }

  async commit(transactionId: string): Promise<void> {
    const transaction = this.getTransaction(transactionId);
    if (transaction.timeoutId) {
      clearTimeout(transaction.timeoutId);
    }
    // ... 既存のコミット処理
  }

  async rollback(transactionId: string): Promise<void> {
    const transaction = this.getTransaction(transactionId);
    if (transaction.timeoutId) {
      clearTimeout(transaction.timeoutId);
    }
    // ... 既存のロールバック処理
  }
}
```

---

## 4. 実行手順

### Phase構成

```
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
```

### Phase 3: テスト作成 (TDD: Red)

#### 目的

タイムアウト機能の動作を検証するテストを作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/transaction/TransactionManager.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: タイマーを使用したユニットテストの設計に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法                         | 選定理由                 |
| ---------------------- | -------------------------------- | ------------------------ |
| .claude/skills/tdd-principles/SKILL.md         | Red-Green-Refactorサイクルの遵守 | TDDの原則に従うため      |
| .claude/skills/test-doubles/SKILL.md           | タイマーのモック化               | vi.useFakeTimersの活用   |
| .claude/skills/transaction-management/SKILL.md | トランザクションテスト設計       | 正しいテストシナリオ設計 |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース例

```typescript
// TransactionManager.test.ts
describe("トランザクションタイムアウト", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should auto-rollback after timeout", async () => {
    const manager = new TransactionManager();
    const txId = await manager.begin({ timeout: 1000 });

    // タイムアウト前はアクティブ
    expect(manager.isActive(txId)).toBe(true);

    // タイムアウト発生
    vi.advanceTimersByTime(1000);

    // 自動ロールバックされている
    expect(manager.isActive(txId)).toBe(false);
  });

  it("should clear timeout on commit", async () => {
    const manager = new TransactionManager();
    const txId = await manager.begin({ timeout: 1000 });

    await manager.commit(txId);

    // タイムアウト後も問題なし
    vi.advanceTimersByTime(1000);
    // エラーが発生しない
  });

  it("should use default timeout when not specified", async () => {
    const manager = new TransactionManager();
    const txId = await manager.begin();

    // デフォルト5分より前は有効
    vi.advanceTimersByTime(299999);
    expect(manager.isActive(txId)).toBe(true);

    // デフォルト5分後はタイムアウト
    vi.advanceTimersByTime(1);
    expect(manager.isActive(txId)).toBe(false);
  });
});
```

#### 成果物

- タイムアウトテストケース

#### 完了条件

- [ ] タイムアウトテストケースが作成されている
- [ ] テストがRed状態（失敗）であることを確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを成功させるためのタイムアウト機能を実装する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/transaction/TransactionManager.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック（トランザクション管理）の実装に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法                     | 選定理由                       |
| ---------------------- | ---------------------------- | ------------------------------ |
| .claude/skills/transaction-management/SKILL.md | トランザクションパターン実装 | 正しい状態管理                 |
| .claude/skills/type-safety-patterns/SKILL.md   | 型安全な実装                 | タイムアウトオプションの型定義 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- タイムアウト機能が実装されたTransactionManager

#### 完了条件

- [ ] タイムアウト機能が実装されている
- [ ] デフォルトタイムアウトが設定されている
- [ ] テストがGreen状態（成功）であることを確認

---

### Phase 5: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善しつつ、テストが継続して成功することを確認する。

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/transaction/TransactionManager.ts
/ai:analyze-code-quality apps/desktop/src/main/transaction/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] タイマー管理のコードが整理されている
- [ ] エラーハンドリングが適切である
- [ ] リファクタリング後もテストが成功する

---

### Phase 6: 品質保証

#### 目的

品質基準を満たすことを検証する。

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
/ai:lint --fix
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 完了条件

- [ ] 全テスト成功
- [ ] カバレッジ80%以上維持
- [ ] Lintエラーなし
- [ ] 型エラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] タイムアウト時間を設定可能である
- [ ] タイムアウト超過時に自動ロールバックが実行される
- [ ] コミット/ロールバック時にタイマーがクリアされる
- [ ] デフォルトタイムアウト（5分）が適用される

### 品質要件

- [ ] 全テストが成功する
- [ ] カバレッジが80%以上を維持
- [ ] Lint/型チェックがクリア

### ドキュメント要件

- [ ] タイムアウトオプションがコメントで説明されている

---

## 6. 検証方法

### テストケース

1. タイムアウト後に自動ロールバックが実行される
2. コミット時にタイマーがクリアされる
3. ロールバック時にタイマーがクリアされる
4. デフォルトタイムアウトが適用される
5. カスタムタイムアウトが適用される

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test:run TransactionManager

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                                    |
| ---------------------- | ------ | -------- | --------------------------------------- |
| タイムアウトが短すぎる | 中     | 低       | デフォルト5分を設定、ユーザー設定可能に |
| タイマーリーク         | 高     | 低       | commit/rollback時に必ずclearTimeout     |
| 既存テストへの影響     | 低     | 中       | vi.useFakeTimersを使用してテスト        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/search-replace/task-step07-final-review.md` - 最終レビューレポート

### 参考資料

- [Node.js Timers](https://nodejs.org/api/timers.html) - タイマーAPI
- [Vitest Fake Timers](https://vitest.dev/guide/mocking.html#timers) - タイマーモック

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
| 優先度 | ファイル              | 問題                     | 推奨対策                      |
| MEDIUM | TransactionManager.ts | タイムアウト未実装       | 自動タイムアウト機能追加      |
```

### 補足事項

- タイムアウト値は将来的にユーザー設定画面から変更可能にすることを検討
- タイムアウト発生時の通知機能は別タスクとして検討
