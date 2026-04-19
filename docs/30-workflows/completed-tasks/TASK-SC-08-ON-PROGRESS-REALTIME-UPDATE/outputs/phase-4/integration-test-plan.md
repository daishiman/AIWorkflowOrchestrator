# モード別 phase 統合テスト計画

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 4                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 統合テストの目的

単体テスト（TC-01〜TC-07）では `mapPhaseToStage` 関数の変換ロジックのみを検証する。
統合テスト（TC-08, TC-09）では以下のフロー全体を検証する:

```
onProgress コールバック受信
  → mapPhaseToStage で stage 変換
  → updateStreamingProgress で Store 更新
  → GenerateStep コンポーネントで UI 反映
```

---

## 2. 統合テスト対象フロー

### フロー A: update モード進捗フロー

```
Main: SKILL_CREATOR_PROGRESS { phase: "loading-skill", percentage: 20, message: "スキルを読み込んでいます..." }
  → Preload: skillCreatorAPI.onProgress コールバック呼び出し
  → useStreamingProgress: mapPhaseToStage("loading-skill") = "planning"
  → Store: streamingStage = "planning", streamingPercent = 20, streamingMessage = "スキルを読み込んでいます..."
  → GenerateStep: stage="planning", percent=20, message="スキルを読み込んでいます..." を表示
```

### フロー B: improve-prompt モード進捗フロー

```
Main: SKILL_CREATOR_PROGRESS { phase: "improving", percentage: 50, message: "プロンプトを改善しています..." }
  → Preload: skillCreatorAPI.onProgress コールバック呼び出し
  → useStreamingProgress: mapPhaseToStage("improving") = "generating-skill"
  → Store: streamingStage = "generating-skill", streamingPercent = 50
  → GenerateStep: stage="generating-skill", percent=50 を表示（ステップリストで active 状態）
```

### フロー C: orchestrate モード進捗フロー

```
Main: SKILL_CREATOR_PROGRESS { phase: "engine-selection", percentage: 15, message: "実行エンジンを選択しています..." }
  → Preload: skillCreatorAPI.onProgress コールバック呼び出し
  → useStreamingProgress: mapPhaseToStage("engine-selection") = "planning"
  → Store: streamingStage = "planning", streamingPercent = 15
  → GenerateStep: stage="planning" を表示
```

---

## 3. 統合テストケース詳細

### TC-08: onProgress → Store 更新の統合テスト

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| ID           | TC-08                               |
| 対象フロー   | フロー A（update モード）           |
| テストツール | Vitest + @testing-library/react     |
| モック対象   | `window.skillCreatorAPI.onProgress` |

```typescript
describe("TC-08: onProgress → Store 更新の統合テスト", () => {
  it("update モードの loading-skill 受信で Store が正しく更新される", async () => {
    const mockCleanup = vi.fn();
    const mockOnProgress = vi.fn((cb) => {
      cb({ phase: "loading-skill", percentage: 20, message: "読み込み中..." });
      return mockCleanup;
    });

    Object.defineProperty(window, "skillCreatorAPI", {
      value: { onProgress: mockOnProgress },
      writable: true,
    });

    const { result } = renderHook(() => useStreamingProgress(), {
      wrapper: StoreProvider,
    });

    expect(result.current.stage).toBe("planning");
    expect(result.current.percent).toBe(20);
    expect(result.current.message).toBe("読み込み中...");
    expect(result.current.isGenerating).toBe(true);
  });

  it("improve-prompt の improving 受信で Store が generating-skill になる", async () => {
    const mockOnProgress = vi.fn((cb) => {
      cb({ phase: "improving", percentage: 50, message: "改善中..." });
      return vi.fn();
    });

    Object.defineProperty(window, "skillCreatorAPI", {
      value: { onProgress: mockOnProgress },
      writable: true,
    });

    const { result } = renderHook(() => useStreamingProgress(), {
      wrapper: StoreProvider,
    });

    expect(result.current.stage).toBe("generating-skill");
    expect(result.current.isGenerating).toBe(true);
  });

  it("アンマウント時にクリーンアップ関数が呼ばれる（P5対策）", () => {
    const mockCleanup = vi.fn();
    const mockOnProgress = vi.fn(() => mockCleanup);

    Object.defineProperty(window, "skillCreatorAPI", {
      value: { onProgress: mockOnProgress },
      writable: true,
    });

    const { unmount } = renderHook(() => useStreamingProgress(), {
      wrapper: StoreProvider,
    });

    unmount();
    expect(mockCleanup).toHaveBeenCalledOnce();
  });
});
```

### TC-09: GenerateStep UI 反映の統合テスト

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| ID           | TC-09                           |
| 対象フロー   | フロー A, B, C                  |
| テストツール | Vitest + @testing-library/react |
| モック対象   | `GenerateStep` の Props         |

```typescript
describe("TC-09: GenerateStep UI 反映の統合テスト", () => {
  it("update モードの動的メッセージが表示される", () => {
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

  it("improve-prompt モードで generating-skill ステージが active になる", () => {
    render(
      <GenerateStep
        stage="generating-skill"
        percent={50}
        message="プロンプトを改善しています..."
      />,
    );
    // SKILL.md を生成しています... のステップが active 状態であることを確認
    expect(screen.getByText("SKILL.md を生成しています...")).toHaveClass(
      "font-medium",
    );
  });

  it("message prop が generationProgress より優先される", () => {
    render(
      <GenerateStep
        stage="planning"
        percent={30}
        message="動的メッセージ"
        generationProgress="静的テキスト"
      />,
    );
    expect(screen.getByText("動的メッセージ")).toBeInTheDocument();
    expect(screen.queryByText("静的テキスト")).not.toBeInTheDocument();
  });
});
```

---

## 4. テスト実行計画

| フェーズ   | 実行タイミング | コマンド                                                         |
| ---------- | -------------- | ---------------------------------------------------------------- |
| RED 確認   | Phase 4 完了時 | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` |
| GREEN 確認 | Phase 5 実装後 | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` |
| 回帰確認   | Phase 5 実装後 | `pnpm --filter @repo/desktop test -- --run`                      |
| 拡張テスト | Phase 6        | `pnpm --filter @repo/desktop test -- --run`                      |

---

## 5. テスト環境要件

| 要件                            | 内容                                              |
| ------------------------------- | ------------------------------------------------- |
| テストランナー                  | Vitest                                            |
| DOM 環境                        | jsdom                                             |
| React テストユーティリティ      | @testing-library/react, @testing-library/jest-dom |
| Store プロバイダー              | テスト用 Zustand Store ラッパー                   |
| `window.skillCreatorAPI` モック | `vi.fn()` または `Object.defineProperty` で設定   |
