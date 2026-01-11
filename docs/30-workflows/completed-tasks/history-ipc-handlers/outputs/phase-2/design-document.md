# Phase 2: 統合設計書

## 実行日時

2026-01-11

---

## 概要

履歴/ログ表示UI用IPCハンドラーの詳細設計書。
Phase 1で定義した要件に基づき、実装方針を確定する。

---

## 1. アーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────────────────────────┐
│                     Renderer Process                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  UI Components                                           │    │
│  │    └── historyAPI.getFileHistory()                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ contextBridge (ipcRenderer.invoke)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Preload Script                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  channels.ts - ホワイトリスト検証                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ipcMain.handle
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Main Process                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  historyHandlers.ts                                      │    │
│  │    ├── バリデーション                                    │    │
│  │    ├── Result型変換                                      │    │
│  │    └── エラーハンドリング                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ DI                                │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  HistoryService.ts                                       │    │
│  │    └── ビジネスロジック・DB操作                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ファイル構成

### 対象ファイル

| ファイル                                     | 役割              | 状態       |
| -------------------------------------------- | ----------------- | ---------- |
| `main/ipc/historyHandlers.ts`                | IPCハンドラー実装 | 実装済み   |
| `main/ipc/__tests__/historyHandlers.test.ts` | ユニットテスト    | 要作成     |
| `main/services/HistoryService.ts`            | サービス層        | スタブ済み |
| `main/ipc/index.ts`                          | ハンドラー登録    | 登録済み   |
| `preload/channels.ts`                        | チャンネル定義    | 定義済み   |
| `renderer/components/history/types.ts`       | 共有型定義        | 定義済み   |

### ディレクトリ構造

```
apps/desktop/src/
├── main/
│   ├── ipc/
│   │   ├── historyHandlers.ts       # IPCハンドラー
│   │   ├── __tests__/
│   │   │   └── historyHandlers.test.ts  # テスト
│   │   └── index.ts                 # 登録
│   └── services/
│       └── HistoryService.ts        # サービス層
├── preload/
│   └── channels.ts                  # チャンネル定義
└── renderer/
    └── components/
        └── history/
            └── types.ts             # 型定義
```

---

## 3. IPCチャンネル仕様

### チャンネル一覧

| チャンネル                  | 用途               | パラメータ             |
| --------------------------- | ------------------ | ---------------------- |
| `history:getFileHistory`    | 履歴一覧取得       | fileId, options?       |
| `history:getVersionDetail`  | バージョン詳細取得 | conversionId           |
| `history:getConversionLogs` | 変換ログ取得       | conversionId, options? |
| `history:restoreVersion`    | バージョン復元     | fileId, conversionId   |

### シーケンス図

```
Renderer          Preload          Main              HistoryService
   │                 │               │                      │
   │─ invoke() ────>│               │                      │
   │                 │─ ipcMain.handle() ─>│               │
   │                 │               │─ validate() ──────>│ (validation)
   │                 │               │                     │
   │                 │               │─ service.method() ─>│
   │                 │               │<── Result<T> ───────│
   │                 │<─ Result<T> ──│                     │
   │<─ Result<T> ────│               │                      │
```

---

## 4. インターフェース設計

### registerHistoryHandlers

```typescript
export function registerHistoryHandlers(
  mainWindow: BrowserWindow,
  historyService: HistoryService,
): void;
```

### HistoryService インターフェース

```typescript
export interface HistoryService {
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<VersionHistoryItem>>;

  getVersionDetail(conversionId: string): Promise<VersionDetailData>;

  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<PaginatedResult<ConversionLog>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<VersionHistoryItem>;
}
```

### Result型

```typescript
type Result<T> = SuccessResult<T> | ErrorResult;

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: Error;
}
```

---

## 5. エラーハンドリング設計

### 処理フロー

```
1. IPC受信
    ↓
2. バリデーション → 失敗 → ErrorResult返却
    ↓ 成功
3. try { HistoryService呼び出し }
    ↓ 成功
4. SuccessResult返却

    ↓ 例外
5. catch { normalizeError() → ErrorResult返却 }
```

### エラー分類

