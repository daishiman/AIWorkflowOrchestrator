# テスト仕様書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 4                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. テスト対象

| ファイル                                                                 | テスト対象関数・定数                |
| ------------------------------------------------------------------------ | ----------------------------------- |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`                | `mapPhaseToStage`, `PHASE_TO_STAGE` |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` | テスト実装ファイル                  |

---

## 2. テストケース一覧

### TC-01: update モード - loading-skill フェーズのマッピング

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| ID       | TC-01                                            |
| 対応AC   | AC-1                                             |
| 分類     | 単体テスト                                       |
| 優先度   | 高                                               |
| 前提条件 | `PHASE_TO_STAGE` に `loading-skill` エントリあり |
| 入力     | `phase = "loading-skill"`                        |
| 期待結果 | `"planning"` が返る                              |

```typescript
it("TC-01: loading-skill は planning にマッピングされる", () => {
  expect(mapPhaseToStage("loading-skill")).toBe("planning");
});
```

---

### TC-02: update モード - analyzing フェーズのマッピング

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| ID       | TC-02                                        |
| 対応AC   | AC-1                                         |
| 分類     | 単体テスト                                   |
| 優先度   | 高                                           |
| 前提条件 | `PHASE_TO_STAGE` に `analyzing` エントリあり |
| 入力     | `phase = "analyzing"`                        |
| 期待結果 | `"planning"` が返る                          |

```typescript
it("TC-02: analyzing は planning にマッピングされる", () => {
  expect(mapPhaseToStage("analyzing")).toBe("planning");
});
```

---

### TC-03: orchestrate モード - engine-selection フェーズのマッピング

| 項目     | 内容                                                |
| -------- | --------------------------------------------------- |
| ID       | TC-03                                               |
| 対応AC   | AC-2                                                |
| 分類     | 単体テスト                                          |
| 優先度   | 高                                                  |
| 前提条件 | `PHASE_TO_STAGE` に `engine-selection` エントリあり |
| 入力     | `phase = "engine-selection"`                        |
| 期待結果 | `"planning"` が返る                                 |

```typescript
it("TC-03: engine-selection は planning にマッピングされる", () => {
  expect(mapPhaseToStage("engine-selection")).toBe("planning");
});
```

---

### TC-04: improve-prompt モード - improving フェーズのマッピング

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| ID       | TC-04                                        |
| 対応AC   | AC-3                                         |
| 分類     | 単体テスト                                   |
| 優先度   | 高                                           |
| 前提条件 | `PHASE_TO_STAGE` に `improving` エントリあり |
| 入力     | `phase = "improving"`                        |
| 期待結果 | `"generating-skill"` が返る                  |

```typescript
it("TC-04: improving は generating-skill にマッピングされる", () => {
  expect(mapPhaseToStage("improving")).toBe("generating-skill");
});
```

---

### TC-05: create モード既存フェーズの回帰テスト（planning〜done）

| 項目     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| ID       | TC-05                                                                               |
| 対応AC   | AC-4                                                                                |
| 分類     | 回帰テスト                                                                          |
| 優先度   | 高                                                                                  |
| 前提条件 | `PHASE_TO_STAGE` の既存エントリが変更されていない                                   |
| 入力     | `"planning"`, `"generating-skill"`, `"generating-agents"`, `"validating"`, `"done"` |
| 期待結果 | 各入力に対して同名または対応する stage が返る                                       |

```typescript
it("TC-05: create モードの既存 phase が正しくマッピングされる", () => {
  expect(mapPhaseToStage("planning")).toBe("planning");
  expect(mapPhaseToStage("generating-skill")).toBe("generating-skill");
  expect(mapPhaseToStage("generating-agents")).toBe("generating-agents");
  expect(mapPhaseToStage("validating")).toBe("validating");
  expect(mapPhaseToStage("done")).toBe("done");
});
```

---

### TC-06: create モード既存フェーズの回帰テスト（エントリ数確認）

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| ID       | TC-06                                                         |
| 対応AC   | AC-4                                                          |
| 分類     | 回帰テスト                                                    |
| 優先度   | 中                                                            |
| 前提条件 | `PHASE_TO_STAGE` の総エントリ数が 9 であること                |
| 入力     | `Object.keys(PHASE_TO_STAGE).length`                          |
| 期待結果 | `9`（create 5 + update 2 + orchestrate 1 + improve-prompt 1） |

