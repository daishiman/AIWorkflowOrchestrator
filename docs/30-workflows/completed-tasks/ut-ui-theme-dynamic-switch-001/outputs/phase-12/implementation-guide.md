# 実装ガイド

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-D

## Part 1: 中学生向け説明

この機能は「部屋の照明プリセット」を選ぶイメージです。

- `kanagawa-dragon` / `light` / `dark` は固定プリセット。
- `system` は「スマホ本体設定に合わせる」モード。
- 選んだ内容は保存され、次回起動でも同じ見た目になる。

アプリ内部では、

- ユーザーが選んだ値（`themeMode`）
- 実際に画面へ適用する値（`resolvedTheme`）
  を分けて管理するので、`system` のときも混乱しない。

## Part 2: 技術者向け説明

### 1. 型

- `ThemeMode = "kanagawa-dragon" | "light" | "dark" | "system"`
- `ResolvedTheme = "kanagawa-dragon" | "light" | "dark"`

### 2. 更新フロー

1. `setThemeMode(mode)` で入力を検証
2. 可能なら `electronAPI.theme.set` を呼び保存
3. `system` の場合は `theme.getSystem` -> `matchMedia` の順で解決
4. store更新後に `data-theme` と `color-scheme` をDOM同期

### 3. 初期化

- `initializeTheme()` が `theme.get` から保存値を復元
- 失敗時は `kanagawa-dragon` へフォールバック

### 4. Main IPC

- `theme:get`: 保存値 + 解決値
- `theme:set`: 入力検証 + 保存 + 解決値
- `theme:get-system`: OSテーマ取得
- `theme:system-changed`: OS変更イベント通知

### 5. 既知の運用注意

- グローバルカバレッジ閾値と局所テストは分離して評価する。
- GUI実機確認は別途Electron起動環境で実施する。
