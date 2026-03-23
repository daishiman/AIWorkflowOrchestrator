# Phase 6: テスト拡充

## メタ情報

| 項目          | 内容                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 6                                                                                                                              |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                              |
| 作成日        | 2026-03-21                                                                                                                     |
| 更新日        | 2026-03-23                                                                                                                     |
| 担当          | -                                                                                                                              |
| ステータス    | 完了                                                                                                                           |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md` |

## 目的

Phase 7 のカバレッジ確認（Line: 80%以上、Branch: 60%以上、Function: 80%以上）に備え、エッジケース・状態遷移パターンに関するテストを追加する。

## 実行タスク

### タスク1: カバレッジ仮計測と不足箇所の特定

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# カバレッジレポート生成
pnpm vitest run --coverage \
  src/renderer/views/WorkspaceView/__tests__/

# カバレッジ結果確認（特にbranch coverageに注目）
```

### タスク2: 追加テストケース（エッジケース）

**追加テストファイル**: Phase 4 で作成した `WorkspaceChatPanel.integration.test.tsx` に追記

| ID  | テスト名                                                                                | 目的                     |
| --- | --------------------------------------------------------------------------------------- | ------------------------ |
| E-1 | blockedReason="NO_PROVIDER"の場合にGuidanceBlockが表示される                            | Branch補完               |
| E-2 | InlineModelSelectorとGuidanceBlockが同時に表示される初期状態（blockedReason!=null）     | 同時表示テスト           |
| E-3 | ストリーミング開始時にdisabledになり、完了時に解除される（rerender検証）                | 状態遷移テスト           |
| E-4 | blockedReason=null時にゼロステート（WorkspaceSuggestionBubbles）が表示される            | 条件分岐テスト           |
| E-5 | StreamingErrorDisplayがstreamingError存在時に表示される（既存機能のリグレッション防止） | リグレッション防止テスト |

**テストコード例（createMockControllerパターン、P39準拠）**:

```typescript
// E-1: NO_PROVIDER の場合も GuidanceBlock が表示される（Branch補完）
it("E-1: blockedReason='NO_PROVIDER'の場合にGuidanceBlockが表示される", () => {
  const controller = createMockController({
    selectedModelId: null,
    blockedReason: "NO_PROVIDER",
  });
  render(<WorkspaceChatPanel controller={controller} />);
  expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();
});

// E-2: InlineModelSelectorとGuidanceBlockの同時表示
it("E-2: blockedReason!=null時にInlineModelSelectorとGuidanceBlockが同時に表示される", () => {
  const controller = createMockController({
    selectedModelId: null,
    blockedReason: "NO_MODEL",
  });
  render(<WorkspaceChatPanel controller={controller} />);

  // 両方が同時に表示されていること
  expect(screen.getByRole("combobox")).toBeInTheDocument(); // InlineModelSelector
  expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument(); // GuidanceBlock
});

// E-3: ストリーミング開始/完了でdisabled状態が遷移する
it("E-3: ストリーミング開始でdisabledになり、完了で解除される", () => {
  const idleController = createMockController({
    selectedModelId: "gpt-4o",
    blockedReason: null,
    isStreaming: false,
  });
  const { rerender } = render(<WorkspaceChatPanel controller={idleController} />);

  const selector = screen.getByRole("combobox");
  expect(selector).not.toBeDisabled();

  // ストリーミング開始
  const streamingController = createMockController({
    selectedModelId: "gpt-4o",
    blockedReason: null,
    isStreaming: true,
  });
  rerender(<WorkspaceChatPanel controller={streamingController} />);
  expect(screen.getByRole("combobox")).toBeDisabled();

  // ストリーミング完了
  rerender(<WorkspaceChatPanel controller={idleController} />);
  expect(screen.getByRole("combobox")).not.toBeDisabled();
});

// E-4: blockedReason=null + メッセージなし → ゼロステート表示
it("E-4: blockedReason=null時にゼロステート（suggestion bubbles）が表示される", () => {
  const controller = createMockController({
    selectedModelId: "gpt-4o",
    blockedReason: null,
    messages: [],
    streamContent: "",
    isStreaming: false,
  });
  render(<WorkspaceChatPanel controller={controller} />);
  expect(screen.getByTestId("workspace-chat-zero-state")).toBeInTheDocument();
});

// E-5: streamingError存在時にStreamingErrorDisplayが表示される
it("E-5: streamingError存在時にStreamingErrorDisplayが表示される", () => {
  const controller = createMockController({
    selectedModelId: "gpt-4o",
    blockedReason: null,
    streamingError: {
      type: "network",
      message: "接続エラー",
      isRetryable: true,
      timestamp: Date.now(),
    },
  });
  render(<WorkspaceChatPanel controller={controller} />);
  expect(screen.getByText("接続エラー")).toBeInTheDocument();
});
```

### タスク3: リグレッションテスト

```bash
# WorkspaceView全体のテスト実行（P40対策）
cd apps/desktop
pnpm vitest run src/renderer/views/WorkspaceView/
```

## 参照資料

### コード品質ルール

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 4 テスト設計 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-4-test.md`           |
| Phase 5 実装       | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                 | 対策                                               |
| ---------- | ------------------------------------ | -------------------------------------------------- |
| P9         | テスト間で状態共有                   | `beforeEach` でリセット                            |
| P39        | happy-dom環境でのuserEvent非互換     | `fireEvent` を使用、`userEvent` 禁止               |
| P40        | テスト実行ディレクトリ依存           | `cd apps/desktop && pnpm vitest run` で実行        |
| P41        | v8カバレッジのインライン関数カウント | インライン関数（コールバック）を明示的にテストする |

## 実行手順

1. **タスク1の実施**: カバレッジを仮計測し、不足箇所を特定する
2. **タスク2の実施**: E-1〜E-5のエッジケーステストを追加する（createMockControllerパターン、fireEvent使用、P39準拠）
3. **タスク3の実施**: リグレッションテストを実行する
4. **再計測**: カバレッジが改善されたことを確認する（Phase 7 の基準値に近づいているか）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                                           | 説明                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-6-test-expansion.md` | テスト拡充計画書          |
| 追加テストコード             | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx` に追記                       | E-1〜E-5 テストケース追加 |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 6
```

## 完了条件

- [ ] タスク1でカバレッジ仮計測を実施し、不足箇所を特定した
- [ ] E-1（blockedReason="NO_PROVIDER"でGuidanceBlock表示）テストを追加した
- [ ] E-2（InlineModelSelectorとGuidanceBlockの同時表示）テストを追加した
- [ ] E-3（ストリーミング開始/完了時のdisabled状態遷移）テストを追加した
- [ ] E-4（ゼロステート表示条件）テストを追加した
- [ ] E-5（StreamingErrorDisplay表示）テストを追加した
- [ ] 全追加テストがPASSであることを確認した
- [ ] P41対策（インライン関数のカバレッジ確認）を実施した
- [ ] P39対策: 全テストで `fireEvent` を使用し、`userEvent` を使用していない

## 次のPhase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
