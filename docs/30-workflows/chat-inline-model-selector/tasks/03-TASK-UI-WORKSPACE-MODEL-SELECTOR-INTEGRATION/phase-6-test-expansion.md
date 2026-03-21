# Phase 6: テスト拡充

## メタ情報

| 項目          | 内容                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 6                                                                                                                              |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                              |
| 作成日        | 2026-03-21                                                                                                                     |
| 担当          | -                                                                                                                              |
| ステータス    | 未着手                                                                                                                         |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md` |

## 目的

Phase 7 のカバレッジ確認（Line: 80%以上、Branch: 60%以上、Function: 80%以上）に備え、エッジケース・同時表示パターン・パネル状態変化に関するテストを追加する。

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

| ID  | テスト名                                                                      | 目的                     |
| --- | ----------------------------------------------------------------------------- | ------------------------ |
| E-1 | ワークスペース切り替え時にInlineModelSelectorの選択状態が維持される           | エッジケース・Branch補完 |
| E-2 | パネルリサイズ後もInlineModelSelector(compact)のレイアウトが崩れない          | エッジケース             |
| E-3 | GuidanceBlock(blocked)とInlineModelSelectorが同時に表示される初期状態が正しい | 同時表示テスト           |
| E-4 | ストリーミング開始時にInlineModelSelectorがdisabledになり、完了時に解除される | 状態遷移テスト           |
| E-5 | API key未設定GuidanceBlockがモデル選択後も引き続き表示される                  | 独立条件テスト           |

**テストコード例**:

```typescript
// E-1: ワークスペース切り替え時の状態維持
it("E-1: ワークスペース切り替え後もInlineModelSelectorの状態が維持される", () => {
  const { rerender } = render(<WorkspaceChatPanel workspaceId="ws-1" />);
  // モデルを選択
  fireEvent.click(screen.getByTestId("model-select-trigger"));

  // ワークスペース切り替え
  rerender(<WorkspaceChatPanel workspaceId="ws-2" />);

  // セレクタ自体は引き続き表示されている（ストア状態はワークスペース非依存）
  expect(screen.getByTestId("inline-model-selector")).toBeInTheDocument();
});

// E-3: 初期状態での同時表示
it("E-3: 初期状態でGuidanceBlock(blocked)とInlineModelSelectorが同時に表示される", () => {
  render(<WorkspaceChatPanel initialModelSelected={false} />);

  // 両方が同時に表示されていること
  expect(screen.getByTestId("inline-model-selector")).toBeInTheDocument();
  expect(screen.getByTestId("guidance-block-blocked")).toBeInTheDocument();
});

// E-5: API key未設定GuidanceBlockの独立性
it("E-5: モデル選択後もAPI key未設定GuidanceBlockは表示される", async () => {
  render(<WorkspaceChatPanel hasApiKey={false} initialModelSelected={false} />);

  // モデルを選択
  await act(async () => {
    fireEvent.click(screen.getByTestId("model-select-trigger"));
  });

  // blocked GuidanceBlockは非表示
  expect(screen.queryByTestId("guidance-block-blocked")).not.toBeInTheDocument();
  // API key GuidanceBlockは引き続き表示
  expect(screen.getByTestId("guidance-block-apikey")).toBeInTheDocument();
});
```

### タスク3: 型安全性テスト

```typescript
// InlineModelSelectorにcompact propが正しい型で渡されることを型レベルで検証
// TypeScriptコンパイル時にエラーが出ないことで確認

// WorkspaceChatPanelのprops型にisStreamingが含まれることを確認
import type { WorkspaceChatPanelProps } from "../WorkspaceChatPanel";
// type check: isStreaming?: boolean
```

### タスク4: リグレッションテスト

```bash
# WorkspaceView全体のテスト実行（P40対策）
cd apps/desktop
pnpm vitest run src/renderer/views/WorkspaceView/

# 変更前後の差分確認
git diff --stat apps/desktop/src/renderer/views/WorkspaceView/
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
2. **タスク2の実施**: E-1〜E-5のエッジケーステストを追加する（fireEvent使用、P39準拠）
3. **タスク3の実施**: 型安全性テストを追加する（TypeScriptコンパイルで確認）
4. **タスク4の実施**: リグレッションテストを実行する
5. **再計測**: カバレッジが改善されたことを確認する（Phase 7 の基準値に近づいているか）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                                           | 説明                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-6-test-expansion.md` | テスト拡充計画書          |
| 追加テストコード             | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx` に追記                       | E-1〜E-5 テストケース追加 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

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
- [ ] E-1（ワークスペース切り替え時の状態維持）テストを追加した
- [ ] E-2（パネルリサイズ時のcompactレイアウト）テストを追加した
- [ ] E-3（GuidanceBlockとInlineModelSelectorの同時表示）テストを追加した
- [ ] E-4（ストリーミング開始/完了時のdisabled状態遷移）テストを追加した
- [ ] E-5（API key GuidanceBlockの独立性）テストを追加した
- [ ] 全追加テストがPASSであることを確認した
- [ ] P41対策（インライン関数のカバレッジ確認）を実施した
- [ ] P39対策: 全テストで `fireEvent` を使用し、`userEvent` を使用していない

## 次のPhase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
