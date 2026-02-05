# Phase 12: 実装ガイド - AUTH-UI-002

## メタ情報

| 項目     | 値          |
| -------- | ----------- |
| Phase    | 12          |
| タスクID | AUTH-UI-002 |
| 作成日   | 2026-02-04  |

---

# Part 1: 概念的説明（中学生でもわかる版）

## Portalって何？

### 身近な例で考えてみよう

部屋の中に窓があるとします。窓から見える景色は「部屋の外」にありますよね。でも窓自体は「部屋の中」にあります。

React Portalも同じです。コンポーネント（部品）は「親コンポーネントの中」に書かれていますが、実際に表示される場所は「画面の一番外側（document.body）」です。

```
[イメージ図]

通常のコンポーネント:
┌─────────────────────────┐
│ 親コンポーネント          │
│ ┌─────────────────────┐ │
│ │ 子コンポーネント      │ │
│ │ （ここに表示される）   │ │
│ └─────────────────────┘ │
└─────────────────────────┘

Portal使用時:
┌─────────────────────────┐
│ 親コンポーネント          │
│ ┌─────────────────────┐ │
│ │ 子コンポーネント      │ │
│ │ （コードはここにある） │ │
│ └─────────────────────┘ │
└─────────────────────────┘
        ↓ 実際の表示場所は...
┌─────────────────────────┐
│ document.body           │
│ ┌─────────────────────┐ │
│ │ Portal要素          │ │◀── ここに表示される！
│ └─────────────────────┘ │
└─────────────────────────┘
```

### なぜ必要なの？

アバター編集メニューの親コンポーネント（プロフィールカード）は「すりガラス」のようなデザイン（`backdrop-blur`）を使っています。

この「すりガラス効果」を使うと、CSSには**Stacking Context（積み重ね文脈）**という特別なルールが適用されます。

このルールでは:

- **すりガラスの中にあるものは、すりガラスの外にある他の要素より手前に出せない**

困りますよね？アバターメニューは「すりガラスの中」にあるので、下にある「連携サービス」パネル（別のすりガラス）に隠れてしまいます。

### どうやって解決したの？

Portalを使って、アバターメニューを「すりガラスの外」（document.body直下）に移動させました。

```
修正前:                      修正後:
┌─ GlassPanel ─────────┐   ┌─ GlassPanel ─────────┐
│ ┌─ アバター ─────────┐│   │ ┌─ アバター ─────────┐│
│ │ [メニュー] ← 隠れる ││   │ │ [ボタンのみ]        ││
│ └───────────────────┘│   │ └───────────────────┘│
└─────────────────────┘   └─────────────────────┘
┌─ GlassPanel ─────────┐   ┌─ GlassPanel ─────────┐
│ 連携サービス ← 手前   │   │ 連携サービス          │
└─────────────────────┘   └─────────────────────┘
                            ┌─ Portal (body直下) ──┐
                            │ [メニュー] ← 最前面！ │
                            └─────────────────────┘
```

### ポイントまとめ

1. **Portal** = 表示場所を親から切り離す技術
2. **すりガラス効果** = 子要素のz-indexを制限する
3. **解決策** = Portalで画面の一番外側に表示

---

# Part 2: 技術的詳細（開発者向け）

## 1. 実装パターン

### 1.1 必要なインポート

```typescript
import { createPortal } from "react-dom";
```

### 1.2 State定義

```typescript
interface MenuPosition {
  top: number;
  left: number;
}

const [isMenuOpen, setIsMenuOpen] = useState(false);
const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
```

### 1.3 Ref定義

```typescript
const triggerRef = useRef<HTMLDivElement>(null);
const menuRef = useRef<HTMLDivElement>(null);
```

## 2. ヘルパー関数

### 2.1 位置計算

```typescript
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!triggerRef.current) return null;
  const rect = triggerRef.current.getBoundingClientRect();
  return {
    top: rect.bottom + 8, // トリガーの下8px
    left: rect.left,
  };
}, []);
```

### 2.2 メニュークローズ

```typescript
const closeMenu = useCallback((returnFocus = false) => {
  setIsMenuOpen(false);
  setMenuPosition(null);
  if (returnFocus) {
    const button = triggerRef.current?.querySelector("button");
    button?.focus();
  }
}, []);
```

## 3. イベントハンドリング

### 3.1 アウトサイドクリック

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
      !triggerRef.current?.contains(target) &&
      !menuRef.current?.contains(target)
    ) {
      closeMenu();
    }
  };

  if (isMenuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isMenuOpen, closeMenu]);
```

### 3.2 Escapeキー

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isMenuOpen) {
      closeMenu(true); // フォーカス復帰
    }
  };

  if (isMenuOpen) {
    document.addEventListener("keydown", handleKeyDown);
  }

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [isMenuOpen, closeMenu]);
```

### 3.3 フォーカス管理

```typescript
useEffect(() => {
  if (isMenuOpen && menuRef.current) {
    requestAnimationFrame(() => {
      const firstItem = menuRef.current?.querySelector('[role="menuitem"]');
      (firstItem as HTMLElement)?.focus();
    });
  }
}, [isMenuOpen]);
```

## 4. Portal描画

```tsx
{
  isMenuOpen &&
    menuPosition &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        aria-label="メニュー名"
        className="fixed z-[9999] ..."
        style={{ top: menuPosition.top, left: menuPosition.left }}
      >
        <button role="menuitem">項目1</button>
        <button role="menuitem">項目2</button>
      </div>,
      document.body,
    );
}
```

## 5. WAI-ARIA属性

### 5.1 トリガーボタン

| 属性          | 値         | 説明             |
| ------------- | ---------- | ---------------- |
| aria-label    | メニュー名 | 読み上げ用       |
| aria-expanded | true/false | 展開状態         |
| aria-haspopup | "menu"     | ポップアップ種別 |

### 5.2 メニューコンテナ

| 属性       | 値         | 説明           |
| ---------- | ---------- | -------------- |
| role       | "menu"     | メニューロール |
| aria-label | メニュー名 | 読み上げ用     |

### 5.3 メニュー項目

| 属性 | 値         | 説明               |
| ---- | ---------- | ------------------ |
| role | "menuitem" | メニュー項目ロール |

## 6. 参照実装

- **実装ファイル**: `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`
- **テストファイル**: `apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx`
- **仕様書**: `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`

## 7. チェックリスト

実装時に確認すべき項目:

- [ ] `createPortal`でdocument.body直下にレンダリング
- [ ] `z-[9999]`で最前面を確保
- [ ] `position: fixed`でviewport基準配置
- [ ] `getBoundingClientRect()`で位置計算
- [ ] アウトサイドクリックでクローズ
- [ ] Escapeキーでクローズ + フォーカス復帰
- [ ] メニューopen時に最初の項目へフォーカス
- [ ] useEffect cleanupでリスナー解除
- [ ] WAI-ARIA属性完備
- [ ] テストカバレッジ80%以上
