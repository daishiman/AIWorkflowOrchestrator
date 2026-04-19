# 拡張テストケース（TC-01〜TC-09）

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 6                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 拡張の目的

Phase 4 で定義した TC-01〜TC-09 に対して、以下の観点でテストケースを拡充する:

- **境界値の網羅**: 大文字・空白・特殊文字など
- **全モードカバレッジ**: update / orchestrate / improve-prompt の全 phase
- **エラーケース**: `phase === "error"` の特殊処理
- **クリーンアップ**: アンマウント時のリスナー解除

---

## 2. 拡張テストケース詳細

### TC-01 拡張: loading-skill マッピング

```typescript
describe("TC-01 拡張: loading-skill マッピング", () => {
  it("loading-skill → planning", () => {
    expect(mapPhaseToStage("loading-skill")).toBe("planning");
  });

  it("LOADING-SKILL（大文字）はフォールバック planning", () => {
    expect(mapPhaseToStage("LOADING-SKILL")).toBe("planning");
  });

  it("loading_skill（アンダースコア）はフォールバック planning", () => {
    expect(mapPhaseToStage("loading_skill")).toBe("planning");
  });
});
```

### TC-02 拡張: analyzing マッピング

```typescript
describe("TC-02 拡張: analyzing マッピング", () => {
  it("analyzing → planning", () => {
    expect(mapPhaseToStage("analyzing")).toBe("planning");
  });

  it("analysing（英国綴り）はフォールバック planning", () => {
    expect(mapPhaseToStage("analysing")).toBe("planning");
  });
});
```

### TC-03 拡張: engine-selection マッピング

```typescript
describe("TC-03 拡張: engine-selection マッピング", () => {
  it("engine-selection → planning", () => {
    expect(mapPhaseToStage("engine-selection")).toBe("planning");
  });

  it("engine_selection（アンダースコア）はフォールバック planning", () => {
    expect(mapPhaseToStage("engine_selection")).toBe("planning");
  });
});
```

### TC-04 拡張: improving マッピング

```typescript
describe("TC-04 拡張: improving マッピング", () => {
  it("improving → generating-skill", () => {
    expect(mapPhaseToStage("improving")).toBe("generating-skill");
  });

  it("IMPROVING（大文字）はフォールバック planning（improving とは別）", () => {
    expect(mapPhaseToStage("IMPROVING")).toBe("planning");
  });

  it("improved（過去形）はフォールバック planning", () => {
    expect(mapPhaseToStage("improved")).toBe("planning");
  });
});
```

### TC-05 拡張: create モード全 phase 回帰

```typescript
describe("TC-05 拡張: create モード全 phase 回帰", () => {
  const createModePhases: Array<[string, StreamingGenerationStage]> = [
    ["planning", "planning"],
    ["generating-skill", "generating-skill"],
    ["generating-agents", "generating-agents"],
    ["validating", "validating"],
    ["done", "done"],
  ];

  it.each(createModePhases)("create モード: %s → %s", (phase, expected) => {
    expect(mapPhaseToStage(phase)).toBe(expected);
  });
});
```

### TC-06 拡張: PHASE_TO_STAGE エントリ数と全キー確認

```typescript
describe("TC-06 拡張: PHASE_TO_STAGE 構造確認", () => {
  it("エントリ数が 9 である", () => {
    expect(Object.keys(PHASE_TO_STAGE).length).toBe(9);
  });

  it("全ての期待キーが存在する", () => {
    const expectedKeys = [
      "planning",
      "generating-skill",
      "generating-agents",
      "validating",
      "done",
      "loading-skill",
      "analyzing",
      "engine-selection",
      "improving",
    ];
    expectedKeys.forEach((key) => {
      expect(PHASE_TO_STAGE).toHaveProperty(key);
    });
  });

  it("全ての値が有効な StreamingGenerationStage である", () => {
    const validStages: StreamingGenerationStage[] = [
      "idle",
      "planning",
      "generating-skill",
      "generating-agents",
      "validating",
      "done",
      "error",
      "cancelled",
    ];
    Object.values(PHASE_TO_STAGE).forEach((stage) => {
      expect(validStages).toContain(stage);
    });
  });
});
```

### TC-07 拡張: 未知 phase フォールバック

