# 認可要件書（Authorization Requirements）

> Phase 1 成果物
> タスクID: SECURITY-001
> 作成日: 2026-01-18

---

## 1. 対象メソッド一覧

### 認可チェックが必要なメソッド

| メソッド名       | 現在のシグネチャ                                                                | 変更後のシグネチャ                                                                                     | 説明                 |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------- |
| getSession       | `getSession(id: string): Promise<ChatSession \| null>`                          | `getSession(id: string, requestUserId: string): Promise<ChatSession \| null>`                          | セッション取得       |
| deleteSession    | `deleteSession(id: string): Promise<boolean>`                                   | `deleteSession(id: string, requestUserId: string): Promise<boolean>`                                   | セッション削除       |
| updateSession    | `updateSession(id: string, data: UpdateChatSession): Promise<boolean>`          | `updateSession(id: string, requestUserId: string, data: UpdateChatSession): Promise<boolean>`          | セッション更新       |
| exportToMarkdown | `exportToMarkdown(sessionId: string, options?: ExportOptions): Promise<string>` | `exportToMarkdown(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>` | Markdownエクスポート |
| exportToJson     | `exportToJson(sessionId: string, options?: ExportOptions): Promise<string>`     | `exportToJson(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>`     | JSONエクスポート     |

### 影響範囲

| 呼び出し元              | ファイル                                                                           | 影響                                   |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| ユニットテスト          | `packages/shared/src/features/chat-history/__tests__/chat-history-service.test.ts` | テストコード修正が必要                 |
| 将来のIPC/APIハンドラー | 未実装                                                                             | 新規実装時に認可済みメソッドを使用可能 |

---

## 2. 機能要件

### FR-AUTH-001: セッション取得時の認可チェック

| 項目         | 内容                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件ID       | FR-AUTH-001                                                                                                                                 |
| 対象メソッド | `getSession(id: string, requestUserId: string)`                                                                                             |
| 入力         | `sessionId`, `requestUserId`                                                                                                                |
| 処理         | 1. セッションを取得<br>2. `session.userId === requestUserId` を検証                                                                         |
| 成功時       | セッションデータを返却                                                                                                                      |
| 失敗時       | `UnauthorizedError` をスロー                                                                                                                |
| 受け入れ基準 | - 所有者がアクセス: セッションデータ返却<br>- 非所有者がアクセス: UnauthorizedError<br>- 存在しないセッション: null（認可チェック前に判定） |

### FR-AUTH-002: セッション削除時の認可チェック

| 項目         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 要件ID       | FR-AUTH-002                                                                                            |
| 対象メソッド | `deleteSession(id: string, requestUserId: string)`                                                     |
| 入力         | `sessionId`, `requestUserId`                                                                           |
| 処理         | 1. セッションを取得<br>2. `session.userId === requestUserId` を検証<br>3. 削除処理実行                 |
| 成功時       | `true` を返却                                                                                          |
| 失敗時       | `UnauthorizedError` をスロー                                                                           |
| 受け入れ基準 | - 所有者が削除: 正常に削除完了<br>- 非所有者が削除: UnauthorizedError<br>- 存在しないセッション: false |

### FR-AUTH-003: セッション更新時の認可チェック

| 項目         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 要件ID       | FR-AUTH-003                                                                                            |
| 対象メソッド | `updateSession(id: string, requestUserId: string, data: UpdateChatSession)`                            |
| 入力         | `sessionId`, `requestUserId`, `updateData`                                                             |
| 処理         | 1. セッションを取得<br>2. `session.userId === requestUserId` を検証<br>3. 更新処理実行                 |
| 成功時       | `true` を返却                                                                                          |
| 失敗時       | `UnauthorizedError` をスロー                                                                           |
| 受け入れ基準 | - 所有者が更新: 正常に更新完了<br>- 非所有者が更新: UnauthorizedError<br>- 存在しないセッション: false |

### FR-AUTH-004: エクスポート時の認可チェック

| 項目         | 内容                                                                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件ID       | FR-AUTH-004                                                                                                                                                                |
| 対象メソッド | `exportToMarkdown(sessionId: string, requestUserId: string, options?: ExportOptions)`<br>`exportToJson(sessionId: string, requestUserId: string, options?: ExportOptions)` |
| 入力         | `sessionId`, `requestUserId`, `options`（任意）                                                                                                                            |
| 処理         | 1. セッションを取得<br>2. `session.userId === requestUserId` を検証<br>3. エクスポート処理実行                                                                             |
| 成功時       | エクスポートデータを返却                                                                                                                                                   |
| 失敗時       | `UnauthorizedError` をスロー                                                                                                                                               |
| 受け入れ基準 | - 所有者がエクスポート: 正常にデータ返却<br>- 非所有者がエクスポート: UnauthorizedError<br>- 存在しないセッション: Error（既存の挙動維持）                                 |

---

## 3. 非機能要件

### NFR-PERF-001: パフォーマンス影響

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| 要件ID         | NFR-PERF-001                                         |
| レイテンシ増加 | 最大10ms以内                                         |
| DB問い合わせ   | 追加クエリなし（既存のセッション取得クエリに含める） |
| 検証方法       | 認可チェック追加前後のレスポンスタイム計測           |

