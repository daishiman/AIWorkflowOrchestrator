# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-22                |
| 機能名     | React Context DI実装      |

---

## 目的

カバレッジ目標達成に向けた追加テストを作成し、テストの網羅性を向上させる。

## 背景

Phase 4〜5で基本的なテストと実装が完了した。本Phaseでは、エッジケース、異常系、統合テストを追加し、品質を向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加

**目的**: 境界値・エッジケースのテストを追加する。

**実行手順**:

1. `ChatHistoryContext.test.tsx` にエッジケーステストを追加:

   ```typescript
   describe("Edge Cases", () => {
     describe("Provider nesting", () => {
       it("should use innermost Provider value when nested", () => {
         // ネストされたProviderのテスト
       });
     });

     describe("Provider unmount", () => {
       it("should cleanup properly when Provider unmounts", () => {
         // アンマウント時のクリーンアップテスト
       });
     });

     describe("Repository null handling", () => {
       it("should throw error when repository is not provided", () => {
         // Repository未指定時のエラーテスト
       });
     });
   });
   ```

2. テストを実行して成功することを確認

**期待される成果物**:

- エッジケーステスト追加済み `ChatHistoryContext.test.tsx`

---

### タスク2: 異常系テスト追加

**目的**: エラーケース・異常系のテストを追加する。

**実行手順**:

1. `useChatHistory.test.ts` に異常系テストを追加:

   ```typescript
   describe("Error Handling", () => {
     describe("Provider not found", () => {
       it("should throw specific error message", () => {
         expect(() => renderHook(() => useChatHistory())).toThrow(
           "useChatHistory must be used within a ChatHistoryProvider",
         );
       });
     });

     describe("Use Case execution errors", () => {
       it("should propagate error from createSession", async () => {
         // Use Case実行エラーの伝播テスト
       });

       it("should propagate error from addUserMessage", async () => {
         // Use Case実行エラーの伝播テスト
       });
     });
   });
   ```

2. テストを実行して成功することを確認

**期待される成果物**:

- 異常系テスト追加済み `useChatHistory.test.ts`

---

### タスク3: 統合テスト追加

**目的**: Context/Provider/Hook間の統合テストを追加する。

**実行手順**:

1. 統合テストファイルを作成: `ChatHistoryIntegration.test.tsx`

   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   import { renderHook, act } from '@testing-library/react';
   import { ChatHistoryProvider } from '../context/ChatHistoryProvider';
   import { useChatHistory } from '../hooks/useChatHistory';

   describe('ChatHistory Integration Tests', () => {
     describe('Provider-Hook Integration', () => {
       it('should provide working Use Cases through hook', async () => {
         const mockSessionRepo = createMockSessionRepository();
         const mockMessageRepo = createMockMessageRepository();

         const { result } = renderHook(() => useChatHistory(), {
           wrapper: ({ children }) => (
             <ChatHistoryProvider
               sessionRepository={mockSessionRepo}
               messageRepository={mockMessageRepo}
             >
               {children}
             </ChatHistoryProvider>
           ),
         });

         // createSession呼び出しテスト
         await act(async () => {
           const response = await result.current.createSession.execute({
             userId: 'test-user',
             title: 'Test Session',
           });
           expect(response.isOk).toBe(true);
         });
       });
     });

     describe('Full workflow', () => {
       it('should complete a full chat session workflow', async () => {
         // セッション作成 → メッセージ追加 → 検索のフルワークフロー
       });
     });
   });
   ```

2. テストを実行して成功することを確認

**期待される成果物**:

- `apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`

---

### タスク4: MockProvider拡張テスト追加

**目的**: MockProviderの拡張機能テストを追加する。

**実行手順**:

1. `ChatHistoryContext.test.tsx` にMockProvider拡張テストを追加:

   ```typescript
   describe('MockChatHistoryProvider Extended', () => {
     describe('Custom mock responses', () => {
       it('should allow error response mocks', async () => {
         const errorMock = {
           createSession: {
             execute: vi.fn().mockResolvedValue({
               isOk: false,
               error: { code: 'TEST_ERROR', message: 'Test error' },
             }),
           },
         };

         const { result } = renderHook(() => useChatHistory(), {
           wrapper: ({ children }) => (
             <MockChatHistoryProvider overrides={errorMock}>
               {children}
             </MockChatHistoryProvider>
           ),
         });

         const response = await result.current.createSession.execute({
           userId: 'test',
         });
         expect(response.isOk).toBe(false);
       });
     });

     describe('Spy verification', () => {
       it('should track Use Case calls for verification', async () => {
         // vi.fn()のモックが呼び出し履歴を追跡することを確認
       });
     });
   });
   ```

2. テストを実行して成功することを確認

**期待される成果物**:

- MockProvider拡張テスト追加済み `ChatHistoryContext.test.tsx`

---

### タスク5: カバレッジ計測

**目的**: 現時点のテストカバレッジを計測する。

**実行手順**:

1. カバレッジ付きでテストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage apps/desktop/src/features/chat-history/
   ```

2. カバレッジレポートを確認
3. カバレッジ結果を `outputs/phase-6/coverage-report.md` に記録

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

---

### タスク6: 追加テスト検討

**目的**: カバレッジ不足の箇所を特定し、追加テストを検討する。

**実行手順**:

1. カバレッジレポートからカバレッジ不足箇所を特定
2. 追加が必要なテストを一覧化
3. 追加テストを実装
4. 追加テスト一覧を `outputs/phase-6/additional-tests.md` に記録

**期待される成果物**:

- `outputs/phase-6/additional-tests.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                           | 内容                  |
| -------------------- | ------------------------------------------------------------------------------ | --------------------- |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 型定義・Repository IF |

### 前Phase成果物

| 参照資料      | パス                                   | 内容           |
| ------------- | -------------------------------------- | -------------- |
| Green状態結果 | `outputs/phase-5/test-green-result.md` | テスト成功証跡 |

---

## 成果物

| 成果物             | パス                                                                               | 内容               |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------ |
| 統合テスト         | `apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx` | 統合テスト         |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                               | カバレッジ計測結果 |
| 追加テスト一覧     | `outputs/phase-6/additional-tests.md`                                              | 追加テスト記録     |

---

## 統合テスト連携（Phase 6は必須）

統合テストの拡充（エラーケース含む）:

- Use Case実行エラー時の伝播テスト
- Provider-Hook間のデータフローテスト
- フルワークフローテスト

---

## 完了条件

- [ ] タスク1: エッジケーステスト追加完了
- [ ] タスク2: 異常系テスト追加完了
- [ ] タスク3: 統合テスト追加完了
- [ ] タスク4: MockProvider拡張テスト追加完了
- [ ] タスク5: カバレッジ計測完了
- [ ] タスク6: 追加テスト検討・実装完了
- [ ] 全成果物が出力されている

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

`docs/30-workflows/react-context-di/phase-7-coverage-check.md`
