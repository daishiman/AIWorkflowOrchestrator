# Phase 6: テスト拡充 — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                          |
| ------------- | ------------------------------------------- |
| 機能名        | chatview-inline-model-selector-integration  |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| Phase         | 6                                           |
| 作成日        | 2026-03-21                                  |
| 依存          | Phase 5（実装）完了後                       |
| 前Phase成果物 | ./phase-5-implementation.md                 |

## 目的

Phase 4テストで網羅できていなかったエッジケースを追加し、境界値・異常系のカバレッジを向上させる。

## 実行タスク

- エッジケーステスト3件を `ChatView.integration.test.tsx` に追加する
- P39・P40の制約を引き続き遵守する
- Phase 7カバレッジ基準（Line 80%以上）の達成に貢献する

## 参照資料

| 資料                                       | パス                                   |
| ------------------------------------------ | -------------------------------------- |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | ./phase-2-design.md                    |
| Phase 4 テスト仕様                         | ./phase-4-test.md                      |
| Phase 5 実装成果物                         | ./phase-5-implementation.md            |
| コード品質ルール（カバレッジ基準）         | .claude/rules/02-code-quality.md       |
| P39: happy-dom環境でのuserEvent非互換      | .claude/rules/06-known-pitfalls.md#P39 |

## 実行手順

### Step 1: 現在のカバレッジ計測

Phase 5実装後のカバレッジを確認してから、追加が必要なケースを特定する。

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/views/ChatView/
```

Line Coverage 80%未満の行がある場合、その箇所に対してエッジケーステストを設計する。

### Step 2: エッジケース TC-E-1 の実装

**テストケース TC-E-1: プロバイダー0件時のChatView表示**

- 前提: StoreのproviderListが空配列
- 手順: ChatViewをレンダリングする
- 期待: InlineModelSelectorは表示されるが、セレクタ内の選択肢が0件であることを示すUI（空状態）が表示される
- 期待: チャット送信ボタンが disabled である

```tsx
it("TC-E-1: プロバイダー0件時はInlineModelSelectorの空状態が表示される", () => {
  render(<ChatView />, { wrapper: EmptyProviderStoreProvider });
  expect(screen.getByTestId("inline-model-selector")).toBeInTheDocument();
  // セレクタは存在するが選択肢が空であることを確認
  // 送信ボタンが無効化されていることを確認
  expect(screen.getByRole("button", { name: /送信/i })).toBeDisabled();
});
```

### Step 3: エッジケース TC-E-2 の実装

**テストケース TC-E-2: セレクタ変更中のメッセージ送信ガード**

- 前提: InlineModelSelectorのドロップダウンが開いている状態
- 手順: テキストを入力してsendボタンを押す（P39準拠: fireEvent使用）
- 期待: ドロップダウンが開いている間は送信がブロックされる、またはドロップダウンが閉じた後に送信が実行される

```tsx
it("TC-E-2: ドロップダウンが開いている間はメッセージ送信がガードされる", async () => {
  render(<ChatView />, { wrapper: TestStoreProvider });
  // ドロップダウンを開く
  fireEvent.click(screen.getByTestId("inline-model-selector"));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "テスト" },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /送信/i }));
  });
  // ドロップダウンが開いている状態での送信はガードされる
  // （実装仕様に応じてアサーションを調整する）
});
```

### Step 4: エッジケース TC-E-3 の実装

**テストケース TC-E-3: RAGモードとインラインモデルセレクタの共存**

- 前提: RAGモード（ファイル選択ペイン表示）がアクティブな状態
- 手順: ChatViewをRAGモードでレンダリングする
- 期待: InlineModelSelectorがヘッダーに引き続き表示される
- 期待: RAGモード特有のUIが同時に表示される

```tsx
it("TC-E-3: RAGモード中もInlineModelSelectorが表示される", () => {
  render(<ChatView />, { wrapper: RagModeStoreProvider });
  expect(screen.getByTestId("inline-model-selector")).toBeInTheDocument();
  // RAGモード特有のUI（例: ファイル選択ペイン）も同時に存在することを確認
});
```

### Step 5: 全テスト実行・Green確認

追加テストを含めた全テストがGreenであることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx
```

期待: TC-I-1〜TC-I-5 + TC-E-1〜TC-E-3 = 計8件すべてGreen

## 統合テスト連携

Phase 4の基本テスト5件に加え、本Phaseで追加する3件のエッジケーステスト（TC-E-1〜TC-E-3）を含む計8件がすべてGreenであることを確認する。

## 成果物

| 成果物                         | パス                                                                             | 説明                           |
| ------------------------------ | -------------------------------------------------------------------------------- | ------------------------------ |
| 統合テストファイル（拡充済み） | apps/desktop/src/renderer/views/ChatView/**tests**/ChatView.integration.test.tsx | エッジケース3件を追加（計8件） |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 6
```

## 完了条件

- [ ] TC-E-1: プロバイダー0件時テストが追加・Greenである
- [ ] TC-E-2: セレクタ変更中の送信ガードテストが追加・Greenである
- [ ] TC-E-3: RAGモード共存テストが追加・Greenである
- [ ] P39準拠: fireEventを使用しuserEventを使用していない
- [ ] Phase 4の既存5件テストが非デグレード（すべてGreen）
- [ ] 追加テストを含めカバレッジがPhase 7の目標（Line 80%以上）に近づいている

## 次のPhase

[Phase 7: カバレッジ確認](./phase-7-coverage.md)
