# 統合テスト観点レビュー結果

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 3                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. IPC統合テスト観点

### 1.1 Main → Renderer 権限リクエスト送信テスト

| テストID | テスト観点                             | 設計での対応箇所                   | 実装可能 |
| -------- | -------------------------------------- | ---------------------------------- | -------- |
| IT-001   | リクエストがRenderer側で受信される     | skill-api-interface-design.md §4.1 | ✅       |
| IT-002   | SkillPermissionRequest型のデータを受信 | type-definitions-design.md §3.1    | ✅       |
| IT-003   | コールバック関数が正しく呼び出される   | ipc-communication-design.md §6.1   | ✅       |
| IT-004   | 複数リクエストが順次処理される         | component-integration-design.md §3 | ✅       |

**テストシナリオ例**:

```typescript
it("should receive permission request from Main Process", async () => {
  const callback = vi.fn();
  const cleanup = skillAPI.onPermission(callback);

  // Main Processからのリクエストをシミュレート
  ipcRenderer.emit("skill:permission:request", null, mockRequest);

  expect(callback).toHaveBeenCalledWith(mockRequest);
  cleanup();
});
```

### 1.2 Renderer → Main 権限応答送信テスト

| テストID | テスト観点                 | 設計での対応箇所                   | 実装可能 |
| -------- | -------------------------- | ---------------------------------- | -------- |
| IT-005   | 許可応答が正しく送信される | skill-api-interface-design.md §4.2 | ✅       |
| IT-006   | 拒否応答が正しく送信される | skill-api-interface-design.md §4.2 | ✅       |
| IT-007   | requestIdが一致する        | type-definitions-design.md §3.2    | ✅       |
| IT-008   | rememberChoiceが反映される | component-integration-design.md §4 | ✅       |

**テストシナリオ例**:

```typescript
it("should send approval response to Main Process", async () => {
  const mockInvoke = vi.fn().mockResolvedValue(true);
  ipcRenderer.invoke = mockInvoke;

  await skillAPI.respondPermission({
    requestId: "req-1",
    approved: true,
    rememberChoice: false,
  });

  expect(mockInvoke).toHaveBeenCalledWith(
    "skill:permission:respond",
    expect.objectContaining({
      requestId: "req-1",
      approved: true,
    }),
  );
});
```

### 1.3 タイムアウト時の動作テスト

| テストID | テスト観点                             | 設計での対応箇所                   | 実装可能 |
| -------- | -------------------------------------- | ---------------------------------- | -------- |
| IT-009   | タイムアウト時にMain側でapproved:false | ipc-communication-design.md §3.2   | ✅       |
| IT-010   | Renderer側は特別な処理なし             | component-integration-design.md §7 | ✅       |

**備考**: タイムアウト処理はMain Process（PermissionResolver）側で実装済み（TASK-3-1-C）

---

## 2. UI統合テスト観点

### 2.1 PermissionDialog表示テスト

| テストID | テスト観点                           | 設計での対応箇所                   | 実装可能 |
| -------- | ------------------------------------ | ---------------------------------- | -------- |
| IT-011   | 権限リクエスト受信時にダイアログ表示 | component-integration-design.md §5 | ✅       |
| IT-012   | ツール名が正しく表示される           | PermissionDialog既存実装           | ✅       |
| IT-013   | 引数がJSON形式で表示される           | PermissionDialog既存実装           | ✅       |
| IT-014   | 理由説明が表示される                 | PermissionDialog既存実装           | ✅       |
| IT-015   | ダイアログがrole="alertdialog"を持つ | PermissionDialog既存実装           | ✅       |

**テストシナリオ例**:

```typescript
it("should display PermissionDialog when request received", async () => {
  render(<SkillStreamDisplay />);

  act(() => {
    mockOnPermissionCallback(mockRequest);
  });

  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(screen.getByText("Bash")).toBeInTheDocument();
  expect(screen.getByText(/echo test/)).toBeInTheDocument();
});
```

### 2.2 ユーザー操作（許可/拒否）テスト

| テストID | テスト観点                           | 設計での対応箇所                   | 実装可能 |
| -------- | ------------------------------------ | ---------------------------------- | -------- |
| IT-016   | 許可ボタンクリックで応答送信         | component-integration-design.md §4 | ✅       |
| IT-017   | 拒否ボタンクリックで応答送信         | component-integration-design.md §4 | ✅       |
| IT-018   | 応答後にダイアログが非表示になる     | component-integration-design.md §4 | ✅       |
| IT-019   | 記憶チェックボックス状態が反映される | component-integration-design.md §4 | ✅       |

**テストシナリオ例**:

```typescript
it("should send approval and close dialog when approve clicked", async () => {
  render(<SkillStreamDisplay />);

  act(() => {
    mockOnPermissionCallback(mockRequest);
  });

  fireEvent.click(screen.getByRole("button", { name: /許可/ }));

  await waitFor(() => {
    expect(mockRespondPermission).toHaveBeenCalledWith({
      requestId: mockRequest.requestId,
      approved: true,
      rememberChoice: false,
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
```

### 2.3 フォーカス管理テスト

