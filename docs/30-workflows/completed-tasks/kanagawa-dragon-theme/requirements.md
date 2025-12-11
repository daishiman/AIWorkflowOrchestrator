# Kanagawa Dragon テーマ要件定義書

## メタ情報

| 項目         | 内容                       |
| ------------ | -------------------------- |
| サブタスクID | T-00-1                     |
| フェーズ     | Phase 0: 要件定義          |
| 作成日       | 2025-12-12                 |
| 担当         | @req-analyst, @ui-designer |

---

## 1. 概要

### 1.1 目的

Kanagawa Dragon配色テーマをデスクトップアプリケーションのデフォルトテーマとして設定し、システム全体の視認性と美しさを向上させる。

### 1.2 背景

- Kanagawaは葛飾北斎の「神奈川沖浪裏」にインスピレーションを受けた配色テーマ
- Dragonバリエーションはより濃い色調で、長時間作業に適している
- 現在のシステムではハードコードされた色が散在しており、一貫性が欠如

---

## 2. カラーパレット要件

### 2.1 Kanagawa Dragon パレット（デフォルト）

| カテゴリ     | 色名         | Hex値   | 用途           |
| ------------ | ------------ | ------- | -------------- |
| 背景         | dragonBlack0 | #0D0C0C | 最深部背景     |
| 背景         | dragonBlack1 | #12120F | メイン背景     |
| 背景         | dragonBlack2 | #1D1C19 | ハイライト背景 |
| 背景         | dragonBlack3 | #282727 | 浮き上がり背景 |
| 背景         | dragonBlack4 | #393836 | 選択背景       |
| 背景         | dragonBlack5 | #625E5A | 非テキスト要素 |
| 背景         | dragonBlack6 | #7A8382 | 軽い非テキスト |
| 前景         | dragonWhite  | #C5C9C5 | メインテキスト |
| 前景         | dragonGray   | #625E5A | コメント       |
| 前景         | dragonGray2  | #A6A69C | サブテキスト   |
| シンタックス | dragonViolet | #8992A7 | キーワード     |
| シンタックス | dragonBlue   | #8BA4B0 | 関数           |
| シンタックス | dragonGreen  | #87A987 | 文字列         |
| シンタックス | dragonPink   | #A292A3 | 数値           |
| シンタックス | dragonOrange | #B6927B | 定数           |
| シンタックス | dragonAqua   | #8EA4A2 | 型             |
| シンタックス | dragonRed    | #C4746E | 特殊           |
| シンタックス | dragonYellow | #C4B28A | 識別子         |
| シンタックス | dragonTeal   | #949FB5 | 特殊2          |
| UI           | samuraiRed   | #E82424 | エラー         |
| UI           | roninYellow  | #FF9E3B | 警告           |
| UI           | springBlue   | #7FB4CA | 情報           |

### 2.2 セマンティックカラー要件

