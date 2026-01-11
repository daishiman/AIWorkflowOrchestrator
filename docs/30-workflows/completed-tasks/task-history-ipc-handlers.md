# IPCハンドラー登録実装 - タスク指示書

## メタ情報

| 項目         | 内容                       |
| ------------ | -------------------------- |
| タスクID     | task-req-history-ipc-001   |
| タスク名     | IPCハンドラーの登録実装    |
| 分類         | 要件                       |
| 対象機能     | 履歴/ログ表示UI            |
| 優先度       | 高                         |
| 見積もり規模 | 小規模（S）                |
| ステータス   | 未実施                     |
| 発見元       | Phase 11（手動テスト検証） |
| 発見日       | 2026-01-10                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

レンダラープロセスからのIPC呼び出しを処理するために、メインプロセスでハンドラーを登録する必要がある。CONV-05-02で実装したHistoryServiceを呼び出し、結果をレンダラーに返却する橋渡し役となる。

### 1.2 問題点・課題

- IPCハンドラーがないと、UIからのAPI呼び出しが失敗する
- preloadで公開したAPIが機能しない
- 履歴データの取得・復元ができない

### 1.3 放置した場合の影響

- 履歴データの取得ができない
- バージョン復元ができない
- UIが常にエラー状態になる

---

## 2. 何を達成するか（What）

### 2.1 目的

メインプロセスに4つのIPCハンドラーを登録し、HistoryServiceと連携させる。

### 2.2 最終ゴール

すべてのIPC呼び出しが正常に処理され、Result型で結果が返却される。

### 2.3 スコープ

#### 含むもの

- ipcMain.handleの登録（4チャンネル）
- HistoryServiceとの連携
- エラーハンドリング（Result型での返却）

#### 含まないもの

- 新しいAPIの追加
- HistoryServiceの修正

### 2.4 成果物

| 成果物             | 説明                   | 配置先                        |
| ------------------ | ---------------------- | ----------------------------- |
| historyHandlers.ts | IPCハンドラー実装      | apps/desktop/src/main/ipc/    |
| main.ts更新        | ハンドラー登録呼び出し | apps/desktop/src/main/main.ts |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-05-02（HistoryService）が完了していること
- task-req-history-integration-001と同時に実施
- task-req-history-preload-001と同時に実施

### 3.2 依存タスク

| タスク                           | 説明                   | 関係     |
| -------------------------------- | ---------------------- | -------- |
| CONV-05-02                       | HistoryService実装     | 前提     |
| task-req-history-integration-001 | 統合タスク（親タスク） | 親タスク |
| task-req-history-preload-001     | preloadスクリプト設定  | 同時実施 |

### 3.3 必要な知識・スキル

- Electron ipcMain API
- TypeScript async/await
- Result型パターン

### 3.4 推奨アプローチ

1. historyHandlers.tsを作成
2. 4つのIPCハンドラーを実装
3. main.tsでアプリ起動時に登録
4. エラーハンドリングを実装
5. ログ出力を追加（デバッグ用）

---

## 4. 実行手順

### Phase 1: 設計確認

#### 使用スキル

| スキル名             | パス                                           | 選定理由                                         |
| -------------------- | ---------------------------------------------- | ------------------------------------------------ |
| electron-ui-patterns | `.claude/skills/electron-ui-patterns/SKILL.md` | IPC通信エラーハンドリングパターン（Trigger一致） |

#### 目的

IPCチャンネル名とResult型パターンを確認する。

#### 完了条件

- [ ] 4つのIPCチャンネル名を確認
- [ ] Result型パターンを確認
- [ ] HistoryServiceのメソッドを確認

### Phase 2: 実装

#### 実装コード

**apps/desktop/src/main/ipc/historyHandlers.ts:**

```typescript
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { HistoryService } from "../services/HistoryService";

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface LogFilterOptions extends PaginationOptions {
  level?: "info" | "warn" | "error" | "debug";
}

interface Result<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}

export function registerHistoryHandlers(historyService: HistoryService): void {
  // 履歴一覧取得
  ipcMain.handle(
    "history:getFileHistory",
    async (
      _event: IpcMainInvokeEvent,
      fileId: string,
      options?: PaginationOptions,
    ): Promise<Result<unknown>> => {
      try {
        const result = await historyService.getFileHistory(fileId, options);
        return { success: true, data: result };
      } catch (error) {
        console.error("[IPC] history:getFileHistory error:", error);
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  );

  // バージョン詳細取得
  ipcMain.handle(
    "history:getVersionDetail",
    async (
      _event: IpcMainInvokeEvent,
      conversionId: string,
    ): Promise<Result<unknown>> => {
      try {
        const result = await historyService.getVersionDetail(conversionId);
        return { success: true, data: result };
      } catch (error) {
        console.error("[IPC] history:getVersionDetail error:", error);
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  );

  // 変換ログ取得
  ipcMain.handle(
    "history:getConversionLogs",
    async (
      _event: IpcMainInvokeEvent,
      conversionId: string,
      options?: LogFilterOptions,
    ): Promise<Result<unknown>> => {
      try {
        const result = await historyService.getConversionLogs(
          conversionId,
          options,
        );
        return { success: true, data: result };
      } catch (error) {
        console.error("[IPC] history:getConversionLogs error:", error);
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  );

  // バージョン復元
  ipcMain.handle(
    "history:restoreVersion",
    async (
      _event: IpcMainInvokeEvent,
      fileId: string,
      conversionId: string,
    ): Promise<Result<unknown>> => {
      try {
        const result = await historyService.restoreVersion(
          fileId,
          conversionId,
        );
        return { success: true, data: result };
      } catch (error) {
        console.error("[IPC] history:restoreVersion error:", error);
        return {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  );

  console.log("[IPC] History handlers registered");
}
```

