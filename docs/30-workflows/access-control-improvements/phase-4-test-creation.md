# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 前提Phase  | Phase 3                     |
| 後続Phase  | Phase 5                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

認可失敗時の振る舞いを検証するテストを、実装前に作成する。TDD原則に基づき、期待される動作を先に定義することで、実装品質を担保する。

## 背景

TDDのRedフェーズとして、認可チェック機能のテストを先に作成する。テストは失敗する状態（Red）で開始し、Phase 5の実装でGreen状態にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイルの作成

**目的**: 認可エラーテスト用のテストファイルを作成する

**実行手順**:

1. テストファイルを作成する:
   - `packages/shared/src/features/chat-history/__tests__/authorization.test.ts`

2. 必要なインポートを記述する:

   ```typescript
   import { describe, it, expect, beforeEach, vi } from "vitest";
   import { ChatHistoryService } from "../chat-history-service";
   import { UnauthorizedError, isUnauthorizedError } from "../errors";
   import { IChatSessionRepository } from "@repo/shared/repositories/chat-session-repository";
   import { IChatMessageRepository } from "@repo/shared/repositories/chat-message-repository";
   ```

3. モックの設定を追加する

**期待される成果物**:

- `authorization.test.ts` ファイル（インポートとモック設定）

---

### タスク2: getSessionの認可テスト作成

**目的**: getSessionメソッドの認可失敗テストを作成する

**実行手順**:

1. 以下のテストケースを作成する:

   ```typescript
   describe("ChatHistoryService - Authorization", () => {
     describe("getSession", () => {
       it("所有者がセッションにアクセスした場合、セッションを返す", async () => {
         // Arrange
         const ownerId = "user-123";
         const sessionId = "session-456";
         const mockSession = {
           id: sessionId,
           userId: ownerId,
           title: "Test Session",
           // ... other fields
         };
         mockSessionRepository.findById.mockResolvedValue(mockSession);

         // Act
         const result = await service.getSession(sessionId, ownerId);

         // Assert
         expect(result).toEqual(mockSession);
       });

       it("非所有者がセッションにアクセスした場合、UnauthorizedErrorを投げる", async () => {
         // Arrange
         const ownerId = "user-123";
         const requesterId = "user-456"; // 別のユーザー
         const sessionId = "session-789";
         const mockSession = {
           id: sessionId,
           userId: ownerId,
           title: "Test Session",
         };
         mockSessionRepository.findById.mockResolvedValue(mockSession);

         // Act & Assert
         await expect(
           service.getSession(sessionId, requesterId),
         ).rejects.toThrow(UnauthorizedError);
       });

       it("存在しないセッションにアクセスした場合、UnauthorizedErrorを投げる", async () => {
         // Arrange
         mockSessionRepository.findById.mockResolvedValue(null);

         // Act & Assert
         await expect(
           service.getSession("non-existent", "user-123"),
         ).rejects.toThrow(UnauthorizedError);
       });
     });
   });
   ```

**期待される成果物**:

- getSessionの認可テストケース（正常系1件、異常系2件）

---

### タスク3: deleteSessionの認可テスト作成

**目的**: deleteSessionメソッドの認可失敗テストを作成する

**実行手順**:

1. 以下のテストケースを作成する:

   ```typescript
   describe("deleteSession", () => {
     it("所有者がセッションを削除した場合、正常に削除される", async () => {
       // Arrange
       const ownerId = "user-123";
       const sessionId = "session-456";
       const mockSession = { id: sessionId, userId: ownerId };
       mockSessionRepository.findById.mockResolvedValue(mockSession);
       mockMessageRepository.findBySessionId.mockResolvedValue([]);
       mockSessionRepository.delete.mockResolvedValue(undefined);

       // Act
       const result = await service.deleteSession(sessionId, ownerId);

       // Assert
       expect(result).toBe(true);
       expect(mockSessionRepository.delete).toHaveBeenCalledWith(sessionId);
     });

     it("非所有者がセッションを削除しようとした場合、UnauthorizedErrorを投げる", async () => {
       // Arrange
       const ownerId = "user-123";
       const requesterId = "user-456";
       const sessionId = "session-789";
       const mockSession = { id: sessionId, userId: ownerId };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       // Act & Assert
       await expect(
         service.deleteSession(sessionId, requesterId),
       ).rejects.toThrow(UnauthorizedError);
       expect(mockSessionRepository.delete).not.toHaveBeenCalled();
     });
   });
   ```

**期待される成果物**:

- deleteSessionの認可テストケース（正常系1件、異常系1件）

