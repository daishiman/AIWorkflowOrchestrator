# Phase 6: テスト拡充

## メタ情報

| 項目          | 内容                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 6                                                                                                                         |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                      |
| 作成日        | 2026-03-21                                                                                                                |
| 担当          | -                                                                                                                         |
| ステータス    | 未着手                                                                                                                    |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-5-implementation.md` |

## 目的

Phase 7 のカバレッジ確認（Line: 80%以上、Branch: 60%以上、Function: 80%以上）に備え、Phase 4/5 で不足しているエッジケース・アクセシビリティ・ライト/ダークモードのテストを追加する。

## 実行タスク

### タスク1: カバレッジ仮計測と不足箇所の特定

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# カバレッジレポート生成
pnpm vitest run --coverage \
  src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx

# カバレッジ結果確認（特に branch coverage に注目）
cat coverage/coverage-summary.json | grep -A 10 '"InlineModelSelector"'
```

### タスク2: エッジケーステストの追加

| ID   | テスト名                                                                       | 目的                 |
| ---- | ------------------------------------------------------------------------------ | -------------------- |
| T9-1 | プロバイダーリストが空の場合、空状態メッセージが表示されること                 | 境界値               |
| T9-2 | 選択したプロバイダーのモデルリストが空の場合、空状態メッセージが表示されること | 境界値               |
| T9-3 | ヘルスチェック中（checking）に選択操作が可能であること                         | 境界値               |
| T9-4 | IPC 経由の Provider 取得エラー時にエラー表示が出ること（ProviderFetchError）   | 異常系               |
| T9-5 | onSelectionChange が渡されていない場合でも、選択操作でクラッシュしないこと     | 防御的プログラミング |
| T9-6 | providers prop が直接渡された場合、Store の値より優先されること                | 正常系（prop優先）   |

**テストコード例**:

```typescript
it("T9-1: プロバイダーリストが空のとき、空状態メッセージが表示される", async () => {
  render(<InlineModelSelector providers={[]} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button"));
  });
  expect(screen.getByText(/プロバイダーがありません|No providers/i)).toBeInTheDocument();
});

it("T9-4: ProviderFetch エラー時にエラー表示が出る", () => {
  // useLLMProviders がエラー状態を返すようにモック
  vi.mocked(useLLMProviders).mockReturnValue({
    providers: [],
    isLoading: false,
    error: new Error("IPC error"),
  });
  render(<InlineModelSelector />);
  expect(screen.getByRole("alert")).toBeInTheDocument();
});
```

### タスク3: アクセシビリティテストの追加

| ID    | テスト名                                                                             | 目的           |
| ----- | ------------------------------------------------------------------------------------ | -------------- |
| T10-1 | トリガーボタンに `aria-haspopup="listbox"` 属性があること                            | ARIA属性       |
| T10-2 | ドロップダウンが開いたとき `aria-expanded="true"` になること                         | ARIA属性       |
| T10-3 | ドロップダウンが閉じたとき `aria-expanded="false"` になること                        | ARIA属性       |
| T10-4 | 選択されたProviderの option に `aria-selected="true"` が設定されていること           | ARIA属性       |
| T10-5 | ドロップダウン開閉後にトリガーボタンにフォーカスが戻ること                           | フォーカス管理 |
| T10-6 | `aria-label` または `aria-labelledby` が設定されていること（スクリーンリーダー対応） | ARIA属性       |

**テストコード例**:

```typescript
it("T10-2: ドロップダウンが開いたとき aria-expanded=true になる", async () => {
  render(<InlineModelSelector providers={mockProviders} />);
  const trigger = screen.getByRole("button");
  await act(async () => {
    fireEvent.click(trigger);
  });
  expect(trigger).toHaveAttribute("aria-expanded", "true");
});

it("T10-5: ドロップダウンを閉じた後にトリガーにフォーカスが戻る", async () => {
  render(<InlineModelSelector providers={mockProviders} />);
  const trigger = screen.getByRole("button");
  await act(async () => {
    fireEvent.click(trigger);
  });
  await act(async () => {
    fireEvent.keyDown(document, { key: "Escape" });
  });
  expect(document.activeElement).toBe(trigger);
});
```

