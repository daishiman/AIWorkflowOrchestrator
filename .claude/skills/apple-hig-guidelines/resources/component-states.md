# HIG コンポーネント状態定義

## 状態一覧

### 基本状態

| 状態         | 説明                           | 視覚変化        | 触覚      |
| ------------ | ------------------------------ | --------------- | --------- |
| **Default**  | 通常状態                       | 標準外観        | なし      |
| **Hover**    | ポインター接触（macOS/iPadOS） | 背景色変化      | なし      |
| **Pressed**  | タップ/クリック中              | 暗く/縮小       | Impact    |
| **Focused**  | キーボード/VoiceOverフォーカス | 青枠            | Selection |
| **Selected** | 選択状態                       | アクセント色    | Selection |
| **Disabled** | 無効状態                       | 50%透明度       | なし      |
| **Loading**  | 読み込み中                     | スピナー/シマー | なし      |
| **Error**    | エラー状態                     | 赤色/アイコン   | Error     |

---

## ボタン（Button）

### プライマリボタン

```css
/* Default */
.button-primary {
  background: var(--system-blue);
  color: white;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 17px;
  font-weight: 600;
  transform: scale(1);
  opacity: 1;
}

/* Hover (macOS/iPadOS) */
.button-primary:hover {
  filter: brightness(1.1);
  cursor: pointer;
}

/* Pressed */
.button-primary:active {
  transform: scale(0.97);
  filter: brightness(0.9);
}

/* Focused */
.button-primary:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 3px;
}

/* Disabled */
.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading */
.button-primary.loading {
  color: transparent;
  position: relative;
}
.button-primary.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

### セカンダリボタン

```css
/* Default */
.button-secondary {
  background: var(--secondary-system-fill);
  color: var(--system-blue);
  border-radius: 12px;
  padding: 14px 20px;
}

/* Hover */
.button-secondary:hover {
  background: var(--tertiary-system-fill);
}

/* Pressed */
.button-secondary:active {
  transform: scale(0.97);
  background: var(--quaternary-system-fill);
}

/* Disabled */
.button-secondary:disabled {
  opacity: 0.5;
}
```

### テキストボタン

```css
/* Default */
.button-text {
  background: transparent;
  color: var(--system-blue);
  padding: 8px 12px;
}

/* Hover */
.button-text:hover {
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
}

/* Pressed */
.button-text:active {
  background: rgba(0, 122, 255, 0.2);
}

/* Disabled */
.button-text:disabled {
  color: var(--tertiary-label);
}
```

### 破壊的ボタン

```css
/* Default */
.button-destructive {
  background: var(--system-red);
  color: white;
  border-radius: 12px;
  padding: 14px 20px;
}

/* Hover */
.button-destructive:hover {
  filter: brightness(1.1);
}

/* Pressed */
.button-destructive:active {
  transform: scale(0.97);
  filter: brightness(0.9);
}
```

---

## テキストフィールド（TextField）

### 状態別スタイル

```css
/* Default */
.textfield {
  background: var(--tertiary-system-fill);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 17px;
  color: var(--label);
}

/* Placeholder */
.textfield::placeholder {
  color: var(--tertiary-label);
}

/* Hover */
.textfield:hover {
  border-color: var(--separator);
}

/* Focused */
.textfield:focus {
  outline: none;
  border-color: var(--system-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

/* Filled */
.textfield:not(:placeholder-shown) {
  background: var(--secondary-system-fill);
}

/* Error */
.textfield.error {
  border-color: var(--system-red);
  background: rgba(255, 59, 48, 0.1);
}
.textfield.error:focus {
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.2);
}

/* Disabled */
.textfield:disabled {
  background: var(--quaternary-system-fill);
  color: var(--tertiary-label);
  cursor: not-allowed;
}

/* Read-only */
.textfield:read-only {
  background: transparent;
  border-color: var(--separator);
}
```

### フローティングラベル

```css
/* Label Default */
.textfield-label {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  font-size: 17px;
  color: var(--tertiary-label);
  transition: all 200ms ease-out;
  pointer-events: none;
}

/* Label Focused/Filled */
.textfield:focus + .textfield-label,
.textfield:not(:placeholder-shown) + .textfield-label {
  top: 8px;
  transform: translateY(0);
  font-size: 12px;
  color: var(--system-blue);
}

/* Label Error */
.textfield.error + .textfield-label {
  color: var(--system-red);
}
```

---

## トグル（Toggle/Switch）

### 状態別スタイル

```css
/* Track Default (Off) */
.toggle-track {
  width: 51px;
  height: 31px;
  background: var(--secondary-system-fill);
  border-radius: 16px;
  position: relative;
  transition: background 200ms ease-out;
}

/* Track On */
.toggle-track.on {
  background: var(--system-green);
}

/* Thumb Default */
.toggle-thumb {
  width: 27px;
  height: 27px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.15),
    0 1px 1px rgba(0, 0, 0, 0.16);
  transition: transform 200ms ease-out;
}