| テストID | テスト観点                               | 設計での対応箇所                   | 実装可能 |
| -------- | ---------------------------------------- | ---------------------------------- | -------- |
| IT-020   | ダイアログ表示時に最初の要素にフォーカス | component-integration-design.md §6 | ✅       |
| IT-021   | Tabキーでフォーカスがループする          | PermissionDialog既存実装           | ✅       |
| IT-022   | Shift+Tabで逆方向にフォーカス移動        | PermissionDialog既存実装           | ✅       |
| IT-023   | フォーカスがダイアログ外に出ない         | PermissionDialog既存実装           | ✅       |

**テストシナリオ例**:

```typescript
it("should trap focus within dialog", async () => {
  render(<SkillStreamDisplay />);

  act(() => {
    mockOnPermissionCallback(mockRequest);
  });

  const dialog = screen.getByRole("alertdialog");
  const buttons = within(dialog).getAllByRole("button");

  // 最後のボタンからTabで最初のボタンへ
  buttons[buttons.length - 1].focus();
  fireEvent.keyDown(document.activeElement!, { key: "Tab" });

  expect(document.activeElement).toBe(buttons[0]);
});
```

---

## 3. エラーハンドリングテスト観点

### 3.1 IPC通信エラー時のテスト

| テストID | テスト観点                              | 設計での対応箇所                   | 実装可能 |
| -------- | --------------------------------------- | ---------------------------------- | -------- |
| IT-024   | respondPermission失敗時にエラーログ出力 | component-integration-design.md §7 | ✅       |
| IT-025   | エラー時もダイアログが閉じる            | component-integration-design.md §7 | ✅       |
| IT-026   | コンポーネントがクラッシュしない        | component-integration-design.md §7 | ✅       |

**テストシナリオ例**:

```typescript
it("should handle IPC error gracefully", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  mockRespondPermission.mockRejectedValue(new Error("IPC Error"));

  render(<SkillStreamDisplay />);

  act(() => {
    mockOnPermissionCallback(mockRequest);
  });

  fireEvent.click(screen.getByRole("button", { name: /許可/ }));

  await waitFor(() => {
    expect(consoleError).toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  consoleError.mockRestore();
});
```

### 3.2 不正なリクエストの処理テスト

| テストID | テスト観点                     | 設計での対応箇所                   | 実装可能 |
| -------- | ------------------------------ | ---------------------------------- | -------- |
| IT-027   | 必須フィールド欠損時の型ガード | type-definitions-design.md §7.2    | ✅       |
| IT-028   | 不正な型のデータを無視         | type-definitions-design.md §7.2    | ✅       |
| IT-029   | 空のrequestIdを拒否            | component-integration-design.md §7 | ✅       |

**テストシナリオ例**:

```typescript
it("should ignore invalid request without requestId", async () => {
  const callback = vi.fn();
  skillAPI.onPermission(callback);

  // 不正なリクエスト（requestIdなし）
  ipcRenderer.emit("skill:permission:request", null, {
    executionId: "exec-1",
    toolName: "Bash",
    // requestId missing
  });

  // 型ガードにより無視される
  expect(callback).not.toHaveBeenCalled();
});
```

---

## 4. コンポーネントライフサイクルテスト観点

| テストID | テスト観点                   | 設計での対応箇所                   | 実装可能 |
| -------- | ---------------------------- | ---------------------------------- | -------- |
| IT-030   | マウント時にリスナー登録     | component-integration-design.md §8 | ✅       |
| IT-031   | アンマウント時にリスナー解除 | component-integration-design.md §8 | ✅       |
| IT-032   | 再マウント時にリスナー再登録 | component-integration-design.md §8 | ✅       |

**テストシナリオ例**:

```typescript
it("should cleanup listener on unmount", async () => {
  const cleanupFn = vi.fn();
  mockOnPermission.mockReturnValue(cleanupFn);

  const { unmount } = render(<SkillStreamDisplay />);

  expect(mockOnPermission).toHaveBeenCalled();

  unmount();

  expect(cleanupFn).toHaveBeenCalled();
});
```

---

## 5. 統合テスト観点サマリー

| カテゴリ                 | テスト数 | 設計で対応 | カバレッジ |
| ------------------------ | -------- | ---------- | ---------- |
| IPC統合テスト            | 10       | 10         | 100%       |
| UI統合テスト             | 13       | 13         | 100%       |
| エラーハンドリングテスト | 6        | 6          | 100%       |
| ライフサイクルテスト     | 3        | 3          | 100%       |
| **合計**                 | **32**   | **32**     | **100%**   |

---

## 6. 統合テスト実行環境

### 6.1 必要なモック

| モック対象           | 用途                        |
| -------------------- | --------------------------- |
| `ipcRenderer.on`     | onPermission受信テスト      |
| `ipcRenderer.invoke` | respondPermission送信テスト |
| `window.skillAPI`    | コンポーネント統合テスト    |
| `vi.useFakeTimers()` | タイムアウトテスト          |

### 6.2 テストフレームワーク

- **ユニットテスト**: Vitest
- **コンポーネントテスト**: React Testing Library
- **E2Eテスト**: Playwright（将来）

---

## 7. 結論

**判定: PASS**

設計には統合テストに必要な全ての観点が含まれており、テスト可能な設計となっています。
Phase 4（テスト作成）で上記テストシナリオを実装することで、要件を検証できます。
