# Phase 4: テスト作成 — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                                       |
| ------------- | -------------------------------------------------------- |
| 機能名        | chatview-inline-model-selector-integration               |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION              |
| Phase         | 4                                                        |
| 作成日        | 2026-03-21                                               |
| 依存          | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT（Task 01）完了後 |
| 前Phase成果物 | `./phase-3-design-review.md`                             |

## 目的

ChatViewにInlineModelSelectorを組み込む統合テストケースを実装前に作成し、TDD原則に従って実装の受入基準を明確化する。

## 実行タスク

- テストファイル `ChatView.integration.test.tsx` を新規作成する
- 5つのテストケースを記述する（詳細は実行手順を参照）
- P39・P40の制約（happy-dom／実行ディレクトリ）を遵守する
- Phase 5実装開始前にテストがRed（失敗）であることを確認する

## 参照資料

| 資料                                       | パス                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| Phase 1 要件定義                           | ./phase-1-requirements.md                                                       |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | ./phase-2-design.md                                                             |
| Phase 3 設計レビュー                       | ./phase-3-design-review.md                                                      |
| P39: happy-dom環境でのuserEvent非互換      | .claude/rules/06-known-pitfalls.md#P39                                          |
| P40: テスト実行ディレクトリ依存            | .claude/rules/06-known-pitfalls.md#P40                                          |
| テストコンポーネントパターン               | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md |

## 実行手順

### Step 1: 既存テストファイルのインポートパターン確認

P63（サブエージェントのインポートパス誤り）対策として、テスト記述前に既存テストを参照する。

```bash
ls apps/desktop/src/renderer/views/ChatView/__tests__/
grep -n "^import" apps/desktop/src/renderer/views/ChatView/__tests__/*.test.tsx | head -40
```

### Step 2: テストファイルの骨格作成

ファイルパス: `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx`

```tsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
// 既存テストのインポートパターンに従って追記する
```

### Step 3: テストケース TC-I-1 の実装

**テストケース TC-I-1: ChatViewヘッダー左側にInlineModelSelectorが表示される**

- 前提: providerList に1件以上のプロバイダーが存在する
- 手順: ChatViewをレンダリングする
- 期待: `data-testid="inline-model-selector"` を持つ要素がヘッダー内に存在する
- アサーション: `screen.getByTestId("inline-model-selector")` が存在すること

```tsx
it("TC-I-1: ChatViewヘッダー左側にInlineModelSelectorが表示される", () => {
  // Arrange: 1件以上のプロバイダーを持つStoreをセットアップ
  // Act: ChatViewをレンダリング
  render(<ChatView />, { wrapper: TestStoreProvider });
  // Assert
  expect(screen.getByTestId("inline-model-selector")).toBeInTheDocument();
});
```

### Step 4: テストケース TC-I-2 の実装

**テストケース TC-I-2: モデル選択後にチャット送信が動作する**

- 前提: InlineModelSelectorでモデルが選択済み
- 手順: テキストを入力しsendボタンを押す（P39準拠: fireEvent使用）
- 期待: チャット送信IPC呼び出しが行われる

```tsx
it("TC-I-2: モデル選択後にチャット送信が動作する", async () => {
  // Arrange
  const mockSend = vi.fn();
  // Act
  render(<ChatView onSend={mockSend} />, { wrapper: TestStoreProvider });
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "テストメッセージ" },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /送信/i }));
  });
  // Assert
  expect(mockSend).toHaveBeenCalledOnce();
});
```

### Step 5: テストケース TC-I-3 の実装

**テストケース TC-I-3: モデル未選択時にLLMGuidanceBannerが表示される**

- 前提: Storeのselected model が null
- 手順: ChatViewをレンダリングする
- 期待: `data-testid="llm-guidance-banner"` が表示される

```tsx
it("TC-I-3: モデル未選択時にLLMGuidanceBannerが表示される", () => {
  render(<ChatView />, { wrapper: EmptyModelStoreProvider });
  expect(screen.getByTestId("llm-guidance-banner")).toBeInTheDocument();
});
```

### Step 6: テストケース TC-I-4 の実装

**テストケース TC-I-4: モデル選択後にLLMGuidanceBannerが非表示になる**

- 前提: Storeのselected model が有効な値
- 手順: ChatViewをレンダリングする
- 期待: `data-testid="llm-guidance-banner"` が DOM に存在しない

```tsx
it("TC-I-4: モデル選択後にLLMGuidanceBannerが非表示になる", () => {
  render(<ChatView />, { wrapper: SelectedModelStoreProvider });
  expect(screen.queryByTestId("llm-guidance-banner")).not.toBeInTheDocument();
});
```

### Step 7: テストケース TC-I-5 の実装

**テストケース TC-I-5: ストリーミング中はInlineModelSelectorがdisabledになる**

- 前提: Storeのstreaming状態がtrue
- 手順: ChatViewをレンダリングする
- 期待: `data-testid="inline-model-selector"` のボタンが disabled 属性を持つ

```tsx
it("TC-I-5: ストリーミング中はInlineModelSelectorがdisabledになる", () => {
  render(<ChatView />, { wrapper: StreamingStoreProvider });
  const selector = screen.getByTestId("inline-model-selector");
  expect(selector).toHaveAttribute("data-disabled", "true");
  // または: expect(selector.querySelector("button")).toBeDisabled();
});
```

### Step 8: Red確認

Phase 5実装前にテストがすべて失敗（Red）であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx
```

期待: 5件すべてFAIL（Redステータス）

## 統合テスト連携

本Phaseで作成する5件の統合テスト（TC-I-1〜TC-I-5）は、Phase 1の受け入れ基準AC-1〜AC-4を直接検証する:

| テストケース | 対応AC | 検証内容                 |
| ------------ | ------ | ------------------------ |
| TC-I-1       | AC-1   | InlineModelSelector表示  |
| TC-I-2       | AC-3   | チャット送信連動         |
| TC-I-3       | AC-2   | モデル未選択時バナー表示 |
| TC-I-4       | AC-2   | モデル選択後バナー非表示 |
| TC-I-5       | AC-1   | ストリーミング中disabled |

Phase 5実装前にすべてRed（失敗）であることを確認する。

## 成果物

| 成果物             | パス                                                                             | 説明                          |
| ------------------ | -------------------------------------------------------------------------------- | ----------------------------- |
| 統合テストファイル | apps/desktop/src/renderer/views/ChatView/**tests**/ChatView.integration.test.tsx | 5テストケースを含む統合テスト |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 4
```

## 完了条件

- [ ] TC-I-1: InlineModelSelector表示テストが記述されている
- [ ] TC-I-2: チャット送信動作テストが記述されている
- [ ] TC-I-3: モデル未選択時バナー表示テストが記述されている
- [ ] TC-I-4: モデル選択後バナー非表示テストが記述されている
- [ ] TC-I-5: ストリーミング中disabled テストが記述されている
- [ ] P39準拠: fireEventを使用しuserEventを使用していない
- [ ] P40準拠: `cd apps/desktop` で実行してRedを確認した
- [ ] テストファイルのインポートパスが既存テストと整合している（P63対策）

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
