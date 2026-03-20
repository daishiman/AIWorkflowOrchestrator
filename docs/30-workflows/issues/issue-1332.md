# [#1332] [UT-TASK06-007-EXT-003] ipcMain.onパターン検証強化

## 概要

`ipcMain.on` パターン（イベントリスナー）と `safeOn` の対応関係を検証する機能を強化する。現在はipcMain.onの検出は行っているが、safeOnとの照合精度が低い。

## 受け入れ基準

- [ ] ipcMain.onとsafeOnの対応関係が正確に照合される
- [ ] R-01/R-04ルールがipcMain.onにも適用される

## メタ情報

- 発見元: UT-TASK06-007 Phase 2 スコープ外定義
- 優先度: 低
- 指示書: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/unassigned-task/ut-task06-007-ext-003-ipc-on-pattern-enhancement.md`
