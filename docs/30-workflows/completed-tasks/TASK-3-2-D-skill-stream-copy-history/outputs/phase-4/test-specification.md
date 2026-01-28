# テスト仕様書

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-3-2-D                        |
| 機能名     | SkillStreamDisplay コピー履歴機能 |
| Phase      | 4                                 |
| 作成日     | 2026-01-28                        |
| ステータス | TDD Red状態                       |

---

## 1. テスト戦略

### 1.1 テスト方針

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| アプローチ     | TDD（テストファースト）            |
| フレームワーク | Vitest + React Testing Library     |
| カバレッジ目標 | 100%（Lines, Branches, Functions） |
| テストレベル   | ユニットテスト + 統合テスト        |

### 1.2 テストスコープ

| レイヤー | 対象コンポーネント  | テストファイル              |
| -------- | ------------------- | --------------------------- |
| Context  | CopyHistoryProvider | CopyHistoryContext.test.tsx |
| Hook     | useCopyHistory      | useCopyHistory.test.ts      |
| UI       | CopyHistoryPanel    | CopyHistoryPanel.test.tsx   |

---

## 2. モック設計

### 2.1 Clipboard API モック

```typescript
const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText,
    },
  });
  mockWriteText.mockClear();
});
```

### 2.2 crypto.randomUUID モック

```typescript
let uuidCounter = 0;
vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
  uuidCounter += 1;
  return `test-uuid-${uuidCounter}`;
});
```

### 2.3 Date.now モック

```typescript
const mockTimestamp = 1706400000000; // 固定タイムスタンプ
vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);
```

---

## 3. テストヘルパー

### 3.1 Provider ラッパー

```typescript
function renderWithCopyHistory(
  ui: React.ReactElement,
  options?: { initialHistory?: CopyHistoryEntry[] }
) {
  return render(
    <CopyHistoryProvider initialHistory={options?.initialHistory}>
      {ui}
    </CopyHistoryProvider>
  );
}
```

### 3.2 Hook テストユーティリティ

```typescript
function renderUseCopyHistory() {
  return renderHook(() => useCopyHistory(), {
    wrapper: CopyHistoryProvider,
  });
}
```

---

## 4. テストカテゴリ

### 4.1 CopyHistoryContext テスト（6件）

| TC-ID  | カテゴリ | テスト内容                             |
| ------ | -------- | -------------------------------------- |
| TC-401 | 状態管理 | コピー時に履歴に追加される             |
| TC-402 | 境界値   | 51件目のコピーで最古の履歴が削除される |
| TC-403 | 状態管理 | removeFromHistory で指定項目が削除     |
| TC-404 | 状態管理 | clearHistory で全履歴が削除            |
| TC-405 | 選択管理 | toggleSelection で選択状態がトグル     |
| TC-406 | 選択管理 | clearSelection で全選択解除            |

### 4.2 useCopyHistory Hook テスト（3件）

| TC-ID  | カテゴリ   | テスト内容                 |
| ------ | ---------- | -------------------------- |
| TC-411 | エラー処理 | Context 外で使用時にエラー |
| TC-412 | データ取得 | history が正しく取得できる |
| TC-413 | アクション | addToHistory が正しく動作  |

### 4.3 CopyHistoryPanel テスト（12件）

| TC-ID  | カテゴリ   | テスト内容                         |
| ------ | ---------- | ---------------------------------- |
| TC-421 | 表示       | 履歴パネルが表示される             |
| TC-422 | 表示       | 履歴項目が一覧表示される           |
| TC-423 | 操作       | 履歴項目クリックで再コピーできる   |
| TC-424 | 操作       | チェックボックスで複数選択できる   |
| TC-425 | 操作       | 「選択をコピー」で一括コピーできる |
| TC-426 | 操作       | 「クリア」で全履歴が削除される     |
| TC-427 | 操作       | 閉じるボタンで onClose が呼ばれる  |
| TC-428 | 表示       | 100文字超のコンテンツが省略表示    |
| TC-431 | キーボード | Tabキーでフォーカス移動            |
| TC-432 | キーボード | Enterキーで項目選択/コピー         |
| TC-433 | キーボード | Escapeキーでパネルを閉じる         |
| TC-434 | キーボード | Spaceキーでチェックボックストグル  |

---

## 5. テストデータ

### 5.1 標準テストデータ

```typescript
const testEntries: CopyHistoryEntry[] = [
  {
    id: "entry-1",
    content: "First copied text",
    timestamp: 1706400000000,
    sourceMessageId: "msg-1",
  },
  {
    id: "entry-2",
    content: "Second copied text",
    timestamp: 1706400001000,
    sourceMessageId: "msg-2",
  },
  {
    id: "entry-3",
    content: "Third copied text",
    timestamp: 1706400002000,
  },
];
```

### 5.2 境界値テストデータ

```typescript
// 50件の履歴
const fiftyEntries = Array.from({ length: 50 }, (_, i) => ({
  id: `entry-${i}`,
  content: `Content ${i}`,
  timestamp: 1706400000000 + i * 1000,
}));

// 100文字超のコンテンツ
const longContent = "A".repeat(150);
```

---

## 6. カバレッジ設定

### 6.1 Vitest設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx",
        "apps/desktop/src/renderer/hooks/useCopyHistory.ts",
        "apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx",
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
```

---

## 7. 受け入れ基準との対応

| AC-ID       | 対応テスト |
| ----------- | ---------- |
| AC-FR-01-1  | TC-421     |
| AC-FR-01-4  | TC-433     |
| AC-FR-01-6  | TC-421     |
| AC-FR-02-1  | TC-423     |
| AC-FR-03-1  | TC-424     |
| AC-FR-03-2  | TC-425     |
| AC-FR-04-1  | TC-426     |
| AC-FR-05-1  | TC-402     |
| AC-FR-06-1  | TC-428     |
| AC-NFR-02-1 | TC-431     |
| AC-NFR-02-2 | TC-432     |
| AC-NFR-02-3 | TC-433     |
| AC-NFR-02-4 | TC-434     |
