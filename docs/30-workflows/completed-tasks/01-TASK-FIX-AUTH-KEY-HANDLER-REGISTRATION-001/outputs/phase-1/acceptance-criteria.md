# Phase 1 受け入れ基準

## 判定ルール

- 判定種別: Pass/Fail
- 対象: Main IPC, Preload API, Renderer preflight, 再登録ライフサイクル

## AC一覧

- AC-01: `registerAllIpcHandlers` 実行時に `registerAuthKeyHandlers` が1回呼ばれる。
- AC-02: `unregisterAllIpcHandlers` 実行時に `unregisterAuthKeyHandlers` が呼ばれ、再登録で `registerAuthKeyHandlers` が再び有効に呼ばれる。
- AC-03: `auth-key:exists` 呼び出しで `No handler registered` が発生しない。
- AC-04: `auth-key:exists` が `{ exists: boolean }` 契約を維持する。
- AC-05: 既存の auth fallback / skill chain / theme watcher 系テストが回帰しない。
- AC-06: 変更差分は Main IPC 周辺に限定され、Preload/Renderer 契約破壊がない。

## 矛盾・漏れ・整合・依存チェック

- 矛盾なし: Main登録要件と Preload 公開契約に矛盾なし。
- 漏れなし: 4チャネルすべてを対象に含む。
- 整合あり: Renderer preflight の前提（exists呼び出し可能）を満たす。
- 依存整合: activate 再登録フロー要件を含む。

## 証跡

- Main: `apps/desktop/src/main/ipc/index.ts`
- Handler: `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- Preload: `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/channels.ts`
- Renderer: `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`
