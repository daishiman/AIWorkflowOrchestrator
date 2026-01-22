# Phase 5: 実装ログ（TDD Green）

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| 作成日     | 2026-01-22 |
| フェーズ   | Phase 5    |
| 成果物種別 | 実装ログ   |
| ステータス | 完了       |
| 関連Issue  | #361       |

---

## 1. 目標

Phase 4で作成した67件の統合テストをすべて通過させる（TDD Green）。

### 1.1 開始時の状況

| テストファイル                      | 合格 | 不合格 | 合計 |
| ----------------------------------- | ---- | ------ | ---- |
| EditorViewIntegration.test.tsx      | 15   | 1      | 16   |
| KeyboardShortcuts.test.tsx          | 15   | 0      | 15   |
| SearchPanelAdapter.test.tsx         | 15   | 2      | 17   |
| WorkspaceSearchIntegration.test.tsx | 5    | 14     | 19   |
| **合計**                            | 50   | 17     | 67   |

---

## 2. 修正内容

### 2.1 WorkspaceSearchIntegration.test.tsx (14件修正)

#### 問題1: role="dialog" vs role="region"

**原因**: WorkspaceSearchPanelは`role="region"`を使用（サイドバーパネル向け）

**修正**:

```typescript
// Before (失敗)
expect(screen.getByRole("dialog")).toBeInTheDocument();

// After (成功)
expect(screen.getByRole("region")).toBeInTheDocument();
```

#### 問題2: デバウンスベースのテスト

**原因**: WorkspaceSearchPanelは手動検索実行（Enter キー）を要求

**修正**:

```typescript
// Before (失敗) - デバウンスベース
await act(async () => {
  fireEvent.change(searchbox, { target: { value: "hello" } });
});
await act(async () => {
  vi.advanceTimersByTime(350);
});

// After (成功) - Enter キーベース
await act(async () => {
  fireEvent.change(searchbox, { target: { value: "hello" } });
  fireEvent.keyDown(searchbox, { key: "Enter" });
});
await act(async () => {
  vi.advanceTimersByTime(100);
});
```

#### 問題3: 複数要素のマッチ

**原因**: 検索結果で複数のファイル名がマッチ

**修正**:

```typescript
// Before (失敗)
expect(screen.getByText(/file1\.ts|file2\.ts/)).toBeInTheDocument();

// After (成功)
const fileElements = screen.getAllByText(/file1\.ts|file2\.ts/);
expect(fileElements.length).toBeGreaterThan(0);
```

### 2.2 EditorViewIntegration.test.tsx (1件修正)

#### 問題: 空クエリ時のハイライトクリア

**原因**: SearchPanel.tsxで空クエリ時に`performSearch()`が呼ばれない

**ファイル**: `apps/desktop/src/features/search/components/SearchPanel.tsx`

**修正**:

```typescript
// Before (バグ)
if (e.key === "Enter") {
  e.preventDefault();
  if (e.altKey && showReplaceMode) {
    handleReplaceAll();
  } else if (results.length > 0) {
    // 空クエリでもresultsが残る
    if (e.shiftKey) {
      goToPrevious();
    } else {
      goToNext();
    }
  } else {
    performSearch();
  }
}

// After (修正済み)
if (e.key === "Enter") {
  e.preventDefault();
  if (e.altKey && showReplaceMode) {
    handleReplaceAll();
  } else if (!searchQuery) {
    // 空クエリの場合は検索を実行（ハイライトクリア）
    performSearch();
  } else if (results.length > 0) {
    if (e.shiftKey) {
      goToPrevious();
    } else {
      goToNext();
    }
  } else {
    performSearch();
  }
}
```

**依存配列更新**:

```typescript
[
  onClose,
  goToNext,
  goToPrevious,
  handleReplaceAll,
  showReplaceMode,
  results.length,
  performSearch,
  searchQuery,  // 追加
],
```

### 2.3 SearchPanelAdapter.test.tsx (2件修正)

#### 問題: happy-dom の style.getPropertyValue 制限

**原因**: dom-accessibility-api が `style.getPropertyValue()` を呼び出すが、happy-dom のモックに含まれていない

**修正**:

```typescript
// Before (失敗)
vi.spyOn(window, "getComputedStyle").mockReturnValue({
  lineHeight: "21px",
  fontSize: "14px",
} as CSSStyleDeclaration);

// After (成功)
vi.spyOn(window, "getComputedStyle").mockReturnValue({
  lineHeight: "21px",
  fontSize: "14px",
  getPropertyValue: (prop: string) => {
    const values: Record<string, string> = {
      "line-height": "21px",
      "font-size": "14px",
      display: "block",
      visibility: "visible",
    };
    return values[prop] || "";
  },
} as unknown as CSSStyleDeclaration);
```

---

## 3. 最終テスト結果

| テストファイル                      | 合格   | 不合格 | 合計   |
| ----------------------------------- | ------ | ------ | ------ |
| EditorViewIntegration.test.tsx      | 16     | 0      | 16     |
| KeyboardShortcuts.test.tsx          | 15     | 0      | 15     |
| SearchPanelAdapter.test.tsx         | 17     | 0      | 17     |
| WorkspaceSearchIntegration.test.tsx | 19     | 0      | 19     |
| **合計**                            | **67** | **0**  | **67** |

### 3.1 テスト実行ログ

```
 Test Files  4 passed (4)
      Tests  67 passed (67)
   Start at  22:22:12
   Duration  3.34s
```

---

## 4. 修正ファイル一覧

| ファイル                                                                                     | 変更内容                                         |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/features/search/components/SearchPanel.tsx`                                | 空クエリ時のハイライトクリア処理を追加           |
| `apps/desktop/src/features/search/__tests__/integration/WorkspaceSearchIntegration.test.tsx` | role変更、Enter キーベース実行、getAllByText使用 |
| `apps/desktop/src/features/search/__tests__/integration/SearchPanelAdapter.test.tsx`         | getPropertyValueモック追加                       |

---

## 5. 学習事項

### 5.1 ARIA役割の適切な使用

- `role="dialog"`: モーダル・オーバーレイ向け（SearchPanel）
- `role="region"`: サイドバーパネル向け（WorkspaceSearchPanel）

### 5.2 コンポーネントのテスト設計

- コンポーネントの実装を理解してからテストを設計
- 手動実行 vs 自動デバウンスの違いを考慮
- happy-dom の制限を理解し、適切なモックを設定

### 5.3 TDD Green の原則

- テストを通過させるための最小限の変更を行う
- 既存の動作を壊さないよう注意
- 変更後は全テストを再実行して確認

---

## 6. 完了条件チェック

- [x] 全67件の統合テストが通過
- [x] SearchPanel.tsx の空クエリ処理バグを修正
- [x] テストファイルの修正が完了
- [x] 実装ログが作成されている

---

## 7. 次フェーズへの引き継ぎ

### Phase 6 (テスト拡充) で対応すべき事項

1. カバレッジ測定を実施
2. カバレッジ目標 80% 達成に向けたテスト追加
3. 境界値・エッジケースのテスト拡充
