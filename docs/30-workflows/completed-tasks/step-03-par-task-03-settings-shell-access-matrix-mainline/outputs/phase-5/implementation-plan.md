# Phase 5: 実装計画

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 実装順序（Concern 1 → 2 → 3）

### Step 1: Concern 1 -- Settings Access Matrix Section

1. AccessMatrixProps 型定義を作成する
2. CapabilityCard を Props ベースで実装する（4状態分岐 + 未認証 guidance-only + loading skeleton）
3. HealthStatusRow を Props ベースで実装する（4状態インジケーター + CTA）
4. ProviderSummaryCard を Props ベースで実装する（選択済み/未選択の分岐）
5. AccessMatrixSection で3コンポーネントを合成する

### Step 2: Concern 2 -- AppLayout Persistent Launcher

1. TerminalLauncherProps 型定義を作成する
2. TerminalLauncher を実装する（活性/非活性 + tooltip + IPC 経由 terminal 起動）
3. AppLayout の header 右側に TerminalLauncher を配置する

### Step 3: Concern 3 -- Public Shell Access Contract

1. isAuthenticated props による guidance-only 表示ロジックを AccessMatrixSection に実装する
2. TerminalLauncher に isDisabled: true, disabledReason: "認証が必要です" を渡す

## 2. 禁止事項

| 禁止事項                           | Pitfall | 対策                                     |
| ---------------------------------- | ------- | ---------------------------------------- |
| DEFAULT_CONFIG への暗黙 fallback   | P62     | provider 未選択時はエラー表示/ガイダンス |
| 合成 Hook の useEffect 依存        | P31     | 個別セレクタのみ使用                     |
| result.data! non-null assertion    | P48     | Array.isArray() / optional chaining      |
| userEvent の使用                   | P39     | happy-dom では fireEvent を使用          |
| プロジェクトルートからのテスト実行 | P40     | cd apps/desktop で実行                   |

## 3. Rollback Risk

| リスク                      | 影響                          | 緩和策                                                                  |
| --------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| AppLayout header が混雑する | レイアウト崩れ                | TerminalLauncher を条件付き表示にし、desktop のみに制限する選択肢を残す |
| health IPC が未定義         | HealthStatusRow が動作しない  | Props にフォールバック値を設定し、IPC 未接続時は null 表示              |
| capability bridge が未統合  | CapabilityCard が表示されない | AccessCapability を Props で直接注入し、Store 非依存で動作可能にする    |
