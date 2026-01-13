# preloadスクリプトへのhistoryAPI追加 - タスク指示書

## メタ情報

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| タスクID         | task-req-history-preload-001               |
| タスク名         | preloadスクリプトへのhistoryAPI追加        |
| 分類             | 要件                                       |
| 対象機能         | 履歴/ログ表示UI                            |
| 優先度           | 高                                         |
| 見積もり規模     | 小規模（S）                                |
| ステータス       | **完了**                                   |
| 発見元           | Phase 11（手動テスト検証）                 |
| 発見日           | 2026-01-10                                 |
| 完了日           | 2026-01-13                                 |
| 実装ドキュメント | `docs/30-workflows/history-preload-setup/` |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ElectronアプリケーションではセキュリティのためcontextIsolationが有効になっており、レンダラープロセスからメインプロセスのAPIに直接アクセスできない。CONV-05-03で開発した履歴UIコンポーネントは`window.historyAPI`を通じてIPC通信を行うが、現在このAPIはpreloadスクリプトで公開されていない。

### 1.2 問題点・課題

- preloadスクリプトでhistoryAPIを公開しないと、UIコンポーネントからIPC通信ができない
- `window.historyAPI`がundefinedとなり、コンポーネントがエラー状態になる
- 履歴機能が完全に動作しない

### 1.3 放置した場合の影響

- 履歴/ログ表示機能が動作しない
- ユーザーがバージョン履歴を確認できない
- 復元機能が利用できない

---

## 2. 何を達成するか（What）

### 2.1 目的

preloadスクリプトでhistoryAPIをwindowオブジェクトに公開し、レンダラープロセスからIPC通信を可能にする。

### 2.2 最終ゴール

`window.historyAPI`が利用可能になり、以下の4メソッドが呼び出せる状態：

- getFileHistory
- getVersionDetail
- getConversionLogs
- restoreVersion

### 2.3 スコープ

#### 含むもの

- contextBridge.exposeInMainWorldの設定
- 4つのAPIメソッドの公開
- TypeScript型定義の追加

#### 含まないもの

- 新しいAPIメソッドの追加
- IPCハンドラーの実装（task-req-history-ipc-001で実施）

### 2.4 成果物

| 成果物         | 説明             | 配置先                                |
| -------------- | ---------------- | ------------------------------------- |
| preload.ts更新 | historyAPI公開   | apps/desktop/src/main/preload.ts      |
| global.d.ts    | Window型拡張定義 | apps/desktop/src/renderer/global.d.ts |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-05-03（履歴UIコンポーネント）が完了していること
- task-req-history-integration-001と同時に実施

### 3.2 依存タスク

| タスク                           | 説明                   | 関係     |
| -------------------------------- | ---------------------- | -------- |
| task-req-history-integration-001 | 統合タスク（親タスク） | 親タスク |
| task-req-history-ipc-001         | IPCハンドラー登録      | 同時実施 |

### 3.3 必要な知識・スキル

- Electron contextBridge API
- Electron ipcRenderer API
- TypeScriptのグローバル型定義（declare global）

### 3.4 推奨アプローチ

1. 既存のpreload.tsを確認
2. historyAPIオブジェクトを定義
3. contextBridge.exposeInMainWorldで公開
4. 型定義を追加
5. DevToolsで公開を確認

---

## 4. 実行手順

### Phase 1: 設計確認

#### 使用スキル

| スキル名             | パス                                           | 選定理由                                 |
| -------------------- | ---------------------------------------------- | ---------------------------------------- |
| electron-ui-patterns | `.claude/skills/electron-ui-patterns/SKILL.md` | preload・contextIsolation（Trigger一致） |

#### 目的

システム仕様とAPIインターフェースを確認する。

#### 完了条件

- [ ] ui-ux-history-panel.mdのHistoryAPI仕様を確認
- [ ] IPCチャンネル名を確認
- [ ] 型定義を確認

### Phase 2: 実装

#### 実装コード

**preload.ts への追加:**

```typescript
import { contextBridge, ipcRenderer } from "electron";

// HistoryAPI型定義
interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface LogFilterOptions extends PaginationOptions {
  level?: "info" | "warn" | "error" | "debug";
}

// historyAPIの公開
contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    ipcRenderer.invoke("history:getFileHistory", fileId, options),

  getVersionDetail: (conversionId: string) =>
    ipcRenderer.invoke("history:getVersionDetail", conversionId),

  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    ipcRenderer.invoke("history:getConversionLogs", conversionId, options),

  restoreVersion: (fileId: string, conversionId: string) =>
    ipcRenderer.invoke("history:restoreVersion", fileId, conversionId),
});
```

