# TypeScript 型チェックレポート - Phase 9

## 実行日時

2026-02-22 23:00

## 実行コマンド

```bash
cd apps/desktop && pnpm typecheck
```

（内部: `tsc --noEmit`）

## 結果: PASS

- 型エラー: 0件

## Phase 9 実行中の修正

| ファイル          | エラー内容                                                                                                                                                                                                                          | 修正内容                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Badge/index.tsx` | TS2430: Interface 'BadgeProps' incorrectly extends interface 'HTMLAttributes<HTMLSpanElement>'. Types of property 'content' are incompatible. Type 'string \| number \| undefined' is not assignable to type 'string \| undefined'. | `React.HTMLAttributes<HTMLSpanElement>` から `content` プロパティを `Omit` で除外し、`BadgeProps` で独自の `content?: string \| number` を定義 |

### 修正詳細

`React.HTMLAttributes<HTMLSpanElement>` には `content?: string` が定義されているため、`BadgeProps` で `content?: string | number` と拡張すると型の不整合が発生した。

```typescript
// 修正前（型エラー）
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string | number;
}

// 修正後（PASS）
export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content?: string | number;
}
```

## 検証範囲

`tsc --noEmit` はプロジェクト全体（`apps/desktop/tsconfig.json` 準拠）を対象とする。atoms コンポーネントの型定義変更が他のコンポーネントに型エラーを波及させていないことを確認済み。
