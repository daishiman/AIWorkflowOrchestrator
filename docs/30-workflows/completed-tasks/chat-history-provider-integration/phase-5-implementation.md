# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装                              |
| 前提Phase  | Phase 4                           |
| 後続Phase  | Phase 6                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | chat-history-provider-integration |

---

## 目的

TDD（テスト駆動開発）のGreen段階として、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

Phase 4で作成したテストが失敗している状態（Red）から、テストを通す実装（Green）を行う。実装は最小限にとどめ、リファクタリングはPhase 8で行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: リポジトリファクトリー実装

**目的**: DrizzleリポジトリをProviderに注入するためのファクトリーを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/features/chat-history/repositories/index.ts`
2. 以下を実装する:

   ```typescript
   // apps/desktop/src/features/chat-history/repositories/index.ts
   import {
     DrizzleChatSessionRepository,
     DrizzleChatMessageRepository,
   } from "@repo/shared";
   // import { db } from "@/lib/db"; // DB接続

   // シングルトンインスタンス
   let sessionRepository: DrizzleChatSessionRepository | null = null;
   let messageRepository: DrizzleChatMessageRepository | null = null;

   export function getSessionRepository(): DrizzleChatSessionRepository {
     if (!sessionRepository) {
       // sessionRepository = new DrizzleChatSessionRepository(db);
       throw new Error(
         "Repository not yet initialized. DB connection required.",
       );
     }
     return sessionRepository;
   }

   export function getMessageRepository(): DrizzleChatMessageRepository {
     if (!messageRepository) {
       // messageRepository = new DrizzleChatMessageRepository(db);
       throw new Error(
         "Repository not yet initialized. DB connection required.",
       );
     }
     return messageRepository;
   }

   // 初期化関数（App.tsxで呼び出し）
   export function initializeRepositories(db: unknown): void {
     sessionRepository = new DrizzleChatSessionRepository(db);
     messageRepository = new DrizzleChatMessageRepository(db);
   }
   ```

3. テストを実行し、リポジトリファクトリーテストが通ることを確認する
4. 実装結果を記録する

**期待される成果物**:

- `apps/desktop/src/features/chat-history/repositories/index.ts`

---

### タスク2: App.tsx Provider統合実装

**目的**: ChatHistoryProviderをApp.tsxに統合する

**実行手順**:

1. `apps/desktop/src/renderer/App.tsx` を更新する:

   ```tsx
   import { ChatHistoryProvider } from "@/features/chat-history/context";
   import {
     getSessionRepository,
     getMessageRepository,
   } from "@/features/chat-history/repositories";

   function App(): JSX.Element {
     // ... 既存のコード ...

     return (
       <BrowserRouter>
         <ChatHistoryProvider
           sessionRepository={getSessionRepository()}
           messageRepository={getMessageRepository()}
         >
           <AuthGuard>
             <Routes>{/* 既存のルート */}</Routes>
           </AuthGuard>
         </ChatHistoryProvider>
       </BrowserRouter>
     );
   }
   ```

2. テストを実行し、App.tsx統合テストが通ることを確認する
3. 実装結果を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/App.tsx`（更新）

---

### タスク3: 初期化処理実装

**目的**: Provider初期化処理を実装する

**実行手順**:

1. ChatHistoryProviderの初期化ロジックを確認する
2. 必要に応じて初期化処理を追加する:
   - DB接続確認
   - isReadyフラグの正しい遷移
3. テストを実行し、初期化関連テストが通ることを確認する
4. 実装結果を記録する

**期待される成果物**:

- 初期化処理の実装（必要な場合）

---

### タスク4: エクスポート設定

**目的**: 新規ファイルのエクスポート設定を行う

**実行手順**:

1. リポジトリファクトリーのエクスポートを設定する
2. 必要に応じてパスエイリアスを確認する
3. インポートが正しく解決されることを確認する
4. 実装結果を記録する

**期待される成果物**:

- エクスポート設定の完了

---

### タスク5: 実装完了確認

**目的**: Phase 4で作成した全てのテストが通ることを確認する

**実行手順**:

1. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run
   ```
2. Phase 4で作成したテストが全てGreen（成功）であることを確認する
3. 実装サマリーを `outputs/phase-5/implementation-summary.md` に出力する

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

## 参照資料

| 参照資料          | パス                                                                     | 内容                    |
| ----------------- | ------------------------------------------------------------------------ | ----------------------- |
| 設計書            | `outputs/phase-2/`                                                       | Phase 2設計成果物       |
| テスト            | `apps/desktop/src/features/chat-history/__tests__/`                      | Phase 4で作成したテスト |
| 既存Provider      | `apps/desktop/src/features/chat-history/context/ChatHistoryProvider.tsx` | 既存Provider実装        |
| Drizzleリポジトリ | `packages/shared/src/features/chat-history/infrastructure/persistence/`  | Drizzleリポジトリ実装   |

---

## 成果物

| 成果物                 | パス                                                           | 内容             |
| ---------------------- | -------------------------------------------------------------- | ---------------- |
| リポジトリファクトリー | `apps/desktop/src/features/chat-history/repositories/index.ts` | ファクトリー実装 |
| App.tsx                | `apps/desktop/src/renderer/App.tsx`                            | Provider統合     |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                    | 実装完了サマリー |

---

## 統合テスト連携（Phase 1〜11は必須）

App.tsx統合・Repository注入の実装:

- Provider統合の実装完了
- Repository注入の実装完了
- 統合テストがGreen状態であることを確認

---

## 完了条件

- [ ] リポジトリファクトリーが実装されている
- [ ] App.tsxにChatHistoryProviderが統合されている
- [ ] 初期化処理が正しく動作する
- [ ] Phase 4で作成した全テストがGreen（成功）である
- [ ] 実装サマリーが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-history-provider-integration/phase-6-test-expansion.md`
