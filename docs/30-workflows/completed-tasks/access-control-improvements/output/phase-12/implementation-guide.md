# 認可機能（Authorization）実装ガイド

> Phase 12 成果物
> タスクID: SECURITY-001
> 作成日: 2026-01-18

---

## Part 1: 概念的な説明（中学生でもわかる版）

### 認可チェックとは何か？

認可チェックとは、「この人はこのデータにアクセスしていいの？」を確認する仕組みです。

**たとえ話**で説明すると：

> 学校のロッカーを想像してください。自分のロッカーには鍵があって、自分だけが開けられます。
> 他の人が「あなたのロッカーを開けたい」と言っても、鍵がなければ開けられません。
> 認可チェックは、この「鍵を持っているか確認する」作業と同じです。

### なぜ必要か？（セキュリティ上の理由）

認可チェックがないと、他人のデータを勝手に見たり、削除したりできてしまいます。

**具体例**：

- ユーザーAのチャット履歴をユーザーBが見てしまう
- 他人のセッションを勝手に削除してしまう
- プライベートな会話内容が漏洩する

**OWASP Top 10**という世界的なセキュリティガイドラインでは、「Broken Access Control（認可の不備）」が最も危険な脆弱性として1位に挙げられています。

### どのように動作するか（概念図）

```
┌─────────────────────────────────────────────────────────┐
│                    リクエスト                            │
│  「セッションID: abc123 のデータを見せて」               │
│  「リクエストユーザー: user-001」                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    認可チェック                          │
│  1. セッション abc123 を検索                             │
│  2. セッションの所有者を確認                             │
│     → 所有者: user-001                                  │
│  3. リクエストユーザーと比較                             │
│     → user-001 === user-001 ?                          │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
┌──────────────────┐         ┌──────────────────┐
│    一致（OK）     │         │   不一致（NG）   │
│  → データを返す   │         │  → エラーを返す  │
└──────────────────┘         └──────────────────┘
```

### エラーメッセージの工夫（情報漏洩防止）

セキュリティでは「どんなエラーが起きたか」を詳しく教えないことが重要です。

**悪い例**（情報が漏れる）:

```
✗ 「セッション abc123 は user-002 のものです」
  → 攻撃者に「abc123というセッションが存在する」ことがバレる
```

**良い例**（情報が漏れない）:

```
✓ 「アクセスが拒否されました」
  → セッションが存在するかどうかわからない
```

---

## Part 2: 技術的詳細（開発者・技術者向け）

### 1. UnauthorizedErrorクラスの仕様

```typescript
// packages/shared/src/features/chat-history/errors.ts

/**
 * 認可失敗時の定数
 */
export const UNAUTHORIZED_ERROR_MESSAGE =
  "Access denied: You do not have permission to access this resource" as const;

export const RESOURCE_TYPE = {
  SESSION: "session",
} as const;

/**
 * 認可失敗エラークラス
 */
export class UnauthorizedError extends Error {
  public readonly name = "UnauthorizedError" as const;
  public readonly code = "UNAUTHORIZED" as const;
  public readonly statusCode = 403 as const;

  constructor(
    message: string = UNAUTHORIZED_ERROR_MESSAGE,
    public readonly resourceType?: string, // ログ用（クライアントには露出しない）
    public readonly resourceId?: string, // ログ用（クライアントには露出しない）
  ) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 型ガード関数
 */
export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}
```

### 2. verifySessionOwnershipの実装詳細

```typescript
// packages/shared/src/features/chat-history/chat-history-service.ts

/**
 * セッションの所有者を検証する（認可チェック）
 *
 * @param sessionId - 検証対象のセッションID
 * @param requestUserId - リクエストを行ったユーザーのID
 * @returns 検証済みのセッション
 * @throws {UnauthorizedError} セッションが存在しない場合、または所有者でない場合
 */
private async verifySessionOwnership(
  sessionId: string,
  requestUserId: string,
): Promise<ChatSession> {
  const session = await this.sessionRepository.findById(sessionId);

  // セッションが存在しない場合も同じエラーを返す（情報漏洩防止）
  if (!session) {
    throw new UnauthorizedError(
      UNAUTHORIZED_ERROR_MESSAGE,
      RESOURCE_TYPE.SESSION,
      sessionId,
    );
  }

  // 所有者検証
  if (session.userId !== requestUserId) {
    throw new UnauthorizedError(
      UNAUTHORIZED_ERROR_MESSAGE,
      RESOURCE_TYPE.SESSION,
      sessionId,
    );
  }

  return session;
}
```

### 3. 使用例とコードサンプル

#### 認可チェック付きメソッドの呼び出し

```typescript
// 所有者によるアクセス（成功）
const session = await chatHistoryService.getSession("session-123", "user-001");
// → セッションオブジェクトが返る

// 非所有者によるアクセス（失敗）
try {
  await chatHistoryService.getSession("session-123", "user-002");
} catch (error) {
  if (isUnauthorizedError(error)) {
    console.log(error.message); // "Access denied: ..."
    console.log(error.statusCode); // 403
  }
}
```

#### APIエンドポイントでのエラーハンドリング

```typescript
// Express/Next.js APIルート例
export async function GET(req: Request) {
  try {
    const sessionId = req.params.id;
    const userId = req.auth.userId; // 認証済みユーザーID

    const session = await chatHistoryService.getSession(sessionId, userId);
    return Response.json(session);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return Response.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    throw error;
  }
}
```

### 4. エラーハンドリングパターン

#### パターン1: 型ガードを使用

```typescript
try {
  await service.deleteSession(sessionId, userId);
} catch (error) {
  if (isUnauthorizedError(error)) {
    // 認可エラー処理
    logger.warn("Unauthorized access attempt", {
      sessionId: error.resourceId,
      requestUserId: userId,
    });
    return { error: "Access denied", status: 403 };
  }
  throw error; // その他のエラーは再スロー
}
```

#### パターン2: instanceof を使用

```typescript
try {
  await service.exportToMarkdown(sessionId, userId);
} catch (error) {
  if (error instanceof UnauthorizedError) {
    return new Response("Forbidden", { status: 403 });
  }
  throw error;
}
```

### 5. メソッドシグネチャ一覧

| メソッド         | シグネチャ                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| getSession       | `getSession(id: string, requestUserId: string): Promise<ChatSession \| null>`                          |
| deleteSession    | `deleteSession(id: string, requestUserId: string): Promise<boolean>`                                   |
| updateSession    | `updateSession(id: string, requestUserId: string, data: UpdateChatSession): Promise<boolean>`          |
| exportToMarkdown | `exportToMarkdown(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>` |
| exportToJson     | `exportToJson(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>`     |

### 6. セキュリティ原則

| 原則         | 実装                                   |
| ------------ | -------------------------------------- |
| Fail-Secure  | 検証失敗時は必ずエラーをスロー         |
| 情報漏洩防止 | 存在チェックと認可チェックで同一エラー |
| 最小権限     | リソースへのアクセスは所有者のみ       |
| 一貫性       | 全メソッドで同じ検証パターンを使用     |

---

## まとめ

本実装により、ChatHistoryServiceの全ての操作に対して認可チェックが実装され、OWASP A01: Broken Access Control に準拠したセキュアな設計となりました。
