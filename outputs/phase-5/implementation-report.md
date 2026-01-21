# 実装報告書（Implementation Report）

> Phase 5 成果物
> タスクID: SECURITY-001
> 実装日: 2026-01-18

---

## 1. 実装概要

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| 実装目的       | OWASP A01: Broken Access Control対策の認可機能実装                          |
| TDDフェーズ    | Green（テストを通過させる最小限の実装）                                     |
| 参照設計書     | `outputs/phase-2/design-authorization.md`                                   |
| テストファイル | `packages/shared/src/features/chat-history/__tests__/authorization.test.ts` |

---

## 2. 実装ファイル一覧

### 2.1 新規作成ファイル

| ファイル                                              | 説明                              |
| ----------------------------------------------------- | --------------------------------- |
| `packages/shared/src/features/chat-history/errors.ts` | UnauthorizedErrorクラス、型ガード |

### 2.2 修正ファイル

| ファイル                                                                           | 修正内容                         |
| ---------------------------------------------------------------------------------- | -------------------------------- |
| `packages/shared/src/features/chat-history/chat-history-service.ts`                | 認可チェック追加、シグネチャ変更 |
| `packages/shared/src/features/chat-history/__tests__/chat-history-service.test.ts` | requestUserId引数追加            |

---

## 3. 実装詳細

### 3.1 UnauthorizedErrorクラス

```typescript
// packages/shared/src/features/chat-history/errors.ts
export class UnauthorizedError extends Error {
  public readonly name = "UnauthorizedError" as const;
  public readonly code = "UNAUTHORIZED" as const;
  public readonly statusCode = 403 as const;

  constructor(
    message = "Access denied: You do not have permission to access this resource",
    public readonly resourceType?: string,
    public readonly resourceId?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}
```

### 3.2 verifySessionOwnershipメソッド

```typescript
// packages/shared/src/features/chat-history/chat-history-service.ts
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

### 3.3 メソッドシグネチャ変更

| メソッド名       | 変更後シグネチャ                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| getSession       | `getSession(id: string, requestUserId: string): Promise<ChatSession \| null>`                          |
| deleteSession    | `deleteSession(id: string, requestUserId: string): Promise<boolean>`                                   |
| updateSession    | `updateSession(id: string, requestUserId: string, data: UpdateChatSession): Promise<boolean>`          |
| exportToMarkdown | `exportToMarkdown(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>` |
| exportToJson     | `exportToJson(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>`     |

---

## 4. テスト実行結果

### 4.1 認可テスト（モックベース）

```
 ✓ src/features/chat-history/__tests__/authorization.test.ts (20 tests) 10ms
 Test Files  1 passed | 133 skipped (134)
      Tests  20 passed | 4671 skipped (4691)
```

### 4.2 TypeScript型チェック

```
> @repo/shared@1.0.0 typecheck
> tsc --noEmit
```

型エラーなしで完了。

---

## 5. TDD Green状態確認

| 確認項目                            | 結果 |
| ----------------------------------- | ---- |
| 認可テスト20件全てパス              | PASS |
| TypeScript型チェック成功            | PASS |
| 既存テストのシグネチャ更新完了      | PASS |
| UnauthorizedError正しく投げられる   | PASS |
| isUnauthorizedError型ガード正常動作 | PASS |

**TDD Green状態**: **確認完了**

---

## 6. セキュリティ実装確認

### 6.1 OWASP A01準拠

| 要件                                 | 実装状況 |
| ------------------------------------ | -------- |
| 全メソッドでuserID検証               | 実装済   |
| 認可チェックがデータ操作前           | 実装済   |
| 情報漏洩防止（統一エラーメッセージ） | 実装済   |
| Fail-Secure設計                      | 実装済   |

### 6.2 認可チェック対象メソッド

| メソッド         | 認可チェック方法       |
| ---------------- | ---------------------- |
| getSession       | 直接検証               |
| deleteSession    | verifySessionOwnership |
| updateSession    | verifySessionOwnership |
| exportToMarkdown | verifySessionOwnership |
| exportToJson     | verifySessionOwnership |

---

## 7. Phase 5 完了確認

- [x] タスク1: UnauthorizedErrorクラスの実装 - 完了
- [x] タスク2: isUnauthorizedError型ガードの実装 - 完了
- [x] タスク3: verifySessionOwnershipメソッドの実装 - 完了
- [x] タスク4: getSessionの認可チェック追加 - 完了
- [x] タスク5: deleteSessionの認可チェック追加 - 完了
- [x] タスク6: updateSessionの認可チェック追加 - 完了
- [x] タスク7: exportToMarkdownの認可チェック追加 - 完了
- [x] タスク8: exportToJsonの認可チェック追加 - 完了
- [x] タスク9: 既存テストのシグネチャ更新 - 完了
- [x] タスク10: テスト実行・Green状態確認 - 完了

**Phase 5 完了**: 全タスク100%実行完了

---

## 8. 次のアクション

Phase 6（テスト拡充 - 境界値・異常系テスト追加）へ進行。
