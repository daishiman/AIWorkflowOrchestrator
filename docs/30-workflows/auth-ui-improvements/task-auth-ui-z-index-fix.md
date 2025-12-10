# アバターメニューz-index修正 - タスク実行仕様書

## ユーザーからの元の指示

```
アバター編集メニュー（z-[9999]）が連携サービスのGlassPanelに隠れてボタンを押せない。
backdrop-blurを使用しているGlassPanelが新しいスタッキングコンテキストを作成するため、
子要素のz-indexが正しく機能していない。
```

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| タスクID     | AUTH-UI-002                 |
| タスク名     | アバターメニューz-index修正 |
| 分類         | バグ修正                    |
| 対象機能     | AccountSection              |
| 優先度       | 高                          |
| 見積もり規模 | 小規模                      |
| ステータス   | 未実施                      |
| 発見元       | ユーザーフィードバック      |
| 発見日       | 2025-12-10                  |
| 関連タスク   | AUTH-UI-001                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-001でz-index値を`z-[9999]`に修正したが、GlassPanelの`backdrop-blur`によって新しいスタッキングコンテキストが作成されるため、z-indexが親GlassPanel内でしか効果を持たない。

### 1.2 問題点・課題

- アバター編集メニューがProfile CardのGlassPanel内にある
- GlassPanelは`backdrop-blur`を使用しており、これがスタッキングコンテキストを作成
- その結果、連携サービスセクション（別のGlassPanel）の下にメニューが隠れる
- ユーザーがアバターメニューのボタンをクリックできない

### 1.3 放置した場合の影響

- アバターのアップロード・変更・削除ができない
- ユーザー体験が著しく低下

---

## 2. 何を達成するか（What）

### 2.1 目的

アバター編集メニューが常に最前面に表示され、クリック可能になる。

### 2.2 最終ゴール

アバター編集メニューが連携サービスセクションの上に表示される。

### 2.3 スコープ

#### 含むもの

- アバター編集メニューをPortalでレンダリングする修正
- メニュー位置の計算ロジック追加

#### 含まないもの

- GlassPanelコンポーネント自体の修正
- 他のポップアップ・メニューの修正

### 2.4 成果物

- 修正されたAccountSection/index.tsx

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- React 18+のcreatePortal APIが利用可能

### 3.2 必要な知識・スキル

- ReactのPortal
- CSS positioning
- useRef, useStateの使用

### 3.3 推奨アプローチ

ReactのcreatePortalを使用して、アバター編集メニューを`document.body`直下にレンダリングする。これによりGlassPanelのスタッキングコンテキストから脱出し、z-indexが正しく機能する。

---

## 4. 実行手順

### Phase 1: 設計

#### 実装設計

```typescript
// 1. ReactDOMからcreatePortalをインポート
import { createPortal } from "react-dom";

// 2. メニュー位置を計算するためのstate追加
const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

// 3. アバターボタンクリック時にメニュー位置を計算
const handleToggleAvatarMenu = () => {
  if (!isAvatarMenuOpen && avatarMenuRef.current) {
    const rect = avatarMenuRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8, // mt-2相当
      left: rect.left,
    });
  }
  setIsAvatarMenuOpen(!isAvatarMenuOpen);
};

// 4. createPortalでメニューをbody直下にレンダリング
{isAvatarMenuOpen && menuPosition && createPortal(
  <div
    role="menu"
    className="fixed w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-[9999]"
    style={{ top: menuPosition.top, left: menuPosition.left }}
  >
    {/* メニュー内容 */}
  </div>,
  document.body
)}
```

---

### Phase 2: テスト作成 (TDD: Red)

#### テストケース

```typescript
describe("AccountSection - Avatar Menu Portal", () => {
  it("アバターメニューがdocument.body直下にPortalでレンダリングされる", async () => {
    render(<AccountSection />);
    const avatarButton = screen.getByRole("button", { name: /アバター.*編集/i });
    await userEvent.click(avatarButton);

    // Portalでレンダリングされたメニューを検索
    const menu = document.body.querySelector('[role="menu"]');
    expect(menu).toBeInTheDocument();
    expect(menu?.parentElement).toBe(document.body);
  });

  it("メニューがfixedポジションでレンダリングされる", async () => {
    render(<AccountSection />);
    const avatarButton = screen.getByRole("button", { name: /アバター.*編集/i });
    await userEvent.click(avatarButton);

    const menu = document.body.querySelector('[role="menu"]');
    expect(menu).toHaveClass("fixed");
  });
});
```

---

### Phase 3: 実装 (TDD: Green)

#### 修正ファイル

`apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`

#### 実装手順

1. `createPortal`をインポート
2. `menuPosition` stateを追加
3. `handleToggleAvatarMenu`でメニュー位置を計算
4. メニューをcreatePortalでレンダリング
5. メニューの外側クリックで閉じる処理を維持

---

### Phase 4: リファクタリング (TDD: Refactor)

- メニュー位置計算ロジックをカスタムフックに抽出（必要に応じて）

---

### Phase 5: 品質保証

```bash
# テスト実行
pnpm --filter @repo/desktop test:run

# Lint
pnpm lint

# 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] アバターメニューが連携サービスセクションの上に表示される
- [ ] メニュー内のボタンがクリック可能
- [ ] メニュー外クリックで閉じる動作が維持される

### 品質要件

- [ ] 全テスト通過
- [ ] Lintエラーなし
- [ ] 型エラーなし

---

## 6. 検証方法

### テストケース

1. アバター編集ボタンをクリック
2. メニューが連携サービスセクションの上に表示される
3. 「アップロード」ボタンをクリックできる

### 検証手順

1. `pnpm --filter @repo/desktop dev`でアプリを起動
2. ログイン
3. アバター編集ボタンをクリック
4. メニューが正しく表示されることを確認
5. メニュー内のボタンがクリック可能であることを確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                              |
| -------------------------- | ------ | -------- | --------------------------------- |
| メニュー位置がずれる       | 中     | 中       | getBoundingClientRectで正確に計算 |
| スクロール時に位置がずれる | 低     | 低       | fixedポジションで対応             |

---

## 8. 参照情報

### 関連ドキュメント

- React Portal: https://react.dev/reference/react-dom/createPortal
- CSS stacking context: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context

### 関連ファイル

- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`
