# ヘッドレスUIライブラリ比較

## 概要

主要なヘッドレスUIライブラリの特徴、利点、欠点を比較します。

---

## ライブラリ一覧

### 1. Radix UI

**概要**: Unstyled、アクセシブルなコンポーネントプリミティブ

```tsx
import * as Dialog from "@radix-ui/react-dialog";

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="overlay" />
    <Dialog.Content className="content">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>;
```

| 項目             | 評価       |
| ---------------- | ---------- |
| スタイルの自由度 | ⭐⭐⭐⭐⭐ |
| アクセシビリティ | ⭐⭐⭐⭐⭐ |
| TypeScript       | ⭐⭐⭐⭐⭐ |
| バンドルサイズ   | ⭐⭐⭐⭐   |
| 学習曲線         | ⭐⭐⭐     |
| コンポーネント数 | ⭐⭐⭐⭐   |

**特徴**:

- 各コンポーネントが個別パッケージ
- asChildパターンでカスタム要素対応
- CSS Variablesでアニメーション制御
- WAI-ARIA完全準拠

**ユースケース**:

- カスタムデザインシステム構築
- 高度なアクセシビリティ要件
- Tailwind CSSとの組み合わせ

---

### 2. Headless UI

**概要**: Tailwind CSS Labs製のヘッドレスコンポーネント

```tsx
import { Menu } from "@headlessui/react";

<Menu>
  <Menu.Button>Options</Menu.Button>
  <Menu.Items>
    <Menu.Item>
      {({ active }) => <a className={active ? "bg-blue-500" : ""}>Account</a>}
    </Menu.Item>
  </Menu.Items>
</Menu>;
```

| 項目             | 評価       |
| ---------------- | ---------- |
| スタイルの自由度 | ⭐⭐⭐⭐⭐ |
| アクセシビリティ | ⭐⭐⭐⭐⭐ |
| TypeScript       | ⭐⭐⭐⭐   |
| バンドルサイズ   | ⭐⭐⭐⭐⭐ |
| 学習曲線         | ⭐⭐⭐⭐   |
| コンポーネント数 | ⭐⭐⭐     |

**特徴**:

- Tailwind CSSと最高の相性
- Render Props経由でスタイル状態を提供
- 軽量（単一パッケージ）
- Vue版も提供

**ユースケース**:

- Tailwind CSSプロジェクト
- シンプルなコンポーネントニーズ
- 素早いプロトタイピング

---

### 3. React Aria

**概要**: Adobe製のアクセシビリティプリミティブ

```tsx
import { useButton } from "@react-aria/button";

function Button(props) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);

  return (
    <button {...buttonProps} ref={ref}>
      {props.children}
    </button>
  );
}
```

| 項目             | 評価       |
| ---------------- | ---------- |
| スタイルの自由度 | ⭐⭐⭐⭐⭐ |
| アクセシビリティ | ⭐⭐⭐⭐⭐ |
| TypeScript       | ⭐⭐⭐⭐⭐ |
| バンドルサイズ   | ⭐⭐⭐     |
| 学習曲線         | ⭐⭐       |
| コンポーネント数 | ⭐⭐⭐⭐⭐ |

**特徴**:

- 最も包括的なアクセシビリティ実装
- Hooks firstアプローチ
- 国際化（i18n）組み込み
- モバイル対応（React Native）

**ユースケース**:

- エンタープライズアプリケーション
- 厳格なアクセシビリティ要件
- 国際化が必要なプロジェクト

---

### 4. Downshift

**概要**: オートコンプリート/セレクト専用ライブラリ

```tsx
import { useCombobox } from "downshift";

function Combobox({ items }) {
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({ items });

  return (
    <div>
      <input {...getInputProps()} />
      <button {...getToggleButtonProps()}>Toggle</button>
      <ul {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <li
              key={item}
              {...getItemProps({ item, index })}
              style={{
                backgroundColor:
                  highlightedIndex === index ? "lightgray" : "white",
              }}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}
```

| 項目             | 評価       |
| ---------------- | ---------- |
| スタイルの自由度 | ⭐⭐⭐⭐⭐ |
| アクセシビリティ | ⭐⭐⭐⭐⭐ |
| TypeScript       | ⭐⭐⭐⭐   |
| バンドルサイズ   | ⭐⭐⭐⭐⭐ |
| 学習曲線         | ⭐⭐⭐     |
| コンポーネント数 | ⭐⭐       |

**特徴**:

- セレクト/コンボボックスに特化
- 非常に軽量
- WAI-ARIA完全準拠
- 柔軟なフィルタリング

**ユースケース**:

- 高度なセレクト/オートコンプリート
- 既存UIライブラリとの組み合わせ
- バンドルサイズ重視

---

### 5. Ariakit (旧Reakit)

**概要**: アクセシブルなUIツールキット

```tsx
import { Button, Dialog, DialogDismiss, DialogHeading } from "@ariakit/react";

function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeading>Title</DialogHeading>
        <p>Content</p>
        <DialogDismiss>Close</DialogDismiss>
      </Dialog>
    </>
  );
}
```

| 項目             | 評価       |
| ---------------- | ---------- |
| スタイルの自由度 | ⭐⭐⭐⭐⭐ |
| アクセシビリティ | ⭐⭐⭐⭐   |
| TypeScript       | ⭐⭐⭐⭐   |
| バンドルサイズ   | ⭐⭐⭐⭐   |
| 学習曲線         | ⭐⭐⭐⭐   |
| コンポーネント数 | ⭐⭐⭐⭐   |

**特徴**:

- コンポーネントとhooksの両方提供
- 状態管理が組み込み
- 比較的シンプルなAPI

---

## 比較表

| ライブラリ  | スタイル   | A11y       | サイズ | 学習 | React | Vue |
| ----------- | ---------- | ---------- | ------ | ---- | ----- | --- |
| Radix UI    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中     | 中   | ✅    | ❌  |
| Headless UI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 小     | 低   | ✅    | ✅  |
| React Aria  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 大     | 高   | ✅    | ❌  |
| Downshift   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 小     | 中   | ✅    | ❌  |
| Ariakit     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | 中     | 低   | ✅    | ❌  |

---

## 選択ガイド

### Radix UIを選ぶべき場合

- 完全なカスタムデザインシステムを構築したい
- 個別のコンポーネントだけ使いたい
- CSS Variablesでアニメーションを制御したい

### Headless UIを選ぶべき場合

- Tailwind CSSを使用している
- シンプルで軽量なソリューションが欲しい
- 素早く実装したい

### React Ariaを選ぶべき場合

- 最高レベルのアクセシビリティが必要
- 国際化対応が必要
- React Nativeも視野に入れている

### Downshiftを選ぶべき場合

- セレクト/コンボボックスのみ必要
- 既存のUIライブラリに組み込みたい
- バンドルサイズを最小限にしたい

### Ariakitを選ぶべき場合

- バランスの取れたソリューションが欲しい
- コンポーネントとhooksを柔軟に使いたい
- シンプルなAPIを好む

---

## チェックリスト

### 選定時

- [ ] プロジェクトの要件に合ったコンポーネントがあるか
- [ ] バンドルサイズは許容範囲か
- [ ] 学習コストは適切か
- [ ] TypeScriptサポートは十分か
- [ ] メンテナンス状況は良好か
- [ ] コミュニティは活発か
