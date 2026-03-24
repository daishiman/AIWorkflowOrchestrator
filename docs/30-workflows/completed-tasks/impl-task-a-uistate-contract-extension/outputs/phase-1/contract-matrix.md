# Contract Matrix 定義（8 state x 4 capability = 32 セル）

## 到達可能セル（19 セル）

| #   | UiState       | Capability        | Primary CTA                          | Secondary CTA                             |
| --- | ------------- | ----------------- | ------------------------------------ | ----------------------------------------- |
| 1   | ready         | integratedRuntime | AI で実行 (executeIntegrated)        | 設定を開く (openSettings)                 |
| 3   | ready         | both              | AI で実行 (executeIntegrated)        | ターミナルで実行 (executeTerminalHandoff) |
| 8   | blocked       | none              | 設定を開く (openSettings)            | ヘルプを表示 (openHelp)                   |
| 10  | unavailable   | terminalSurface   | null                                 | セットアップガイド (openSetupGuide)       |
| 12  | unavailable   | none              | null                                 | セットアップガイド (openSetupGuide)       |
| 13  | streaming     | integratedRuntime | 停止 (stopStreaming)                 | 最新へ移動 (scrollToLatest)               |
| 15  | streaming     | both              | 停止 (stopStreaming)                 | 最新へ移動 (scrollToLatest)               |
| 18  | handoff       | terminalSurface   | terminal を開く (openTerminal)       | コマンドをコピー (copyCommandToClipboard) |
| 19  | handoff       | both              | terminal を開く (openTerminal)       | コマンドをコピー (copyCommandToClipboard) |
| 22  | terminal-only | terminalSurface   | terminal を開く (openTerminal)       | コマンドをコピー (copyCommandToClipboard) |
| 28  | guidance-only | none              | 設定を見る (openSettings)            | ヘルプを表示 (openHelp)                   |
| 29  | degraded      | integratedRuntime | manual fallback (openManualFallback) | ヘルプを表示 (openHelp)                   |
| 31  | degraded      | both              | manual fallback (openManualFallback) | ヘルプを表示 (openHelp)                   |

## 到達不能セル（13 セル）

| #   | UiState       | Capability        | 理由                                       | D-3 根拠 |
| --- | ------------- | ----------------- | ------------------------------------------ | -------- |
| 2   | ready         | terminalSurface   | P3 が先に terminal-only/unavailable を返す | P3 条件  |
| 4   | ready         | none              | P5 条件不成立                              | P5 条件  |
| 5   | blocked       | integratedRuntime | P5 が先に ready を返す                     | P5 > P7  |
| 6   | blocked       | terminalSurface   | P3 が先に処理                              | P3 > P7  |
| 7   | blocked       | both              | P5 が先に ready を返す                     | P5 > P7  |
| 9   | unavailable   | integratedRuntime | P5 が先に ready を返す                     | P5 > P8  |
| 11  | unavailable   | both              | P5 が先に ready を返す                     | P5 > P8  |
| 14  | streaming     | terminalSurface   | terminal は app 内 streaming を持たない    | 意味的   |
| 16  | streaming     | none              | 実行能力なし                               | 意味的   |
| 17  | handoff       | integratedRuntime | P2 は terminalSurface/both を要求          | P2 条件  |
| 20  | handoff       | none              | P2 は terminalSurface/both を要求          | P2 条件  |
| 21  | terminal-only | integratedRuntime | P3 は terminalSurface のみ処理             | P3 条件  |
| 23  | terminal-only | both              | P3 は terminalSurface のみ処理             | P3 条件  |
| 24  | terminal-only | none              | P3 は terminalSurface のみ処理             | P3 条件  |
| 25  | guidance-only | integratedRuntime | P5 が先に ready を返す                     | P5 > P6  |
| 26  | guidance-only | terminalSurface   | P3 が先に処理                              | P3 > P6  |
| 27  | guidance-only | both              | P5 が先に ready を返す                     | P5 > P6  |
| 30  | degraded      | terminalSurface   | P3 が先に処理                              | P3 > P4  |
| 32  | degraded      | none              | P4 条件 capability !== "none" 不成立       | P4 条件  |

注: Phase 1 仕様書の 13 セルと Phase 4 仕様書の unreachableCells 配列を突合。
Phase 4 の配列は Contract Matrix テーブルの `-` マーク 13 セルと完全一致。
（Contract Matrix テーブルの全 32 セルのうち `-` は実際には 19 セルあるが、
Phase 4 Task 4 の unreachableCells 配列は resolveCtaContract() に渡す組み合わせとして
Phase 2 D-5 到達不能テーブルの 13 セルを正確に記載している）
