# 後方互換性要件 — Phase 1 成果物

## Badge 後方互換性

### 維持すべき既存挙動

| 項目                     | 現在の挙動                   | 維持方針                                          |
| ------------------------ | ---------------------------- | ------------------------------------------------- |
| 5 variant のレンダリング | variant ごとに異なるカラー   | カラーは CSS 変数に移行するが、視覚的に同等を維持 |
| 2 サイズ（sm / md）      | サイズごとに異なるパディング | 変更なし                                          |
| `role="status"`          | 全インスタンスに付与         | 変更なし                                          |
| `forwardRef` サポート    | ref が span 要素に転送される | 変更なし                                          |
| `displayName = "Badge"`  | DevTools で表示              | 変更なし                                          |
| `className` のマージ     | clsx でマージ                | 変更なし                                          |
| 追加 HTML 属性の透過     | `...props` で透過            | 変更なし                                          |

### 破壊的変更（制御された移行）

| 変更内容                      | 影響範囲                | 移行方法                                    |
| ----------------------------- | ----------------------- | ------------------------------------------- |
| `children` を必須→任意に変更  | 型定義のみ              | `content` props が代替を提供                |
| Tailwind カラークラス→CSS変数 | テスト6件のアサーション | テストのアサーションを CSS 変数クラスに変更 |
| `primary` variant 追加        | 新規のみ                | 既存コードに影響なし                        |

### テスト維持チェックリスト

- [ ] 既存17テスト全件PASS（アサーション修正後）
- [ ] `variant` のデフォルト値が `"default"` のまま
- [ ] `size` のデフォルト値が `"md"` のまま
- [ ] `ref` 転送が正常動作
- [ ] `role="status"` が全インスタンスに付与

---

## EmptyState 後方互換性

### 維持すべき既存挙動

| 項目                         | 現在の挙動                | 維持方針                     |
| ---------------------------- | ------------------------- | ---------------------------- |
| `title` の表示               | `<p>` 要素でテキスト表示  | 変更なし                     |
| `description` の条件付き表示 | props がある場合のみ表示  | 変更なし                     |
| `icon` の表示                | `Icon` コンポーネント使用 | 変更なし                     |
| `action` の ReactNode 渡し   | JSX をそのまま描画        | オブジェクト形式も追加で受入 |
| `className` のマージ         | clsx でマージ             | 変更なし                     |
| `memo` による最適化          | `React.memo` でラップ     | 変更なし                     |
| `displayName = "EmptyState"` | DevTools で表示           | 変更なし                     |

### 新規追加（後方互換を保つ）

| 新規 props         | デフォルト値 | 既存コードへの影響                           |
| ------------------ | ------------ | -------------------------------------------- |
| `suggestions`      | `undefined`  | 指定なし時は SuggestionBubble 非表示         |
| `compact`          | `false`      | false 時は既存レイアウトと同一               |
| `mood`             | `undefined`  | 指定なし時はニュートラルスタイル（変更なし） |
| `action` (obj形式) | -            | ReactNode 形式との分岐処理で両立             |

### テスト維持チェックリスト

- [ ] 既存6テスト全件PASS
- [ ] `title` 必須 props の挙動が変更されていない
- [ ] `description` のオプション表示が正常
- [ ] `icon` の Icon コンポーネント連携が正常
- [ ] `action` の ReactNode 形式が正常動作
- [ ] `className` のカスタムクラス追加が正常

---

## atoms/index.ts エクスポート互換性

### 現在のエクスポート（9コンポーネント）

```typescript
export { Button, type ButtonProps } from "./Button";
export { Icon, type IconProps, type IconName } from "./Icon";
export { Badge, type BadgeProps } from "./Badge";
export { Spinner, type SpinnerProps } from "./Spinner";
export { Avatar, type AvatarProps } from "./Avatar";
export { ProgressBar, type ProgressBarProps } from "./ProgressBar";
export { Input, type InputProps } from "./Input";
export { TextArea, type TextAreaProps } from "./TextArea";
export { Checkbox, type CheckboxProps } from "./Checkbox";
```

### 追加予定のエクスポート（6コンポーネント）

```typescript
export { StatusIndicator, type StatusIndicatorProps } from "./StatusIndicator";
export { FilterChip, type FilterChipProps } from "./FilterChip";
export { SkeletonCard, type SkeletonCardProps } from "./SkeletonCard";
export {
  SuggestionBubble,
  type SuggestionBubbleProps,
} from "./SuggestionBubble";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { RelativeTime, type RelativeTimeProps } from "./RelativeTime";
```

### 互換性保証

- 既存の9エクスポートは一切変更しない
- 新規6エクスポートは追加のみ
- 既存の import パス（`from "./Badge"` 等）は変更しない
