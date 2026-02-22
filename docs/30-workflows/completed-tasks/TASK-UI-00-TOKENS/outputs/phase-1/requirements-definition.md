# 要件定義書 — TASK-UI-00-TOKENS Phase 1

## メタ情報

| 項目     | 値                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| タスクID | TASK-UI-00-TOKENS                                                                                           |
| タスク名 | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| Phase    | 1（要件定義）                                                                                               |
| 作成日   | 2026-02-22                                                                                                  |
| 要件総数 | FR: 40件 / NFR: 6件 / 合計: 46件                                                                            |

---

## 1. 機能要件（FR）

### 1-1. Light テーマカラー要件（FR-L-001〜FR-L-012）

Apple HIG System Colors に全面置き換え。セレクタ: `[data-theme="light"]`

| 要件ID   | 要件内容                                                                                                                                                                                                | 根拠                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR-L-001 | `[data-theme="light"]` セレクタで `color-scheme: light` を設定する                                                                                                                                      | Apple HIG Dark Mode ガイド   |
| FR-L-002 | 背景色を Apple System Background Colors に置き換える: `--bg-primary: #FFFFFF`, `--bg-secondary: #F2F2F7`, `--bg-tertiary: #E5E5EA`                                                                      | Apple HIG Color              |
| FR-L-003 | `--bg-elevated: #FFFFFF`（elevated surface）を定義する                                                                                                                                                  | Apple HIG Elevation          |
| FR-L-004 | `--bg-glass: rgba(242, 242, 247, 0.8)`（半透明セカンダリ）を定義する                                                                                                                                    | ui-ux-design-system.md       |
| FR-L-005 | `--bg-selection: rgba(0, 122, 255, 0.15)`（systemBlue 15%）を定義する                                                                                                                                   | Apple HIG Selection          |
| FR-L-006 | テキスト色を Apple Label Colors に置き換える: `--text-primary: #000000`, `--text-secondary: rgba(60, 60, 67, 0.6)`, `--text-muted: rgba(60, 60, 67, 0.3)`                                               | Apple HIG Label Colors       |
| FR-L-007 | `--text-inverse: #FFFFFF` を定義する                                                                                                                                                                    | 反転テキスト用途             |
| FR-L-008 | ボーダー色を Apple Separator Colors に置き換える: `--border-default: #C6C6C8`, `--border-emphasis: #AEAEB2`, `--border-subtle: rgba(60, 60, 67, 0.12)`                                                  | Apple HIG Separator          |
| FR-L-009 | ステータス色を Apple System Tint Colors (Light) に置き換える: systemBlue `#007AFF`, systemGreen `#34C759`, systemOrange `#FF9500`, systemRed `#FF3B30`                                                  | Apple HIG System Colors      |
| FR-L-010 | ステータスホバー色を定義する: primary `#0056B3`, success `#28A745`, warning `#CC7700`, error `#CC2F26`                                                                                                  | マイクロインタラクション要件 |
| FR-L-011 | info色を systemIndigo に変更する: `--status-info: #5856D6`, `--status-info-hover: #4240A8`                                                                                                              | Apple HIG System Colors      |
| FR-L-012 | Syntax Highlighting を Xcode Light 準拠に定義する: keyword `#9B2393`, function `#007AFF`, string `#C41A16`, number `#1C00CF`, constant `#703DAA`, type `#5856D6`, comment `#8E8E93`, variable `#3900A0` | Xcode Light テーマ           |

### 1-2. Dark テーマカラー要件（FR-D-001〜FR-D-012）

Apple HIG System Colors (Dark) に新規定義。セレクタ: `[data-theme="dark"]`