---

### タスク4: エクスポートメソッドの認可テスト作成

**目的**: exportToMarkdown, exportToJsonの認可失敗テストを作成する

**実行手順**:

1. 以下のテストケースを作成する:

   ```typescript
   describe("exportToMarkdown", () => {
     it("所有者がエクスポートした場合、Markdown文字列を返す", async () => {
       // Arrange
       const ownerId = "user-123";
       const sessionId = "session-456";
       const mockSession = { id: sessionId, userId: ownerId, title: "Test" };
       mockSessionRepository.findById.mockResolvedValue(mockSession);
       mockMessageRepository.findBySessionId.mockResolvedValue([]);

       // Act
       const result = await service.exportToMarkdown(sessionId, ownerId);

       // Assert
       expect(typeof result).toBe("string");
     });

     it("非所有者がエクスポートしようとした場合、UnauthorizedErrorを投げる", async () => {
       // Arrange
       const ownerId = "user-123";
       const requesterId = "user-456";
       const sessionId = "session-789";
       const mockSession = { id: sessionId, userId: ownerId };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       // Act & Assert
       await expect(
         service.exportToMarkdown(sessionId, requesterId),
       ).rejects.toThrow(UnauthorizedError);
     });
   });

   describe("exportToJson", () => {
     it("非所有者がエクスポートしようとした場合、UnauthorizedErrorを投げる", async () => {
       // Arrange
       const ownerId = "user-123";
       const requesterId = "user-456";
       const sessionId = "session-789";
       const mockSession = { id: sessionId, userId: ownerId };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       // Act & Assert
       await expect(
         service.exportToJson(sessionId, requesterId),
       ).rejects.toThrow(UnauthorizedError);
     });
   });
   ```

**期待される成果物**:

- エクスポートメソッドの認可テストケース

---

### タスク5: isUnauthorizedError型ガードのテスト作成

**目的**: 型ガード関数のテストを作成する

**実行手順**:

1. 以下のテストケースを作成する:

   ```typescript
   describe("isUnauthorizedError", () => {
     it("UnauthorizedErrorインスタンスに対してtrueを返す", () => {
       const error = new UnauthorizedError();
       expect(isUnauthorizedError(error)).toBe(true);
     });

     it("通常のErrorに対してfalseを返す", () => {
       const error = new Error("test");
       expect(isUnauthorizedError(error)).toBe(false);
     });

     it("null/undefinedに対してfalseを返す", () => {
       expect(isUnauthorizedError(null)).toBe(false);
       expect(isUnauthorizedError(undefined)).toBe(false);
     });
   });
   ```

**期待される成果物**:

- isUnauthorizedErrorのテストケース

---

### タスク6: TDD Red状態の確認

**目的**: テストが失敗することを確認する

**実行手順**:

1. テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run authorization
   ```

2. 以下を確認する:
   - UnauthorizedErrorが未定義のためインポートエラー
   - または、認可チェックが未実装のためテスト失敗

3. Red状態であることを記録する

**期待される成果物**:

- TDD Red状態の確認結果

---

## 参照資料

| 参照資料         | パス                                                                           | 内容             |
| ---------------- | ------------------------------------------------------------------------------ | ---------------- |
| Phase 2 設計書   | `outputs/phase-2/design-authorization.md`                                      | 認可ロジック設計 |
| チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | テスト対象の仕様 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容                   |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------- |
| チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | テスト対象メソッド仕様 |

---

## 成果物

| 成果物             | パス                                                                        | 内容             |
| ------------------ | --------------------------------------------------------------------------- | ---------------- |
| 認可テストファイル | `packages/shared/src/features/chat-history/__tests__/authorization.test.ts` | 認可エラーテスト |

---

## 統合テスト連携

**Phase 4での統合テスト連携アクション**:

- 認可失敗テストシナリオを作成
- 正常系（所有者アクセス）と異常系（非所有者アクセス）の両方をテスト
- エラーレスポンスの検証を含める

---

## 完了条件

- [ ] テストファイルが作成されている
- [ ] getSessionの認可テスト（正常系・異常系）が作成されている
- [ ] deleteSessionの認可テスト（正常系・異常系）が作成されている
- [ ] エクスポートメソッドの認可テストが作成されている
- [ ] isUnauthorizedError型ガードのテストが作成されている
- [ ] テストがRed状態（失敗）であることを確認済み

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証（Phase 4）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run authorization
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] UnauthorizedErrorが未定義で失敗する、または認可チェックが未実装で失敗する

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-5-implementation.md`
