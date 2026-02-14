# Phase 2: 設計ドキュメント - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| Phase      | 2                                 |
| 実行日     | 2026-02-14                        |
| ステータス | 完了                              |

---

## Task 1: アプローチ比較評価

### A案: 既存ハンドラ削除後に再登録

| 評価軸             | 評価 | 理由                                                                |
| ------------------ | ---- | ------------------------------------------------------------------- |
| 二重登録解消       | 確実 | removeHandler()で解除後に再登録するため二重登録は発生しない         |
| mainWindow参照更新 | 確実 | 再登録時に新しいmainWindowが引数として渡される                      |
| 実装複雑度         | 中   | IPC_CHANNELSから全チャンネル名を取得してremoveHandler()する関数追加 |
| セキュリティリスク | 低   | unregister→registerは同期的に連続実行、隙間は事実上ない             |
| 既存コードへの影響 | 小   | index.tsとipc/index.tsの2ファイルのみ修正                           |
| テスタビリティ     | 高   | unregister/registerの単体テストが容易                               |

### B案: 登録済みフラグでガード

| 評価軸             | 評価   | 理由                                                |
| ------------------ | ------ | --------------------------------------------------- |
| 二重登録解消       | 確実   | フラグで2回目以降をスキップ                         |
| mainWindow参照更新 | 不可能 | 2回目の呼び出しがスキップされるため参照更新されない |
| 実装複雑度         | 低     | フラグ1つの追加のみ                                 |
| セキュリティリスク | なし   | ハンドラは常に登録済み                              |
| 既存コードへの影響 | 最小   | ipc/index.tsの先頭にフラグチェックのみ              |
| テスタビリティ     | 高     | フラグ状態テストのみ                                |

**不採用理由**: FR-1.3（新ウィンドウへの参照更新）を満たせない

### C案: activateではIPC再登録しない

| 評価軸             | 評価   | 理由                                               |
| ------------------ | ------ | -------------------------------------------------- |
| 二重登録解消       | 確実   | 再登録自体を行わない                               |
| mainWindow参照更新 | 条件付 | 全ハンドラのmainWindow参照方式を変更する必要がある |
| 実装複雑度         | 高     | 15個のハンドラ登録関数の引数・内部実装を変更       |
| セキュリティリスク | なし   | ハンドラは常に登録済み                             |
| 既存コードへの影響 | 大     | 約15個のハンドラファイル + テストの大規模修正      |
| テスタビリティ     | 中     | 参照の動的解決テストが複雑                         |

**不採用理由**: 影響範囲が過大（約15ファイルの大規模修正 + テスト修正）

---

## Task 2: アプローチ選定

### 選定結果: A案（既存ハンドラ削除後に再登録）

### 要件マッピング

| 観点                       | A案    | B案            | C案    |
| -------------------------- | ------ | -------------- | ------ |
| FR-1.1（例外解消）         | 満たす | 満たす         | 満たす |
| FR-1.2（IPC正常動作）      | 満たす | 満たす         | 条件付 |
| FR-1.3（mainWindow更新）   | 満たす | **満たさない** | 条件付 |
| FR-2.1（二重登録防止）     | 満たす | 満たす         | 満たす |
| FR-2.2（on()二重防止）     | 満たす | N/A            | 満たす |
| FR-2.3（全チャンネル解除） | 満たす | N/A            | N/A    |
| 既存テスト影響             | なし   | なし           | 大     |

---

## Task 3: 修正対象ファイルのインターフェース設計

### ファイル1: `apps/desktop/src/main/ipc/index.ts`

#### 新規関数: `unregisterAllIpcHandlers()`

```typescript
/**
 * 全 IPC ハンドラを解除する
 * activate イベントで registerAllIpcHandlers() を再実行する前に呼び出す
 *
 * @description
 * - IPC_CHANNELS 定数から全チャンネル名を取得して removeHandler() を実行
 * - ipcMain.removeHandler() は未登録チャンネルでもエラーを出さないため安全
 * - ipcMain.removeAllListeners() で on() リスナーも合わせてクリーンアップ
 */
export function unregisterAllIpcHandlers(): void {
  const allChannels = Object.values(IPC_CHANNELS);
  for (const channel of allChannels) {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  }
}
```

### ファイル2: `apps/desktop/src/main/index.ts`

#### 修正箇所: activate イベントハンドラ

