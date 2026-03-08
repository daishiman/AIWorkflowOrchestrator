# Phase 2: 設計

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 2                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 1 で定義した要件を実現するための設計を行う。各 `registerXxxHandlers()` を個別 try-catch で囲む Graceful Degradation パターンの構造設計と、失敗情報の記録・通知メカニズムを設計する。

## 実行タスク

- アーキテクチャ設計: `registerAllIpcHandlers` のリファクタリング構造を設計する
- エラーハンドリング設計: 個別 try-catch と失敗情報記録の仕組みを設計する
- インターフェース設計: 戻り値型と失敗情報の型定義を設計する

## 参照資料

| 資料名       | パス                                                                  | 説明           |
| ------------ | --------------------------------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                          | Phase 1 成果物 |
| IPC ハンドラ | `apps/desktop/src/main/ipc/index.ts`                                  | 主対象ファイル |
| エラー方針   | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラーカテゴリ |

### システム仕様（aiworkflow-requirements）

- `error-handling.md`: Infrastructure Error（4000-4999）のエラー構造定義
- `arch-electron-services.md`: Main Process の初期化順序とサービスライフサイクル

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

### ステップ1: 型定義の設計

```typescript
/** ハンドラ登録失敗情報 */
interface HandlerRegistrationFailure {
  /** 失敗したハンドラ名（例: "registerSkillHandlers"） */
  handlerName: string;
  /** エラーメッセージ（内部情報をサニタイズ済み） */
  errorMessage: string;
  /** エラーカテゴリコード（4000-4999: Infrastructure Error） */
  errorCode: number;
}

/** registerAllIpcHandlers の戻り値 */
interface IpcHandlerRegistrationResult {
  /** 登録に成功したハンドラ数 */
  successCount: number;
  /** 登録に失敗したハンドラ数 */
  failureCount: number;
  /** 失敗詳細の一覧 */
  failures: HandlerRegistrationFailure[];
}
```

### ステップ2: safeRegister ヘルパー関数の設計

個別 try-catch を共通化するヘルパー関数を設計する:

```typescript
function safeRegister(
  handlerName: string,
  registerFn: () => void,
  failures: HandlerRegistrationFailure[],
): boolean {
  try {
    registerFn();
    return true;
  } catch (error) {
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

**設計判断の根拠:**

| 設計選択             | 採用理由                                              |
| -------------------- | ----------------------------------------------------- |
| ヘルパー関数で共通化 | 30個以上の try-catch を個別に書くとコードが冗長になる |
| `failures` 配列蓄積  | 全登録完了後に一括で失敗情報を返却するため（FR-03）   |
| boolean 戻り値       | 呼び出し元で成功/失敗を判定可能にする                 |
| `console.error` 使用 | electron-log がない環境（テスト等）でも動作を保証する |

### ステップ3: registerAllIpcHandlers のリファクタリング設計

現行の逐次呼び出しを `safeRegister` でラップする:

```typescript
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
): IpcHandlerRegistrationResult {
  const failures: HandlerRegistrationFailure[] = [];
  let successCount = 0;

  // グループ1: 依存なしハンドラ（window参照不要）
  const noDepHandlers: [string, () => void][] = [
    ["registerFileHandlers", () => registerFileHandlers()],
    ["registerStoreHandlers", () => registerStoreHandlers()],
    ["registerDashboardHandlers", () => registerDashboardHandlers()],
    // ... 残りのハンドラ
  ];

  for (const [name, fn] of noDepHandlers) {
    if (safeRegister(name, fn, failures)) successCount++;
  }

  // グループ2: mainWindow 依存ハンドラ
  if (safeRegister("registerWindowHandlers",
    () => registerWindowHandlers(mainWindow), failures)) {
    successCount++;
  }

  // グループ3: サービス初期化 + ハンドラ登録（依存チェーン）
  // SkillService等の初期化が必要なグループは、
  // サービス初期化とハンドラ登録をまとめて1つのtry-catchで囲む
  safeRegister("registerSkillHandlers (with SkillService init)", () => {
    const skillService = /* ... 初期化 ... */;
    registerSkillHandlers(mainWindow, skillService, authKeyService);
  }, failures);

  return { successCount, failureCount: failures.length, failures };
}
```

### ステップ4: unregisterAllIpcHandlers との整合性設計

`unregisterAllIpcHandlers` は現行のまま変更不要:

- `ipcMain.removeHandler()` は未登録チャンネルでもエラーを出さない（既存コメントに記載済み）
- 失敗したハンドラのチャンネルに対して `removeHandler` を呼んでも安全
- P5（リスナー二重登録）対策として、`unregisterAllIpcHandlers` → `registerAllIpcHandlers` のフローは既存設計を維持

### ステップ5: ログ出力設計

| ログレベル | 出力条件                            | フォーマット                                                    |
| ---------- | ----------------------------------- | --------------------------------------------------------------- |
| error      | 個別ハンドラ登録失敗時              | `[IPC] Failed to register {handlerName}: {errorMessage}`        |
| warn       | 1つ以上のハンドラ登録失敗で全体完了 | `[IPC] {failureCount}/{totalCount} handlers failed to register` |
| info       | 全ハンドラ登録成功                  | `[IPC] All {totalCount} handlers registered successfully`       |

## 統合テスト連携

| 統合ポイント        | 契約定義                                                    |
| ------------------- | ----------------------------------------------------------- |
| Main → ログ         | `console.error` / `console.warn` による構造化ログ出力       |
| 戻り値 → 呼び出し元 | `IpcHandlerRegistrationResult` 型で失敗情報を返却           |
| 解除フロー          | `unregisterAllIpcHandlers` は変更なし（既存の安全性を維持） |

## 成果物

| 成果物       | パス                                  | 説明                 |
| ------------ | ------------------------------------- | -------------------- |
| 設計書       | `outputs/phase-2/design-document.md`  | アーキテクチャ設計   |
| 型定義設計   | `outputs/phase-2/type-definitions.md` | インターフェース定義 |
| シーケンス図 | `outputs/phase-2/sequence-diagram.md` | 登録フロー           |

## 完了条件

- [ ] `HandlerRegistrationFailure` と `IpcHandlerRegistrationResult` の型定義が設計されている
- [ ] `safeRegister` ヘルパー関数の設計が完了している
- [ ] `registerAllIpcHandlers` のリファクタリング構造が設計されている
- [ ] `unregisterAllIpcHandlers` との整合性が確認されている
- [ ] ログ出力設計（error/warn/info）が定義されている
- [ ] エラーコード 4001（Infrastructure Error）が割り当てられている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
