# 統合テスト観点レビュー結果 - スライド出力ディレクトリ設定

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 3                        |
| タスク     | T-03-4                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |
| レビュアー | 自動レビュー             |
| ステータス | 完了                     |

---

## 統合テスト観点チェック

### IPC接続テスト

| テスト観点             | 設計での対応                                 | テスト可能性 | 確認結果   |
| ---------------------- | -------------------------------------------- | ------------ | ---------- |
| getDirectory 疎通      | `slideSettings:getDirectory` チャンネル      | 可能         | [x] 確認済 |
| setDirectory 疎通      | `slideSettings:setDirectory` チャンネル      | 可能         | [x] 確認済 |
| selectDirectory 疎通   | `slideSettings:selectDirectory` チャンネル   | 可能         | [x] 確認済 |
| validateDirectory 疎通 | `slideSettings:validateDirectory` チャンネル | 可能         | [x] 確認済 |
| getAllSettings 疎通    | `slideSettings:getAllSettings` チャンネル    | 可能         | [x] 確認済 |
| 不正チャンネル拒否     | ホワイトリスト外チャンネル                   | 可能         | [x] 確認済 |

**テストシナリオ例**:

```typescript
describe("IPC Channel Integration", () => {
  it("should respond to getAllSettings channel", async () => {
    const result = await window.electronAPI.slideSettings.getAllSettings();
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("outputDirectory");
  });

  it("should reject unknown channels", async () => {
    await expect(
      window.electronAPI.invoke("slideSettings:unknown"),
    ).rejects.toThrow("not allowed");
  });
});
```

---

### データフローテスト

| テスト観点                   | 設計での対応                | テスト可能性 | 確認結果   |
| ---------------------------- | --------------------------- | ------------ | ---------- |
| Renderer → Preload → Main    | safeInvoke経由でIPC呼び出し | 可能         | [x] 確認済 |
| Main → Store → Main          | electron-store読み書き      | 可能         | [x] 確認済 |
| Main → Renderer (レスポンス) | Result<T>型でデータ返却     | 可能         | [x] 確認済 |
| 設定変更の即時反映           | useState + IPC呼び出し      | 可能         | [x] 確認済 |

**テストシナリオ例**:

```typescript
describe("Data Flow Integration", () => {
  it("should persist and retrieve settings", async () => {
    // 1. 設定を保存
    const setResult = await window.electronAPI.slideSettings.setDirectory({
      path: "/test/path",
      autoCreate: true,
    });
    expect(setResult.success).toBe(true);

    // 2. 設定を取得して確認
    const getResult = await window.electronAPI.slideSettings.getDirectory();
    expect(getResult.success).toBe(true);
    expect(getResult.data).toBe("/test/path");
  });
});
```

---

### エラーハンドリングテスト

| テスト観点                 | 設計での対応                      | テスト可能性 | 確認結果   |
| -------------------------- | --------------------------------- | ------------ | ---------- |
| IPC失敗時のRenderer表示    | Result.error でエラー返却         | 可能         | [x] 確認済 |
| バリデーションエラー表示   | ValidationResult.status = "error" | 可能         | [x] 確認済 |
| 設定ファイル破損時リカバリ | デフォルト値へのフォールバック    | 可能         | [x] 確認済 |
| 書き込み権限エラー         | ValidationResult.status = "error" | 可能         | [x] 確認済 |

**テストシナリオ例**:

```typescript
describe("Error Handling Integration", () => {
  it("should return error for invalid path", async () => {
    const result = await window.electronAPI.slideSettings.validateDirectory({
      path: "../invalid",
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe("error");
    expect(result.data.message).toContain("traversal");
  });
});
```

---

### 永続化テスト

| テスト観点             | 設計での対応                 | テスト可能性 | 確認結果   |
| ---------------------- | ---------------------------- | ------------ | ---------- |
| Store読み書きの一貫性  | electron-store + JSON Schema | 可能         | [x] 確認済 |
| アプリ再起動後の永続性 | ファイルシステム永続化       | 手動テスト   | [x] 確認済 |
| スキーマバリデーション | JSON Schemaによる検証        | 可能         | [x] 確認済 |
| マイグレーション       | schemaVersion + migrations   | 可能         | [x] 確認済 |

