# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装                        |
| 前提Phase  | Phase 4                     |
| 後続Phase  | Phase 6                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

TDDサイクルのGreenフェーズとして、Phase 4で作成したテストを通すための最小限の実装を行う。UnauthorizedErrorクラスと認可チェックロジックを実装する。

## 背景

Red状態のテストをGreen状態にするため、設計書に基づいてUnauthorizedErrorクラスと各メソッドへの認可チェックを実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: UnauthorizedErrorクラスの実装

**目的**: 認可失敗時の専用エラークラスを実装する

**実行手順**:

1. エラーファイルを作成する:
   - `packages/shared/src/features/chat-history/errors.ts`

2. 以下のコードを実装する:

   ```typescript
   /**
    * 認可失敗時にスローされるエラー
    * OWASP A01対策として、情報漏洩を防ぐエラーメッセージを使用
    */
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

   /**
    * UnauthorizedError型ガード
    */
   export function isUnauthorizedError(
     error: unknown,
   ): error is UnauthorizedError {
     return error instanceof UnauthorizedError;
   }
   ```

3. エラークラスをエクスポートする（index.tsがあれば更新）

**期待される成果物**:

- `packages/shared/src/features/chat-history/errors.ts`

---

### タスク2: 部分Green状態の確認

**目的**: UnauthorizedError関連のテストが通ることを確認する

**実行手順**:

1. テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run authorization
   ```

2. 以下を確認する:
   - isUnauthorizedErrorのテストが成功する
   - 認可チェック未実装のため、認可テストは引き続き失敗

**期待される成果物**:

- 部分Green状態の確認結果

---

### タスク3: verifySessionOwnershipヘルパーの実装

**目的**: 再利用可能な認可チェック関数を実装する

**実行手順**:

1. `chat-history-service.ts` にプライベートメソッドを追加する:

   ```typescript
   import { UnauthorizedError } from './errors';

   /**
    * セッションの所有者を検証する
    * @throws {UnauthorizedError} リクエストユーザーが所有者でない場合
    */
   private async verifySessionOwnership(
     sessionId: string,
     requestUserId: string
   ): Promise<ChatSession> {
     const session = await this.sessionRepository.findById(sessionId);

     if (!session) {
       // セッションが存在しない場合も同じエラーを返す（情報漏洩防止）
       throw new UnauthorizedError(
         'Access denied: You do not have permission to access this resource',
         'session',
         sessionId
       );
     }

     if (session.userId !== requestUserId) {
       throw new UnauthorizedError(
         'Access denied: You do not have permission to access this resource',
         'session',
         sessionId
       );
     }

     return session;
   }
   ```

**期待される成果物**:

- verifySessionOwnershipメソッドの実装

---

### タスク4: getSessionへの認可チェック追加

**目的**: getSessionメソッドに認可チェックを追加する

**実行手順**:

1. メソッドシグネチャを変更する:

   ```typescript
   // 変更前
   async getSession(id: string): Promise<ChatSession | null>

   // 変更後
   async getSession(id: string, requestUserId: string): Promise<ChatSession | null>
   ```

2. 認可チェックを追加する:

   ```typescript
   async getSession(id: string, requestUserId: string): Promise<ChatSession | null> {
     const session = await this.verifySessionOwnership(id, requestUserId);
     // 既存のメッセージ取得ロジック
     const messages = await this.messageRepository.findBySessionId(id);
     return { ...session, messages };
   }
   ```

3. テストを実行して確認する

**期待される成果物**:

- getSessionメソッドへの認可チェック追加

---

### タスク5: deleteSessionへの認可チェック追加

**目的**: deleteSessionメソッドに認可チェックを追加する

**実行手順**:

1. メソッドシグネチャを変更する:

   ```typescript
   // 変更前
   async deleteSession(id: string): Promise<boolean>

   // 変更後
   async deleteSession(id: string, requestUserId: string): Promise<boolean>
   ```

2. 認可チェックを追加する:

   ```typescript
   async deleteSession(id: string, requestUserId: string): Promise<boolean> {
     await this.verifySessionOwnership(id, requestUserId);
     // 既存の削除ロジック
     const messages = await this.messageRepository.findBySessionId(id);
     for (const message of messages) {
       await this.messageRepository.delete(message.id);
     }
     await this.sessionRepository.delete(id);
     return true;
   }
   ```

**期待される成果物**:

- deleteSessionメソッドへの認可チェック追加

---

### タスク6: エクスポートメソッドへの認可チェック追加

**目的**: exportToMarkdown, exportToJsonに認可チェックを追加する

**実行手順**:

1. 各メソッドのシグネチャを変更し、認可チェックを追加する:

   ```typescript
   async exportToMarkdown(
     sessionId: string,
     requestUserId: string,
     options?: ExportOptions
   ): Promise<string> {
     const session = await this.verifySessionOwnership(sessionId, requestUserId);
     // 既存のエクスポートロジック
   }

   async exportToJson(
     sessionId: string,
     requestUserId: string,
     options?: ExportOptions
   ): Promise<string> {
     const session = await this.verifySessionOwnership(sessionId, requestUserId);
     // 既存のエクスポートロジック
   }
   ```

**期待される成果物**:

- エクスポートメソッドへの認可チェック追加

---

### タスク7: 呼び出し元の修正

**目的**: メソッドシグネチャ変更に伴う呼び出し元を修正する

**実行手順**:

1. 以下のファイルを修正する（該当する場合）:
   - IPCハンドラー（Desktop）: `apps/desktop/src/main/ipc/chatHistoryHandlers.ts`
   - APIルート（Web）: 該当ファイル
   - 既存のテストファイル

2. 各呼び出し箇所にrequestUserIdパラメータを追加する

3. 修正後にビルドエラーがないことを確認する

**期待される成果物**:

- 呼び出し元の修正完了

---

### タスク8: TDD Green状態の確認

**目的**: すべてのテストが成功することを確認する

**実行手順**:

1. テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run authorization
   ```

