# 統合テスト設計書 - 履歴UIコンポーネント統合

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| 作成日     | 2026-01-11 |
| Phase      | 4          |
| ステータス | 完了       |

---

## 1. 統合テスト概要

### 1.1 テスト範囲

```
┌─────────────────────────────────────────────────────────────┐
│                    統合テスト対象範囲                        │
│                                                             │
│  [HistoryPage] ←→ [useVersionHistory] ←→ [window.historyAPI]│
│        ↓                                        ↓           │
│  [VersionHistory]                          [preload]        │
│  [VersionDetail]                               ↓           │
│  [RestoreDialog]                       [historyHandlers]    │
│                                                ↓           │
│                                        [HistoryService]     │
│                                             (モック)        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 テストカテゴリ

| カテゴリ           | 検証内容                                |
| ------------------ | --------------------------------------- |
| IPC接続テスト      | 4チャンネルの疎通・レスポンス形式       |
| データフローテスト | Renderer→preload→Main→Service→DBの往復  |
| エラーハンドリング | IPC障害時のフロントエンド表示・リトライ |
| 状態同期テスト     | 復元後のUI更新                          |

---

## 2. IPC接続テスト

### 2.1 テストシナリオ

| シナリオID | チャンネル                | テスト内容                 |
| ---------- | ------------------------- | -------------------------- |
| IPC-01     | history:getFileHistory    | 正常レスポンス形式の検証   |
| IPC-02     | history:getVersionDetail  | 正常レスポンス形式の検証   |
| IPC-03     | history:getConversionLogs | 正常レスポンス形式の検証   |
| IPC-04     | history:restoreVersion    | 正常レスポンス形式の検証   |
| IPC-05     | 全チャンネル              | エラーレスポンス形式の検証 |

### 2.2 検証項目

```typescript
// レスポンス形式
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: Error;
}
```

---

## 3. データフローテスト

### 3.1 テストシナリオ

| シナリオID | フロー             | テスト内容                        |
| ---------- | ------------------ | --------------------------------- |
| DF-01      | 履歴一覧取得       | HistoryPage → API → UI更新        |
| DF-02      | バージョン詳細取得 | クリック → API → 詳細パネル更新   |
| DF-03      | ログ取得＋フィルタ | フィルタ変更 → API → ログ一覧更新 |
| DF-04      | バージョン復元     | 確認 → API → 履歴一覧リフレッシュ |

### 3.2 データフロー詳細

```
[履歴一覧取得フロー]
HistoryPage.useEffect
    ↓
useVersionHistory.fetchHistory
    ↓
window.historyAPI.getFileHistory(fileId, options)
    ↓
preload: safeInvoke('history:getFileHistory', ...)
    ↓
Main: ipcMain.handle('history:getFileHistory', ...)
    ↓
historyService.getFileHistory(fileId, options)
    ↓ (モック)
{ items: [...], total: N, hasMore: boolean }
    ↓
{ success: true, data: { items, total, hasMore } }
    ↓
useVersionHistory.setHistory(items)
    ↓
HistoryPage: <VersionHistory history={history} />
```

---

## 4. エラーハンドリングテスト

### 4.1 テストシナリオ

| シナリオID | エラー種別           | テスト内容                                    |
| ---------- | -------------------- | --------------------------------------------- |
| ERR-01     | historyAPI未定義     | エラーメッセージ「History API not available」 |
| ERR-02     | ネットワークエラー   | エラーメッセージ + 再試行ボタン               |
| ERR-03     | サービス例外         | エラーメッセージ表示                          |
| ERR-04     | バリデーションエラー | 入力検証エラーメッセージ                      |
| ERR-05     | 復元失敗             | ダイアログ内エラー表示                        |

### 4.2 リトライ検証

```typescript
// リトライシナリオ
it('再試行ボタンでデータ再取得される', async () => {
  // 1回目: エラー
  mockHistoryAPI.getFileHistory.mockResolvedValueOnce({
    success: false,
    error: new Error('Network Error'),
  });
  // 2回目: 成功
  mockHistoryAPI.getFileHistory.mockResolvedValueOnce({
    success: true,
    data: { items: [...], total: 1, hasMore: false },
  });

  render(<HistoryPage />);

  // エラー表示を確認
  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // 再試行ボタンをクリック
  fireEvent.click(screen.getByText('再試行'));

  // データ表示を確認
  await waitFor(() => {
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
```

---

## 5. 状態同期テスト

### 5.1 テストシナリオ

| シナリオID | 操作           | 検証内容                                |
| ---------- | -------------- | --------------------------------------- |
| SYNC-01    | バージョン復元 | 履歴一覧が自動リフレッシュされる        |
| SYNC-02    | バージョン復元 | 復元後のバージョンがisLatest=trueになる |
| SYNC-03    | ログフィルタ   | フィルタ変更でログ一覧が更新される      |

### 5.2 復元後の状態同期

```typescript
// 復元後の状態同期テスト
it("復元後に履歴一覧がリフレッシュされる", async () => {
  const originalVersion = { conversionId: "v2", version: 2, isLatest: false };
  const restoredVersion = { conversionId: "v2", version: 2, isLatest: true };

  mockHistoryAPI.restoreVersion.mockResolvedValue({
    success: true,
    data: restoredVersion,
  });

  // 復元実行
  // ...

  // 履歴一覧のリフレッシュを確認
  await waitFor(() => {
    expect(mockHistoryAPI.getFileHistory).toHaveBeenCalledTimes(2); // 初回 + リフレッシュ
  });
});
```

---

## 6. モック設計

### 6.1 historyAPIモック

```typescript
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  window.historyAPI = mockHistoryAPI;
});

afterEach(() => {
  window.historyAPI = undefined;
});
```

### 6.2 HistoryServiceモック

```typescript
const mockHistoryService = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};
```

---

## 確認結果

- [x] IPC接続テストシナリオが定義されている
- [x] データフローテストシナリオが定義されている
- [x] エラーハンドリングテストシナリオが定義されている
- [x] 状態同期テストシナリオが定義されている
- [x] モック設計が完了している

---

## 変更履歴

| Version | Date       | Changes       |
| ------- | ---------- | ------------- |
| 1.0.0   | 2026-01-11 | Phase 4で作成 |