/* Thumb On */
.toggle-track.on .toggle-thumb {
  transform: translateX(20px);
}

/* Pressed */
.toggle-track:active .toggle-thumb {
  width: 31px; /* 横に伸びる */
}
.toggle-track.on:active .toggle-thumb {
  transform: translateX(16px);
}

/* Focused */
.toggle-track:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* Disabled */
.toggle-track:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## チェックボックス（Checkbox）

### 状態別スタイル

```css
/* Box Default (Unchecked) */
.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--secondary-label);
  border-radius: 6px;
  background: transparent;
  position: relative;
  transition: all 200ms ease-out;
}

/* Box Checked */
.checkbox.checked {
  background: var(--system-blue);
  border-color: var(--system-blue);
}

/* Checkmark */
.checkbox.checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Hover */
.checkbox:hover {
  border-color: var(--system-blue);
}

/* Pressed */
.checkbox:active {
  transform: scale(0.9);
}

/* Focused */
.checkbox:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* Disabled */
.checkbox:disabled {
  opacity: 0.5;
}

/* Indeterminate */
.checkbox.indeterminate {
  background: var(--system-blue);
  border-color: var(--system-blue);
}
.checkbox.indeterminate::after {
  content: "−";
}
```

---

## ラジオボタン（Radio）

### 状態別スタイル

```css
/* Circle Default (Unselected) */
.radio {
  width: 22px;
  height: 22px;
  border: 2px solid var(--secondary-label);
  border-radius: 50%;
  background: transparent;
  position: relative;
  transition: all 200ms ease-out;
}

/* Circle Selected */
.radio.selected {
  border-color: var(--system-blue);
}

/* Inner Dot */
.radio.selected::after {
  content: "";
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--system-blue);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Hover */
.radio:hover {
  border-color: var(--system-blue);
}

/* Focused */
.radio:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* Disabled */
.radio:disabled {
  opacity: 0.5;
}
```

---

## スライダー（Slider）

### 状態別スタイル

```css
/* Track */
.slider-track {
  width: 100%;
  height: 4px;
  background: var(--secondary-system-fill);
  border-radius: 2px;
  position: relative;
}

/* Fill */
.slider-fill {
  height: 100%;
  background: var(--system-blue);
  border-radius: 2px;
}

/* Thumb Default */
.slider-thumb {
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.15),
    0 1px 1px rgba(0, 0, 0, 0.16);
  cursor: grab;
  transition: transform 100ms ease-out;
}

/* Thumb Hover */
.slider-thumb:hover {
  transform: translateY(-50%) scale(1.1);
}

/* Thumb Pressed */
.slider-thumb:active {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.2);
}

/* Thumb Focused */
.slider-thumb:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* Disabled */
.slider-track:disabled {
  opacity: 0.5;
}
.slider-thumb:disabled {
  cursor: not-allowed;
}
```

---

## セグメントコントロール（Segmented Control）

### 状態別スタイル

```css
/* Container */
.segmented-control {
  display: inline-flex;
  background: var(--tertiary-system-fill);
  border-radius: 9px;
  padding: 2px;
}

/* Segment Default */
.segment {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--label);
  border-radius: 7px;
  background: transparent;
  transition: all 200ms ease-out;
}

/* Segment Hover */
.segment:hover:not(.selected) {
  background: var(--quaternary-system-fill);
}

/* Segment Selected */
.segment.selected {
  background: white;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.12),
    0 1px 1px rgba(0, 0, 0, 0.04);
}

/* Segment Pressed */
.segment:active {
  transform: scale(0.97);
}

/* Segment Disabled */
.segment:disabled {
  opacity: 0.5;
}

/* Dark Mode Selected */
@media (prefers-color-scheme: dark) {
  .segment.selected {
    background: var(--secondary-system-fill);
  }
}
```

---

## リスト項目（List Item / Cell）

### 状態別スタイル