| 要件ID   | 要件内容                                                                                                                                                                                               | 根拠                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| FR-D-001 | `[data-theme="dark"]` セレクタで `color-scheme: dark` を設定する                                                                                                                                       | Apple HIG Dark Mode ガイド   |
| FR-D-002 | 背景色を Apple System Background Colors (Dark) に定義する: `--bg-primary: #000000`, `--bg-secondary: #1C1C1E`, `--bg-tertiary: #2C2C2E`                                                                | Apple HIG Color (Dark)       |
| FR-D-003 | `--bg-elevated: #1C1C1E`（elevated surface）を定義する                                                                                                                                                 | Apple HIG Elevation (Dark)   |
| FR-D-004 | `--bg-glass: rgba(28, 28, 30, 0.8)`（半透明セカンダリ）を定義する                                                                                                                                      | ui-ux-design-system.md       |
| FR-D-005 | `--bg-selection: rgba(10, 132, 255, 0.25)`（systemBlue 25%）を定義する                                                                                                                                 | Apple HIG Selection (Dark)   |
| FR-D-006 | テキスト色を Apple Label Colors (Dark) に定義する: `--text-primary: #FFFFFF`, `--text-secondary: rgba(235, 235, 245, 0.6)`, `--text-muted: rgba(235, 235, 245, 0.3)`                                   | Apple HIG Label Colors       |
| FR-D-007 | `--text-inverse: #000000` を定義する                                                                                                                                                                   | 反転テキスト用途             |
| FR-D-008 | ボーダー色を Apple Separator Colors (Dark) に定義する: `--border-default: #38383A`, `--border-emphasis: #48484A`, `--border-subtle: rgba(84, 84, 88, 0.36)`                                            | Apple HIG Separator (Dark)   |
| FR-D-009 | ステータス色を Apple System Tint Colors (Dark) に定義する: systemBlue `#0A84FF`, systemGreen `#30D158`, systemOrange `#FF9F0A`, systemRed `#FF453A`                                                    | Apple HIG System Colors      |
| FR-D-010 | ステータスホバー色を定義する: primary `#409CFF`, success `#5BD97D`, warning `#FFB840`, error `#FF6961`                                                                                                 | マイクロインタラクション要件 |
| FR-D-011 | info色を systemIndigo (Dark) に定義する: `--status-info: #5E5CE6`, `--status-info-hover: #7A78EB`                                                                                                      | Apple HIG System Colors      |
| FR-D-012 | Syntax Highlighting を Xcode Dark 準拠に定義する: keyword `#FC5FA3`, function `#0A84FF`, string `#FC6A5D`, number `#D0BF69`, constant `#A167E6`, type `#5E5CE6`, comment `#7F8C98`, variable `#67B7A4` | Xcode Dark テーマ            |

### 1-3. マイクロインタラクション変数要件（FR-MI-001〜FR-MI-007）

テーマ非依存。`:root` セレクタに定義。

| 要件ID    | 要件内容                                                                                                        | 根拠                       |
| --------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR-MI-001 | `:root` に `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)` を追加する                                        | ui-ux-design-principles.md |
| FR-MI-002 | `:root` に `--ease-anticipate: cubic-bezier(0.68, -0.55, 0.27, 1.55)` を追加する                                | ui-ux-design-principles.md |
| FR-MI-003 | `:root` に `--scale-hover: 1.02` を追加する                                                                     | ui-ux-design-principles.md |
| FR-MI-004 | `:root` に `--scale-active: 0.97` を追加する                                                                    | ui-ux-design-principles.md |
| FR-MI-005 | `:root` に `--scale-bounce: 1.05` を追加する                                                                    | ui-ux-design-principles.md |
| FR-MI-006 | `@keyframes success-bounce` を定義する（`0%: scale(1)` → `50%: scale(var(--scale-bounce))` → `100%: scale(1)`） | タスク仕様書 Task 3        |
| FR-MI-007 | `@keyframes error-shake` を定義する（`translateX` による4px振幅の左右振動アニメーション）                       | タスク仕様書 Task 3        |

### 1-4. テストヘルパー要件（FR-TH-001〜FR-TH-005）

| 要件ID    | 要件内容                                                                                                                                                   | 根拠                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| FR-TH-001 | `renderWithTheme(ui, options?)` 関数を作成する。`@testing-library/react` の `render` をラップし、`document.documentElement` に `data-theme` 属性を設定する | タスク仕様書 Task 4 |
| FR-TH-002 | `options.theme` パラメータで `"kanagawa-dragon"` / `"light"` / `"dark"` を指定可能にする                                                                   | タスク仕様書 Task 4 |
| FR-TH-003 | `options.theme` のデフォルト値は `"kanagawa-dragon"` とする                                                                                                | タスク仕様書 Task 4 |
| FR-TH-004 | `@testing-library/react` の `RenderOptions` を拡張し、`theme` 以外のオプションをそのまま `render` に渡す                                                   | タスク仕様書 Task 4 |
| FR-TH-005 | 型定義で `ResolvedTheme` 型（`apps/desktop/src/renderer/store/types.ts`）を使用する                                                                        | 型安全要件          |

