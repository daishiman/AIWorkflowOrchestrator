# Phase 11: 手動テスト計画

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. MT-01〜MT-06 Walkthrough シナリオ

### MT-01: Settings 画面に access matrix 表示

- 前提条件: 認証済みユーザーで Settings 画面を開く
- 確認内容: Access Matrix セクションが Settings 画面内に表示されること
- screenshot 計画: Settings 画面全体のキャプチャ（access matrix セクションが視認可能）
- CLI fallback: 設計ドキュメントの画面構成図を証跡として参照

### MT-02: 4 capability 状態の card 切り替え（screenshot x4）

- 前提条件: 各 capability 状態を再現できるテストデータ
- 確認内容: integratedRuntime / terminalSurface / both / none の4状態で CapabilityCard が正しく切り替わること
- screenshot 計画: 各状態ごとに1枚、計4枚
- CLI fallback: Phase 5 設計の状態別 UI 仕様を証跡として参照

### MT-03: health row connected/disconnected（screenshot x2）

- 前提条件: provider の接続状態を切り替えられる環境
- 確認内容: HealthStatusRow が connected / disconnected を正しく表示すること
- screenshot 計画: 各状態ごとに1枚、計2枚
- CLI fallback: HealthStatusRow コンポーネント仕様を証跡として参照

### MT-04: persistent launcher 全画面表示（screenshot x3）

- 前提条件: AppLayout が表示される任意の3画面（Settings / Chat / Agent）
- 確認内容: TerminalLauncher が全画面で persistent に表示されること
- screenshot 計画: 各画面ごとに1枚、計3枚
- CLI fallback: AppLayout 配置図を証跡として参照

### MT-05: 未認証時 guidance-only

- 前提条件: 未認証状態でアプリにアクセスする
- 確認内容: guidance-only モード表示、操作不可機能のグレーアウト/非表示
- screenshot 計画: 未認証状態の画面キャプチャ1枚
- CLI fallback: PUBLIC_UNAUTHENTICATED_VIEWS 定義と未認証画面仕様を参照

### MT-06: mobile responsive

- 前提条件: viewport 幅 375px / 768px / 1024px
- 確認内容: access matrix / launcher / guidance-only が各 viewport で崩れなく表示
- screenshot 計画: 各 viewport ごとに主要画面のキャプチャ
- CLI fallback: レスポンシブ仕様を証跡として参照

## 2. Fallback 記録方針

- 本タスクは設計タスクのため、実画面キャプチャは後続実装タスクで取得する
- 本 Phase では設計ドキュメントの walkthrough 結果を間接的な視覚検証として記録する
- 後続実装タスクの Phase 11 で Electron webContents.capturePage() または Playwright page.screenshot() による実キャプチャを必須とする