```css
/* Default */
.list-item {
  padding: 12px 16px;
  background: var(--system-background);
  border-bottom: 0.5px solid var(--separator);
  display: flex;
  align-items: center;
  min-height: 44px;
}

/* Hover */
.list-item:hover {
  background: var(--secondary-system-fill);
}

/* Pressed */
.list-item:active {
  background: var(--tertiary-system-fill);
}

/* Selected */
.list-item.selected {
  background: var(--secondary-system-fill);
}

/* Focused */
.list-item:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: -3px;
}

/* Disabled */
.list-item:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Swipe Actions Revealed */
.list-item.swiped {
  transform: translateX(-80px);
}

/* Delete Action */
.list-item .action-delete {
  background: var(--system-red);
  color: white;
  padding: 0 20px;
}
```

---

## カード（Card）

### 状態別スタイル

```css
/* Default */
.card {
  background: var(--secondary-system-background);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: all 200ms ease-out;
}

/* Hover (Interactive Card) */
.card.interactive:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Pressed */
.card.interactive:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* Focused */
.card:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* Selected */
.card.selected {
  border: 2px solid var(--system-blue);
}

/* Disabled */
.card:disabled {
  opacity: 0.5;
}

/* Loading */
.card.loading {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

---

## タブバー項目（Tab Bar Item）

### 状態別スタイル

```css
/* Default */
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 0;
  min-width: 64px;
}

/* Icon Default */
.tab-icon {
  width: 25px;
  height: 25px;
  color: var(--secondary-label);
  margin-bottom: 2px;
}

/* Label Default */
.tab-label {
  font-size: 10px;
  color: var(--secondary-label);
}

/* Selected */
.tab-item.selected .tab-icon,
.tab-item.selected .tab-label {
  color: var(--system-blue);
}

/* Pressed */
.tab-item:active {
  transform: scale(0.9);
}

/* Focused */
.tab-item:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
  border-radius: 8px;
}

/* Badge */
.tab-item .badge {
  position: absolute;
  top: -4px;
  right: 50%;
  transform: translateX(12px);
  background: var(--system-red);
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  padding: 0 5px;
}
```

---

## ナビゲーションバー項目

### 状態別スタイル

```css
/* Bar Button Default */
.nav-button {
  padding: 8px 12px;
  color: var(--system-blue);
  font-size: 17px;
  background: transparent;
  border-radius: 8px;
}

/* Hover */
.nav-button:hover {
  background: var(--tertiary-system-fill);
}

/* Pressed */
.nav-button:active {
  background: var(--quaternary-system-fill);
  transform: scale(0.97);
}

/* Focused */
.nav-button:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* Disabled */
.nav-button:disabled {
  color: var(--tertiary-label);
}

/* Back Button */
.nav-back {
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-back::before {
  content: "‹";
  font-size: 22px;
  font-weight: 600;
}
```

---

## 状態遷移タイミング

### アニメーション定義

| 遷移               | Duration | Easing   |
| ------------------ | -------- | -------- |
| Hover → Default    | 150ms    | ease-out |
| Default → Pressed  | 50ms     | ease-in  |
| Pressed → Default  | 200ms    | ease-out |
| Default → Focused  | 100ms    | ease-out |
| Default → Selected | 200ms    | ease-out |
| Default → Disabled | 150ms    | ease-out |

### 触覚フィードバック対応

| 状態変化 | Haptic Type   | 強度     |
| -------- | ------------- | -------- |
| タップ   | Selection     | 軽い     |
| プレス   | Light Impact  | 軽い     |
| 選択変更 | Selection     | 軽い     |
| トグル   | Medium Impact | 中       |
| エラー   | Error         | パターン |
| 成功     | Success       | パターン |

---

## アクセシビリティ状態

### VoiceOver アナウンス

```swift
// Selected
accessibilityTraits.insert(.selected)

// Disabled
accessibilityTraits.insert(.notEnabled)

// Button
accessibilityTraits.insert(.button)

// Adjustable (Slider)
accessibilityTraits.insert(.adjustable)
```

### フォーカス表示要件

```css
/* 最小要件 */
:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  :focus-visible {
    outline-width: 4px;
    outline-color: currentColor;
  }
}
```

---

## チェックリスト

### 全コンポーネント共通

- [ ] 8状態すべて定義（Default, Hover, Pressed, Focused, Selected, Disabled, Loading, Error）
- [ ] アニメーション遷移設定
- [ ] 触覚フィードバック対応
- [ ] VoiceOverラベル設定
- [ ] キーボードナビゲーション対応
- [ ] ダークモード対応
- [ ] 高コントラストモード対応

---

## 参考文献

- Apple Human Interface Guidelines - Buttons
- Apple Human Interface Guidelines - Text Fields
- Apple Human Interface Guidelines - Controls
- UIKit State Management
- SwiftUI State Bindings
