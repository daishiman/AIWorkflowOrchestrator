# MultiSelectCheckbox maxSelect プロパティ実装 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-UI-W-MC-06                                 |
| タスク名     | MultiSelectCheckbox maxSelect プロパティ実装    |
| 分類         | 改善                                            |
| 対象機能     | interview-widgets / MultiSelectCheckbox         |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 6 (TASK-UI-02 ConversationPanel 孤立解消) |
| 発見日       | 2026-04-06                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`MultiSelectCheckbox` コンポーネントは、スキルインタビュー（`interview-widgets`）において
ユーザーが複数の選択肢を選べる UI を提供している。
現在の実装（`MultiSelectCheckboxProps`）には `maxSelect` プロパティが存在せず、
何個でも選択できてしまう状態になっている。

スキルの仕様上、「最大 N 個まで選択可能」という制約を持つ質問が想定されており、
その制約をコンポーネントレベルで表現する手段が存在しない。

### 1.2 問題点・課題

- **現状の `MultiSelectCheckboxProps`** には `maxSelect?: number` が定義されていない。
- 制限超過時の UI フィードバック（チェックボックスの非活性化、カウンター表示など）が存在しない。
- テストファイル `MultiSelectCheckbox.test.tsx` の 128 行目に以下の `it.todo` が残っている：
  ```ts
  it.todo("W-MC-06: cannot select more than maxSelect when limit is reached");
  ```
  この `todo` は `maxSelect` 未実装を明示する目的で記録されたが、
  未タスクと二重管理になっている状態を解消するためにも本タスクで実装する必要がある。

### 1.3 放置した場合の影響

- スキル仕様で「最大 2 択」などの制約を持つ質問が存在しても、UI 側で制限できない。
- 親コンポーネント（`QuestionCard` / `SkillCreatorConversationPanel` など）が
  選択数バリデーションを個別に実装するか、バリデーションなしで送信してしまうリスクがある。
- `it.todo` が永久に残り続け、テストカバレッジレポートが不完全になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`MultiSelectCheckbox` コンポーネントに `maxSelect?: number` プロパティを追加し、
選択上限に達した際に未選択のチェックボックスを非活性化することで、
ユーザーが意図せず上限を超えて選択できないようにする。

### 2.2 最終ゴール

- `maxSelect` を渡すと、選択済み数が `maxSelect` に達した時点で
  未選択のチェックボックスが `disabled` 状態になる。
- `maxSelect` が未指定（`undefined`）の場合は従来どおり制限なしで動作する。
- `it.todo("W-MC-06: ...")` を実際のテストケースに昇格させ、グリーンにする。

### 2.3 スコープ

#### 含むもの

- `MultiSelectCheckboxProps` への `maxSelect?: number` 追加
- 制限到達時の未選択チェックボックスへの `disabled` 付与ロジック
- 制限到達時の視覚的フィードバック（`disabled` スタイル適用）
- `it.todo` を実際のテストに昇格させて通過させること
- `maxSelect` を渡した場合の追加テストケース（境界値含む）

#### 含まないもの

- 「あと N 個選べます」などのカウンター表示 UI（別タスクとして切り出し可能）
- スキル仕様 JSON スキーマの `maxSelect` 対応（別タスク）
- `SkillCreatorUserInputOption` の型定義変更
- 親コンポーネント（`QuestionCard` 等）への `maxSelect` 連携（別タスク）

### 2.4 成果物

1. 変更済み `MultiSelectCheckbox.tsx`（`maxSelect` プロパティ追加、制限ロジック実装）
2. 変更済み `MultiSelectCheckbox.test.tsx`（`it.todo` 削除・実テストに置換、追加テスト）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/skill/interview-widgets/MultiSelectCheckbox.tsx` が
  現行の形（props: `options`, `selectedIds`, `onToggle`, `disabled?`）であること。
- Vitest が実行可能な環境であること（`pnpm --filter @repo/desktop test`）。

### 3.2 依存タスク

なし（単独コンポーネント変更のため他タスクへの依存なし）。

### 3.3 必要な知識

- React の `disabled` prop の使い方とチェックボックスの制御パターン
- TypeScript のオプショナルプロパティ（`prop?: Type`）
- Vitest / React Testing Library の `render`, `fireEvent`, `screen` の基本操作
- `it.todo` を通常の `it(...)` に変換する方法

### 3.4 推奨アプローチ

`MultiSelectCheckbox` コンポーネント内で以下のロジックを追加する：

```tsx
const isMaxReached = maxSelect !== undefined && selectedIds.length >= maxSelect;
// 各チェックボックスの disabled 判定
const isDisabled =
  disabled || (isMaxReached && !selectedIds.includes(option.id));