**テストシナリオ例**:

```typescript
describe("Persistence Integration", () => {
  it("should validate schema on store access", async () => {
    // 不正なスキーマを直接書き込んでテスト
    const store = getSlideSettingsStore();
    expect(() => store.set("outputDirectory", "")).toThrow();
  });
});
```

---

### 状態同期テスト

| テスト観点             | 設計での対応                  | テスト可能性 | 確認結果   |
| ---------------------- | ----------------------------- | ------------ | ---------- |
| 設定変更の即時反映     | useSlideSettings hook状態管理 | 可能         | [x] 確認済 |
| UIコンポーネント更新   | React状態更新                 | 可能         | [x] 確認済 |
| バリデーション結果反映 | ValidationResult状態更新      | 可能         | [x] 確認済 |

**テストシナリオ例**:

```typescript
describe("State Sync Integration", () => {
  it("should update UI after directory change", async () => {
    const { result } = renderHook(() => useSlideSettings());

    await act(async () => {
      await result.current.selectDirectory();
    });

    expect(result.current.settings?.outputDirectory).not.toBeNull();
  });
});
```

---

## テストカバレッジ計画

### ユニットテスト対象

| モジュール             | テスト対象                | 優先度 |
| ---------------------- | ------------------------- | ------ |
| slideSettingsStore     | get/set/default/migration | 高     |
| validation             | validateDirectoryPath     | 高     |
| useSlideSettings       | 状態管理・IPC呼び出し     | 高     |
| SlideDirectorySettings | レンダリング・イベント    | 中     |
| DirectorySelector      | クリック・onChange        | 中     |
| PathDisplay            | 表示・バリデーション      | 中     |

### 統合テスト対象

| テストスイート     | テストケース             | 優先度 |
| ------------------ | ------------------------ | ------ |
| IPC統合            | 全5チャンネルの疎通      | 高     |
| データフロー       | 設定保存→取得の一貫性    | 高     |
| エラーハンドリング | バリデーションエラー表示 | 高     |
| E2E                | 設定画面→ダイアログ→保存 | 中     |

---

## テストダブル設計

### Preload APIモック

```typescript
const mockSlideSettingsAPI: SlideSettingsAPI = {
  getDirectory: vi.fn().mockResolvedValue({
    success: true,
    data: "~/Documents/Slides",
  }),
  setDirectory: vi.fn().mockResolvedValue({ success: true }),
  selectDirectory: vi.fn().mockResolvedValue({
    success: true,
    data: "/selected/path",
  }),
  validateDirectory: vi.fn().mockResolvedValue({
    success: true,
    data: {
      status: "valid",
      message: "有効なディレクトリです",
    },
  }),
  getAllSettings: vi.fn().mockResolvedValue({
    success: true,
    data: {
      outputDirectory: "~/Documents/Slides",
      autoCreateDirectory: true,
      defaultTheme: "kanagawa",
      schemaVersion: 1,
    },
  }),
};

// テストセットアップ
beforeEach(() => {
  vi.stubGlobal("window", {
    electronAPI: {
      slideSettings: mockSlideSettingsAPI,
    },
  });
});
```

---

## 指摘事項

**指摘なし** - 統合テスト観点が十分に設計でカバーされています。

---

## レビュー結果サマリー

| カテゴリ                 | 項目数 | 確認済 | 問題あり |
| ------------------------ | ------ | ------ | -------- |
| IPC接続テスト            | 6      | 6      | 0        |
| データフローテスト       | 4      | 4      | 0        |
| エラーハンドリングテスト | 4      | 4      | 0        |
| 永続化テスト             | 4      | 4      | 0        |
| 状態同期テスト           | 3      | 3      | 0        |

---

## 結論

**判定: PASS**

統合テスト観点が設計で十分にカバーされており、テスト可能性も確保されています。
Phase 4（テスト作成）でこれらの観点に基づいたテストを実装します。
