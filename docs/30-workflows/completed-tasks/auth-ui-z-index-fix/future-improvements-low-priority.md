# 将来的改善提案（LOW優先度） - Portal実装

**元タスク**: AUTH-UI-002
**発見元**: T-07-1 最終レビュー
**優先度**: LOW（任意）
**対応時期**: 時間がある場合、または関連機能実装時

---

## 概要

AUTH-UI-002（Portal実装）の最終レビュー（T-07-1）で特定された、任意対応の改善提案をまとめたドキュメント。

これらの改善は必須ではなく、コア機能は既に完全に動作している。開発リソースに余裕がある場合や、関連機能を実装する際に併せて対応することを推奨。

---

## 改善提案リスト

### 1. JSDocコメント追加

**対象**: ヘルパー関数（全関数）

**現状**:

```typescript
const closeAvatarMenu = useCallback((returnFocus = false) => {
  setIsAvatarMenuOpen(false);
  setMenuPosition(null);
  if (returnFocus) {
    const button = avatarButtonRef.current?.querySelector("button");
    button?.focus();
  }
}, []);
```

**改善後**:

```typescript
/**
 * アバターメニューを閉じる
 * @param returnFocus - trueの場合、フォーカスをアバターボタンに戻す
 * @description メニュー位置をnullに設定してメニューを非表示にする
 */
const closeAvatarMenu = useCallback((returnFocus = false) => {
  setIsAvatarMenuOpen(false);
  setMenuPosition(null);
  if (returnFocus) {
    const button = avatarButtonRef.current?.querySelector("button");
    button?.focus();
  }
}, []);
```

**効果**: 関数の意図・パラメータ・戻り値が明確になり、保守性向上

**工数**: 0.25日

---

### 2. 定数のセマンティック命名

**対象**: メニュー関連定数

**現状**（該当なし、将来的に定数が追加される場合）:

```typescript
const MENU_HEIGHT = 120;
const MENU_WIDTH = 200;
const VERTICAL_SPACING = 8;
```

**改善後**:

```typescript
const AVATAR_MENU_HEIGHT = 120;
const AVATAR_MENU_WIDTH = 200;
const AVATAR_MENU_VERTICAL_GAP = 8;
```

**効果**: 定数の用途が一目で分かる、他のメニューとの区別が明確

**工数**: 0.1日

---

### 3. インポート順序の統一

**対象**: AccountSection/index.tsx

**現状**:

```typescript
import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useAppStore } from "../../../store";
```

**改善後**:

```typescript
// 外部ライブラリ
import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

// 内部モジュール
import { useAppStore } from "../../../store";
import { Button } from "../../atoms/Button";
// ...
```

**効果**: インポートの可読性向上、依存関係の明確化

**工数**: 0.1日

---

### 4. アニメーション削減モード対応

**対象**: Portalメニューのトランジション

**現状**: Tailwind CSSデフォルトのトランジション

**改善後**:

```css
@media (prefers-reduced-motion: reduce) {
  .menu-portal {
    transition: none;
  }
}
```

**効果**: 動きに敏感なユーザーへの配慮（アクセシビリティ向上）

**工数**: 0.25日

---

### 5. カバレッジ100%達成

**対象**: 未カバー行（7行、防御的コーディング箇所）

**現状カバレッジ**: 93.03%

**未カバー箇所**:

- L30: プロフィール画像フォールバック
- L66-70: Portal document.body null check
- L98-99: onCloseコールバック

**改善内容**: エッジケーステストを追加

**効果**: カバレッジ100%達成、極端なエッジケースの検証

**工数**: 0.5日

**注記**: 実際の不具合発見確率は極めて低い（防御的コーディング箇所）

---

### 6. ビジュアルリグレッションテスト

**対象**: AccountSectionコンポーネント

**現状**: 機能テストのみ（115テスト）

**改善内容**: Storybook + Chromatic/Percy統合

**実装例**:

```typescript
// AccountSection.stories.tsx
export const Default: Story = {
  args: { user: mockUser, isOpen: false },
};

export const MenuOpen: Story = {
  args: { user: mockUser, isOpen: true },
};
```

**効果**: UIデグレードの早期検出、視覚的な変更の追跡

**工数**: 1日（Storybook環境構築含む）

**注記**: 現状のテストで十分なカバレッジあり、優先度は低い

---

### 7. パフォーマンステスト

**対象**: メニュー開閉のメモリリーク検証

**現状**: 機能テストで基本動作確認済み

**改善内容**: 100回開閉でのメモリリーク検証

**実装例**:

```typescript
it("メニュー開閉を100回繰り返してもメモリリークしないこと", async () => {
  const initialMemory = (performance as any).memory?.usedJSHeapSize;

  for (let i = 0; i < 100; i++) {
    // メニュー開閉
    await userEvent.click(avatarEditButton);
    await userEvent.click(document.body);
  }

  const finalMemory = (performance as any).memory?.usedJSHeapSize;
  expect(finalMemory).toBeLessThan(initialMemory * 1.5); // 50%以内の増加
});
```

**効果**: メモリリーク早期検出、パフォーマンス劣化防止

**工数**: 0.5日

**注記**: 現状のコンポーネント規模では不要、大規模化時に検討

---

## 優先度判断基準

これらの改善提案をLOW優先度とした理由：

| 改善項目                 | LOW優先度とした理由                                  |
| ------------------------ | ---------------------------------------------------- |
| JSDocコメント            | 関数名が十分に説明的、TypeScript型で意図が明確       |
| 定数のセマンティック命名 | 現状で定数が少なく、混乱の余地がない                 |
| インポート順序           | 機能に影響なし、Prettier/ESLintで強制可能            |
| アニメーション削減モード | デフォルトのトランジションが控えめで問題になりにくい |
| カバレッジ100%           | 93%で十分高水準、未カバーは防御的コーディング箇所    |
| ビジュアルリグレッション | 機能テストで十分カバー、UI変更頻度が低い             |
| パフォーマンステスト     | コンポーネント規模が小さく、パフォーマンス問題なし   |

---

## 対応推奨タイミング

### 即座対応: 不要

現状で本番投入可能な品質。

### 次回イテレーション: 任意

以下の条件が揃った場合に対応検討：

- 開発スケジュールに余裕がある
- 関連機能（他のPortal実装等）を実装する
- WCAG 2.2 AAA対応を目指す

### 将来的対応: 検討

以下の変化があった場合に対応：

- コンポーネントが大規模化（複雑度増加）
- ユーザーからのフィードバック（視認性、パフォーマンス）
- 新しいアクセシビリティ基準（WCAG 2.2, 3.0）

---

## 関連ドキュメント

### 元タスク

- [タスク実行仕様書](./task-auth-ui-z-index-fix-specification.md)
- [タスク完了報告](./completion-summary.md)

### レビュー結果

- [最終レビュー統合](./review-final-t-07-1.md)（T-07-1）
- [コード品質レビュー]（@code-quality出力）
- [テスト品質レビュー]（@frontend-tester出力）

### 実装

- [AccountSection実装](../../../apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx)
- [Portalテスト](../../../apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx)

---

**作成日時**: 2025-12-20 23:30
**ステータス**: 未着手（LOW優先度）
**次回レビュー**: 次回イテレーション時に優先度を再評価