### NFR-SEC-001: セキュリティ原則

| 項目            | 内容                                                           |
| --------------- | -------------------------------------------------------------- |
| 要件ID          | NFR-SEC-001                                                    |
| Fail-Secure     | エラー発生時はアクセス拒否                                     |
| Deny by Default | 明示的な許可がない場合は拒否                                   |
| 情報漏洩防止    | エラーメッセージからセッション存在有無を推測させない           |
| 検証方法        | - 例外発生時のアクセス拒否確認<br>- エラーメッセージの内容確認 |

### NFR-COMPAT-001: 後方互換性

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 要件ID   | NFR-COMPAT-001                                                     |
| 影響     | 既存のメソッドシグネチャ変更による呼び出し元の修正が必要           |
| 移行方針 | テストコードの修正で対応（実行時の呼び出し元は現時点で存在しない） |
| 検証方法 | 既存テストの全パス確認                                             |

---

## 4. エラーレスポンス仕様

### UnauthorizedError クラス仕様

```typescript
/**
 * 認可失敗エラー
 *
 * リソースへのアクセス権限がない場合にスローされる。
 * OWASP A01: Broken Access Control の対策として使用。
 */
export class UnauthorizedError extends Error {
  readonly name = "UnauthorizedError";
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 403;

  constructor(
    message: string = "Access denied: You do not have permission to access this resource",
  ) {
    super(message);
  }
}
```

### エラーメッセージ原則

| 原則                 | 説明                                                               |
| -------------------- | ------------------------------------------------------------------ |
| セッション存在非露出 | 「セッションが見つかりません」ではなく「アクセス権限がありません」 |
| ユーザーID非露出     | エラーメッセージにユーザーIDを含めない（ログには記録可能）         |
| 開発者向け詳細分離   | 詳細なエラー情報は開発者向けログにのみ出力                         |

### エラーコード体系

| エラーコード     | 説明                 | HTTPステータス |
| ---------------- | -------------------- | -------------- |
| UNAUTHORIZED     | 認可失敗             | 403            |
| (既存) NOT_FOUND | リソースが存在しない | 404            |

---

## 5. 受け入れ基準

### 認可チェックの受け入れ基準

| テストケース                   | 期待結果             |
| ------------------------------ | -------------------- |
| 所有者がセッションを取得       | セッションデータ返却 |
| 非所有者がセッションを取得     | UnauthorizedError    |
| 所有者がセッションを削除       | true（削除成功）     |
| 非所有者がセッションを削除     | UnauthorizedError    |
| 所有者がセッションを更新       | true（更新成功）     |
| 非所有者がセッションを更新     | UnauthorizedError    |
| 所有者がMarkdownエクスポート   | Markdown文字列返却   |
| 非所有者がMarkdownエクスポート | UnauthorizedError    |
| 所有者がJSONエクスポート       | JSON文字列返却       |
| 非所有者がJSONエクスポート     | UnauthorizedError    |
| 存在しないセッションを取得     | null                 |
| 存在しないセッションを削除     | false                |
| 存在しないセッションを更新     | false                |

### OWASP A01 準拠確認項目

| 確認項目                                           | 状態   |
| -------------------------------------------------- | ------ |
| すべてのデータアクセスにuserID検証が実装されている | 要実装 |
| 水平権限昇格が不可能になっている                   | 要実装 |
| 認可チェックはサービス層で一元管理されている       | 要実装 |
| 認可失敗時のエラーレスポンスが統一されている       | 要実装 |

---

## 6. 統合テストシナリオ

### シナリオ一覧

| シナリオID  | 説明                           | 期待結果           |
| ----------- | ------------------------------ | ------------------ |
| IT-AUTH-001 | 所有者がセッションにアクセス   | 成功               |
| IT-AUTH-002 | 非所有者がセッションにアクセス | UnauthorizedError  |
| IT-AUTH-003 | 存在しないセッションにアクセス | null/false/Error   |
| IT-AUTH-004 | 空文字のuserIdでアクセス       | UnauthorizedError  |
| IT-AUTH-005 | nullのuserIdでアクセス         | TypeScript型エラー |

---

## 7. 参考資料

- [OWASP A01: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- 内部参照: `.claude/skills/aiworkflow-requirements/references/security-principles.md`
- 内部参照: `.claude/skills/aiworkflow-requirements/references/error-handling.md`

---

## 8. Phase 1 完了確認

- [x] タスク1: 対象メソッドの特定 - 完了
- [x] タスク2: 機能要件の定義（FR-AUTH-001〜004）- 完了
- [x] タスク3: 非機能要件の定義（NFR-PERF-001, NFR-SEC-001, NFR-COMPAT-001）- 完了
- [x] タスク4: エラーレスポンス仕様の定義 - 完了
- [x] タスク5: 要件書の作成 - 完了
- [x] 統合テストシナリオの特定 - 完了

**Phase 1 完了**: 全タスク100%実行完了