**main.ts への追加:**

```typescript
import { registerHistoryHandlers } from "./ipc/historyHandlers";
import { HistoryService } from "./services/HistoryService";

// app.whenReady() 内で
const historyService = new HistoryService(/* dependencies */);
registerHistoryHandlers(historyService);
```

#### 完了条件

- [ ] historyHandlers.tsが作成されている
- [ ] 4つのIPCハンドラーが実装されている
- [ ] main.tsでハンドラーが登録されている
- [ ] エラーハンドリングが実装されている

### Phase 3: 検証

#### 検証手順

1. アプリケーションを起動
2. コンソールログで「History handlers registered」を確認
3. UIから各機能を実行
4. 正常に結果が返却されることを確認

#### 完了条件

- [ ] history:getFileHistoryハンドラーが登録されている
- [ ] history:getVersionDetailハンドラーが登録されている
- [ ] history:getConversionLogsハンドラーが登録されている
- [ ] history:restoreVersionハンドラーが登録されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 履歴一覧取得が動作する
- [ ] バージョン詳細取得が動作する
- [ ] 変換ログ取得が動作する
- [ ] バージョン復元が動作する
- [ ] エラー時にResult型でエラー情報が返却される

### 品質要件

- [ ] TypeScript型エラーがない
- [ ] ESLintエラーがない
- [ ] コンソールにエラーログが適切に出力される

### ドキュメント要件

- [ ] IPCチャンネル名が仕様と一致している

---

## 6. 検証方法

### テストケース

| ケース | 操作                       | 期待結果                         |
| ------ | -------------------------- | -------------------------------- |
| TC-01  | 履歴一覧を取得             | { success: true, data: [...] }   |
| TC-02  | 存在しないファイルIDで取得 | { success: false, error: {...} } |
| TC-03  | バージョン詳細を取得       | { success: true, data: {...} }   |
| TC-04  | バージョン復元を実行       | { success: true, data: {...} }   |

### 検証手順

1. アプリケーション起動時のログを確認
2. DevToolsでネットワーク/IPC通信を監視
3. UIから各機能を実行して結果を確認

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                         |
| ---------------------- | ------ | -------- | ---------------------------- |
| ハンドラー未登録       | 高     | 低       | アプリ起動時のログを確認     |
| HistoryService未初期化 | 高     | 低       | DIコンテナでの依存注入を確認 |
| チャンネル名の不一致   | 高     | 低       | preloadと同一名を使用        |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                       | 内容                      |
| ------------------- | -------------------------------------------------------------------------- | ------------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | IPCチャンネル名・Result型 |
| IPC通信パターン     | `.claude/skills/electron-ui-patterns/SKILL.md`                             | Result型パターン          |

### 関連ドキュメント

| ドキュメント       | パス                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| 統合ガイド         | `docs/30-workflows/history-ui-components/outputs/phase-12/integration-guide.md` |
| HistoryService仕様 | `apps/desktop/src/main/services/HistoryService.ts`                              |

### 参考資料

- [Electron ipcMain](https://www.electronjs.org/docs/latest/api/ipc-main)
- [Electron ipcMain.handle](https://www.electronjs.org/docs/latest/api/ipc-main#ipcmainhandlechannel-listener)

---

## 9. 備考

### IPCチャンネル名一覧

| チャンネル                | メソッド          | 引数                   |
| ------------------------- | ----------------- | ---------------------- |
| history:getFileHistory    | getFileHistory    | fileId, options?       |
| history:getVersionDetail  | getVersionDetail  | conversionId           |
| history:getConversionLogs | getConversionLogs | conversionId, options? |
| history:restoreVersion    | restoreVersion    | fileId, conversionId   |

### 実装時の注意点

1. **エラーハンドリング**: すべてのハンドラーでtry-catchを使用
2. **ログ出力**: エラー時はconsole.errorでログ出力
3. **Result型**: success/errorの形式で統一

### 関連タスク

- **親タスク**: task-req-history-integration-001
- **同時実施**: task-req-history-preload-001（preload側）