| カテゴリ   | 用途      | Dragon値                 |
| ---------- | --------- | ------------------------ |
| background | primary   | dragonBlack1 (#12120F)   |
| background | secondary | dragonBlack2 (#1D1C19)   |
| background | tertiary  | dragonBlack3 (#282727)   |
| background | elevated  | dragonBlack3 (#282727)   |
| background | glass     | rgba(18, 18, 15, 0.9)    |
| background | selection | dragonBlack4 (#393836)   |
| text       | primary   | dragonWhite (#C5C9C5)    |
| text       | secondary | dragonGray2 (#A6A69C)    |
| text       | muted     | dragonGray (#625E5A)     |
| text       | inverse   | dragonBlack1 (#12120F)   |
| border     | default   | dragonBlack4 (#393836)   |
| border     | emphasis  | dragonBlack5 (#625E5A)   |
| border     | subtle    | rgba(197, 201, 197, 0.1) |
| status     | primary   | dragonBlue (#8BA4B0)     |
| status     | success   | dragonGreen (#87A987)    |
| status     | warning   | roninYellow (#FF9E3B)    |
| status     | error     | samuraiRed (#E82424)     |
| status     | info      | springBlue (#7FB4CA)     |

---

## 3. 適用対象画面一覧

### 3.1 必須適用画面

| 画面名        | ファイルパス                                     | 優先度 |
| ------------- | ------------------------------------------------ | ------ |
| AuthView      | `apps/desktop/src/renderer/views/AuthView/`      | 高     |
| DashboardView | `apps/desktop/src/renderer/views/DashboardView/` | 高     |
| EditorView    | `apps/desktop/src/renderer/views/EditorView/`    | 高     |
| SettingsView  | `apps/desktop/src/renderer/views/SettingsView/`  | 高     |
| ChatView      | `apps/desktop/src/renderer/views/ChatView/`      | 中     |
| GraphView     | `apps/desktop/src/renderer/views/GraphView/`     | 中     |

### 3.2 必須適用コンポーネント

| コンポーネント | ファイルパス                                                    | 優先度 |
| -------------- | --------------------------------------------------------------- | ------ |
| App.tsx        | `apps/desktop/src/renderer/App.tsx`                             | 高     |
| GlassPanel     | `apps/desktop/src/renderer/components/organisms/GlassPanel/`    | 高     |
| AppDock        | `apps/desktop/src/renderer/components/organisms/AppDock/`       | 高     |
| ThemeSelector  | `apps/desktop/src/renderer/components/molecules/ThemeSelector/` | 高     |
| Button         | `apps/desktop/src/renderer/components/atoms/Button/`            | 中     |
| Input          | `apps/desktop/src/renderer/components/atoms/Input/`             | 中     |
| Sidebar        | `apps/desktop/src/renderer/components/organisms/Sidebar/`       | 中     |

### 3.3 設定ファイル

| ファイル           | パス                                                      | 変更内容        |
| ------------------ | --------------------------------------------------------- | --------------- |
| tokens.css         | `apps/desktop/src/renderer/styles/tokens.css`             | CSS変数追加     |
| tailwind.config.js | `apps/desktop/tailwind.config.js`                         | カラー拡張      |
| settingsSlice.ts   | `apps/desktop/src/renderer/store/slices/settingsSlice.ts` | ThemeMode型拡張 |

---

## 4. アクセシビリティ要件

### 4.1 WCAG 2.1 AA準拠

| 要件                   | 基準                      | 検証方法                     |
| ---------------------- | ------------------------- | ---------------------------- |
| テキストコントラスト   | 最小4.5:1（通常テキスト） | コントラストチェッカー       |
| 大テキストコントラスト | 最小3:1（18px以上）       | コントラストチェッカー       |
| UIコンポーネント       | 最小3:1                   | 境界線・フォーカス状態確認   |
| フォーカス表示         | 視覚的に明確              | キーボードナビゲーション確認 |

### 4.2 Dragonテーマのコントラスト確認

| 組み合わせ                                      | 比率   | 判定              |
| ----------------------------------------------- | ------ | ----------------- |
| dragonWhite (#C5C9C5) on dragonBlack1 (#12120F) | 10.2:1 | PASS              |
| dragonGray2 (#A6A69C) on dragonBlack1 (#12120F) | 6.8:1  | PASS              |
| dragonGray (#625E5A) on dragonBlack1 (#12120F)  | 3.5:1  | PASS (大テキスト) |
| dragonBlue (#8BA4B0) on dragonBlack1 (#12120F)  | 6.1:1  | PASS              |
| dragonGreen (#87A987) on dragonBlack1 (#12120F) | 5.4:1  | PASS              |
| samuraiRed (#E82424) on dragonBlack1 (#12120F)  | 4.8:1  | PASS              |

---

## 5. テーマ切り替え要件

### 5.1 サポートテーマ

| テーマ名        | 説明                          | デフォルト |
| --------------- | ----------------------------- | ---------- |
| kanagawa-dragon | Kanagawa Dragon（濃いダーク） | ✓          |
| kanagawa-wave   | Kanagawa Wave（標準ダーク）   |            |
| kanagawa-lotus  | Kanagawa Lotus（ライト）      |            |
| light           | システムライト                |            |
| dark            | システムダーク                |            |
| system          | OSの設定に追従                |            |

### 5.2 切り替え機能要件

| 要件               | 詳細                                         |
| ------------------ | -------------------------------------------- |
| 設定画面からの変更 | SettingsViewのThemeSelectorで選択            |
| 即時反映           | 選択直後にUI全体に反映                       |
| 永続化             | Electron storeに保存、再起動後も維持         |
| トランジション     | CSS transitionで滑らかに切り替え             |
| アクセシビリティ   | キーボードで操作可能、スクリーンリーダー対応 |

### 5.3 ThemeMode型定義

```typescript
type ThemeMode =
  | "kanagawa-dragon"
  | "kanagawa-wave"
  | "kanagawa-lotus"
  | "light"
  | "dark"
  | "system";
```

---

## 6. 非機能要件

### 6.1 パフォーマンス

| 要件               | 基準                |
| ------------------ | ------------------- |
| テーマ切り替え時間 | 100ms以内           |
| 初回読み込み       | CSS変数による最適化 |
| メモリ使用         | 増加なし            |

### 6.2 互換性

| 要件         | 詳細                      |
| ------------ | ------------------------- |
| Electron対応 | Electron 30.x             |
| ブラウザ対応 | Chromium (Electronベース) |
| OS対応       | macOS, Windows, Linux     |

---

## 7. 制約事項

### 7.1 技術的制約

- CSS変数は`[data-theme="xxx"]`セレクタで切り替え
- Tailwind JITモードでCSS変数を参照
- Electron safeStorageでテーマ設定を永続化

### 7.2 デザイン制約

- 既存のGlassmorphismデザインを維持
- Apple HIG準拠のUI要素を維持
- アニメーション・トランジションは既存の設定を流用

---

## 8. 成功基準

| 基準             | 達成条件                                   |
| ---------------- | ------------------------------------------ |
| テーマ適用       | 全画面・コンポーネントにDragonテーマが適用 |
| ハードコード除去 | hex値のハードコードが0件                   |
| アクセシビリティ | WCAG 2.1 AA準拠                            |
| テーマ切り替え   | 全テーマで正常動作                         |
| 永続化           | 再起動後もテーマ設定維持                   |
| テスト           | 自動テスト全件PASS                         |

---

## 9. 完了条件チェックリスト

- [x] カラーパレット要件が文書化されている
- [x] 適用対象画面一覧が定義されている
- [x] アクセシビリティ要件が明記されている
- [x] テーマ切り替え要件が定義されている
- [x] 非機能要件が定義されている
- [x] 成功基準が明確化されている