```

上記を `<input type="checkbox" ... disabled={isDisabled} />` に適用し、
`label` の `className` にも `cursor-not-allowed opacity-50` を条件付きで追加する。

---

## 4. 実行手順

### Phase構成

| Phase | 名称                 | 概要                                       |
| ----- | -------------------- | ------------------------------------------ |
| 1     | 型定義・ロジック実装 | props 追加と制限ロジックの実装             |
| 2     | テスト実装           | `it.todo` 昇格と追加テストケース作成       |
| 3     | 動作確認・完了       | ローカルテスト実行・品質チェックリスト確認 |

---

### Phase 1: 型定義・ロジック実装

#### 目的

`MultiSelectCheckboxProps` に `maxSelect?: number` を追加し、
選択上限ロジックをコンポーネントに組み込む。

#### 手順

1. `apps/desktop/src/renderer/components/skill/interview-widgets/MultiSelectCheckbox.tsx` を開く。
2. `MultiSelectCheckboxProps` インターフェースに以下を追加する：
   ```ts
   maxSelect?: number;
   ```
3. 関数引数の分割代入に `maxSelect` を追加する：
   ```tsx
   export function MultiSelectCheckbox({
     options,
     selectedIds,
     onToggle,
     disabled,
     maxSelect,
   }: MultiSelectCheckboxProps) {
   ```
4. 関数内（`return` の直前）に以下のロジックを追加する：
   ```tsx
   const isMaxReached =
     maxSelect !== undefined && selectedIds.length >= maxSelect;
   ```
5. `options.map(...)` 内の `<label>` と `<input>` を以下のように変更する：

   **label の className**（`disabled` 条件を以下に更新）：

   ```tsx
   ${disabled || (isMaxReached && !selectedIds.includes(option.id)) ? "cursor-not-allowed opacity-50" : ""}
   ```

   **input の disabled**：

   ```tsx
   disabled={disabled || (isMaxReached && !selectedIds.includes(option.id))}
   ```

#### 成果物

- 変更済み `MultiSelectCheckbox.tsx`

#### 完了条件

- TypeScript 型エラーがないこと（`pnpm typecheck` でエラーなし）
- `maxSelect` を指定しない場合、従来の動作が変わらないこと

---

### Phase 2: テスト実装

#### 目的

`it.todo("W-MC-06: ...")` を実際のテストケースに昇格させ、
`maxSelect` の各動作シナリオを網羅的に検証する。

#### 手順

1. `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx` を開く。
2. 128 行目の以下の行を削除する：
   ```ts
   it.todo("W-MC-06: cannot select more than maxSelect when limit is reached");
   ```
3. 同じ場所に以下のテストケースを追加する：

   **ケース 1: 上限到達時、未選択チェックボックスが disabled になる**

   ```tsx
   it("W-MC-06: disables unselected checkboxes when maxSelect is reached", () => {
     render(
       <MultiSelectCheckbox
         options={threeOptions}
         selectedIds={["a", "b"]}
         onToggle={vi.fn()}
         maxSelect={2}
       />,
     );

     const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
     // "a" と "b" は選択済み → disabled にならない
     expect(checkboxes[0].disabled).toBe(false);
     expect(checkboxes[1].disabled).toBe(false);
     // "c" は未選択かつ上限到達 → disabled になる
     expect(checkboxes[2].disabled).toBe(true);
   });
   ```

   **ケース 2: 上限未到達の場合、全チェックボックスが操作可能**

   ```tsx
   it("W-MC-06: does not disable checkboxes when selection is below maxSelect", () => {
     render(
       <MultiSelectCheckbox
         options={threeOptions}
         selectedIds={["a"]}
         onToggle={vi.fn()}
         maxSelect={2}
       />,
     );

     const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
     expect(checkboxes[0].disabled).toBe(false);
     expect(checkboxes[1].disabled).toBe(false);
     expect(checkboxes[2].disabled).toBe(false);
   });
   ```

   **ケース 3: maxSelect 未指定の場合、制限なし（後退互換性）**

   ```tsx
   it("W-MC-06: no restriction when maxSelect is undefined", () => {
     render(
       <MultiSelectCheckbox
         options={threeOptions}
         selectedIds={["a", "b", "c"]}
         onToggle={vi.fn()}
       />,
     );

     const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
     checkboxes.forEach((cb) => {
       expect(cb.disabled).toBe(false);
     });
   });
   ```

4. ファイルを保存する。

#### 成果物

- 変更済み `MultiSelectCheckbox.test.tsx`（`it.todo` なし、実テスト 3 件追加）

#### 完了条件

- `it.todo` が 0 件になること
- 追加したテストが全て `pass` すること

---

### Phase 3: 動作確認・完了

#### 目的

ローカルテスト実行と品質チェックリストによる最終確認を行う。

#### 手順

1. テストを実行して全件グリーンであることを確認する：
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx
   ```
2. 型チェックを実行する：
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. Lint を実行する：
   ```bash
   pnpm --filter @repo/desktop lint
   ```
4. 以下の完了条件チェックリストを確認する（次セクション参照）。

#### 成果物

- 全テストグリーンのローカル実行結果

#### 完了条件

- テストファイルに `it.todo` が残っていないこと
- `pnpm test`, `pnpm typecheck`, `pnpm lint` 全てエラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `MultiSelectCheckboxProps` に `maxSelect?: number` が追加されている
- [ ] `selectedIds.length >= maxSelect` の場合、未選択の `<input>` が `disabled` になる
- [ ] `maxSelect` が `undefined` の場合、従来の動作が変わらない（後退互換性）
- [ ] 既選択済みのチェックボックスは上限到達後も `disabled` にならない（解除可能）

### 品質要件

- [ ] `it.todo("W-MC-06: ...")` が削除されている
- [ ] W-MC-06 の実テストが少なくとも 3 ケース存在し、全て `pass` する
- [ ] `pnpm typecheck` でエラーなし
- [ ] `pnpm lint` でエラーなし
- [ ] 既存テスト（W-MC-02, W-MC-04, TC-16, TC-B05 等）が引き続き `pass` する

### ドキュメント要件

- [ ] 本タスク仕様書のステータスを「完了」に更新する
- [ ] `docs/30-workflows/unassigned-task/task-00-master-task-list.md` の当該行を更新する（存在する場合）

---

## 6. 検証方法

### テストケース

| テストID  | シナリオ                                   | 期待結果                                          |
| --------- | ------------------------------------------ | ------------------------------------------------- |
| W-MC-06-1 | `maxSelect=2`, 2 件選択済み → 未選択を確認 | 未選択のチェックボックスが `disabled=true`        |
| W-MC-06-2 | `maxSelect=2`, 1 件選択済み → 全件確認     | 全チェックボックスが `disabled=false`             |
| W-MC-06-3 | `maxSelect` 未指定, 3 件全選択済み → 確認  | 全チェックボックスが `disabled=false`（制限なし） |
| W-MC-06-4 | `maxSelect=2`, 選択済み項目をクリック      | `onToggle` が呼ばれる（解除可能）                 |

### 検証手順

1. Phase 3 の手順 1 のコマンドでテストを実行し、全件 `pass` を確認する。
2. `grep -n "it.todo" MultiSelectCheckbox.test.tsx` で `it.todo` が 0 件であることを確認する。
3. `MultiSelectCheckbox` を手動でレンダリングして目視確認する場合は、
   Storybook または `SkillCreatorConversationPanel` 経由で動作確認する。

---

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                                      |
| ----------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `disabled` 付与により既存テストが壊れる         | 中     | 低       | `maxSelect` 未指定時は従来ロジック通り動作することを確認（後退互換）      |
| 選択済み項目を `disabled` にしてしまう誤実装    | 中     | 中       | `!selectedIds.includes(option.id)` 条件を必ず付けること                   |
| label の `className` の `disabled` 条件が不整合 | 低     | 中       | `<input disabled>` と `<label className disabled-style>` を同一条件で制御 |
| `maxSelect=0` などの異常値が渡される            | 低     | 低       | 要件外のため対処不要（仕様外入力は呼び出し元の責任）                      |

---

## 8. 参照情報

### 関連ドキュメント

- 対象コンポーネント: `apps/desktop/src/renderer/components/skill/interview-widgets/MultiSelectCheckbox.tsx`
- テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx`
- 発見元タスク仕様書: `docs/30-workflows/unassigned-task/TASK-UI-02-conversation-panel-orphan-resolution.md`

### 参考資料

- React チェックボックス制御パターン: https://react.dev/reference/react-dom/components/input
- Vitest `it.todo` ドキュメント: https://vitest.dev/api/#test-todo

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
W-MC-06: maxSelect 制限 (TODO: maxSelect prop 未実装)
it.todo("W-MC-06: cannot select more than maxSelect when limit is reached");
```

（出典: `MultiSelectCheckbox.test.tsx` 128 行目, TASK-UI-02 Phase 6 テスト拡充時に記録）

### 補足事項

#### TASK-UI-02 での苦戦箇所（将来の課題解決に向けた記録）

**苦戦箇所 1: `it.todo` と未タスクの二重管理問題**

TASK-UI-02 の Phase 6（テスト拡充）において、`maxSelect` が未実装であることが判明した。
その時点では実装スコープ外のため `it.todo` として記録したが、
同時に未タスクとして本ファイルも作成することになり、**同一情報が 2 箇所に存在する状態**になった。

今後、`it.todo` を残す場合は必ず対応する未タスク指示書を同時作成すること。
逆に未タスク指示書が作成されたら `it.todo` をコメントで本ファイルのパスを指すか、
本タスク実装時に `it.todo` を削除してテストを実装すること。

**苦戦箇所 2: `maxSelect` 未実装によるテスト設計の制約**

`maxSelect` の動作仕様が未定義のため、テストケースの `selectedIds` と
`maxSelect` の組み合わせをどう設計すべきか判断できなかった。
本タスク実装時に「既選択項目は上限到達後も解除可能にする」という仕様を確定させること。
この判断が曖昧なまま実装すると、`disabled` 付与範囲の誤りが発生しやすい。

**推奨する仕様決定事項（本タスク着手前に確認）**

- 上限到達時、「未選択」のみ `disabled` にし「選択済み」は解除可能にするか？ → **YES（推奨）**
- `maxSelect=1` の場合は実質ラジオボタン相当になるが、`MultiSelectCheckbox` を流用するか？ → スコープ外
