# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成（TDD Red）         |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-22                    |
| 機能名     | React Context DI実装          |

---

## 目的

TDDのRed（失敗するテスト作成）フェーズとして、実装前に失敗するテストを作成する。

## 背景

テスト駆動開発（TDD）では、実装前にテストを書くことで、明確な要件に基づいた実装が可能になる。本Phaseでは、Context/Provider/Hookの期待動作を検証するテストを先に作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストディレクトリ・ファイル準備

**目的**: テストファイルの配置先ディレクトリとファイルを準備する。

**実行手順**:

1. テストディレクトリを作成:

   ```bash
   mkdir -p apps/desktop/src/features/chat-history/context/__tests__
   mkdir -p apps/desktop/src/features/chat-history/context/__mocks__
   mkdir -p apps/desktop/src/features/chat-history/hooks/__tests__
   ```

2. テストファイルを作成（空ファイル）:
   - `apps/desktop/src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx`
   - `apps/desktop/src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`

3. テストユーティリティのセットアップを確認:
   - `@testing-library/react` がインストールされているか確認
   - `vitest` がインストールされているか確認

**期待される成果物**:

- テストディレクトリ構造
- テストファイル（空）

---

### タスク2: Context型テスト作成

**目的**: ChatHistoryContextの型定義が正しいことを検証するテストを作成する。

**実行手順**:

1. `ChatHistoryContext.test.tsx` に以下のテストを作成:

   ```typescript
   import { describe, it, expect } from "vitest";
   // 実装前なのでimportはコメントアウト
   // import { ChatHistoryContext, ChatHistoryContextValue } from '../ChatHistoryContext';

   describe("ChatHistoryContext", () => {
     describe("Context Definition", () => {
       it("should be defined", () => {
         // TODO: 実装後に有効化
         // expect(ChatHistoryContext).toBeDefined();
         expect(true).toBe(false); // Red状態
       });

       it("should have null as default value", () => {
         // TODO: 実装後に有効化
         expect(true).toBe(false); // Red状態
       });
     });

     describe("ChatHistoryContextValue Type", () => {
       it("should include all required Use Cases", () => {
         // Type check: createSession, addUserMessage, addAssistantMessage, togglePinned, searchSessions
         expect(true).toBe(false); // Red状態
       });

       it("should include isReady state", () => {
         expect(true).toBe(false); // Red状態
       });
     });
   });
   ```

