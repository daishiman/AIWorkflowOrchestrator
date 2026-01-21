# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 前提Phase  | Phase 1                     |
| 後続Phase  | Phase 3                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

認可失敗時のエラークラスと、各メソッドへの認可チェック追加方法を設計し、既存のメソッドシグネチャとの互換性を考慮した実装方針を決定する。

## 背景

既存のチャット履歴サービスは単一ユーザー環境を前提として設計されており、メソッドシグネチャにuserIdを受け取る設計になっていない。将来のマルチユーザー対応を見据えつつ、現在の呼び出し元への影響を最小限に抑える設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: UnauthorizedErrorクラスの詳細設計

**目的**: 認可失敗時の専用エラークラスを設計する

**実行手順**:

1. エラークラスの詳細設計を行う：

   ```typescript
   // packages/shared/src/features/chat-history/errors.ts

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
   ```

2. 型ガード関数を設計する：

   ```typescript
   export function isUnauthorizedError(
     error: unknown,
   ): error is UnauthorizedError {
     return error instanceof UnauthorizedError;
   }
   ```

3. エラーのエクスポート設計を確認する

**期待される成果物**:

- UnauthorizedErrorクラスの詳細設計書

---

### タスク2: 認可チェック関数の設計

**目的**: 再利用可能な認可チェックロジックを設計する

**実行手順**:

1. プライベートヘルパー関数を設計する：

   ```typescript
   // ChatHistoryServiceクラス内のプライベートメソッド

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

2. 設計原則を文書化する：
   - Fail-Secure: 検証失敗時は必ずエラーを投げる
   - 一貫したエラーメッセージ: セッションの存在有無を推測させない
   - ログ出力: 開発者向けに詳細情報をログ出力（本番では適切なレベル設定）

**期待される成果物**:

- 認可チェック関数の設計書

---

### タスク3: メソッドシグネチャ変更の設計

**目的**: 各メソッドへの認可チェック追加方法を設計する

**実行手順**:

1. 変更後のメソッドシグネチャを設計する：

   ```typescript
   // 変更前
   async getSession(id: string): Promise<ChatSession | null>

   // 変更後
   async getSession(id: string, requestUserId: string): Promise<ChatSession | null>
   ```

2. 全対象メソッドのシグネチャ変更を設計する：

   | メソッド名       | 変更前シグネチャ                        | 変更後シグネチャ                                               |
   | ---------------- | --------------------------------------- | -------------------------------------------------------------- |
   | getSession       | `(id: string)`                          | `(id: string, requestUserId: string)`                          |
   | deleteSession    | `(id: string)`                          | `(id: string, requestUserId: string)`                          |
   | updateSession    | `(id: string, data: UpdateChatSession)` | `(id: string, requestUserId: string, data: UpdateChatSession)` |
   | exportToMarkdown | `(sessionId: string, options?)`         | `(sessionId: string, requestUserId: string, options?)`         |
   | exportToJson     | `(sessionId: string, options?)`         | `(sessionId: string, requestUserId: string, options?)`         |

3. 呼び出し元の修正箇所を特定する：
   - IPCハンドラー（Desktop）
   - APIルート（Web）
   - テストファイル

**期待される成果物**:

- メソッドシグネチャ変更一覧
- 呼び出し元修正箇所一覧

---

### タスク4: エラーハンドリングフローの設計

**目的**: 認可エラー発生時のエラー伝播とユーザーへの表示方法を設計する

**実行手順**:

1. エラー伝播フローを設計する：

   ```
   Service層
   └── UnauthorizedError発生
       ↓
   IPC/API層
   └── エラーをキャッチ
   └── ログ出力（詳細情報）
   └── エラーレスポンス生成（最小限の情報）
       ↓
   Renderer/Client層
   └── エラーメッセージ表示
   └── 「アクセス権限がありません」
   ```

2. IPC/API層でのエラーハンドリング設計：

   ```typescript
   // IPCハンドラーでのエラーハンドリング例
   try {
     const result = await chatHistoryService.getSession(sessionId, userId);
     return { success: true, data: result };
   } catch (error) {
     if (isUnauthorizedError(error)) {
       console.warn(`Unauthorized access attempt: sessionId=${sessionId}`);
       return {
         success: false,
         error: { code: "UNAUTHORIZED", message: error.message },
       };
     }
     throw error;
   }
   ```

**期待される成果物**:

- エラーハンドリングフロー図
- IPC/API層のエラーハンドリング設計

---

### タスク5: 設計書の作成

**目的**: 上記の設計をまとめた設計書を作成する

**実行手順**:

1. `outputs/phase-2/` ディレクトリを作成する
2. 以下の内容を含む設計書を作成する：
   - UnauthorizedErrorクラス設計
   - 認可チェック関数設計
   - メソッドシグネチャ変更一覧
   - エラーハンドリングフロー
   - 呼び出し元修正箇所一覧
3. 設計書をレビュー可能な形式で保存する

**期待される成果物**:

- `outputs/phase-2/design-authorization.md`

---

## 参照資料

| 参照資料               | パス                                                                           | 内容                     |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 要件書         | `outputs/phase-1/requirements-authorization.md`                                | 認可機能要件             |
| チャット履歴仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | サービスインターフェース |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラー設計指針           |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                              | 内容                    |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| チャット履歴仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`    | IChatHistoryService仕様 |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`      | Repository Pattern等    |
| 認証・セキュリティ     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | IPC認証パターン         |

---

## 成果物

| 成果物 | パス                                      | 内容                                           |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| 設計書 | `outputs/phase-2/design-authorization.md` | エラークラス・認可ロジック・シグネチャ変更設計 |

---

## 統合テスト連携

**Phase 2での統合テスト連携アクション**:

- 認可チェックポイントを設計に反映
- エラーレスポンス形式を統一
- IPC/API層でのエラーハンドリング設計を統合テスト観点で検証可能に

---

## 完了条件

- [ ] UnauthorizedErrorクラスの詳細設計が完了している
- [ ] 認可チェック関数の設計が完了している
- [ ] 全対象メソッドのシグネチャ変更設計が完了している
- [ ] エラーハンドリングフローが設計されている
- [ ] 呼び出し元修正箇所が特定されている
- [ ] 設計書が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-3-design-review.md`
