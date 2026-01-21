# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 6                           |
| Phase名    | テスト拡充                  |
| 前提Phase  | Phase 5                     |
| 後続Phase  | Phase 7                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

認可チェックのカバレッジを向上させるため、境界値・異常系・エッジケースのテストを追加する。カバレッジ目標達成に向けたテスト拡充を行う。

## 背景

Phase 5で基本的な認可チェックを実装したが、以下のケースをカバーするテストを追加する必要がある：

- 境界値テスト
- エッジケース（null, undefined, 空文字列など）
- エラーメッセージの検証
- 統合テストシナリオ

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 境界値テストの追加

**目的**: 認可チェックの境界値をテストする

**実行手順**:

1. 以下のテストケースを追加する:

   ```typescript
   describe("Boundary Value Tests", () => {
     it("空文字列のuserIdでアクセスした場合、UnauthorizedErrorを投げる", async () => {
       const sessionId = "session-123";
       const mockSession = { id: sessionId, userId: "user-123" };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       await expect(service.getSession(sessionId, "")).rejects.toThrow(
         UnauthorizedError,
       );
     });

     it("空白のみのuserIdでアクセスした場合、UnauthorizedErrorを投げる", async () => {
       const sessionId = "session-123";
       const mockSession = { id: sessionId, userId: "user-123" };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       await expect(service.getSession(sessionId, "   ")).rejects.toThrow(
         UnauthorizedError,
       );
     });

     it("空文字列のsessionIdでアクセスした場合、UnauthorizedErrorを投げる", async () => {
       mockSessionRepository.findById.mockResolvedValue(null);

       await expect(service.getSession("", "user-123")).rejects.toThrow(
         UnauthorizedError,
       );
     });
   });
   ```

**期待される成果物**:

- 境界値テストケース

---

### タスク2: エラーメッセージ検証テストの追加

**目的**: エラーメッセージが情報漏洩しないことを検証する

**実行手順**:

1. 以下のテストケースを追加する:

   ```typescript
   describe("Error Message Security", () => {
     it("存在しないセッションと認可失敗で同じエラーメッセージを返す", async () => {
       const requesterId = "user-456";

       // 存在しないセッション
       mockSessionRepository.findById.mockResolvedValue(null);
       let error1: UnauthorizedError | null = null;
       try {
         await service.getSession("non-existent", requesterId);
       } catch (e) {
         error1 = e as UnauthorizedError;
       }

       // 認可失敗（他人のセッション）
       const mockSession = { id: "session-123", userId: "user-123" };
       mockSessionRepository.findById.mockResolvedValue(mockSession);
       let error2: UnauthorizedError | null = null;
       try {
         await service.getSession("session-123", requesterId);
       } catch (e) {
         error2 = e as UnauthorizedError;
       }

       // 同じエラーメッセージであること
       expect(error1?.message).toBe(error2?.message);
       expect(error1?.message).not.toContain("not found");
       expect(error1?.message).not.toContain("does not exist");
     });

     it("エラーメッセージにuserIdが含まれない", async () => {
       const sessionId = "session-123";
       const ownerId = "user-123";
       const requesterId = "user-456";
       const mockSession = { id: sessionId, userId: ownerId };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       try {
         await service.getSession(sessionId, requesterId);
       } catch (e) {
         const error = e as UnauthorizedError;
         expect(error.message).not.toContain(ownerId);
         expect(error.message).not.toContain(requesterId);
       }
     });
   });
   ```

**期待される成果物**:

- エラーメッセージセキュリティテストケース

---

### タスク3: UnauthorizedErrorプロパティテストの追加

**目的**: エラークラスのプロパティが正しいことを検証する

**実行手順**:

1. 以下のテストケースを追加する:

   ```typescript
   describe("UnauthorizedError Properties", () => {
     it("正しいプロパティを持つ", () => {
       const error = new UnauthorizedError(
         "test message",
         "session",
         "session-123",
       );

       expect(error.name).toBe("UnauthorizedError");
       expect(error.code).toBe("UNAUTHORIZED");
       expect(error.statusCode).toBe(403);
       expect(error.message).toBe("test message");
       expect(error.resourceType).toBe("session");
       expect(error.resourceId).toBe("session-123");
     });

     it("デフォルトメッセージを使用する", () => {
       const error = new UnauthorizedError();

       expect(error.message).toBe(
         "Access denied: You do not have permission to access this resource",
       );
     });

     it("Errorを継承している", () => {
       const error = new UnauthorizedError();

       expect(error instanceof Error).toBe(true);
       expect(error instanceof UnauthorizedError).toBe(true);
     });

     it("スタックトレースを持つ", () => {
       const error = new UnauthorizedError();

       expect(error.stack).toBeDefined();
       expect(error.stack).toContain("UnauthorizedError");
     });
   });
   ```

**期待される成果物**:

- UnauthorizedErrorプロパティテストケース

