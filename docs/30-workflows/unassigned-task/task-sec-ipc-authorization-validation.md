# IPC層認可バリデーション強化 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | SEC-IPC-001                                |
| タスク名     | IPC層認可バリデーション強化                |
| 分類         | セキュリティ                               |
| 対象機能     | Electron IPC Handler（chat-history）       |
| 優先度       | 中                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（SECURITY-001システム仕様更新時） |
| 発見日       | 2026-01-19                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SECURITY-001タスクでChatHistoryServiceに認可チェック機能を実装した。現在、認可チェックはService層の`verifySessionOwnership`メソッドで実行されている。しかし、IPC Handler層（Renderer-Main間通信）では、Renderer側から送信される`requestUserId`の妥当性検証が行われていない。

**aiworkflow-requirements参照**:

- `references/interfaces-chat-history.md` - IChatHistoryService認可チェック仕様
- `references/architecture-patterns.md` - IPC Handler Registration Pattern

### 1.2 問題点・課題

**現在の実装状態**:

```typescript
// chat-history-handlers.ts
ipcMain.handle(
  "chat-history:get-session",
  async (_, sessionId, requestUserId) => {
    // requestUserIdはRenderer側から受け取った値をそのまま使用
    return await chatHistoryService.getSession(sessionId, requestUserId);
  },
);
```

**セキュリティ上の問題**:

- Renderer側（フロントエンド）から任意の`requestUserId`を送信可能
- 認証状態とrequestUserIdの整合性検証なし
- 悪意あるユーザーが他ユーザーのIDを詐称する可能性

### 1.3 放置した場合の影響

| 影響領域               | 影響度 | 説明                                            |
| ---------------------- | ------ | ----------------------------------------------- |
| セキュリティ           | Medium | requestUserId詐称による他ユーザーデータアクセス |
| OWASP A01準拠          | Medium | Broken Access Control対策の不完全性             |
| 監査・コンプライアンス | Low    | セキュリティ監査で指摘される可能性              |

---

## 2. 何を達成するか（What）

### 2.1 目的

IPC Handler層で`requestUserId`と認証セッションの整合性を検証し、不正なユーザーID詐称を防止する。

### 2.2 最終ゴール

- ✅ IPC Handler層で認証セッションからユーザーIDを取得
- ✅ Renderer側から送信されるrequestUserIdの妥当性検証
- ✅ 不整合時はエラーをスロー（UnauthorizedError）
- ✅ 全対象IPCハンドラーに検証を適用

### 2.3 スコープ

#### 含むもの

- chat-history関連IPCハンドラーの認可バリデーション追加
- 認証セッションからユーザーID取得ヘルパー関数
- 認可バリデーションエラーハンドリング

#### 含まないもの

- 他のIPCハンドラー（chat-history以外）への適用（将来タスク）
- 認証フロー自体の変更
- 監査ログ機能（別タスク：AUDIT-001）

### 2.4 成果物

| 種別         | 成果物                       | 配置先                                                      |
| ------------ | ---------------------------- | ----------------------------------------------------------- |
| 実装         | IPC認可ヘルパー関数          | `apps/desktop/src/main/ipc/helpers/authorization.ts`        |
| 実装         | chat-history-handlers.ts修正 | `apps/desktop/src/main/ipc/chat-history-handlers.ts`        |
| テスト       | IPC認可テスト                | `apps/desktop/src/main/ipc/__tests__/authorization.test.ts` |
| ドキュメント | architecture-patterns.md更新 | `.claude/skills/aiworkflow-requirements/references/`        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] SECURITY-001（ChatHistoryService認可チェック）が完了していること
- [ ] 認証セッション管理がMain Processで実装されていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- SECURITY-001: ChatHistoryService認可チェック（完了済み）

**同時実施可能なタスク**:

- AUDIT-001: 監査ログ実装

### 3.3 必要な知識

- Electron IPC（ipcMain.handle）
- 認証セッション管理（AuthService）
- TypeScript型安全なエラーハンドリング

### 3.4 推奨アプローチ

1. **認可ヘルパー関数作成**: 認証セッションからユーザーIDを取得し、requestUserIdと比較
2. **IPCハンドラー修正**: 全対象ハンドラーで認可ヘルパー関数を呼び出し
3. **エラーハンドリング**: 不整合時はUnauthorizedErrorをスロー

---

## 4. 実行手順

### Phase構成

```
Phase 1: 認可ヘルパー関数の実装
  ↓
Phase 2: chat-history-handlers.ts修正
  ↓
Phase 3: テスト作成・実行
  ↓
Phase 4: ドキュメント更新
```

---

### Phase 1: 認可ヘルパー関数の実装

#### 目的

認証セッションからユーザーIDを取得し、requestUserIdとの整合性を検証するヘルパー関数を作成する。

#### 手順

