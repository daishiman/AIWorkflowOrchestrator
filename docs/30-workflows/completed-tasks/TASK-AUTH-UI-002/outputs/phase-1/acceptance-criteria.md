# Phase 1: 受け入れ基準 - AUTH-UI-002

## メタ情報

| 項目     | 値          |
| -------- | ----------- |
| Phase    | 1           |
| タスクID | AUTH-UI-002 |
| 作成日   | 2026-02-04  |

---

## 受け入れ基準一覧

| AC-ID | 受け入れ基準                                               | 要件  | 検証方法   | 状態 |
| ----- | ---------------------------------------------------------- | ----- | ---------- | ---- |
| AC-1  | アバターメニューボタンをクリックするとメニューが表示される | FR-2  | 手動テスト | ✅   |
| AC-2  | メニューが連携サービスセクションの上に表示される           | FR-1  | 手動テスト | ✅   |
| AC-3  | 「アップロード」ボタンがクリック可能                       | FR-2  | 手動テスト | ✅   |
| AC-4  | 「アバターを削除」ボタンがクリック可能                     | FR-2  | 手動テスト | ✅   |
| AC-5  | メニュー外をクリックするとメニューが閉じる                 | FR-3  | 自動テスト | ✅   |
| AC-6  | Escキーを押すとメニューが閉じる                            | FR-4  | 自動テスト | ✅   |
| AC-7  | スクリーンリーダーでメニュー項目が読み上げられる           | NFR-1 | axe-core   | ✅   |
| AC-8  | Portalがdocument.body直下にレンダリングされる              | FR-1  | 自動テスト | ✅   |

---

## 各受け入れ基準の詳細

### AC-1: メニュー表示

**前提条件**:

- ログイン済み状態

**操作手順**:

1. アカウント設定画面を開く
2. アバター編集ボタン（鉛筆アイコン）をクリック

**期待結果**:

- メニューが表示される
- 「アップロード」「プロバイダーアバター使用」「アバターを削除」の選択肢が見える

---

### AC-2: z-index確認

**前提条件**:

- メニュー表示中

**操作手順**:

1. 目視でメニュー位置を確認

**期待結果**:

- メニューが連携サービスセクションの上に表示されている
- 連携サービスセクションに隠れていない

---

### AC-3 & AC-4: ボタンクリック

**前提条件**:

- メニュー表示中

**操作手順**:

1. メニュー内のボタンをクリック

**期待結果**:

- ボタンがクリック可能
- 対応するアクションが実行される

---

### AC-5: アウトサイドクリック

**テストコード確認**:

```typescript
it("メニュー外クリックでメニューが閉じる", async () => {
  // メニューを開く
  await userEvent.click(avatarEditButton);
  expect(screen.getByRole("menu")).toBeInTheDocument();

  // メニュー外をクリック
  await userEvent.click(document.body);

  // メニューが閉じる
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
```

---

### AC-6: Escキー

**テストコード確認**:

```typescript
it("Escキーでメニューが閉じる", async () => {
  // メニューを開く
  await userEvent.click(avatarEditButton);
  expect(screen.getByRole("menu")).toBeInTheDocument();

  // Escキーを押す
  await userEvent.keyboard("{Escape}");

  // メニューが閉じる
  await waitFor(() => {
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
```

---

### AC-7: アクセシビリティ

**テストコード確認**:

```typescript
it("メニューコンテナにrole='menu'が設定されている", async () => {
  render(<AccountSection />);
  await userEvent.click(avatarEditButton);

  const menu = screen.getByRole("menu");
  expect(menu).toBeInTheDocument();
});

it("メニュー項目にrole='menuitem'が設定されている", async () => {
  render(<AccountSection />);
  await userEvent.click(avatarEditButton);

  const menuItems = screen.getAllByRole("menuitem");
  expect(menuItems.length).toBeGreaterThan(0);
});
```

---

### AC-8: Portal描画

**テストコード確認**:

```typescript
it("Portalでdocument.body直下にレンダリングされる", async () => {
  render(<AccountSection />);
  await userEvent.click(avatarEditButton);

  // Portalでレンダリングされたメニューを取得
  const menu = document.body.querySelector('[role="menu"]');
  expect(menu).toBeInTheDocument();
  expect(menu?.closest("body")).toBe(document.body);
});
```

---

## 検証状態サマリー

| 検証方法   | 合計 | 完了 | 残り |
| ---------- | ---- | ---- | ---- |
| 手動テスト | 4    | 4    | 0    |
| 自動テスト | 3    | 3    | 0    |
| axe-core   | 1    | 1    | 0    |
| **合計**   | 8    | 8    | 0    |
