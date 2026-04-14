# Phase 5: 実装

## メタ情報

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001               |
| タスク名  | スキルウィザード Q5 複数選択時の「主ツール」UI表示 |
| フェーズ  | Phase 5: 実装                                      |
| 前提Phase | Phase 4                                            |
| 後続Phase | Phase 6                                            |
| 作成日    | 2026-04-13                                         |
| 分類      | UI task (VISUAL)                                   |

---

## 目的

Phase 4 で作成した Red テストを Green にするための最小実装を行う。
`ConversationRoundStep.tsx` の `renderQuestion` 関数内に Q5 専用の「主ツール」バッジ表示ロジックを追加し、
受入条件 AC-1〜AC-4 をすべて満たす状態にする。

---

## 実装計画

### 修正ファイル一覧

| 種別 | ファイルパス                                                                  |
| ---- | ----------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |

新規ファイルの作成は不要。既存の `ConversationRoundStep.tsx` のみを修正する。

### 事前確認: packages/ui の既存バッジスタイル

実装前に以下を確認し、既存バッジコンポーネントやスタイルが再利用可能かどうかを判断する。

```bash
# packages/ui にバッジ関連コンポーネントがあるか確認
ls packages/ui/src/components/
grep -r "Badge\|badge" packages/ui/src/ --include="*.tsx" -l
```

- 既存の Badge コンポーネントが存在する場合: そのコンポーネントを import して使用する
- 存在しない場合: インライン Tailwind CSS でバッジを実装する（後述）

---

## 実装方針

### 1. `renderQuestion` 関数内での Q5 キー分岐によるバッジ表示制御

既存の `renderQuestion(idx)` 関数は全設問を統一的にレンダリングしている。
Q5 のバッジ表示は **この関数内** で `key === "q5"` の分岐により制御する。
関数シグネチャや呼び出し元は変更しない。

実装パターンの概要:

```typescript
// renderQuestion 関数内のオプションリストレンダリング箇所
// 各オプションをレンダリングするループ内で以下の判定を追加する

const isMainTool =
  key === "q5" &&
  selectedOptions.length >= 2 &&
  selectedOptions[0] === option.value;
```

- `key === "q5"`: Q5 設問のみに限定する（Q3・Q4 等には影響しない）
- `selectedOptions.length >= 2`: 2件以上選択されている場合のみバッジ表示
- `selectedOptions[0] === option.value`: 最初の選択肢 (`selectedOptions[0]`) のオプションにのみバッジ表示

### 2. 「主ツール」バッジの実装（インライン Tailwind スタイル）

packages/ui に既存 Badge コンポーネントが存在しない場合、以下のインライン実装を使用する。

```tsx
{
  isMainTool && (
    <span
      aria-label="主ツールとして使用される"
      className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
    >
      主ツール
    </span>
  );
}
```

Tailwind クラスの選定基準:

- `rounded-full`: バッジらしい丸みを持たせる
- `bg-blue-100 text-blue-800`: 他のバッジ（存在する場合）と色調を合わせる。なければ青系を使用
- `text-xs font-medium`: 小さめの強調テキスト
- `inline-flex items-center`: テキストとの縦位置を揃える

### 3. aria-label 追加（AC-3 対応）

上記 `<span>` 要素に `aria-label="主ツールとして使用される"` を付与する。
ボタン側は `aria-labelledby` で選択肢ラベルを参照し、`Slack` のような元の名前を保持する。
これにより、補助情報は伝えつつ button 名の exact match を壊さない。

### 4. 削除容易性の確保（AC-4 対応）

UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 が完了した後、バッジ表示が不要になった場合に
追加コードを安全に削除できるよう、以下のコメントを付与する。

```typescript
// Q5 専用の主ツール判定
```

このコメントを以下の箇所に追加する:

1. `isMainTool` 変数の定義行の直前
2. `{isMainTool && (...)}` のバッジ JSX ブロックの直前

削除時の手順（将来の担当者向け）:

1. `isMainTool` 変数の定義を削除
2. `{isMainTool && (...)}` の JSX ブロックを削除
3. `ConversationRoundStep.test.tsx` の主ツール関連テストを削除
4. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` を実行して既存テストが PASS することを確認

---

## 実装上の注意点

### Q3/Q4 の汎用 renderQuestion との共通化を崩さないこと

`renderQuestion` 関数は Q1〜Q6 すべての設問に対して共通で使用される。
今回の修正は `key === "q5"` の条件分岐に閉じ込め、他の設問のレンダリングロジックに影響を与えないこと。

- `selectedOptions[0]` の判定は `key === "q5" && selectedOptions.length >= 2` の条件が **両方** 成立する場合のみ
- `isQ5Required` フラグ（L234, L367 付近）は既存ロジックのまま変更しない
- renderQuestion の引数・戻り値の型は変更しない

### selectedOptions の安全な参照

既存コードでは `selectedOptions` は `answer.selectedOptions ?? []` で取得されている。
この取得方法を変更せず、`selectedOptions[0]` へのアクセスは `selectedOptions.length >= 2` の条件確認後に行うため、
`undefined` アクセスは発生しない。

### packages/ui の既存バッジスタイルを優先

実装前に `packages/ui` ディレクトリを確認し、既存 Badge コンポーネントやユーティリティクラスが
存在する場合はそれを優先して使用する。独自実装よりも既存コンポーネントの再利用を優先することで、
デザインの一貫性を保つ。

---

## 実行コマンド

### 実装後のテスト実行（Green 確認）

```bash
pnpm --filter @repo/desktop test -- ConversationRoundStep
```

### 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

---

## 完了基準

- [ ] `ConversationRoundStep.tsx` に `isMainTool` 判定ロジックと「主ツール」バッジ JSX が追加されている
- [ ] `// TODO: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 完了後に削除` コメントが付与されている
- [ ] `aria-label="主ツールとして使用される"` がバッジ要素に付与されている
- [ ] Phase 4 で作成した5件のテストがすべて PASS している
- [ ] 既存テストが引き続き全 PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] Phase 6 (テスト拡充) へのブロッカーがない
