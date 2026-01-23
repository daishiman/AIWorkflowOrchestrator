# システムプロンプトレートリミット実装 - タスク実行仕様書

## メタ情報

```yaml
issue_number: 448
```

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | UNASSIGNED-SYSPROMPT-006             |
| タスク名     | システムプロンプトレートリミット実装 |
| 分類         | パフォーマンス                       |
| 対象機能     | チャット - システムプロンプト設定    |
| 優先度       | 低                                   |
| 見積もり規模 | **小規模**                           |
| ステータス   | 未実施                               |
| 発見元       | TASK-CHAT-SYSPROMPT-DB-001 Phase 12  |
| 発見日       | 2026-01-22                           |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

システムプロンプトのDB永続化機能では、IPC Handler経由でCRUD操作が可能です。しかし、リクエスト頻度を制限するレートリミット機能は未実装です。

### 問題点・課題

| 問題           | 影響                                |
| -------------- | ----------------------------------- |
| レート制限なし | 大量リクエストでDBに負荷がかかる    |
| DoS攻撃に脆弱  | 悪意あるリクエストを防げない        |
| リソース枯渇   | メモリ・CPU使用率が急上昇する可能性 |

### 放置した場合の影響

- アプリケーションが応答不能になる可能性
- 他の機能に影響を与える
- ユーザー体験の低下

---

## 2. 何を達成するか（What）

### 目的

IPC Handler層でリクエスト頻度を制限し、システムの安定性を確保する。

### 最終ゴール

| ゴール           | 詳細                         |
| ---------------- | ---------------------------- |
| レート制限       | 1分間あたりの操作回数を制限  |
| 制限超過時の処理 | 適切なエラーメッセージを返す |
| 設定可能         | 制限値を環境変数で設定可能   |

### スコープ

**含むもの**:

- IPC Handler層でのレート制限
- スライディングウィンドウ方式
- 制限超過時のエラーレスポンス
- 環境変数での制限値設定

**含まないもの**:

- ユーザー別のレート制限
- 分散環境でのレート制限
- 動的な制限値変更

### 成果物一覧

| 種別   | 成果物                 | 配置先                                           |
| ------ | ---------------------- | ------------------------------------------------ |
| 実装   | RateLimiter            | `apps/desktop/src/main/utils/rate-limiter.ts`    |
| 実装   | レート制限ミドルウェア | `apps/desktop/src/main/middleware/rate-limit.ts` |
| 設定   | 環境変数               | `.env.example`                                   |
| テスト | RateLimiterテスト      | `apps/desktop/src/main/utils/*.test.ts`          |

---

## 3. どのように実行するか（How）

### 前提条件

| 条件         | 状態   |
| ------------ | ------ |
| IPC Handlers | ✅完了 |

### 依存タスク

- なし

### 必要な知識・スキル

| スキル                     | レベル |
| -------------------------- | ------ |
| TypeScript                 | 中級   |
| レートリミットアルゴリズム | 基礎   |

---

## 4. 実行手順

### RateLimiter実装

```typescript
// apps/desktop/src/main/utils/rate-limiter.ts
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 古いタイムスタンプを削除
    this.timestamps = this.timestamps.filter((t) => t > windowStart);

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const recentRequests = this.timestamps.filter(
      (t) => t > windowStart,
    ).length;
    return Math.max(0, this.maxRequests - recentRequests);
  }
}
```

### ミドルウェア適用

```typescript
// apps/desktop/src/main/middleware/rate-limit.ts
const rateLimiter = new RateLimiter(
  60 * 1000, // 1分
  parseInt(process.env.SYSTEM_PROMPT_RATE_LIMIT || "60", 10),
);

export function checkRateLimit(): boolean {
  if (!rateLimiter.isAllowed()) {
    throw new Error(
      "Rate limit exceeded. Please wait before making more requests.",
    );
  }
  return true;
}
```

### 環境変数

```env
# .env.example
SYSTEM_PROMPT_RATE_LIMIT=60  # 1分あたりの最大リクエスト数
```

---

## 5. 完了条件チェックリスト

- [ ] RateLimiterクラスが実装されている
- [ ] IPC Handlerにレート制限が適用されている
- [ ] 制限超過時に適切なエラーが返される
- [ ] 環境変数で制限値が設定可能
- [ ] テストカバレッジ80%以上

---

## 6. 検証方法

| ID   | テストケース           | 期待結果             |
| ---- | ---------------------- | -------------------- |
| TC01 | 通常リクエスト         | 正常に処理される     |
| TC02 | 制限内の連続リクエスト | 全て正常に処理される |
| TC03 | 制限超過               | エラーが返される     |
| TC04 | 時間経過後のリクエスト | 再び正常に処理される |

---

## 更新履歴

| 日付       | 版  | 変更内容                   | 作成者 |
| ---------- | --- | -------------------------- | ------ |
| 2026-01-22 | 1.0 | 初版作成（Phase 12で検出） | Claude |
