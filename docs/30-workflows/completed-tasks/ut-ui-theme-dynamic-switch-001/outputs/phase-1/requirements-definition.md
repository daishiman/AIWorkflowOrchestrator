# Phase 1 要件定義書

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 体制: SubAgent-A/B/C（並列） + SubAgent-D（統合）

## 目的

`kanagawa-dragon` 固定実装を、`kanagawa-dragon | light | dark | system` の4モードへ拡張し、永続化・OS追従・初期描画整合を満たす。

## 機能要件（FR）

- FR-01: `ThemeMode` は `kanagawa-dragon | light | dark | system` を扱う。
- FR-02: `ResolvedTheme` は `kanagawa-dragon | light | dark` を扱う。
- FR-03: `setThemeMode(mode)` 実行時に `themeMode` と `resolvedTheme` を更新する。
- FR-04: `system` 選択時は `nativeTheme`（IPC）または `matchMedia` で解決する。
- FR-05: `document.documentElement[data-theme]` と `color-scheme` を同期する。
- FR-06: `electron-store` の `theme.mode` で再起動復元を行う。
- FR-07: 保存値異常・IPC失敗時は `kanagawa-dragon` へフォールバックする。
- FR-08: 設定画面で4モードを選択できる。
- FR-09: Main/Preload/Renderer の責務を分離し、IPC契約で連携する。
- FR-10: P31対策として個別セレクタ（`useThemeMode` 等）を提供する。

## 非機能要件（NFR）

- NFR-01: 変更対象主要ファイルで Line 80% / Branch 60% / Function 80% 以上。
- NFR-02: テーマ関連テストを追加し、回帰を防止する。
- NFR-03: `typecheck` と `eslint` を通過する。
- NFR-04: 初期描画でテーマ属性が未設定にならない（FOUC抑制）。

## SubAgent別抽出結果

### SubAgent-A（Renderer）

- settingsSlice で `themeMode` / `resolvedTheme` を管理。
- SettingsView に ThemeSelector を追加。
- `useTheme` で `kanagawa-dragon` を dark系扱いに統一。

### SubAgent-B（Main/Preload）

- `theme:get` / `theme:set` / `theme:get-system` / `theme:system-changed` を利用。
- `validateThemeMode` で入力値をガード。
- Store異常時は安全な既定値で継続。

### SubAgent-C（永続化/テスト）

- `theme.mode` 永続化と起動時復元。
- 無効値とIPC失敗時フォールバック。
- 7テストファイルで127件の回帰テストを確保。

## 判定

- Phase 1要件定義: 完了
- 次Phase入力: `outputs/phase-2/architecture-design.md`