**global.d.ts の追加/更新:**

```typescript
import type {
  VersionHistoryItem,
  ConversionLog,
  PaginatedResult,
  Result,
} from "./components/history/types";

interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  getVersionDetail(
    conversionId: string,
  ): Promise<Result<{ version: VersionHistoryItem; logs: ConversionLog[] }>>;

  getConversionLogs(
    conversionId: string,
    options?: { limit?: number; offset?: number; level?: string },
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}

declare global {
  interface Window {
    historyAPI?: HistoryAPI;
  }
}

export {};
```

#### 完了条件

- [ ] preload.tsにhistoryAPIが追加されている
- [ ] global.d.tsにWindow型拡張が追加されている
- [ ] TypeScript型エラーがない

### Phase 3: 検証

#### 検証手順

1. アプリケーションを起動
2. DevToolsコンソールを開く
3. `window.historyAPI`を入力して確認
4. `typeof window.historyAPI.getFileHistory`が`function`であることを確認

#### 完了条件

- [ ] window.historyAPIがundefinedでない
- [ ] getFileHistoryが関数として存在
- [ ] getVersionDetailが関数として存在
- [ ] getConversionLogsが関数として存在
- [ ] restoreVersionが関数として存在

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] window.historyAPIがundefinedでない
- [ ] getFileHistoryが呼び出せる
- [ ] getVersionDetailが呼び出せる
- [ ] getConversionLogsが呼び出せる
- [ ] restoreVersionが呼び出せる

### 品質要件

- [ ] TypeScript型エラーがない
- [ ] ESLintエラーがない
- [ ] contextIsolationが有効な状態で動作

### ドキュメント要件

- [ ] 型定義が追加されている

---

## 6. 検証方法

### テストケース

| ケース | 操作                                      | 期待結果               |
| ------ | ----------------------------------------- | ---------------------- |
| TC-01  | DevToolsで`window.historyAPI`を確認       | オブジェクトが存在     |
| TC-02  | `typeof window.historyAPI.getFileHistory` | `function`が返る       |
| TC-03  | webPreferences.contextIsolation確認       | `true`が設定されている |

### 検証手順

```javascript
// DevToolsコンソールで実行
console.log(window.historyAPI); // オブジェクトが表示される
console.log(typeof window.historyAPI.getFileHistory); // "function"
console.log(Object.keys(window.historyAPI)); // ["getFileHistory", "getVersionDetail", "getConversionLogs", "restoreVersion"]
```

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                        |
| -------------------- | ------ | -------- | --------------------------- |
| APIが公開されない    | 高     | 中       | webPreferences設定を確認    |
| 型定義の不一致       | 中     | 中       | types.tsとの整合性を確認    |
| チャンネル名の不一致 | 高     | 低       | IPCハンドラーと同一名を使用 |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                       | 内容                          |
| ------------------- | -------------------------------------------------------------------------- | ----------------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | HistoryAPI仕様・型定義        |
| IPC通信パターン     | `.claude/skills/electron-ui-patterns/SKILL.md`                             | API利用可能性チェックパターン |

### 関連ドキュメント

| ドキュメント         | パス                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| 統合ガイド           | `docs/30-workflows/history-ui-components/outputs/phase-12/integration-guide.md` |
| コンポーネント型定義 | `apps/desktop/src/renderer/components/history/types.ts`                         |

### 参考資料

- [Electron contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
- [Electron ipcRenderer](https://www.electronjs.org/docs/latest/api/ipc-renderer)

---

## 9. 備考

### 実装時の注意点

1. **セキュリティ**: contextIsolationは必ず有効にする
2. **型安全性**: historyAPIをオプショナル（?）として定義し、存在確認を行う
3. **エラーハンドリング**: IPC通信の結果はResult型で返却される

### 関連タスク

- **親タスク**: task-req-history-integration-001
- **同時実施**: task-req-history-ipc-001（IPCハンドラー側）

### 補足事項

- preload.tsの変更後はアプリケーションの再起動が必要
- BrowserWindowのwebPreferencesで`preload`パスが正しく設定されていることを確認
