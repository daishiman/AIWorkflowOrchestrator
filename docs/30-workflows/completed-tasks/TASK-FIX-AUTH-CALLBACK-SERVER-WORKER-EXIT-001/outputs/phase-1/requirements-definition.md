# Phase 1 要件定義書

## 対象

- タスクID: `TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001`
- 実装差分: `apps/desktop/src/main/auth/authCallbackServer.ts`, `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`

## 機能要件

1. `waitForCallback()` の timeout は「待機失敗」を返す責務に限定し、内部で `stop()` を呼ばない。
2. `stop()` は冪等に実行でき、未起動/停止済みでも正常終了する。
3. `server.close()` の失敗があってもプロセス終了時に例外伝播しない。
4. timeout テストは終了時に明示 `await server.stop()` を実行し、ワーカー終了前にクリーンアップを完了する。

## 非機能要件

- 既存認証フロー（`/auth/callback` 正常系）を壊さない。
- 既存 IPC/型契約は変更しない。
- セキュリティ要件（`127.0.0.1` bind、HTML エスケープ）を維持する。

## 制約

- 変更範囲は上記2ファイルに限定する。
- コミット/PRは本タスクでは実施しない。