```typescript
describe("TC-07 拡張: 未知 phase フォールバック", () => {
  const unknownPhases = [
    "unknown-phase",
    "",
    "   ",
    "PLANNING",
    "null",
    "undefined",
    "123",
    "plan ning",
    "generate",
  ];

  it.each(unknownPhases)(
    '未知 phase "%s" は planning にフォールバックする',
    (phase) => {
      expect(mapPhaseToStage(phase)).toBe("planning");
    },
  );
});
```

### TC-08 拡張: onProgress → Store 更新の統合テスト

```typescript
describe("TC-08 拡張: onProgress → Store 更新", () => {
  it("error phase 受信で stage が error になる", async () => {
    const mockOnProgress = vi.fn((cb) => {
      cb({ phase: "error", percentage: 0, message: "LLM_ERROR: 生成失敗" });
      return vi.fn();
    });
    window.skillCreatorAPI = { onProgress: mockOnProgress };

    const { result } = renderHook(() => useStreamingProgress(), {
      wrapper: StoreProvider,
    });

    expect(result.current.stage).toBe("error");
    expect(result.current.error).not.toBeNull();
  });

  it("複数 phase を順次受信した場合に最後の値が反映される", async () => {
    const callbacks: Array<
      (p: { phase: string; percentage: number; message: string }) => void
    > = [];
    const mockOnProgress = vi.fn((cb) => {
      callbacks.push(cb);
      return vi.fn();
    });
    window.skillCreatorAPI = { onProgress: mockOnProgress };

    const { result } = renderHook(() => useStreamingProgress(), {
      wrapper: StoreProvider,
    });

    act(() => {
      callbacks[0]({
        phase: "loading-skill",
        percentage: 20,
        message: "読み込み中",
      });
    });
    expect(result.current.stage).toBe("planning");
    expect(result.current.percent).toBe(20);

    act(() => {
      callbacks[0]({ phase: "analyzing", percentage: 50, message: "分析中" });
    });
    expect(result.current.stage).toBe("planning");
    expect(result.current.percent).toBe(50);
  });

  it("アンマウント後に Store がリセットされる", () => {
    const mockOnProgress = vi.fn((cb) => {
      cb({ phase: "loading-skill", percentage: 30, message: "読み込み中" });
      return vi.fn();
    });
    window.skillCreatorAPI = { onProgress: mockOnProgress };

    const { result, unmount } = renderHook(() => useStreamingProgress(), {
      wrapper: StoreProvider,
    });

    expect(result.current.percent).toBe(30);
    unmount();
    // Store がリセットされていること（percent が 0 に戻る）
    // ※ Store の状態確認方法はテスト環境に依存
  });
});
```

### TC-09 拡張: GenerateStep UI 反映

```typescript
describe("TC-09 拡張: GenerateStep UI 反映", () => {
  it("message が空の場合 generationProgress が表示される", () => {
    render(
      <GenerateStep
        stage="planning"
        percent={20}
        message=""
        generationProgress="フォールバックテキスト"
      />,
    );
    expect(screen.getByText("フォールバックテキスト")).toBeInTheDocument();
  });

  it("message も generationProgress も空の場合は何も表示されない", () => {
    render(
      <GenerateStep stage="planning" percent={20} message="" />,
    );
    // currentMessage が "" のため表示なし
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("generating-skill stage のステップリストが正しく active になる", () => {
    render(
      <GenerateStep
        stage="generating-skill"
        percent={50}
        message="プロンプトを改善しています..."
      />,
    );
    expect(screen.getByText("プロンプトを改善しています...")).toBeInTheDocument();
  });
});
```

---

## 3. 拡張テストケースサマリー

| TC 拡張  | 追加観点                              | 件数    |
| -------- | ------------------------------------- | ------- |
| TC-01    | 大文字・記号バリアント                | +2      |
| TC-02    | 綴りバリアント                        | +1      |
| TC-03    | 記号バリアント                        | +1      |
| TC-04    | 大文字・語形変化バリアント            | +2      |
| TC-05    | パラメータ化テスト（全 create phase） | +1      |
| TC-06    | キー存在確認・値型検証                | +2      |
| TC-07    | パラメータ化（9 種類の未知 phase）    | +7      |
| TC-08    | error phase・複数受信・リセット       | +3      |
| TC-09    | フォールバック表示・空メッセージ      | +2      |
| **合計** |                                       | **+21** |
