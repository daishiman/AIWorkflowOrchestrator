# Phase 2 アーキテクチャ設計

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 体制: SubAgent-A/B/C（並列） + SubAgent-D（統合）

## レイヤ責務

- Renderer（SubAgent-A）
- `settingsSlice` が `themeMode/resolvedTheme` のSSOTを保持
- `ThemeSelector` でユーザー入力を受ける
- `SettingsView` でUI導線を提供

- Main（SubAgent-B）
- `themeHandlers` が `electron-store` 永続化と `nativeTheme` 参照を担当
- 入力値バリデーションを一元化

- Preload（SubAgent-B）
- IPC request/response 型の境界を定義

- テスト/品質（SubAgent-C）
- Slice/UI/Main IPCの回帰テストを保持

## シーケンス: テーマ変更

1. ユーザーが `ThemeSelector` でモード選択
2. Renderer `setThemeMode(mode)` 実行
3. Main `theme:set` で保存・解決
4. Rendererが `resolvedTheme` を状態反映
5. DOMへ `data-theme` と `color-scheme` を適用

## シーケンス: system追従

1. `themeMode=system` を保存
2. Main `nativeTheme` 変更イベント受信
3. `theme:system-changed` をBroadcast
4. Rendererで `resolvedTheme` を再解決
5. DOM更新

## P31対策設計

- 合成Hook依存を避けるため、`store/index.ts` に個別セレクタを追加。
- 初期化Hookは `useInitializeTheme` のみを参照して依存参照を安定化。

## 例外時設計

- IPC失敗: `matchMedia` または既定値へフォールバック。
- 保存値不正: `kanagawa-dragon` に矯正。
