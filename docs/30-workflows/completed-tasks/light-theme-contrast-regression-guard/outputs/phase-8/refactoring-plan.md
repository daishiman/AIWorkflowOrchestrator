# Phase 8 Refactoring Plan

## 今回の refactor-safe 整理

| Before                                                 | After                                          | 効果                                         |
| ------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------- |
| scenario / selector / audit target が散在              | `light-theme-contrast-guard.config.mjs` に集約 | representative screen 追加時の変更点を局所化 |
| Auth panel に `data-testid` を渡せない                 | `GlassPanel` が HTML attributes を透過         | harness 用 wrapper を増やさずに capture 可能 |
| screenshot command が package scripts に露出していない | `screenshot:light-theme-contrast-guard` を追加 | 実行経路を 1 つに固定                        |
| guard command が ad-hoc 実行前提                       | `guard:light-theme-contrast` を追加            | audit report の再現性を上げた                |

## 重複削減ポイント

1. screenshot scenarios と audit targets を同一 config に寄せた。
2. harness payload を capture script と renderer harness の 2 箇所で共通概念にそろえた。
3. build input を electron-vite config に明示し、Phase 11 だけ別系統の dev server に依存しない形へ寄せた。

## 振る舞い維持の確認

| 対象                               | 維持確認                                          |
| ---------------------------------- | ------------------------------------------------- |
| ThemeSelector / AuthView の既存 UI | `data-testid` 追加のみで配色は不変更              |
| Dashboard / Settings               | audit current 0 件を維持                          |
| WorkspaceSearch                    | remediation は未着手、baseline backlog として維持 |

## 残る整理候補

- audit pattern の neutral color 範囲拡張は本 task の外に残す。
- light remediation の actual code change は shared-color-migration workflow へ委譲する。
