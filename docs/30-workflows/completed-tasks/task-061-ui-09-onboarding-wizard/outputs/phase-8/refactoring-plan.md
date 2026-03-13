# Phase 8 リファクタリング方針

## 実施した整理

| 項目               | 内容                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| helper 関数化      | `getFocusableElements`, `normalizeInitialName`, `getPreviewName`, `isOnboardingStarterToolId` を component 内 helper として整理 |
| 定数化             | step、AI prompt、starter tool、theme option、store key を定数へ集約                                                             |
| fallback 整理      | `normalizeInitialName()` を通して generic name 除外を共通化                                                                     |
| responsive 修正    | mobile の step indicator を `grid-cols-2 sm:grid-cols-4` に修正                                                                 |
| 冗長条件分岐の除去 | テーマアイコンのテキスト色指定 `text-white` vs `text-white` の恒等条件分岐を1つの静的クラスに整理                               |

## 目的

- step ごとの JSX と domain 定数を分離して読みやすくする
- generic name 判定の重複と drift を防ぐ
- mobile visual issue を component 内で閉じて直す
- 無意味な条件分岐を除去し、コードの意図を明確にする

## 変更詳細

### 冗長条件分岐の除去（L710-718）

テーマ選択リストのアイコン `<span>` に付与されていた Tailwind クラス生成ロジックが以下のようになっており、全ての分岐で同じ `text-white` を返す恒等条件分岐が存在していた。

```tsx
// 修正前（冗長）
option.mode === "light" || option.mode === "system"
  ? "text-white"
  : "text-white"

// 修正後（静的クラスとして直接記述）
className={clsx(
  "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white",
  option.accentClassName,
)}
```

## テスト結果

- 修正前: 20/20 PASS
- 修正後: 20/20 PASS（テスト破壊なし）
