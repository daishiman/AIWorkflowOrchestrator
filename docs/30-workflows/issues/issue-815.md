# [#815] "[UT-FIX-IPC-HANDLER-DOUBLE-REG-001] UT"

## メタ情報

```yaml
task_id: UT-FIX-IPC-HANDLER-DOUBLE-REG-001
task_name: UT
category: -
target_feature: -
priority: 高
scale: Phase 1-13 完全実行
status: 未実施
source_phase: -
created_date: 2026-02-13
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-fix-ipc-handler-double-reg-001.md
```

| 項目       | 内容                |
| ---------- | ------------------- |
| 優先度     | 高                  |
| 規模       | Phase 1-13 完全実行 |
| ステータス | 未実施              |

---

## 1. なぜこのタスクが必要か（Why）

`app.on("activate")` イベント（macOS でドックアイコンクリック時）で `registerAllIpcHandlers()` が再実行され、`ipcMain.handle()` が同一チャンネルに2回目のハンドラ登録を試みて例外が発生する。

**エラーメッセージ**:

```
Uncaught Exception: Error: Attempted to register a second handler for 'file:get-tree'
  at IpcMainImpl.handle
  at registerFileHandlers
  at registerAllIpcHandlers
```

**根本原因**: `apps/desktop/src/main/index.ts` の `app.on("activate")` コールバックが `registerAllIpcHandlers(mainWindowRef)` を呼び出すが、`ipcMain.handle()` は同一チャンネルへの重複登録を許可しない。既存ハンドラの `removeHandler()` が呼ばれないまま再登録が試行される。

**影響範囲**:

- macOS でのアプリ再アクティブ化時にクラッシュ
- 全 IPC チャンネル（file, store, dashboard, graph, ai, theme, skill）が影響対象

---

## 2. 何を達成するか（What）

### 受入基準

1. `app.on("activate")` でウィンドウ再作成時に IPC ハンドラが正常に登録される
2. 既存ハンドラが登録済みの場合、二重登録例外が発生しない
3. macOS ドックアイコンクリックでアプリが正常に復帰する
4. ウィンドウが存在する場合は不要な再登録が発生しない

### スコープ外

- IPC ハンドラのロジック変更
- 新規 IPC チャンネルの追加

---

## 3. どう実現するか（How）

### 修正対象ファイル

| ファイル                             | 修正内容                                                      |
| ------------------------------------ | ------------------------------------------------------------- |
| `apps/desktop/src/main/index.ts`     | `activate` イベントでの IPC ハンドラ再登録ロジック修正        |
| `apps/desktop/src/main/ipc/index.ts` | `unregisterAllIpcHandlers()` 関数の追加（または再登録ガード） |

### 実装アプローチ

#### A案: 既存ハンドラを削除してから再登録（推奨）

```typescript
// ipc/index.ts
export function unregisterAllIpcHandlers(): void {
  // 全チャンネルの既存ハンドラを削除
  Object.values(IPC_CHANNELS).forEach((channel) => {
    try {
      ipcMain.removeHandler(channel);
    } catch {
      // ハンドラが未登録の場合は無視
    }
  });
}

// main/index.ts
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    unregisterAllIpcHandlers();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

#### B案: 登録済みフラグでガード

```typescript
// main/index.ts
let ipcHandlersRegistered = false;

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    if (!ipcHandlersRegistered) {
      registerAllIpcHandlers(mainWindowRef);
      ipcHandlersRegistered = true;
    }
  }
});
```

#### C案: activate では IPC 再登録しない

```typescript
// main/index.ts
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    // IPC ハンドラは app.whenReady() で一度だけ登録済み
    // ipcMain.handle() はグローバルなので再登録不要
  }
});
```

### 設計判断のポイント

- `ipcMain.handle()` はウィンドウではなくプロセスレベルで登録される
- ウィンドウを閉じてもハンドラは残る → C案が最もシンプル
- ただしハンドラ内で `mainWindow` 参照を更新する必要がある場合はA案
- `mainWindowRef` をクロージャで参照している場合、新ウィンドウへの参照更新が必要

---

## 4. 実行手順

### Phase 4: テスト作成

- `registerAllIpcHandlers` の二重呼び出しテスト
- `app.on("activate")` シミュレーションテスト
- ハンドラ登録状態の検証テスト

### Phase 5: 実装

1. `mainWindowRef` の参照方式を確認（クロージャ vs グローバル変数）
2. 選択したアプローチに基づいて修正
3. activate イベントでのウィンドウ参照更新ロジックを確認

### Phase 6-9: テスト拡充・品質検証

- 既存 IPC テストの動作確認
- `pnpm typecheck && pnpm lint && pnpm test` 全パス

---

## 5. 完了条件

- [ ] `app.on("activate")` で IPC ハンドラ二重登録例外が発生しない
- [ ] macOS ドックアイコンクリックでアプリが正常に復帰する
- [ ] 全 IPC チャンネルが正常に応答する
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] `pnpm test` PASS（関連テスト全パス）

---

## 6. 検証方法

### 自動テスト

```bash
cd apps/desktop && pnpm vitest run src/main/__tests__/
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/
```

### 手動テスト（macOS）

1. アプリを起動する
2. ⌘+Q でアプリを終了しない状態でウィンドウを閉じる（⌘+W）
3. ドックアイコンをクリックしてアプリを再アクティブ化する
4. エラーなくウィンドウが復帰する
5. Agent ビューでスキル一覧が正常に表示される
6. DevTools コンソールに `Attempted to register a second handler` エラーが出ない

---

## 7. リスク・注意事項

- **P5パターン**: リスナー二重登録の既知パターンと同種の問題
- **mainWindow 参照**: ハンドラ内で `mainWindow` を参照している場合、新ウィンドウ作成後に参照を更新する必要がある
- **テスト環境**: Electron の `app` イベントはユニットテストで再現が難しいため、手動テストの重要性が高い

---

## 8. 参照情報

| 種別             | パス                                                        |
| ---------------- | ----------------------------------------------------------- |
| エラー発生箇所   | `apps/desktop/src/main/index.ts:277`                        |
| IPC 登録関数     | `apps/desktop/src/main/ipc/index.ts:63-70`                  |
| ファイルハンドラ | `apps/desktop/src/main/ipc/fileHandlers.ts`                 |
| 関連Pitfall      | `.claude/rules/06-known-pitfalls.md` P5（リスナー二重登録） |

---

## 9. 備考

- Electron の `ipcMain.handle()` はプロセスレベルでハンドラを登録するため、ウィンドウのライフサイクルとは独立
- `ipcMain.on()` は重複登録可能だが、`ipcMain.handle()` は不可。この非対称性がバグの原因
- C案（再登録しない）が最もシンプルだが、ハンドラ内で `mainWindow` 参照を使用している場合は参照更新メカニズムが別途必要