### 1-5. テーマ横断テスト要件（FR-TT-001〜FR-TT-004）

| 要件ID    | 要件内容                                                                                              | 根拠                   |
| --------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| FR-TT-001 | 3テーマ（`kanagawa-dragon`, `light`, `dark`）で `renderWithTheme` のレンダリングテストを実施する      | タスク仕様書 Task 5    |
| FR-TT-002 | 各テーマで `document.documentElement.getAttribute("data-theme")` が正しいテーマ名を返すことを検証する | タスク仕様書 Task 5    |
| FR-TT-003 | テーマ未指定時のデフォルト値が `"kanagawa-dragon"` であることを検証する                               | タスク仕様書 Task 5    |
| FR-TT-004 | `afterEach` で `data-theme` 属性をリセットし、テスト間の状態汚染を防止する                            | P9: テスト間リーク防止 |

---

## 2. 非機能要件（NFR）

| 要件ID  | カテゴリ         | 要件内容                                                                                          | 根拠                        |
| ------- | ---------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| NFR-001 | アクセシビリティ | 全テーマで `--text-primary` / `--bg-primary` 間のコントラスト比が WCAG 2.1 AA（4.5:1）を満たす    | 01-architecture.md WCAG     |
| NFR-002 | アクセシビリティ | 全テーマで `--status-*` 色と `--bg-primary` 間のコントラスト比が 3:1 以上（UIコンポーネント基準） | testing-accessibility.md    |
| NFR-003 | パフォーマンス   | CSS変数の追加によるレンダリング遅延が計測不能レベル（10ms未満）であること                         | quality-requirements.md     |
| NFR-004 | 互換性           | `kanagawa-dragon` テーマの全変数が変更されないこと                                                | タスク仕様書 §6             |
| NFR-005 | テスト品質       | テストヘルパーのテストが `cd apps/desktop && pnpm vitest run` で全件 PASS                         | P40: テスト実行ディレクトリ |
| NFR-006 | テスト品質       | テストで `userEvent` を使用しない（happy-dom環境では `fireEvent` を使用）                         | P39: happy-dom非互換        |

---

## 3. 要件分類サマリ

| 分類                     | 要件ID範囲             | 要件数 |
| ------------------------ | ---------------------- | ------ |
| Light テーマカラー定義   | FR-L-001 〜 FR-L-012   | 12     |
| Dark テーマカラー定義    | FR-D-001 〜 FR-D-012   | 12     |
| マイクロインタラクション | FR-MI-001 〜 FR-MI-007 | 7      |
| テストヘルパー           | FR-TH-001 〜 FR-TH-005 | 5      |
| テーマ横断テスト         | FR-TT-001 〜 FR-TT-004 | 4      |
| 非機能要件               | NFR-001 〜 NFR-006     | 6      |
| **合計**                 |                        | **46** |

---

## 4. アーキテクチャ層別影響

本タスクは **Renderer層のみ** に影響する。Main Process / Preload層への変更は不要。

| 層       | 影響範囲                                      | 変更内容                                           |
| -------- | --------------------------------------------- | -------------------------------------------------- |
| Renderer | `apps/desktop/src/renderer/styles/tokens.css` | light/darkテーマ定義、マイクロインタラクション変数 |
| Renderer | `apps/desktop/src/renderer/tests/helpers/`    | renderWithTheme ヘルパー + テスト                  |
| Main     | なし                                          | 変更なし                                           |
| Preload  | なし                                          | 変更なし                                           |

---

## 5. 参照資料

| 参照仕様                                                                                         | 用途                                    |
| ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-1-design-tokens.md`            | 元タスク仕様書（Task 1〜5定義）         |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                       | Design Token 3層体系・テーマ管理        |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                   | Apple HIG準拠・マイクロインタラクション |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                     | WCAG 2.1 AA・ARIA属性検証               |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                      | Vitest実行基準・テスト品質ゲート        |
| `.claude/rules/01-architecture.md`                                                               | Apple HIG カラーパレット定義            |
| [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)         | Apple 公式 System Colors                |
| [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | ダークモード設計原則                    |
