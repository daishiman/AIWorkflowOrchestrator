# Phase 4: モック戦略

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Store Mock

- useAppStore を vi.mock で差し替え、個別セレクタ（P31 準拠）を返す
- capability / health / provider / isAuthenticated は個別セレクタで取得する設計
- 合成 Hook は使用しない

## 2. IPC Mock

- window.electronAPI の health 取得を vi.fn() でスタブ化
- terminal 起動 IPC も vi.fn() でスタブ化し、呼び出し引数を検証する

## 3. Props 直接注入（推奨）

- 各コンポーネントは Props ベースで設計されるため、DTO を直接渡す方式を優先する
- Store mock は AccessMatrixSection / AppLayout の統合テストでのみ使用する
- unit テストは Props 直接注入で完結させる

## 4. テスト環境

- happy-dom 環境を使用（P39 準拠: userEvent ではなく fireEvent を使用）
- apps/desktop ディレクトリから実行（P40 準拠）
- beforeEach で状態をリセット（P9 準拠）
