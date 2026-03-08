# Phase 5: 実装

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 5                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 2 の設計と Phase 4 のテストに基づき、`registerAllIpcHandlers` に Graceful Degradation パターンを実装する。TDD の Green フェーズとして、全テストを通過させる。

## 実行タスク

- 型定義の実装: `HandlerRegistrationFailure` と `IpcHandlerRegistrationResult` を実装する
- safeRegister ヘルパー実装: 個別 try-catch を共通化するヘルパー関数を実装する
- registerAllIpcHandlers リファクタリング: 既存の逐次呼び出しを `safeRegister` でラップする
- 戻り値型の変更: `void` → `IpcHandlerRegistrationResult` に変更する

## 参照資料

| 資料名       | パス                                                                   | 説明           |
| ------------ | ---------------------------------------------------------------------- | -------------- |
| 設計書       | `outputs/phase-2/design-document.md`                                   | Phase 2 成果物 |
| テスト       | `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | Phase 4 成果物 |
| IPC index    | `apps/desktop/src/main/ipc/index.ts`                                   | 実装対象       |
| テスト設計書 | `outputs/phase-4/test-design.md`                                       | Phase 4 成果物 |

### システム仕様（aiworkflow-requirements）

- `error-handling.md`: Infrastructure Error とログ最小化
- `api-ipc-system.md`: 登録導線と契約影響範囲
- `security-electron-ipc.md`: register / unregister 対称性、非IPCリスナー観点
- `architecture-implementation-patterns.md`: Main Process 側の再登録/継続動作パターン
- `arch-electron-services.md`: サービス初期化グループの依存順序
- `arch-ipc-persistence.md`: `registerAllIpcHandlers` を単一入口のまま維持

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: 型定義の追加

`apps/desktop/src/main/ipc/index.ts` の先頭（import 直後）に型定義を追加する:

```typescript
/** ハンドラ登録失敗情報 */
export interface HandlerRegistrationFailure {
  handlerName: string;
  errorMessage: string;
  errorCode: number;
}

/** registerAllIpcHandlers の戻り値 */
export interface IpcHandlerRegistrationResult {
  successCount: number;
  failureCount: number;
  failures: HandlerRegistrationFailure[];
}
```

### ステップ2: safeRegister ヘルパー関数の実装

`registerAllIpcHandlers` の直前にヘルパー関数を追加する:

```typescript
/**
 * 個別ハンドラ登録を try-catch で囲み、失敗時にログ出力と記録を行う
 */
function safeRegister(
  handlerName: string,
  registerFn: () => void,
  failures: HandlerRegistrationFailure[],
): boolean {
  try {
    registerFn();
    return true;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[IPC] Failed to register ${handlerName}: ${errorMessage}`);
    failures.push({
      handlerName,
      errorMessage,
      errorCode: 4001,
    });
    return false;
  }
}
```

### ステップ3: registerAllIpcHandlers のリファクタリング

1. 戻り値型を `void` → `IpcHandlerRegistrationResult` に変更する
2. 各 `registerXxxHandlers()` 呼び出しを `safeRegister()` でラップする
3. サービス初期化 + ハンドラ登録のグループは、まとめて1つの `safeRegister` で囲む
4. 関数末尾で成功/失敗のサマリーログを出力する
5. `IpcHandlerRegistrationResult` を返却する

**重要な実装ルール:**

| ルール                                             | 理由                                                   |
| -------------------------------------------------- | ------------------------------------------------------ |
| 既存のハンドラ登録順序を変更しない                 | 依存関係がある可能性があるため                         |
| `themeWatcherUnsubscribe` の代入は safeRegister 外 | モジュールスコープ変数の管理は個別に行う必要があるため |
| Supabase 条件分岐は既存ロジックを維持              | `getSupabaseClient()` の null チェックは変更しない     |
| `authKeyService` は `safeRegister` の前に初期化    | 複数のハンドラで共有されるため、先に初期化が必要       |

### ステップ4: 呼び出し互換性の確認

`registerAllIpcHandlers` は戻り値を追加しても、既存呼び出し元が戻り値を無視する限り後方互換を保てる。したがって本タスクでは **呼び出し元の強制変更は行わず**、必要であれば将来の監視改善タスクで起動ログ集計に利用する。

```typescript
// 既存呼び出し元は後方互換でそのまま維持できる
registerAllIpcHandlers(mainWindow);

// 将来必要になれば起動診断で利用可能
const registration = registerAllIpcHandlers(mainWindow);
if (registration.failureCount > 0) {
  console.warn("[IPC] Partial registration detected", registration.failures);
}
```

### ステップ5: テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-graceful-degradation.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/safe-register.test.ts
```

全テストが Green（成功）であることを確認する。

## 統合テスト連携

- 既存呼び出し元が戻り値未使用のまま動作し、起動/activate フローを壊さないことを確認する
- 既存の `unregisterAllIpcHandlers` は変更なしであることを確認する

## 多角的チェック観点

| 観点               | チェック内容                                            |
| ------------------ | ------------------------------------------------------- |
| セキュリティ       | ログに内部パスや環境変数値を含めていないか（NFR-02）    |
| エラーハンドリング | `catch (error: unknown)` で全ての例外型を捕捉しているか |
| アーキテクチャ     | 既存のハンドラ登録順序が維持されているか                |

## 成果物

| 成果物       | パス                                       | 説明                      |
| ------------ | ------------------------------------------ | ------------------------- |
| 実装コード   | `apps/desktop/src/main/ipc/index.ts`       | Graceful Degradation 実装 |
| 実装レポート | `outputs/phase-5/implementation-report.md` | 変更内容の詳細            |

## 完了条件

- [ ] `HandlerRegistrationFailure` と `IpcHandlerRegistrationResult` 型が実装されている
- [ ] `safeRegister` ヘルパー関数が実装されている
- [ ] `registerAllIpcHandlers` の全 `registerXxxHandlers()` が `safeRegister` でラップされている
- [ ] 戻り値型が `IpcHandlerRegistrationResult` に変更されている
- [ ] 既存呼び出し元が戻り値未使用のまま後方互換で動作する
- [ ] Phase 4 のテストが全て Green（成功）
- [ ] 既存のハンドラ登録順序が変更されていない
- [ ] `themeWatcherUnsubscribe` の管理が正常に動作している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