2. テストを実行して全て失敗することを確認:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx
   ```

**期待される成果物**:

- `ChatHistoryContext.test.tsx`（Red状態）

---

### タスク3: Providerテスト作成

**目的**: ChatHistoryProviderの動作を検証するテストを作成する。

**実行手順**:

1. `ChatHistoryContext.test.tsx` にProviderテストを追加:

   ```typescript
   describe("ChatHistoryProvider", () => {
     describe("Use Cases Provision", () => {
       it("should provide createSession use case", async () => {
         // TODO: renderHook with ChatHistoryProvider
         expect(true).toBe(false); // Red状態
       });

       it("should provide addUserMessage use case", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should provide addAssistantMessage use case", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should provide togglePinned use case", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should provide searchSessions use case", async () => {
         expect(true).toBe(false); // Red状態
       });
     });

     describe("Initialization", () => {
       it("should set isReady to true after initialization", async () => {
         expect(true).toBe(false); // Red状態
       });
     });

     describe("Custom Repository Injection", () => {
       it("should accept custom session repository", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should accept custom message repository", async () => {
         expect(true).toBe(false); // Red状態
       });
     });
   });
   ```

**期待される成果物**:

- Providerテスト追加済み `ChatHistoryContext.test.tsx`

---

### タスク4: Hookテスト作成

**目的**: useChatHistory hookの動作を検証するテストを作成する。

**実行手順**:

1. `useChatHistory.test.ts` に以下のテストを作成:

   ```typescript
   import { describe, it, expect } from "vitest";
   import { renderHook } from "@testing-library/react";
   // 実装前なのでimportはコメントアウト
   // import { useChatHistory } from '../useChatHistory';
   // import { ChatHistoryProvider } from '../../context/ChatHistoryProvider';

   describe("useChatHistory", () => {
     describe("Within Provider", () => {
       it("should return context value when used within Provider", () => {
         // TODO: 実装後に有効化
         expect(true).toBe(false); // Red状態
       });

       it("should return all Use Cases", () => {
         expect(true).toBe(false); // Red状態
       });

       it("should return isReady state", () => {
         expect(true).toBe(false); // Red状態
       });
     });

     describe("Outside Provider", () => {
       it("should throw error when used outside Provider", () => {
         // TODO: 実装後に有効化
         // expect(() => renderHook(() => useChatHistory())).toThrow();
         expect(true).toBe(false); // Red状態
       });

       it("should throw error with descriptive message", () => {
         expect(true).toBe(false); // Red状態
       });
     });
   });
   ```

**期待される成果物**:

- `useChatHistory.test.ts`（Red状態）

---

### タスク5: MockProviderテスト作成

**目的**: MockChatHistoryProviderの動作を検証するテストを作成する。

**実行手順**:

1. `ChatHistoryContext.test.tsx` にMockProviderテストを追加:

   ```typescript
   describe("MockChatHistoryProvider", () => {
     describe("Default Mocks", () => {
       it("should provide mocked createSession", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should provide mocked use cases that return success", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should set isReady to true by default", async () => {
         expect(true).toBe(false); // Red状態
       });
     });

     describe("Overrides", () => {
       it("should allow partial overrides of context value", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should allow overriding isReady state", async () => {
         expect(true).toBe(false); // Red状態
       });

       it("should allow overriding individual Use Cases", async () => {
         expect(true).toBe(false); // Red状態
       });
     });
   });
   ```

**期待される成果物**:

- MockProviderテスト追加済み `ChatHistoryContext.test.tsx`

---

### タスク6: テスト実行確認（Red状態）

**目的**: 全テストが失敗する（Red状態）ことを確認する。

**実行手順**:

1. 全テストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
   ```

2. 全テストが失敗することを確認
3. テスト結果を `outputs/phase-4/test-red-result.md` に記録

**期待される成果物**:

- `outputs/phase-4/test-red-result.md`（全テスト失敗の証跡）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                           | 内容                  |
| -------------------- | ------------------------------------------------------------------------------ | --------------------- |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 型定義・Repository IF |

### 前Phase成果物

| 参照資料         | パス                                 | 内容             |
| ---------------- | ------------------------------------ | ---------------- |
| 設計ドキュメント | `outputs/phase-2/design-document.md` | 詳細設計         |
| レビュー結果     | `outputs/phase-3/review-verdict.md`  | 設計レビュー結果 |

---

## 成果物

| 成果物        | パス                                                                                   | 内容                        |
| ------------- | -------------------------------------------------------------------------------------- | --------------------------- |
| Contextテスト | `apps/desktop/src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx` | Context/Provider/Mockテスト |
| Hookテスト    | `apps/desktop/src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`        | Hook動作テスト              |
| Red状態結果   | `outputs/phase-4/test-red-result.md`                                                   | テスト失敗証跡              |

---

## 統合テスト連携（Phase 4は必須）

Provider内Use Cases呼び出しテストを作成する:

- Provider経由で`createSession.execute()`が呼び出せるテスト
- Provider経由で`addUserMessage.execute()`が呼び出せるテスト
- Provider経由で`addAssistantMessage.execute()`が呼び出せるテスト
- Provider経由で`togglePinned.execute()`が呼び出せるテスト
- Provider経由で`searchSessions.execute()`が呼び出せるテスト

---

## 完了条件

- [ ] タスク1: テストディレクトリ・ファイル準備完了
- [ ] タスク2: Context型テスト作成完了
- [ ] タスク3: Providerテスト作成完了
- [ ] タスク4: Hookテスト作成完了
- [ ] タスク5: MockProviderテスト作成完了
- [ ] タスク6: テスト実行確認（全テスト失敗）完了
- [ ] 全成果物が出力されている

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
pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-5-implementation.md`