2. 以下を確認する:
   - すべての認可テストが成功（Green状態）
   - 既存のテストも成功（リグレッションなし）

3. 全テストを実行して確認する:

   ```bash
   pnpm --filter @repo/shared test:run chat-history
   ```

**期待される成果物**:

- TDD Green状態の確認結果

---

## 参照資料

| 参照資料       | パス                                                                        | 内容             |
| -------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 2 設計書 | `outputs/phase-2/design-authorization.md`                                   | 認可ロジック設計 |
| Phase 4 テスト | `packages/shared/src/features/chat-history/__tests__/authorization.test.ts` | テスト仕様       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容                 |
| ---------------- | ------------------------------------------------------------------------------ | -------------------- |
| チャット履歴仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 実装対象メソッド仕様 |
| エラー仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラークラス設計指針 |

---

## 成果物

| 成果物       | パス                                                                | 内容              |
| ------------ | ------------------------------------------------------------------- | ----------------- |
| エラークラス | `packages/shared/src/features/chat-history/errors.ts`               | UnauthorizedError |
| 認可ロジック | `packages/shared/src/features/chat-history/chat-history-service.ts` | 認可チェック実装  |

---

## 統合テスト連携

**Phase 5での統合テスト連携アクション**:

- 認可チェック実装とエラーハンドリング
- IPC/API層での呼び出し元修正
- 統合テストで認可エラーレスポンスを検証可能に

---

## 完了条件

- [ ] UnauthorizedErrorクラスが実装されている
- [ ] isUnauthorizedError型ガードが実装されている
- [ ] verifySessionOwnershipヘルパーが実装されている
- [ ] getSessionに認可チェックが追加されている
- [ ] deleteSessionに認可チェックが追加されている
- [ ] エクスポートメソッドに認可チェックが追加されている
- [ ] 呼び出し元が修正されている
- [ ] すべてのテストがGreen状態である
- [ ] 既存テストにリグレッションがない

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証（Phase 5）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run authorization

# 全chat-historyテスト実行
pnpm --filter @repo/shared test:run chat-history
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）
- [ ] 認可失敗テストが成功する
- [ ] 正常系テストも継続成功する

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-6-test-expansion.md`
