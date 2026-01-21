# 認可機能設計書（Authorization Design）

> Phase 2 成果物
> タスクID: SECURITY-001
> 作成日: 2026-01-18

---

## 1. UnauthorizedError クラス設計

### 1.1 クラス定義

````typescript
// packages/shared/src/features/chat-history/errors.ts

/**
 * 認可失敗時にスローされるエラー
 *
 * OWASP A01: Broken Access Control 対策として使用。
 * セッションの存在有無を推測させないよう、統一されたエラーメッセージを使用する。
 *
 * @example
 * ```typescript
 * if (session.userId !== requestUserId) {
 *   throw new UnauthorizedError(
 *     "Access denied: You do not have permission to access this resource",
 *     "session",
 *     sessionId
 *   );
 * }
 * ```
 */
export class UnauthorizedError extends Error {
  /** エラー名（固定値） */
  public readonly name = "UnauthorizedError" as const;

  /** エラーコード（固定値） */
  public readonly code = "UNAUTHORIZED" as const;

  /** HTTPステータスコード（固定値） */
  public readonly statusCode = 403 as const;

  /**
   * UnauthorizedErrorを生成する
   *
   * @param message - エラーメッセージ（デフォルト: 汎用的なアクセス拒否メッセージ）
   * @param resourceType - リソースタイプ（ログ用、オプション）
   * @param resourceId - リソースID（ログ用、オプション）
   */
  constructor(
    message = "Access denied: You do not have permission to access this resource",
    public readonly resourceType?: string,
    public readonly resourceId?: string,
  ) {
    super(message);
    // ES5環境でのprototype chain維持
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
````

### 1.2 型ガード関数

````typescript
/**
 * UnauthorizedError型ガード
 *
 * @param error - 判定対象のエラー
 * @returns UnauthorizedErrorの場合true
 *
 * @example
 * ```typescript
 * try {
 *   await service.getSession(id, userId);
 * } catch (error) {
 *   if (isUnauthorizedError(error)) {
 *     // 認可エラー処理
 *   }
 * }
 * ```
 */
export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}
````

### 1.3 エクスポート設計

```typescript
// packages/shared/src/features/chat-history/index.ts に追加
export { UnauthorizedError, isUnauthorizedError } from "./errors.js";
```

---

## 2. 認可チェック関数設計

### 2.1 プライベートヘルパーメソッド

```typescript
// ChatHistoryServiceクラス内に追加

/**
 * セッションの所有者を検証する
 *
 * セッションの存在確認と所有者検証を一括で行う。
 * セキュリティ原則:
 * - Fail-Secure: 検証失敗時は必ずエラーを投げる
 * - 情報漏洩防止: セッションの存在有無を推測させないエラーメッセージ
 *
 * @param sessionId - 検証対象のセッションID
 * @param requestUserId - リクエストを行ったユーザーのID
 * @returns 検証済みのセッション
 * @throws {UnauthorizedError} セッションが存在しない場合、または所有者でない場合
 *
 * @internal
 */
private async verifySessionOwnership(
  sessionId: string,
  requestUserId: string,
): Promise<ChatSession> {
  const session = await this.sessionRepository.findById(sessionId);

  // セッションが存在しない場合も同じエラーを返す（情報漏洩防止）
  if (!session) {
    throw new UnauthorizedError(
      "Access denied: You do not have permission to access this resource",
      "session",
      sessionId,
    );
  }

  // 所有者検証
  if (session.userId !== requestUserId) {
    throw new UnauthorizedError(
      "Access denied: You do not have permission to access this resource",
      "session",
      sessionId,
    );
  }

  return session;
}
```

### 2.2 設計原則

| 原則            | 説明                                     | 実装方法                                      |
| --------------- | ---------------------------------------- | --------------------------------------------- |
| Fail-Secure     | 検証失敗時は必ずアクセス拒否             | 条件不成立時は例外をスロー                    |
| Deny by Default | 明示的に許可されない限り拒否             | 検証成功時のみセッションを返却                |
| 情報漏洩防止    | セッションの存在有無を推測させない       | 存在しない場合も同じUnauthorizedErrorをスロー |
| 一貫性          | すべてのメソッドで同じ検証ロジックを使用 | verifySessionOwnershipメソッドで一元管理      |

---

## 3. メソッドシグネチャ変更設計

### 3.1 変更一覧

| メソッド名       | 変更前シグネチャ                                                                | 変更後シグネチャ                                                                                       |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| getSession       | `getSession(id: string): Promise<ChatSession \| null>`                          | `getSession(id: string, requestUserId: string): Promise<ChatSession \| null>`                          |
| deleteSession    | `deleteSession(id: string): Promise<boolean>`                                   | `deleteSession(id: string, requestUserId: string): Promise<boolean>`                                   |
| updateSession    | `updateSession(id: string, data: UpdateChatSession): Promise<boolean>`          | `updateSession(id: string, requestUserId: string, data: UpdateChatSession): Promise<boolean>`          |
| exportToMarkdown | `exportToMarkdown(sessionId: string, options?: ExportOptions): Promise<string>` | `exportToMarkdown(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>` |
| exportToJson     | `exportToJson(sessionId: string, options?: ExportOptions): Promise<string>`     | `exportToJson(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>`     |

### 3.2 実装パターン

```typescript
/**
 * getSession - 認可チェック追加版
 */
async getSession(id: string, requestUserId: string): Promise<ChatSession | null> {
  const session = await this.sessionRepository.findById(id);

  // セッションが存在しない場合はnullを返す（既存の挙動維持）
  if (!session) {
    return null;
  }

  // 所有者検証
  if (session.userId !== requestUserId) {
    throw new UnauthorizedError(
      "Access denied: You do not have permission to access this resource",
      "session",
      id,
    );
  }

  return session;
}

/**
 * deleteSession - 認可チェック追加版
 */
async deleteSession(id: string, requestUserId: string): Promise<boolean> {
  // 認可チェック（存在しない場合はUnauthorizedError）
  await this.verifySessionOwnership(id, requestUserId);

  // 既存の削除ロジック
  const messages = await this.messageRepository.findBySessionId(id);
  for (const message of messages) {
    await this.messageRepository.delete(message.id);
  }

  return this.sessionRepository.delete(id);
}

/**
 * updateSession - 認可チェック追加版
 */
async updateSession(
  id: string,
  requestUserId: string,
  data: UpdateChatSession,
): Promise<boolean> {
  // 認可チェック
  await this.verifySessionOwnership(id, requestUserId);

  // 既存の更新ロジック
  return this.sessionRepository.update(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * exportToMarkdown - 認可チェック追加版
 */
async exportToMarkdown(
  sessionId: string,
  requestUserId: string,
  options?: ExportOptions,
): Promise<string> {
  // 認可チェック付きのセッション検証（validateSessionの代替）
  const session = await this.verifySessionOwnership(sessionId, requestUserId);

  // 既存のエクスポートロジック
  const messages = await this.messageRepository.findBySessionId(sessionId);
  // ... 残りの処理
}

/**
 * exportToJson - 認可チェック追加版
 */
async exportToJson(
  sessionId: string,
  requestUserId: string,
  _options?: ExportOptions,
): Promise<string> {
  // 認可チェック付きのセッション検証
  const session = await this.verifySessionOwnership(sessionId, requestUserId);

  // 既存のエクスポートロジック
  const messages = await this.messageRepository.findBySessionId(sessionId);
  // ... 残りの処理
}
```

### 3.3 getSessionの特別な挙動

| ケース                     | 戻り値/挙動         | 理由                               |
| -------------------------- | ------------------- | ---------------------------------- |
| セッションが存在しない     | `null`              | 既存の挙動維持、呼び出し元の互換性 |
| セッションが存在、非所有者 | `UnauthorizedError` | 認可チェック                       |
| セッションが存在、所有者   | `ChatSession`       | 正常系                             |

---

## 4. エラーハンドリングフロー設計

### 4.1 エラー伝播フロー

```
┌─────────────────────────────────────────────────────────────┐
│ Service層 (ChatHistoryService)                              │
│ └── verifySessionOwnership() で認可チェック                 │
│     └── 失敗時: UnauthorizedError をスロー                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ エラー伝播
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ IPC/API層 (Handler)                                         │
│ └── try-catch でエラーをキャッチ                            │
│ └── isUnauthorizedError() で型判定                          │
│ └── ログ出力（詳細情報: sessionId, requestUserId）          │
│ └── エラーレスポンス生成（最小限の情報のみ）                │
└──────────────────────┬──────────────────────────────────────┘
                       │ エラーレスポンス
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Renderer/Client層                                           │
│ └── エラーコードを判定                                      │
│ └── ユーザー向けメッセージを表示                            │
│     「アクセス権限がありません」                            │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 IPC層でのエラーハンドリング設計

```typescript
// apps/desktop/src/main/ipc/chatHistoryHandlers.ts

import { isUnauthorizedError } from "@repo/shared/features/chat-history";

/**
 * セッション取得IPCハンドラー
 */
ipcMain.handle(
  "chat-history:getSession",
  async (event, sessionId: string, userId: string) => {
    try {
      const result = await chatHistoryService.getSession(sessionId, userId);
      return { success: true, data: result };
    } catch (error) {
      if (isUnauthorizedError(error)) {
        // 開発者向けログ（詳細情報）
        console.warn(
          `[SECURITY] Unauthorized access attempt: sessionId=${sessionId}, requestUserId=${userId}`,
        );

        // クライアント向けレスポンス（最小限の情報）
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }
      // 予期しないエラーは再スロー
      throw error;
    }
  },
);
```

### 4.3 エラーレスポンス形式

```typescript
// 成功時
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// エラー時
interface ErrorResponse {
  success: false;
  error: {
    code: "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
  };
}
```

---

## 5. 呼び出し元修正箇所一覧

### 5.1 テストファイル

| ファイル                                                                           | 修正内容                                |
| ---------------------------------------------------------------------------------- | --------------------------------------- |
| `packages/shared/src/features/chat-history/__tests__/chat-history-service.test.ts` | 全テストケースにrequestUserId引数を追加 |

### 5.2 将来のIPC/APIハンドラー（参考）

| ファイル（想定）                                   | 修正内容                                  |
| -------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/chatHistoryHandlers.ts` | getSession, deleteSession等の呼び出し修正 |
| `apps/web/src/app/api/chat-history/route.ts`       | APIルートの認可チェック対応               |

---

## 6. ファイル変更一覧

### 6.1 新規作成ファイル

| ファイル                                              | 内容                              |
| ----------------------------------------------------- | --------------------------------- |
| `packages/shared/src/features/chat-history/errors.ts` | UnauthorizedErrorクラス、型ガード |

### 6.2 修正ファイル

| ファイル                                                                           | 修正内容                         |
| ---------------------------------------------------------------------------------- | -------------------------------- |
| `packages/shared/src/features/chat-history/chat-history-service.ts`                | 認可チェック追加、シグネチャ変更 |
| `packages/shared/src/features/chat-history/index.ts`                               | errors.tsからのエクスポート追加  |
| `packages/shared/src/features/chat-history/__tests__/chat-history-service.test.ts` | テストケース修正                 |

---

## 7. Phase 2 完了確認

- [x] タスク1: UnauthorizedErrorクラスの詳細設計 - 完了
- [x] タスク2: 認可チェック関数の設計 - 完了
- [x] タスク3: メソッドシグネチャ変更の設計 - 完了
- [x] タスク4: エラーハンドリングフローの設計 - 完了
- [x] タスク5: 設計書の作成 - 完了

**Phase 2 完了**: 全タスク100%実行完了