| 分類                   | 例           | 対処                 |
| ---------------------- | ------------ | -------------------- |
| バリデーションエラー   | 空のfileId   | 早期リターン         |
| ビジネスロジックエラー | データ未発見 | ErrorResult返却      |
| システムエラー         | DB接続障害   | ログ出力+ErrorResult |

### ユーティリティ関数

```typescript
function success<T>(data: T): Result<T>;
function error<T>(err: Error): Result<T>;
function normalizeError(err: unknown): Error;
function validateNotEmpty(value: string, fieldName: string): void;
```

---

## 6. セキュリティ設計

### Electron セキュリティ設定

| 設定             | 値    | 理由                           |
| ---------------- | ----- | ------------------------------ |
| contextIsolation | true  | preloadスクリプト分離          |
| nodeIntegration  | false | Rendererからの直接アクセス防止 |
| sandbox          | true  | Chromiumサンドボックス         |

### チャンネルホワイトリスト

```typescript
// preload/channels.ts
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 他のチャンネル
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
  IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
  IPC_CHANNELS.HISTORY_RESTORE_VERSION,
];
```

### バリデーション

| 項目           | 検証箇所           | 検証内容             |
| -------------- | ------------------ | -------------------- |
| チャンネル名   | preload            | ホワイトリスト照合   |
| 必須パラメータ | historyHandlers.ts | 非空検証             |
| 型             | TypeScript         | コンパイル時チェック |

---

## 7. テスト設計

### ユニットテスト観点

| テストケース             | 検証内容                    |
| ------------------------ | --------------------------- |
| ハンドラー登録           | 4つのハンドラーが登録される |
| 正常系（各チャンネル）   | SuccessResult返却           |
| 異常系（パラメータ不正） | ErrorResult返却             |
| 異常系（Service例外）    | 例外がErrorResultに変換     |

### モック戦略

```typescript
// HistoryServiceをモック
const mockHistoryService: HistoryService = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

// ipcMain.handleをモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));
```

---

## 8. 依存関係

### 外部依存

| パッケージ | 用途                 |
| ---------- | -------------------- |
| electron   | ipcMain.handle       |
| vitest     | テストフレームワーク |

### 内部依存

```
historyHandlers.ts
    ├── electron (ipcMain)
    ├── preload/channels.ts (IPC_CHANNELS)
    └── renderer/components/history/types.ts (型定義)

HistoryService.ts
    └── renderer/components/history/types.ts (型定義)
```

---

## 9. 実装状況サマリー

| コンポーネント          | 状態          | 備考                   |
| ----------------------- | ------------- | ---------------------- |
| historyHandlers.ts      | ✅ 実装済み   | 4ハンドラー登録        |
| HistoryService.ts       | ✅ スタブ済み | CONV-05-02で本実装     |
| channels.ts             | ✅ 定義済み   | ホワイトリスト登録済み |
| types.ts                | ✅ 定義済み   | 全型定義完了           |
| historyHandlers.test.ts | ⏳ 未作成     | Phase 4で作成          |

---

## 10. 次Phaseへの引き継ぎ

### Phase 3（設計レビュー）での確認事項

1. IPCチャンネル仕様の妥当性
2. Result型パターンの適切性
3. エラーハンドリング戦略の十分性
4. セキュリティ設計の完全性

### Phase 4（テスト作成）での作業

1. `historyHandlers.test.ts` の作成
2. モックの設定
3. 正常系・異常系テストの実装
4. カバレッジ目標: Line 80%以上

---

## Phase 2 実行記録

### 実行タスク

- タスク1（ファイル構成の設計）: ✅ 完了 - `outputs/phase-2/file-structure.md`
- タスク2（関数インターフェースの設計）: ✅ 完了 - `outputs/phase-2/interface-design.md`
- タスク3（エラーハンドリング設計）: ✅ 完了 - `outputs/phase-2/error-handling-design.md`
- タスク4（設計書の統合）: ✅ 完了 - `outputs/phase-2/design-document.md`

### 発見事項

- 良かった点: 既存実装が規約に準拠しており、設計の大部分は確認作業となった
- 問題点: 特になし
- 改善提案: ログ出力の追加を検討（現状は最小限のログのみ）

### 次Phase への引き継ぎ事項

- テストファイルの作成が必要（Phase 4）
- 既存実装のコードカバレッジ測定が必要（Phase 7）