```typescript
it("TC-06: PHASE_TO_STAGE のエントリ数が 9 である", () => {
  expect(Object.keys(PHASE_TO_STAGE).length).toBe(9);
});
```

---

### TC-07: 未知フェーズのフォールバック動作

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| ID       | TC-07                                            |
| 対応AC   | AC-5                                             |
| 分類     | 境界値テスト                                     |
| 優先度   | 高                                               |
| 前提条件 | `mapPhaseToStage` にフォールバックロジックがある |
| 入力     | `"unknown-phase"`, `""`, `"   "`, `"PLANNING"`   |
| 期待結果 | すべて `"planning"` が返る                       |

```typescript
it("TC-07: 未知 phase は planning にフォールバックする", () => {
  expect(mapPhaseToStage("unknown-phase")).toBe("planning");
  expect(mapPhaseToStage("")).toBe("planning");
  expect(mapPhaseToStage("   ")).toBe("planning");
  expect(mapPhaseToStage("PLANNING")).toBe("planning"); // 大文字は別扱い
});
```

---

### TC-08: onProgress コールバック登録と Store 更新の統合テスト

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| ID       | TC-08                                                          |
| 対応AC   | AC-1〜AC-3                                                     |
| 分類     | 統合テスト                                                     |
| 優先度   | 高                                                             |
| 前提条件 | `skillCreatorAPI.onProgress` のモックが利用可能                |
| 入力     | onProgress コールバック経由で `phase: "loading-skill"` を送信  |
| 期待結果 | Zustand Store の `streamingStage` が `"planning"` に更新される |

```typescript
it("TC-08: onProgress で loading-skill を受信すると Store が planning になる", async () => {
  // モック設定
  const mockOnProgress = vi.fn((cb) => {
    cb({ phase: "loading-skill", percentage: 20, message: "読み込み中" });
    return () => {};
  });
  window.skillCreatorAPI = { onProgress: mockOnProgress };

  // Hook レンダリング
  const { result } = renderHook(() => useStreamingProgress(), { wrapper });

  // 検証
  expect(result.current.stage).toBe("planning");
  expect(result.current.percent).toBe(20);
});
```

---

### TC-09: モード別進捗の UI 反映統合テスト

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| ID       | TC-09                                                         |
| 対応AC   | AC-1〜AC-3                                                    |
| 分類     | 統合テスト                                                    |
| 優先度   | 中                                                            |
| 前提条件 | `GenerateStep` コンポーネントが `stage`, `message` を受け取る |
| 入力     | `stage="planning"`, `message="スキルを読み込んでいます..."`   |
| 期待結果 | `GenerateStep` が動的メッセージを表示する                     |

```typescript
it("TC-09: GenerateStep が動的メッセージを表示する", () => {
  render(
    <GenerateStep
      stage="planning"
      percent={20}
      message="スキルを読み込んでいます..."
    />,
  );
  expect(
    screen.getByText("スキルを読み込んでいます..."),
  ).toBeInTheDocument();
});
```

---

## 3. テストケースサマリー

| ID    | 分類   | 対応AC     | 優先度 | TDD フェーズ |
| ----- | ------ | ---------- | ------ | ------------ |
| TC-01 | 単体   | AC-1       | 高     | Red → Green  |
| TC-02 | 単体   | AC-1       | 高     | Red → Green  |
| TC-03 | 単体   | AC-2       | 高     | Red → Green  |
| TC-04 | 単体   | AC-3       | 高     | Red → Green  |
| TC-05 | 回帰   | AC-4       | 高     | Green 維持   |
| TC-06 | 回帰   | AC-4       | 中     | Green 維持   |
| TC-07 | 境界値 | AC-5       | 高     | Green 維持   |
| TC-08 | 統合   | AC-1〜AC-3 | 高     | Green        |
| TC-09 | 統合   | AC-1〜AC-3 | 中     | Green        |
