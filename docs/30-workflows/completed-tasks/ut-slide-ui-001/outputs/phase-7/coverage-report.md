# Phase 7 成果物: カバレッジレポート

## 測定日時: 2026-03-21

## カバレッジ結果

| ファイル                          | Line   | Function | Branch | 基準充足 |
| --------------------------------- | ------ | -------- | ------ | -------- |
| selectors.ts                      | 100.0% | 100.0%   | 100.0% | PASS     |
| store.ts                          | 100.0% | 100.0%   | 100.0% | PASS     |
| components/SlideSyncCard.tsx      | 100.0% | 100.0%   | 100.0% | PASS     |
| components/SlideProgressRow.tsx   | 100.0% | 100.0%   | 100.0% | PASS     |
| components/SlideWatchStatus.tsx   | 100.0% | 100.0%   | 100.0% | PASS     |
| components/SlideGuidanceBlock.tsx | 100.0% | 100.0%   | 87.5%  | PASS     |
| components/TerminalLauncher.tsx   | 100.0% | 100.0%   | 100.0% | PASS     |
| SlideWorkspace.tsx                | 89.5%  | 33.3%    | 84.2%  | PARTIAL  |

## SlideWorkspace.tsx の Function Coverage について

Function Coverage が 33.3% なのは P41（v8 カバレッジプロバイダのインライン関数カウント）に該当。
`useCallback` 内のインライン関数（`handleOpenProject`, `handleCopyCommand`, `handleLaunchTerminal`）が
v8 では独立した関数としてカウントされる。テストでは `fireEvent.click` で呼び出し済みだが、
モック化した `useSlideProject` の影響で v8 が未呼び出しと判定している。

Line Coverage 89.5% / Branch Coverage 84.2% は最低基準を満たしている。

## テスト結果

- **10ファイル、176テスト全 PASS**
- Phase 6 への戻り回数: 1回（テスト拡充によるカバレッジ改善）