1. `apps/desktop/src/main/ipc/helpers/authorization.ts`を新規作成
2. `validateRequestUserId(requestUserId: string): Promise<void>`関数を実装
3. 認証セッションからユーザーIDを取得するロジックを追加
4. 不整合時はUnauthorizedErrorをスロー

#### 実装例

```typescript
// authorization.ts
import { UnauthorizedError } from "@repo/shared/errors";
import { authService } from "../../services/authService";

export async function validateRequestUserId(
  requestUserId: string,
): Promise<void> {
  const currentUser = await authService.getCurrentUser();

  if (!currentUser) {
    throw new UnauthorizedError("No authenticated user", "IPC", "chat-history");
  }

  if (currentUser.id !== requestUserId) {
    throw new UnauthorizedError(
      "Request user ID does not match authenticated user",
      "IPC",
      requestUserId,
    );
  }
}
```

#### 完了条件

- [ ] authorization.ts作成完了
- [ ] validateRequestUserId関数実装完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: chat-history-handlers.ts修正

#### 目的

chat-history関連の全IPCハンドラーに認可バリデーションを追加する。

#### 手順

1. `chat-history-handlers.ts`を開く
2. `validateRequestUserId`をインポート
3. 以下のハンドラーに認可バリデーションを追加:
   - `chat-history:get-session`
   - `chat-history:delete-session`
   - `chat-history:update-session`
   - `chat-history:export-markdown`
   - `chat-history:export-json`

#### 実装例

```typescript
// chat-history-handlers.ts
import { validateRequestUserId } from "./helpers/authorization";

ipcMain.handle(
  "chat-history:get-session",
  async (_, sessionId, requestUserId) => {
    await validateRequestUserId(requestUserId); // 追加
    return await chatHistoryService.getSession(sessionId, requestUserId);
  },
);
```

#### 完了条件

- [ ] 5ハンドラーすべてに認可バリデーション追加
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: テスト作成・実行

#### 目的

IPC認可バリデーションが正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目                          | 期待結果                  |
| --- | -------- | ----------------------------------- | ------------------------- |
| 1   | 正常系   | 認証ユーザーと一致するrequestUserId | 処理が正常に継続          |
| 2   | 異常系   | 認証ユーザーと不一致なrequestUserId | UnauthorizedErrorがスロー |
| 3   | 異常系   | 未認証状態でのリクエスト            | UnauthorizedErrorがスロー |
| 4   | 境界値   | 空文字列のrequestUserId             | UnauthorizedErrorがスロー |

#### 完了条件

- [ ] テスト4件すべてPASS
- [ ] カバレッジ80%以上

---

### Phase 4: ドキュメント更新

#### 目的

aiworkflow-requirementsのシステム仕様を更新する。

#### 手順

1. `references/architecture-patterns.md`のIPC Handler Registration Patternセクションに認可バリデーション仕様を追記
2. `references/security-api-electron.md`に認可バリデーション項目を追加
3. SKILL.mdの変更履歴を更新

#### 完了条件

- [ ] architecture-patterns.md更新完了
- [ ] security-api-electron.md更新完了
- [ ] SKILL.md変更履歴追記

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] validateRequestUserId関数実装完了
- [ ] 5 IPCハンドラーに認可バリデーション追加
- [ ] UnauthorizedErrorが正しくスローされる

### 品質要件

- [ ] テスト4件すべてPASS
- [ ] ESLint/TypeScriptエラーゼロ
- [ ] カバレッジ80%以上

### ドキュメント要件

- [ ] architecture-patterns.md更新
- [ ] security-api-electron.md更新
- [ ] SKILL.md変更履歴追記

---

## 6. 検証方法

### テストケース

#### 単体テスト

1. validateRequestUserId - 正常系（一致）
2. validateRequestUserId - 異常系（不一致）
3. validateRequestUserId - 異常系（未認証）
4. validateRequestUserId - 境界値（空文字列）

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test authorization

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                           |
| ---------------------- | ------ | -------- | ------------------------------ |
| 認証セッション取得失敗 | Medium | Low      | エラーハンドリングで適切に処理 |
| 既存テストの破壊       | Medium | Medium   | 既存テストのモック修正         |
| パフォーマンス低下     | Low    | Low      | 認証チェックはキャッシュ活用   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` - 認可チェック仕様
- `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` - IPC Handler Pattern
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` - UnauthorizedError仕様

### 参考資料

- [OWASP A01:2021 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)

---

## 9. 備考

### 発見経緯

SECURITY-001タスクのPhase 12（システム仕様更新）において、aiworkflow-requirementsの`interfaces-chat-history.md`を更新した際、IPC層でのrequestUserIdバリデーションが不足していることを検出した。

### 補足事項

- このタスクはSECURITY-001の補完タスクとして位置づけられる
- 将来的に他のIPCハンドラー（chat-history以外）にも同様のパターンを適用する必要がある
- 認可ヘルパー関数は再利用可能な設計とすること