---

### タスク4: updateSessionの認可テスト追加

**目的**: updateSessionメソッド（存在する場合）の認可テストを追加する

**実行手順**:

1. updateSessionメソッドが存在するか確認する
2. 存在する場合、以下のテストケースを追加する:

   ```typescript
   describe("updateSession", () => {
     it("所有者がセッションを更新した場合、正常に更新される", async () => {
       const ownerId = "user-123";
       const sessionId = "session-456";
       const mockSession = {
         id: sessionId,
         userId: ownerId,
         title: "Old Title",
       };
       mockSessionRepository.findById.mockResolvedValue(mockSession);
       mockSessionRepository.update.mockResolvedValue({
         ...mockSession,
         title: "New Title",
       });

       const result = await service.updateSession(sessionId, ownerId, {
         title: "New Title",
       });

       expect(result.title).toBe("New Title");
     });

     it("非所有者がセッションを更新しようとした場合、UnauthorizedErrorを投げる", async () => {
       const ownerId = "user-123";
       const requesterId = "user-456";
       const sessionId = "session-789";
       const mockSession = { id: sessionId, userId: ownerId };
       mockSessionRepository.findById.mockResolvedValue(mockSession);

       await expect(
         service.updateSession(sessionId, requesterId, { title: "New Title" }),
       ).rejects.toThrow(UnauthorizedError);
       expect(mockSessionRepository.update).not.toHaveBeenCalled();
     });
   });
   ```

**期待される成果物**:

- updateSessionの認可テストケース（該当する場合）

---

### タスク5: 統合テストシナリオの追加

**目的**: 複数操作を含む統合テストシナリオを追加する

**実行手順**:

1. 以下のテストケースを追加する:

   ```typescript
   describe("Integration Scenarios", () => {
     it("セッション作成者のみが操作できるシナリオ", async () => {
       const ownerId = "user-123";
       const otherUserId = "user-456";
       const sessionId = "session-789";
       const mockSession = {
         id: sessionId,
         userId: ownerId,
         title: "My Session",
       };

       // セットアップ
       mockSessionRepository.findById.mockResolvedValue(mockSession);
       mockMessageRepository.findBySessionId.mockResolvedValue([]);

       // 所有者は操作可能
       await expect(
         service.getSession(sessionId, ownerId),
       ).resolves.toBeDefined();
       await expect(
         service.exportToMarkdown(sessionId, ownerId),
       ).resolves.toBeDefined();

       // 他ユーザーは操作不可
       await expect(service.getSession(sessionId, otherUserId)).rejects.toThrow(
         UnauthorizedError,
       );
       await expect(
         service.deleteSession(sessionId, otherUserId),
       ).rejects.toThrow(UnauthorizedError);
       await expect(
         service.exportToMarkdown(sessionId, otherUserId),
       ).rejects.toThrow(UnauthorizedError);
     });
   });
   ```

**期待される成果物**:

- 統合テストシナリオ

---

### タスク6: テスト実行とカバレッジ確認

**目的**: 追加したテストを実行し、カバレッジを確認する

**実行手順**:

1. テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run authorization
   ```

2. カバレッジを確認する:

   ```bash
   pnpm --filter @repo/shared test:run authorization --coverage
   ```

3. 以下の目標を確認する:
   - Line Coverage: 80%以上（推奨90%）
   - Branch Coverage: 60%以上（推奨70%）
   - Function Coverage: 80%以上（推奨90%）

**期待される成果物**:

- テスト実行結果
- カバレッジレポート

---

## 参照資料

| 参照資料       | パス                                                                        | 内容       |
| -------------- | --------------------------------------------------------------------------- | ---------- |
| Phase 4 テスト | `packages/shared/src/features/chat-history/__tests__/authorization.test.ts` | 既存テスト |
| Phase 5 実装   | `packages/shared/src/features/chat-history/chat-history-service.ts`         | 実装対象   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容           |
| ---------------- | ------------------------------------------------------------------------------ | -------------- |
| チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | テスト対象仕様 |

---

## 成果物

| 成果物             | パス                                                                        | 内容                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| 拡充テスト         | `packages/shared/src/features/chat-history/__tests__/authorization.test.ts` | 境界値・異常系テスト |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                        | カバレッジ状況       |

---

## 統合テスト連携

**Phase 6での統合テスト連携アクション**:

- 境界値・エッジケースのテスト拡充
- エラーメッセージセキュリティテスト
- 統合テストシナリオの追加

---

## 完了条件

- [ ] 境界値テストが追加されている
- [ ] エラーメッセージセキュリティテストが追加されている
- [ ] UnauthorizedErrorプロパティテストが追加されている
- [ ] updateSessionの認可テストが追加されている（該当する場合）
- [ ] 統合テストシナリオが追加されている
- [ ] すべてのテストが成功している
- [ ] カバレッジ目標を達成している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-7-coverage-check.md`