### タスク4: ライト/ダークモードテスト

| ID    | テスト名                                                                     | 目的                 |
| ----- | ---------------------------------------------------------------------------- | -------------------- |
| T11-1 | ライトモードで CSS 変数によるカラー適用が正しいこと（クラス名検証）          | デザイントークン検証 |
| T11-2 | ダークモードで CSS 変数によるカラー適用が正しいこと（クラス名検証）          | デザイントークン検証 |
| T11-3 | compact=true の場合、ライト/ダーク両モードでコンパクトクラスが適用されること | デザイントークン検証 |

**テストコード例**:

```typescript
// P47対策: selectorTriggerStyles 定数をインポートして検証
import { selectorTriggerStyles } from "../InlineModelSelector";

it("T11-1: ライトモードでトリガーにデフォルトスタイルが適用される", () => {
  render(<InlineModelSelector providers={mockProviders} />);
  const trigger = screen.getByRole("button");
  expect(trigger.className).toContain(selectorTriggerStyles.base);
  expect(trigger.className).toContain(selectorTriggerStyles.default);
});
```

### タスク5: 型安全性テスト

```typescript
// InlineModelSelectorProps 型の制約をコンパイル時に確認
import type { InlineModelSelectorProps } from "../InlineModelSelector";

// onSelectionChange のコールバック引数型が正しいことを型チェックで確認
type SelectionCallback = NonNullable<
  InlineModelSelectorProps["onSelectionChange"]
>;
type SelectionArg = Parameters<SelectionCallback>[0];
// SelectionArg は { providerId: string; modelId: string } であること
```

## 参照資料

### コード品質ルール

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト設計 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-4-test.md`           |
| Phase 5 実装       | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-5-implementation.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                  | 対策                                                     |
| ---------- | ------------------------------------- | -------------------------------------------------------- |
| P9         | テスト間で状態共有                    | `beforeEach` でリセット                                  |
| P39        | happy-dom環境でのuserEvent非互換      | `fireEvent` を使用                                       |
| P40        | テスト実行ディレクトリ依存            | `apps/desktop` から実行する                              |
| P41        | v8カバレッジのインライン関数カウント  | インライン arrow function のコールバックを明示的にテスト |
| P47        | CSS変数ベーステストのアサーション戦略 | デザイントークン定数をインポートして使用                 |

### システム仕様（aiworkflow-requirements）

| 参照資料                     | パス                                                                              | 内容                             |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| UI/UXコンポーネント          | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 既存UIコンポーネント構造         |
| コンポーネントテストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | コンポーネントテスト設計パターン |

## 実行手順

1. **タスク1の実施**: カバレッジを仮計測し、不足箇所を特定する
2. **タスク2の実施**: エッジケーステストを追加する
3. **タスク3の実施**: アクセシビリティテストを追加する
4. **タスク4の実施**: ライト/ダークモードテストを追加する
5. **タスク5の実施**: 型安全性テストを追加する
6. **再計測**: カバレッジが基準値に近づいているか確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと 1 対 1 で突合する

## 成果物

| 成果物                       | パス                                                                                                                      | 説明                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-6-test-expansion.md` | テスト拡充計画書         |
| 追加テストコード             | `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`（追記）                                 | T9〜T11 テストケース追加 |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 6
```

## 完了条件

- [ ] タスク1でカバレッジ仮計測を実施し、不足箇所を特定した
- [ ] T9-1 〜 T9-6（エッジケース）を追加実装した
- [ ] T10-1 〜 T10-6（アクセシビリティ）を追加実装した
- [ ] T11-1 〜 T11-3（ライト/ダークモード）を追加実装した
- [ ] 型安全性テスト（タスク5）を追加した
- [ ] 全追加テストが PASS であることを確認した
- [ ] P41対策（インライン arrow function のカバレッジ確認）を実施した
- [ ] P47対策（デザイントークン定数インポート）がテストに適用されている

## 次のPhase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
