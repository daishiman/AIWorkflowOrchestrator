# Phase 2: アーキテクチャ設計書 - AUTH-UI-002

## メタ情報

| 項目     | 値          |
| -------- | ----------- |
| Phase    | 2           |
| タスクID | AUTH-UI-002 |
| 作成日   | 2026-02-04  |
| 状態     | 確認完了    |

---

## 1. アーキテクチャ概要

### 1.1 システム構造

```
AccountSection
├── Profile Card（GlassPanel）
│   ├── アバター表示
│   └── アバター編集ボタン（トリガー）
├── Portal（document.body直下）
│   └── アバターメニュー（role="menu"）
│       ├── アップロード（role="menuitem"）
│       ├── プロバイダーアバター使用（role="menuitem"）
│       └── アバター削除（role="menuitem"）
└── 連携サービス（GlassPanel）
```

### 1.2 技術選択

| 技術               | 選択理由                                     |
| ------------------ | -------------------------------------------- |
| React createPortal | GlassPanelのStacking Contextから脱出するため |
| useState           | メニュー状態・位置管理のシンプルさ           |
| useCallback        | メモ化による不要な再レンダリング防止         |
| useEffect          | イベントリスナーのライフサイクル管理         |
| useRef             | DOM参照（トリガー、メニュー）の管理          |

---

## 2. State設計

### 2.1 State一覧

| State            | 型                   | 初期値 | 用途             |
| ---------------- | -------------------- | ------ | ---------------- |
| isAvatarMenuOpen | boolean              | false  | メニュー表示状態 |
| menuPosition     | MenuPosition \| null | null   | メニュー位置座標 |

### 2.2 型定義

```typescript
/**
 * アバターメニューの表示位置
 */
interface MenuPosition {
  /** メニューのtop座標（px） */
  top: number;
  /** メニューのleft座標（px） */
  left: number;
}
```

---

## 3. Ref設計

| Ref             | 型                        | 用途                           |
| --------------- | ------------------------- | ------------------------------ |
| avatarButtonRef | RefObject<HTMLDivElement> | トリガーボタンコンテナの参照   |
| avatarMenuRef   | RefObject<HTMLDivElement> | メニュー要素の参照（Portal内） |

---

## 4. イベントハンドリング設計

### 4.1 ハンドラー一覧

| イベント             | ハンドラー             | 処理内容                              |
| -------------------- | ---------------------- | ------------------------------------- |
| トリガークリック     | handleToggleAvatarMenu | メニュー表示/非表示切り替え、位置計算 |
| アウトサイドクリック | useEffect内ハンドラー  | メニュークローズ                      |
| Escapeキー           | useEffect内ハンドラー  | メニュークローズ、フォーカス復帰      |

### 4.2 ヘルパー関数

```typescript
/**
 * アバターメニューを閉じる
 * @param returnFocus - trueの場合、フォーカスをアバターボタンに戻す
 */
const closeAvatarMenu = useCallback((returnFocus = false) => {
  setIsAvatarMenuOpen(false);
  setMenuPosition(null);
  if (returnFocus) {
    const button = avatarButtonRef.current?.querySelector("button");
    button?.focus();
  }
}, []);

/**
 * アバターメニューの表示位置を計算
 * @returns メニュー位置、またはボタンが見つからない場合はnull
 */
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!avatarButtonRef.current) return null;
  const rect = avatarButtonRef.current.getBoundingClientRect();
  return {
    top: rect.bottom + 8, // mt-2相当
    left: rect.left,
  };
}, []);
```

---

## 5. Portal描画設計

### 5.1 レンダリング条件

```typescript
{isAvatarMenuOpen && menuPosition && createPortal(
  <MenuComponent />,
  document.body
)}
```

### 5.2 スタイル適用

| プロパティ | 値                | 理由                 |
| ---------- | ----------------- | -------------------- |
| position   | fixed             | viewport基準での配置 |
| z-index    | 9999 (z-[9999])   | 最前面表示の確保     |
| top        | menuPosition.top  | 動的計算による位置   |
| left       | menuPosition.left | 動的計算による位置   |

---

## 6. アクセシビリティ設計（WAI-ARIA）

### 6.1 トリガーボタン属性

| 属性          | 値               | 用途                       |
| ------------- | ---------------- | -------------------------- |
| aria-label    | "アバターを編集" | スクリーンリーダー用ラベル |
| aria-expanded | isAvatarMenuOpen | 展開状態                   |
| aria-haspopup | "menu"           | ポップアップ種別           |

### 6.2 メニューコンテナ属性

| 属性       | 値                     | 用途                       |
| ---------- | ---------------------- | -------------------------- |
| role       | "menu"                 | メニューロール             |
| aria-label | "アバター編集メニュー" | スクリーンリーダー用ラベル |

### 6.3 メニュー項目属性

| 属性 | 値         | 用途               |
| ---- | ---------- | ------------------ |
| role | "menuitem" | メニュー項目ロール |

---

## 7. フォーカス管理

### 7.1 フォーカスフロー

1. **メニュー開く**: 最初のメニュー項目へフォーカス移動
2. **Escキー**: トリガーボタンへフォーカス復帰
3. **メニュー項目選択**: メニュークローズ後、フォーカス維持不要

### 7.2 実装方法

```typescript
useEffect(() => {
  if (isAvatarMenuOpen && avatarMenuRef.current) {
    requestAnimationFrame(() => {
      const firstMenuItem = avatarMenuRef.current?.querySelector(
        '[role="menuitem"]',
      ) as HTMLElement;
      firstMenuItem?.focus();
    });
  }
}, [isAvatarMenuOpen]);
```

---

## 8. イベントリスナー管理

### 8.1 アウトサイドクリック

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const isInsideButtonContainer = avatarButtonRef.current?.contains(target);
    const isInsideMenu = avatarMenuRef.current?.contains(target);

    if (!isInsideButtonContainer && !isInsideMenu) {
      closeAvatarMenu();
    }
  };

  if (isAvatarMenuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isAvatarMenuOpen, closeAvatarMenu]);
```

### 8.2 Escapeキー

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isAvatarMenuOpen) {
      closeAvatarMenu(true);
    }
  };

  if (isAvatarMenuOpen) {
    document.addEventListener("keydown", handleKeyDown);
  }

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [isAvatarMenuOpen, closeAvatarMenu]);
```

---

## 9. 統合ポイント/契約

| 統合ポイント | 契約定義                                 |
| ------------ | ---------------------------------------- |
| React Portal | createPortal(element, document.body)     |
| State管理    | useState: isAvatarMenuOpen, menuPosition |
| Ref管理      | useRef: avatarButtonRef, avatarMenuRef   |

---

## 10. 設計確認チェックリスト

- [x] 既存実装がPortal実装パターンに準拠している
- [x] State設計が適切である
- [x] WAI-ARIA属性が完備されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計確認が完了している
