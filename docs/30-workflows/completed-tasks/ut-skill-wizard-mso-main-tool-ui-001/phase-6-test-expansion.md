# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001               |
| タスク名  | スキルウィザード Q5 複数選択時の「主ツール」UI表示 |
| フェーズ  | Phase 6: テスト拡充                                |
| 前提Phase | Phase 5                                            |
| 後続Phase | Phase 7                                            |
| 作成日    | 2026-04-13                                         |
| 分類      | UI task (VISUAL)                                   |

---

## 目的

Phase 5 の実装で Green になった基本テストに加え、以下の観点でテストを拡充する。

- **fail path**: 選択解除や選択数の変化など、バッジが消えるべき状況の検証
- **回帰 guard**: Q5 以外の全設問（Q1, Q2, Q3, Q4, Q6）でバッジが表示されないことの網羅的確認
- **補助 command**: 選択順序の変化によって主ツールが正しく切り替わることの検証

これらにより、将来の実装変更によるリグレッションを防ぐセーフティネットを構築する。

---

## 追加テストケース

### テストケース1: 選択解除後にバッジが消える（selectedOptions が1件以下になった時）

**目的**: Q5 で一度2件選択した後、1件に減った（選択解除した）状態でバッジが消えることを確認する。
これは `selectedOptions.length >= 2` の条件が動的に評価されることを保証する。

```typescript
it("Q5でツールの選択を解除してselectedOptionsが1件になるとバッジが消える", () => {
  // Arrange: Q5 に1件のみ選択されている状態（選択解除後の状態を模擬）
  // answer.selectedOptions = ['toolA']  // toolB を解除した後の状態
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
});

it("Q5でselectedOptionsが0件の時にバッジが表示されない", () => {
  // Arrange: Q5 に0件選択状態
  // answer.selectedOptions = []
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
});
```

**検証内容**:

- `selectedOptions.length === 1` のとき、バッジが表示されないこと
- `selectedOptions.length === 0` のとき、バッジが表示されないこと（0件選択時の確認は後述のテストケース4と統合可能）

---

### テストケース2: 選択順序変更（別ツールを先に選ぶと主ツールが変わる）

**目的**: `selectedOptions[0]` が変わったときに、バッジが新しい最初の選択肢に移動することを確認する。
表示ロジックが `selectedOptions` 配列の先頭要素を常に参照していることを保証する。

```typescript
it("Q5でtoolBが先頭に来るとtoolBにバッジが表示される", () => {
  // Arrange: Q5 に2ツール選択状態、ただし toolB が先頭
  // answer.selectedOptions = ['toolB', 'toolA']  // toolB が先に選ばれた状態
  // Act: コンポーネントをレンダリング
  // Assert: toolB のオプション要素にバッジが存在する
  // toolA のオプション要素にはバッジが存在しない
  // expect(screen.getAllByText('主ツール')).toHaveLength(1)
  // toolB に対応する要素内に「主ツール」バッジが存在することを確認
});
```

**検証内容**:

- `selectedOptions` 配列の順序が変わったとき、バッジが `selectedOptions[0]` に対応するオプションに表示されること
- バッジが常に1つだけ表示されること

---

### テストケース3: Q5以外の設問でバッジが表示されない（Q1, Q2, Q3, Q4, Q6の回帰確認）

**目的**: Q5 固有のバッジロジックが他の全設問に影響しないことを網羅的に確認する。
Phase 4 では Q3・Q4 のみ確認したが、Phase 6 では全設問を対象にした回帰 guard を追加する。

```typescript
describe("Q5以外の設問でバッジが表示されない（回帰guard）", () => {
  const nonQ5Keys = ["q1", "q2", "q3", "q4", "q6"];

  nonQ5Keys.forEach((questionKey) => {
    it(`${questionKey}で複数選択してもバッジが表示されない`, () => {
      // Arrange: 各設問キーに対して2件以上の selectedOptions を設定
      // key === questionKey の設問に answer.selectedOptions = ['optionA', 'optionB']
      // Act: コンポーネントをレンダリング
      // Assert: 「主ツール」バッジが存在しない
      // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
    });
  });
});
```

**検証内容**:

- Q1, Q2, Q3, Q4, Q6 のいずれも `selectedOptions.length >= 2` でバッジが表示されないこと
- 各設問キーごとに独立したテストケースとして実行されること

---

### テストケース4: 0件選択時のバッジなし確認

**目的**: Q5 で `selectedOptions` が空配列のとき、バッジが表示されないことを確認する。
`selectedOptions[0]` が `undefined` になるケースでのエラーがないことも兼ねて検証する。

```typescript
it("Q5でselectedOptionsが空配列の時にバッジが表示されない", () => {
  // Arrange: Q5 に0件選択状態
  // answer.selectedOptions = []
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
  // Assert: コンポーネントがクラッシュしないこと（正常にレンダリングされること）
  // expect(screen.getByRole('...')).toBeInTheDocument()  // コンポーネント全体が存在する
});

it("Q5でselectedOptionsがundefinedの時にバッジが表示されない", () => {
  // Arrange: Q5 に selectedOptions が未定義の状態
  // answer.selectedOptions = undefined  → answer.selectedOptions ?? [] により [] として処理される
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
  // Assert: コンポーネントがクラッシュしないこと
});
```

**検証内容**:

- `selectedOptions` が `[]` のとき、バッジが表示されないこと
- `selectedOptions` が `undefined` のとき（`answer.selectedOptions ?? []` により `[]` に正規化される）、バッジが表示されないこと
- いずれのケースでもコンポーネントがエラーなくレンダリングされること

---

## 実行コマンド

### テスト拡充後の全テスト実行

```bash
pnpm --filter @repo/desktop test -- ConversationRoundStep
```

### 詳細出力付きで実行（テストケース名を確認）

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose ConversationRoundStep
```

### 全テストスイートでのリグレッション確認

```bash
pnpm --filter @repo/desktop test
```

### カバレッジレポートの確認（オプション）

```bash
pnpm --filter @repo/desktop test -- --coverage ConversationRoundStep
```

---

## 完了基準

- [ ] テストケース1（選択解除後のバッジ消去）が追加され PASS している
- [ ] テストケース2（選択順序変更による主ツール切り替え）が追加され PASS している
- [ ] テストケース3（Q1, Q2, Q3, Q4, Q6 の回帰 guard）が追加され全 5 件 PASS している
- [ ] テストケース4（0件・undefined 時のバッジなし確認）が追加され PASS している
- [ ] Phase 4 で作成した基本テスト 5 件が引き続き PASS している
- [ ] `pnpm --filter @repo/desktop test -- ConversationRoundStep` が全 PASS
- [ ] `pnpm --filter @repo/desktop test` で既存テスト全体がリグレッションなし
- [ ] Phase 7 へのブロッカーがない