```typescript
// 修正前（行274-278）
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    registerAllIpcHandlers(mainWindowRef);
  }
});

// 修正後
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers();
    mainWindowRef = createWindow();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

**変更点**:

1. `import` に `unregisterAllIpcHandlers` を追加
2. `registerAllIpcHandlers()` の前に `unregisterAllIpcHandlers()` を呼び出す
3. `unregisterAllIpcHandlers()` は `createWindow()` の前に呼び出す（ウィンドウ作成前に解除）

---

## Task 4: unregisterAllIpcHandlers() の詳細設計

### 処理フロー

```
unregisterAllIpcHandlers()
  │
  ├─ Object.values(IPC_CHANNELS) で全チャンネル名を取得（170+チャンネル）
  │
  ├─ 各チャンネルに対して:
  │   ├─ ipcMain.removeHandler(channel)       ← handle()で登録されたハンドラ解除
  │   └─ ipcMain.removeAllListeners(channel)  ← on()で登録されたリスナー解除
  │
  └─ 完了（全チャンネル走査済み）
```

### IPC_CHANNELS の網羅性

`IPC_CHANNELS` はプロジェクトの全 IPC チャンネル名を一元管理する定数オブジェクト。セキュリティ原則によりハードコード文字列は禁止されているため、`Object.values(IPC_CHANNELS)` で全チャンネルを走査すれば網羅的に解除できる。

### setupThemeWatcher の二重呼び出し対策

`setupThemeWatcher()` は `nativeTheme.on("updated", handler)` でリスナーを登録する。`registerAllIpcHandlers()` 内で呼ばれるため、activate で再登録すると二重呼び出しになる。

**対策**: `setupThemeWatcher()` は unsubscribe 関数を返すため、再登録前に呼び出す必要がある。ただし、`setupThemeWatcher()` は `BrowserWindow.getAllWindows()` コールバックで動的にウィンドウを取得するため、ウィンドウ参照の問題は発生しない。`nativeTheme` のリスナーは `ipcMain` とは別系統のため、`unregisterAllIpcHandlers()` では解除されない。

**対応方針**: `registerAllIpcHandlers()` 内で `setupThemeWatcher()` の戻り値（unsubscribe関数）をモジュールスコープで保持し、再登録時に呼び出してから再設定する。

```typescript
let themeWatcherUnsubscribe: (() => void) | null = null;

export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // ... 他のハンドラ登録 ...

  // Theme watcher: 再登録時は既存のリスナーを解除してから再設定
  if (themeWatcherUnsubscribe) {
    themeWatcherUnsubscribe();
  }
  themeWatcherUnsubscribe = setupThemeWatcher(nativeTheme, () =>
    BrowserWindow.getAllWindows(),
  );
}
```

---

## エッジケース設計

### 1. activate が連続で発火した場合

`BrowserWindow.getAllWindows().length === 0` のガードがあるため、ウィンドウが存在する間は再登録されない。ウィンドウが閉じられた直後に再度 activate が発火した場合も、unregister → register の順序で安全に処理される。

### 2. Supabase 条件分岐ハンドラ

`registerAuthHandlers()` / `registerAuthFallbackHandlers()` は Supabase 設定有無で排他的に登録される。`unregisterAllIpcHandlers()` は全チャンネルを走査するため、どちらのパスで登録されたハンドラも確実に解除される。

### 3. サービスインスタンスの再生成

`registerAllIpcHandlers()` 内で `SkillService`, `AuthModeService` 等のサービスインスタンスが再生成される。これは設計上問題ない（各サービスは外部リソースから状態を復元できる）。

---

## セキュリティ設計

### 4層防御の維持確認

| 防御層                 | 修正による影響 | 理由                                             |
| ---------------------- | -------------- | ------------------------------------------------ |
| L1: ホワイトリスト     | 影響なし       | IPC_CHANNELS 定数は変更しない                    |
| L2: Sender検証         | 影響なし       | 各ハンドラ内の検証ロジックは変更しない           |
| L3: 引数バリデーション | 影響なし       | 各ハンドラ内のバリデーションロジックは変更しない |
| L4: エラーサニタイズ   | 影響なし       | エラーレスポンスの形式は変更しない               |

### unregister → register 間のセキュリティ

- 同期的に連続実行されるため、Renderer からのリクエストが処理される可能性は事実上ない
- 仮に隙間にリクエストが到達した場合、未登録のハンドラにはエラーが返される（フェイルセキュア）

---

## 完了条件チェック

- [x] A/B/C 案の比較評価が完了し、全評価軸の根拠が記載されている
- [x] 選定理由が FR-1.1 ~ FR-2.3 の要件マッピングで説明されている
- [x] `unregisterAllIpcHandlers()` の関数シグネチャとロジックが設計されている
- [x] `apps/desktop/src/main/index.ts` の activate ハンドラ修正内容が明確である
- [x] `IPC_CHANNELS` の網羅性確認方針が記載されている
- [x] 4層防御への影響分析が完了し、全レイヤーで「影響なし」が確認されている
- [x] エッジケース（activate 連続発火、条件分岐ハンドラ、setupThemeWatcher 二重呼出）が分析されている
- [x] 本Phase内の全タスクを100%実行完了
