# Phase 4: テスト作成 (TDD Red段階)

## メタ情報

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001               |
| タスク名  | スキルウィザード Q5 複数選択時の「主ツール」UI表示 |
| フェーズ  | Phase 4: テスト作成 (TDD Red段階)                  |
| 前提Phase | Phase 3                                            |
| 後続Phase | Phase 5                                            |
| 作成日    | 2026-04-13                                         |
| 分類      | UI task (VISUAL)                                   |

---

## 目的

TDD (テスト駆動開発) の Red 段階として、実装前に失敗するテストを先に記述する。
Q5 で複数ツールが選択されたときに「主ツール」バッジが表示されることを検証するテストスイートを
`ConversationRoundStep.test.tsx` に追加し、現時点では全テストが **fail** することを確認する。

---

## 事前確認

### 依存関係整合

以下のコマンドを実行し、依存関係が正常にインストール・ビルドされていることを確認する。

```bash
# モノレポ全体の依存関係インストール
pnpm install

# shared パッケージのビルド（他パッケージの型解決に必要）
pnpm --filter @repo/shared build
```

### 対象ファイルの確認

| ファイル種別   | パス                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` |

---

## テストスイート設計

### テストファイル: `ConversationRoundStep.test.tsx`

追加するテストスイートは既存の `describe` ブロック内、または新規 `describe('Q5 主ツールバッジ表示', ...)` ブロックとして追加する。

---

### テストケース1: Q5で2ツール選択時に最初のツールに「主ツール」バッジが表示される（AC-1）

**目的**: Q5 で `selectedOptions` が2件のとき、最初の選択肢 (`selectedOptions[0]`) に対応するオプション要素内に「主ツール」バッジが表示されることを確認する。

```typescript
it("Q5で2ツール選択時に最初のツールに「主ツール」バッジが表示される", () => {
  // Arrange: Q5 に2ツールが選択されている状態のpropsを準備
  // answer.selectedOptions = ['toolA', 'toolB']
  // key === 'q5' のQuestionオブジェクトを含むpropsをセットアップ
  // Act: コンポーネントをレンダリング
  // Assert: 最初の選択肢 'toolA' に対応するエレメントに「主ツール」バッジが存在する
  // expect(screen.getByText('主ツール')).toBeInTheDocument()
  // 2番目以降の選択肢にはバッジが存在しない
  // expect(screen.getAllByText('主ツール')).toHaveLength(1)
});
```

**検証内容**:

- 「主ツール」というテキストを持つバッジ要素が DOM に存在すること
- バッジが最初の選択肢にのみ表示され、2番目以降には表示されないこと

---

### テストケース2: Q5で1ツールのみ選択時にバッジが表示されない（AC-2）

**目的**: Q5 で `selectedOptions` が1件のとき、「主ツール」バッジが一切表示されないことを確認する。

```typescript
it("Q5で1ツールのみ選択時にバッジが表示されない", () => {
  // Arrange: Q5 に1ツールのみ選択されている状態
  // answer.selectedOptions = ['toolA']
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
});
```

**検証内容**:

- `selectedOptions.length === 1` のとき、「主ツール」バッジが DOM に存在しないこと

---

### テストケース3: バッジのaria-labelに「主ツールとして使用される」が含まれる（AC-3）

**目的**: アクセシビリティ要件として、「主ツール」バッジの `aria-label` 属性に「主ツールとして使用される」という文字列が含まれていることを確認する。

```typescript
it("バッジのaria-labelに「主ツールとして使用される」が含まれる", () => {
  // Arrange: Q5 に2ツール選択状態
  // Act: コンポーネントをレンダリング
  // Assert: aria-label を持つバッジ要素の属性を確認
  // const badge = screen.getByText('主ツール')
  // expect(badge).toHaveAttribute('aria-label', expect.stringContaining('主ツールとして使用される'))
});
```

**検証内容**:

- バッジ要素またはその親要素の `aria-label` 属性が `主ツールとして使用される` という文字列を含むこと

---

### テストケース4: Q5以外の設問でバッジが表示されない（Q3, Q4での非表示確認）

**目的**: Q5 固有のロジックが他の設問に影響しないことを確認する。Q3・Q4 でも複数選択が可能な設問がある場合、「主ツール」バッジが表示されないことを検証する。

```typescript
it("Q3で複数選択してもバッジが表示されない", () => {
  // Arrange: key === 'q3' の設問に2件以上のselectedOptions
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
});

it("Q4で複数選択してもバッジが表示されない", () => {
  // Arrange: key === 'q4' の設問に2件以上のselectedOptions
  // Act: コンポーネントをレンダリング
  // Assert: 「主ツール」バッジが存在しない
  // expect(screen.queryByText('主ツール')).not.toBeInTheDocument()
});
```

**検証内容**:

- Q3・Q4 で `selectedOptions.length >= 2` であっても「主ツール」バッジが表示されないこと

---

### テストケース5: Q5で3ツール選択時も最初のツールのみバッジ表示

**目的**: 3件以上選択した場合でも、最初の選択肢 (`selectedOptions[0]`) にのみバッジが表示され、2番目・3番目にはバッジが表示されないことを確認する。

```typescript
it("Q5で3ツール選択時も最初のツールのみバッジが表示される", () => {
  // Arrange: Q5 に3ツール選択状態
  // answer.selectedOptions = ['toolA', 'toolB', 'toolC']
  // Act: コンポーネントをレンダリング
  // Assert: バッジが1つだけ存在し、最初の選択肢に対応していること
  // expect(screen.getAllByText('主ツール')).toHaveLength(1)
  // 最初のオプション内にバッジが存在することを確認
});
```

**検証内容**:

- `selectedOptions.length >= 3` でも「主ツール」バッジが1つだけ存在すること
- バッジが `selectedOptions[0]` に対応するオプション要素の内部に存在すること

---

## 実行コマンド

### テスト実行（デスクトップアプリのみ）

```bash
pnpm --filter @repo/desktop test
```

### 対象ファイルを絞ったテスト実行

```bash
pnpm --filter @repo/desktop test -- ConversationRoundStep
```

### ウォッチモードで実行（開発中）

```bash
pnpm --filter @repo/desktop test -- --watch ConversationRoundStep
```

---

## Red確認方法

1. 上記テストケースをすべて `ConversationRoundStep.test.tsx` に追加する
2. `pnpm --filter @repo/desktop test -- ConversationRoundStep` を実行する
3. 追加した5件のテストがすべて **FAIL** することを確認する
   - 実装がまだ存在しないため、`queryByText('主ツール')` が `null` を返し、`toBeInTheDocument()` が失敗する
4. 既存のテストケースが引き続き **PASS** することを確認する（既存テストが壊れていないこと）
5. Red 確認が取れたら Phase 5 の実装に移行する

---

## 完了基準

- [ ] 5件のテストケースがすべて `ConversationRoundStep.test.tsx` に追加されている
- [ ] `pnpm --filter @repo/desktop test -- ConversationRoundStep` 実行で追加テストが全 FAIL
- [ ] 既存テストは全 PASS のまま維持されている
- [ ] Phase 5 (実装) へのブロッカーがない
