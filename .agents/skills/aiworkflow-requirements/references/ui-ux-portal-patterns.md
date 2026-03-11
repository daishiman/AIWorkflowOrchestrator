# Portal実装パターン UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

React Portal（`createPortal`）を使用して、CSS stacking contextの制約から脱出し、要素を確実に最前面に表示するための実装パターン。

**適用場面**:

- ドロップダウンメニュー、ツールチップ、モーダルなど、親要素のstacking contextから独立させる必要がある要素
- `backdrop-filter: blur()`、`filter`、`transform`などstacking contextを作成するCSSプロパティを持つ親要素の子孫要素

## Stacking Context問題の理解

**問題**: CSS stacking contextが作成されると、子要素の`z-index`は親のstacking context内でのみ有効になる。

**Stacking Contextを作成するCSSプロパティ**:

- `backdrop-filter: blur()`
- `filter: blur()`, `filter: drop-shadow()` など
- `transform`（`translateZ(0)` 含む）
- `opacity < 1`
- `position: fixed` + `transform`
- `will-change: transform, opacity` など

**解決策**: React Portalで`document.body`直下にレンダリング

## 基本実装パターン

**必須要素**:

1. メニュー位置を保持するstate
2. メニュー表示状態のboolean state
3. トリガーボタンのref
4. メニュー要素のref（アウトサイドクリック判定用）

**State管理**:

- `isMenuOpen`: メニュー表示状態（boolean）
- `menuPosition`: メニュー位置（`{ top: number, left: number } | null`）
- `triggerRef`: トリガーボタンへの参照
- `menuRef`: メニュー要素への参照

**位置計算ヘルパー関数**:

- `calculateMenuPosition()`: トリガーボタンの`getBoundingClientRect()`から位置を計算
- トリガーの下に8pxスペースを確保
- 左端を揃える

**メニュートグルハンドラー**:

- 開く時: 位置を計算してセット
- 閉じる時: 位置をnullにリセット

**Portal描画**:

- `isMenuOpen && menuPosition`の条件で描画
- `createPortal(..., document.body)`でbody直下にレンダリング
- `z-[9999]`で最前面を確保

## イベントハンドリング

### アウトサイドクリックで閉じる

- `mousedown`イベントをdocumentにリスナー登録
- トリガーとメニュー両方の外側かを判定
- `contains(target)`でDOM階層を確認
- `isMenuOpen`が変わったらuseEffectでリスナー更新

### Escapeキーで閉じる

- `keydown`イベントをdocumentにリスナー登録
- `event.key === "Escape"`でEscキーを検出
- メニュークローズ時にフォーカスをトリガーに戻す

### メニュークローズヘルパー

- `closeMenu(returnFocus: boolean)`: メニュー状態と位置をリセット
- `returnFocus`がtrueならトリガーボタンにフォーカス復帰

## WAI-ARIA Menu Pattern実装

**トリガーボタン必須属性**:

| 属性 | 値 | 説明 |
|------|------|------|
| aria-label | メニューを開く | スクリーンリーダー用ラベル |
| aria-expanded | true/false | 展開状態 |
| aria-haspopup | menu | ポップアップの種類 |

**メニューコンテナ必須属性**:

| 属性 | 値 | 説明 |
|------|------|------|
| role | menu | メニューロール |
| aria-label | メニュー | スクリーンリーダー用ラベル |

**メニュー項目必須属性**:

| 属性 | 値 | 説明 |
|------|------|------|
| role | menuitem | メニュー項目ロール |

**フォーカス管理**:

- メニューopen時に最初の項目へフォーカス移動
- `requestAnimationFrame()`でPortalレンダリング完了を待つ
- `querySelector('[role="menuitem"]')`で最初の項目を取得

## テスト設計

**必須テストケース**:

| カテゴリ | テスト内容 |
|----------|------------|
| Portal描画 | `document.body`直下への描画確認 |
| z-index | `z-[9999]`が適用されていることを確認 |
| 位置計算 | トリガーボタンの下に正しく配置 |
| アウトサイドクリック | メニュー外クリックで閉じる |
| Escapeキー | Escキーでクローズ＋フォーカス復帰 |
| ARIA属性 | role, aria-expanded, aria-label等 |
| フォーカス管理 | メニューopen時の自動フォーカス移動 |
| メモリリーク防止 | useEffect cleanupによるリスナー解除 |

## パフォーマンス最適化

**useCallbackによるメモ化**:

- 位置計算関数（`calculateMenuPosition`）
- メニュークローズ関数（`closeMenu`）

**requestAnimationFrameの使用**:

Portal要素のレンダリング完了を待ってからフォーカス移動を実行

## ベストプラクティス

| 原則 | 説明 |
|------|------|
| 最小限の使用 | Portalは必要な場合のみ使用 |
| メモリリーク防止 | useEffect cleanupでイベントリスナーを必ず解除 |
| アクセシビリティ必須 | WAI-ARIA Patternに完全準拠 |
| 位置計算の最適化 | useCallbackでメモ化 |
| テストカバレッジ80%以上 | Portal機能は包括的にテスト |
| TypeScript型安全性 | MenuPosition型など、明示的な型定義 |

## 注意事項

**避けるべきパターン**:

- Portalを多用する（パフォーマンス低下）
- イベントリスナーのクリーンアップ忘れ（メモリリーク）
- ARIA属性の省略（アクセシビリティ違反）
- フォーカス管理の省略（キーボードナビゲーション不可）

**推奨パターン**:

- 必要最小限のPortal使用
- useEffect cleanupでリスナー解除
- WAI-ARIA Pattern完全準拠
- 包括的なテストカバレッジ（≥80%）

## 実装チェックリスト

Portal実装時に確認すべき項目：

- MenuPosition型を定義
- calculateMenuPosition()ヘルパー関数を実装
- closeMenu()ヘルパー関数を実装
- アウトサイドクリックハンドラーをuseEffectで実装
- EscapeキーハンドラーをuseEffectで実装
- フォーカス管理をuseEffectで実装（requestAnimationFrame使用）
- ARIA属性を完備（role, aria-expanded, aria-haspopup, aria-label）
- useEffect cleanupでイベントリスナー解除
- テストカバレッジ80%以上を達成
- axe-core自動テストでWCAG 2.1 AA違反0件

## 参考実装

**実装例**: `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`, `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`
**テスト例**: `apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx`, `apps/desktop/src/renderer/components/organisms/NotificationCenter/NotificationCenter.test.tsx`
**タスクドキュメント**: `docs/30-workflows/auth-ui-z-index-fix/`, `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/`

---

## 関連ドキュメント

- [ナビゲーションUI設計](./ui-ux-navigation.md)
- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [LLM選択機能](./ui-ux-llm-selector.md)
- [UI/UXパネル設計](./ui-ux-panels.md)
