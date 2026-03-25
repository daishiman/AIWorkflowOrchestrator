# Phase 2: 設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 2                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

Phase 1 の要件に基づき、`validateIpcSender` 適用の具体的な設計を行う。

## 参照資料

| 資料名                 | パス                                                             | 説明                                             |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| Phase 1 要件定義       | `phase-1-requirements.md`                                        | 受け入れ基準・スコープ                           |
| validateIpcSender 実装 | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | 関数シグネチャ・戻り値型                         |
| skillHandlers.ts       | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | 適用パターンの参考実装                           |
| agentHandlers.ts       | `apps/desktop/src/main/ipc/agentHandlers.ts`                     | 適用パターンの参考実装                           |
| IPC 呼び出し元         | `apps/desktop/src/main/ipc/index.ts` L858-862                    | `registerPermissionStoreHandlers` の呼び出し箇所 |

## 設計

### 1. 関数シグネチャ変更

#### Before

```typescript
export function registerPermissionStoreHandlers(
  permissionStore: IPermissionStore,
): void {
```

#### After

```typescript
import type { BrowserWindow } from "electron";
import { withValidation } from "../../infrastructure/security/ipc-validator";

export function registerPermissionStoreHandlers(
  mainWindow: BrowserWindow,
  permissionStore: IPermissionStore,
): void {
```

**設計判断**: `mainWindow` を第1引数にする。他のハンドラ登録関数（`registerSkillHandlers`, `registerAgentExecutionHandlers` 等）と同じ慣例に合わせる。

### 2. 各ハンドラへの sender 検証追加

#### パターン選定: `withValidation` ラッパー vs インライン

| 観点                   | `withValidation` ラッパー                               | インラインパターン                                 |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| コード量               | 4行/ハンドラ（計16行）                                  | 8行/ハンドラ（計32行）                             |
| 既存使用例             | profileHandlers, apiKeyHandlers                         | skillHandlers, agentHandlers                       |
| エラー処理             | `return toIPCValidationError()`                         | `throw toIPCValidationError()`                     |
| 既存ハンドラとの整合性 | 高（既存エラーは `return { success: false }` パターン） | 低（既存エラーは `return` だが検証失敗は `throw`） |
| プロジェクト進化方向   | 新しいハンドラで採用増加中                              | 旧パターン                                         |

**設計判断**: `withValidation` ラッパーを採用する。理由:

1. 既存の permission-store-handlers が全エラーで `return { success: false }` パターンを使用しており、`withValidation` の `return` パターンとの整合性が高い
2. コード重複の削減（32行 → 16行）
3. profileHandlers / apiKeyHandlers で実績のある新パターンへの統一

全4ハンドラに同一パターンを適用する:

```typescript
ipcMain.handle(
  IPC_CHANNELS.PERMISSION_XXX,
  withValidation(
    IPC_CHANNELS.PERMISSION_XXX,
    async (event, ...args): Promise<XxxResponse> => {
      // 既存ビジネスロジック（変更なし）
      try {
        // ...
      } catch (error) {
        // ...
      }
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

#### ハンドラ別の変更詳細

| ハンドラ                     | event 引数の変更             | sender 検証追加 |
| ---------------------------- | ---------------------------- | --------------- |
| `permission:getAllowedTools` | `async ()` → `async (event)` | 先頭に追加      |
| `permission:revokeTool`      | `_event` → `event`           | 先頭に追加      |
| `permission:clearAll`        | `async ()` → `async (event)` | 先頭に追加      |
| `permission:clear-session`   | `_event` → `event`           | 先頭に追加      |

### 3. 呼び出し元の修正

**ファイル**: `apps/desktop/src/main/ipc/index.ts` L858-862

#### Before

```typescript
const permissionStore = new PermissionStore();
track("registerPermissionStoreHandlers", () => {
  registerPermissionStoreHandlers(permissionStore);
});
```

#### After

```typescript
const permissionStore = new PermissionStore();
track("registerPermissionStoreHandlers", () => {
  registerPermissionStoreHandlers(mainWindow, permissionStore);
});
```

`mainWindow` は `registerAllIpcHandlers` の引数として既にスコープ内に存在するため、追加のインポートや取得処理は不要。

### 4. テスト設計

#### 4.1 既存テストの修正

全ての `registerPermissionStoreHandlers(mockPermissionStore)` 呼び出しを `registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore)` に変更する。

#### 4.2 mockMainWindow の定義

```typescript
const mockMainWindow = {
  webContents: { id: 1 },
  id: 1,
} as unknown as BrowserWindow;
```

#### 4.3 mockEvent の定義（正常系）

```typescript
const createMockEvent = (webContentsId: number = 1) =>
  ({
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  }) as unknown as IpcMainInvokeEvent;
```

#### 4.4 validateIpcSender のモック

```typescript
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockReturnValue({
    success: false,
    error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
  }),
}));
```

#### 4.5 新規テストケース

| テストID | テスト内容                                                        | 期待結果                             |
| -------- | ----------------------------------------------------------------- | ------------------------------------ |
| SEC-01   | 正常な sender からの getAllowedTools                              | 正常応答                             |
| SEC-02   | 正常な sender からの revokeTool                                   | 正常応答                             |
| SEC-03   | 正常な sender からの clearAll                                     | 正常応答                             |
| SEC-04   | 正常な sender からの clear-session                                | 正常応答                             |
| SEC-05   | 不正 sender からの getAllowedTools                                | エラー応答 return (IPC_UNAUTHORIZED) |
| SEC-06   | 不正 sender からの revokeTool                                     | エラー応答 return (IPC_UNAUTHORIZED) |
| SEC-07   | 不正 sender からの clearAll                                       | エラー応答 return (IPC_UNAUTHORIZED) |
| SEC-08   | 不正 sender からの clear-session                                  | エラー応答 return (IPC_UNAUTHORIZED) |
| SEC-09   | 全4ハンドラで validateIpcSender が呼ばれること                    | 4回呼び出し確認                      |
| SEC-10   | getAllowedWindows コールバックが mainWindow を返すこと（P41対策） | コールバック検証                     |

### 5. エラーレスポンス形式

sender 検証失敗時は `withValidation` ラッパーが `return toIPCValidationError(validation)` で応答する（`throw` ではない）。これは既存の permission-store-handlers のエラー処理パターン（`return { success: false, ... }`）と整合する:

```json
{
  "success": false,
  "error": {
    "code": "IPC_UNAUTHORIZED" | "IPC_FORBIDDEN",
    "message": "具体的なエラーメッセージ"
  }
}
```

**注意**: skillHandlers 等の旧パターンでは `throw toIPCValidationError()` を使用しているが、permission-store-handlers では既存のエラー処理パターン（`return`）との一貫性を優先し、`withValidation` の `return` パターンを採用する。

### 6. 影響範囲

| ファイル                                      | 影響                                |
| --------------------------------------------- | ----------------------------------- |
| `permission-store-handlers.ts`                | シグネチャ変更 + sender 検証追加    |
| `permission-store-handlers.test.ts`           | モック修正 + テスト追加             |
| `ipc/index.ts` L861                           | 呼び出し引数に `mainWindow` 追加    |
| `register-conversation-handlers.test.ts` L315 | モック引数修正（必要に応じて）      |
| `ipc-graceful-degradation.test.ts` L284       | モック引数修正（必要に応じて）      |
| `ipc-double-registration.test.ts` L233        | モック引数修正（必要に応じて）      |
| `fallback-handlers.test.ts` L210              | モック引数修正（必要に応じて）      |
| `unregisterPermissionStoreHandlers`           | 影響なし（mainWindow を使用しない） |

注: L315, L284, L233, L210 はモック化された `registerPermissionStoreHandlers` であり、`vi.fn()` のため引数が変わっても型チェックには影響しない可能性が高い。ただし確認は必須。

## 実行タスク

- Task 2-1: 関数シグネチャ変更の設計
- Task 2-2: sender 検証パターンの選定（`withValidation` vs インライン）
- Task 2-3: 呼び出し元の修正方法の特定
- Task 2-4: テスト設計（新規テストケース定義）
- Task 2-5: 影響範囲の特定

## 実行手順

### ステップ1: 関数シグネチャ設計

`registerSkillHandlers`, `registerAgentExecutionHandlers` 等の既存パターンを参照し、`mainWindow` の引数位置を決定する。

### ステップ2: sender 検証パターンの選定

`ipc-validator.ts` の `withValidation` ラッパー（L319-336）とインラインパターンを比較し、最適なパターンを選択する。

### ステップ3: テスト設計

SEC-01~SEC-10 のテストケースをテーブル形式で定義する。

### ステップ4: 影響範囲分析

`grep -rn "registerPermissionStoreHandlers" apps/desktop/src/` で全呼び出し箇所を特定する。

## 統合テスト連携

- 既存の 25+ テストケースが全 PASS すること
- 新規 10 テストケース（SEC-01 ~ SEC-10）が PASS すること
- `pnpm typecheck` が PASS すること

## 多角的チェック観点

- **セキュリティ**: 全4ハンドラで sender 検証が行われること。検証パターンは既存ハンドラと統一
- **DI パターン**: P34 準拠。`mainWindow` はアプリ起動時に確定するため Constructor Injection が適切
- **P41 対策**: `getAllowedWindows: () => [mainWindow]` のコールバックをテストで明示的に検証
- **後方互換性**: 内部 API のため破壊的変更は許容。呼び出し元は1箇所（`ipc/index.ts`）のみ

## 成果物

| 成果物 | パス                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 設計書 | `docs/30-workflows/permission-store-sender-validation/phase-2-design.md` |

## 完了条件

- [x] 関数シグネチャの変更設計完了
- [x] 各ハンドラの修正パターン定義完了
- [x] 呼び出し元の修正方法特定完了
- [x] テスト設計（新規テストケース10件）完了
- [x] 影響範囲の特定完了

## 次のPhase

Phase 3: 設計レビュー — 要件・設計の妥当性検証

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
