# IPC Pattern Catalog

## 1. Request-Response Pattern (invoke/handle)

**用途**: 非同期リクエスト-レスポンス通信

**実装**:
```typescript
// Main
ipcMain.handle('channel', async (event, request) => {
  return { success: true, data: result };
});

// Renderer
const response = await window.electronAPI.invoke(request);
```

**適用場面**:
- CRUD操作
- ファイルI/O
- 外部API呼び出し

**メリット**: Promise-based、型安全、エラーハンドリング容易
**デメリット**: 単発リクエストのみ、ストリーミング不可

---

## 2. Fire-and-Forget Pattern (send/on)

**用途**: 単方向イベント送信

**実装**:
```typescript
// Renderer
window.electronAPI.send('channel', data);

// Main
ipcMain.on('channel', (event, data) => {
  // レスポンスなし
});
```

**適用場面**:
- ログ送信
- アナリティクス
- バックグラウンドタスク

**メリット**: シンプル、軽量
**デメリット**: レスポンスなし、エラーハンドリング困難

---

## 3. Event Subscription Pattern

**用途**: Main→Rendererへのリアルタイム通知

**実装**:
```typescript
// Preload
contextBridge.exposeInMainWorld('electronAPI', {
  onEvent: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on('channel', listener);
    return () => ipcRenderer.removeListener('channel', listener);
  },
});

// Renderer
const unsubscribe = window.electronAPI.onEvent((data) => {
  console.log(data);
});
// cleanup
unsubscribe();
```

**適用場面**:
- プログレス通知
- リアルタイム更新
- システムイベント

**メリット**: リアルタイム、push型
**デメリット**: メモリリーク注意、クリーンアップ必須

---

## 4. State Synchronization Pattern

**用途**: 複数Renderer間の状態同期

**実装**:
```typescript
// Main (State Store)
class StateStore {
  private state = {};
  update(newState) {
    this.state = { ...this.state, ...newState };
    this.broadcast();
  }
  broadcast() {
    BrowserWindow.getAllWindows().forEach(w => {
      w.webContents.send('state:update', this.state);
    });
  }
}
```

**適用場面**:
- マルチウィンドウアプリ
- グローバル設定
- ユーザーセッション

**メリット**: 一貫性保証、中央管理
**デメリット**: 複雑度増加、パフォーマンス考慮必要

---

## 5. Stream Pattern

**用途**: 大量データの段階的送信

**実装**:
```typescript
// Main
for await (const chunk of dataStream) {
  window.webContents.send('data:chunk', chunk);
}
window.webContents.send('data:end');
```

**適用場面**:
- ファイル読み込み
- ログストリーミング
- データベースカーソル

**メリット**: メモリ効率、プログレス表示可能
**デメリット**: バックプレッシャー対応必要、複雑

---

## 6. Batch Processing Pattern

**用途**: 複数リクエストのバッチ処理

**実装**:
```typescript
class BatchProcessor {
  private queue = [];
  add(item) {
    this.queue.push(item);
    if (this.queue.length >= 50) this.flush();
  }
  async flush() {
    await processAll(this.queue);
    this.queue = [];
  }
}
```

**適用場面**:
- 大量データ送信
- アナリティクスイベント
- ログ収集

**メリット**: パフォーマンス向上、ネットワーク効率化
**デメリット**: レイテンシ増加、タイミング制御必要

---

## パターン選択ガイド

| 要件                   | 推奨パターン                |
| ---------------------- | --------------------------- |
| レスポンスが必要       | Request-Response            |
| レスポンス不要         | Fire-and-Forget             |
| リアルタイム通知       | Event Subscription          |
| 複数ウィンドウ同期     | State Synchronization       |
| 大量データ             | Stream or Batch Processing  |
| ファイル操作           | Request-Response + Stream   |
| アナリティクス         | Fire-and-Forget or Batch    |
