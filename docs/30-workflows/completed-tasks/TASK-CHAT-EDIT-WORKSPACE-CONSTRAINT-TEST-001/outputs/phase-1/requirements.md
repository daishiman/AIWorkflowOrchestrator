# Phase 1 成果物: 要件定義書

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| Phase      | 1                                                          |
| タスクID   | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                 |
| 作成日     | 2026-03-15                                                 |
| テスト対象 | `apps/desktop/src/main/ipc/chatEditHandlers.ts` (L159-173) |

## P50チェック結果: 既実装状態の調査

### 調査結果

```bash
# IPC版 workspacePath テストの有無を確認
grep -rn "workspacePath\|workspace\|isAllowedPath" \
  apps/desktop/src/main/ipc/__tests__/chatEditHandlers*
# → 該当なし（0件）
```

| 判定   | 根拠                                                       |
| ------ | ---------------------------------------------------------- |
| 未実装 | IPC版 `chatEditHandlers*test*` に workspacePath テストなし |

**注意（P58対策）**: `handlers/__tests__/chatEditHandlers.workspace.test.ts` は `handlers/chatEditHandlers.ts` 用（`handleReadFile`, `handleWriteFile`, `isWithinWorkspace` のテスト）であり、IPC版のテスト代替にはならない。

### 既存テストファイル一覧

| ファイル                                                | 責務                     | workspacePath テスト |
| ------------------------------------------------------- | ------------------------ | -------------------- |
| `ipc/__tests__/chatEditHandlers.test.ts`                | IPC基本テスト            | なし                 |
| `ipc/__tests__/chatEditHandlers.security.test.ts`       | IPCセキュリティテスト    | なし                 |
| `ipc/__tests__/chatEditHandlers.selection.test.ts`      | IPCセレクションテスト    | なし                 |
| `handlers/__tests__/chatEditHandlers.workspace.test.ts` | handlers版ワークスペース | あり（別ファイル）   |

### 結論

Phase 4-5 は **新規テスト作成** モードで実行する。

---

## 機能要件（FR）

| FR ID  | 要件                                                                     | 対応 TC  | 優先度 | テスト対象コード行   |
| ------ | ------------------------------------------------------------------------ | -------- | ------ | -------------------- |
| FR-001 | workspacePath 指定時、workspace 内ファイルは正常処理される               | TC-WS-01 | 高     | L159-173             |
| FR-002 | workspacePath 指定時、workspace 外ファイルは PERMISSION_DENIED を返す    | TC-WS-02 | 高     | L163-171             |
| FR-003 | workspacePath 未指定時、isAllowedPath が呼ばれずに処理が続行する         | TC-WS-03 | 高     | L159                 |
| FR-004 | パストラバーサル攻撃パターンに対して PERMISSION_DENIED を返す            | TC-WS-04 | 高     | L163 + PathValidator |
| FR-005 | 複数コンテキストのうち 1 つでも workspace 外なら全体が PERMISSION_DENIED | TC-WS-05 | 高     | L160-171             |
| FR-006 | 空コンテキスト配列で isAllowedPath が呼ばれずに正常処理される            | TC-WS-06 | 中     | L160                 |

### テスト対象コード（正本: `ipc/chatEditHandlers.ts` L159-173）

```typescript
// workspacePath セキュリティ検証
if (args.workspacePath && typeof args.workspacePath === "string") {
  for (const ctx of args.contexts) {
    if (!isAllowedPath(ctx.filePath, [args.workspacePath])) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "File path is outside the workspace",
          retryable: false,
        },
      };
    }
  }
}
```

### isAllowedPath 実装（正本: `PathValidator.ts`）

```typescript
export function isAllowedPath(
  filePath: string,
  allowedDirs: string[],
): boolean {
  const resolved = path.resolve(filePath);
  return allowedDirs.some((dir) => resolved.startsWith(path.resolve(dir)));
}
```

---

## 非機能要件（NFR）

| NFR ID  | 要件                                                     | 基準                | 検証方法                                    |
| ------- | -------------------------------------------------------- | ------------------- | ------------------------------------------- |
| NFR-001 | workspacePath 検証ブランチの Branch Coverage が 70% 以上 | 70%+                | `vitest --coverage` で L159-173 を確認      |
| NFR-002 | 既存テストへの影響がない                                 | 全 PASS 維持        | `pnpm --filter @repo/desktop test` 全テスト |
| NFR-003 | テスト実行時間が既存テストの実行時間を大幅に超えない     | 追加 2 秒以内       | Vitest の実行時間レポート                   |
| NFR-004 | テスト間で状態を共有しない（P9 対策）                    | beforeEach リセット | コードレビューで `beforeEach` の存在を確認  |

---

## 受け入れ基準（AC）

### AC-001（TC-WS-01: workspace 内ファイルの正常処理）

- **前提条件**: `validateIpcSender` が `{valid: true}` を返す
- **入力**: `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/src/index.ts"}]`
- **期待出力**: `{success: true}` のレスポンス
- **検証ポイント**: `isAllowedPath` が `("/home/user/project/src/index.ts", ["/home/user/project"])` で呼ばれること

### AC-002（TC-WS-02: workspace 外ファイルの拒否）

- **前提条件**: `validateIpcSender` が `{valid: true}` を返す
- **入力**: `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/etc/passwd"}]`
- **期待出力**: `{success: false, error: {code: "PERMISSION_DENIED"}}`
- **検証ポイント**: RuntimeResolver.resolve() が呼ばれていないこと

### AC-003（TC-WS-03: workspacePath 未指定時の検証スキップ）

- **前提条件**: `validateIpcSender` が `{valid: true}` を返す
- **入力**: `workspacePath: undefined`, `contexts: [{filePath: "/etc/passwd"}]`
- **期待出力**: RuntimeResolver 以降の処理に進む（`success: true`）
- **検証ポイント**: `isAllowedPath` が呼ばれていないこと

### AC-004（TC-WS-04: パストラバーサル攻撃のガード）

- **前提条件**: `validateIpcSender` が `{valid: true}` を返す
- **入力**: `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/../../etc/passwd"}]`
- **期待出力**: `{success: false, error: {code: "PERMISSION_DENIED"}}`
- **検証ポイント**: `isAllowedPath` 内の `path.resolve()` でパスが正規化され、`/etc/passwd` として評価されること

### AC-005（TC-WS-05: 複数コンテキストの部分拒否）

- **前提条件**: `validateIpcSender` が `{valid: true}` を返す
- **入力**: `workspacePath: "/home/user/project"`, `contexts: [{filePath: "/home/user/project/src/index.ts"}, {filePath: "/etc/passwd"}]`
- **期待出力**: `{success: false, error: {code: "PERMISSION_DENIED"}}`
- **検証ポイント**: 1 番目のコンテキストは PASS、2 番目のコンテキストで `isAllowedPath` が `false` を返すこと

### AC-006（TC-WS-06: 空コンテキスト配列の正常処理）

- **前提条件**: `validateIpcSender` が `{valid: true}` を返す
- **入力**: `workspacePath: "/home/user/project"`, `contexts: []`
- **期待出力**: RuntimeResolver 以降の処理に進む（`success: true`）
- **検証ポイント**: `isAllowedPath` が呼ばれていないこと（for-of ループが実行されない）

---

## テスト対象ファイルの確認

| 項目                   | 値                                                                           |
| ---------------------- | ---------------------------------------------------------------------------- |
| テスト対象ファイル正本 | `apps/desktop/src/main/ipc/chatEditHandlers.ts`（P58 対策）                  |
| AuthMode 型定義正本    | `packages/shared/src/types/auth-mode.ts`（P57 対策）                         |
| AuthMode 実値          | `"subscription" \| "api-key"`                                                |
| isAllowedPath 実装     | `apps/desktop/src/main/services/chat-edit/utils/PathValidator.ts`            |
| IPC チャンネル定数     | `IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT` = `"chat-edit:send-with-context"` |

---

## 完了条件チェック

- [x] P50チェック完了: 既存テストの網羅範囲を確認済み（結果: 未実装）
- [x] FR-001〜FR-006 の機能要件が定義されている
- [x] NFR-001〜NFR-004 の非機能要件が定義されている
- [x] AC-001〜AC-006 の受け入れ基準が具体的に記述されている
- [x] テスト対象ファイルが正本（`ipc/chatEditHandlers.ts`）として特定されている（P58 対策）
- [x] AuthMode の型定義正本が確認されている（P57 対策）
- [x] 本Phase内の全タスクを100%実行完了
