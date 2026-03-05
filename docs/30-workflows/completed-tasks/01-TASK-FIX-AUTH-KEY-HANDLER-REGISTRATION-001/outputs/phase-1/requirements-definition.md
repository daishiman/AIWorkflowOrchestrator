# Phase 1 要件定義書

## 1. 問題定義

- 事象: `auth-key:exists` 呼び出し時に `No handler registered` が発生し、実行前認証チェックが停止する。
- 影響: Renderer 側 preflight が認証エラー扱いとなり、スキル実行がブロックされる。

## 2. SubAgent並列分析

### SubAgent-A（Main/IPC責務）

- `registerAllIpcHandlers` に `registerAuthKeyHandlers` 呼び出しが存在しない。
- `unregisterAllIpcHandlers` は全チャンネル解除のみで、`authKeyHandlers.ts` 内 `handlersRegistered` 状態とのライフサイクル連携が明示されていない。
- 参照: `apps/desktop/src/main/ipc/index.ts`, `apps/desktop/src/main/ipc/authKeyHandlers.ts`

### SubAgent-B（Preload/API契約）

- Preload は `authKey.exists()` を公開済みで、`ALLOWED_INVOKE_CHANNELS` に `AUTH_KEY_EXISTS` を含む。
- Main登録欠落時に Renderer からの契約呼び出しが不成立。
- 参照: `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/channels.ts`

### SubAgent-C（Renderer/UX契約）

- `preflightSkillExecutionAuth()` は `authKey.exists()` 失敗時に `AUTHENTICATION_ERROR` を返し、実行停止。
- 参照: `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`

### SubAgent-D（統合監査）

- Main/Preload/Renderer の契約は宣言上整合しているが、Main側登録ライフサイクルが未接続。
- 根因は「IPC契約定義済みだが runtime 登録漏れ」および「再登録時状態連携不足」。

## 3. 機能要件

- FR-01: 起動時に `auth-key:set/exists/validate/delete` 4チャネルを Main 側へ確実に登録する。
- FR-02: `app.on("activate")` 経路で `unregister -> register` しても 4チャネルが再登録される。
- FR-03: `auth-key:exists` は保存キー未設定でも環境変数フォールバックを含めて判定できる。
- FR-04: 登録/解除は二重実行に対して冪等である。

## 4. 非機能要件

- NFR-01: 既存 IPC チャネルの後方互換を壊さない。
- NFR-02: sender 検証とキーサニタイズを維持する。
- NFR-03: 既存テストに加えて回帰テストを追加し、再発を防止する。
- NFR-04: 変更は最小差分で実施し、責務境界（Main/Preload/Renderer）を維持する。

## 5. スコープ

- In Scope
  - Main IPC 登録経路修正
  - ライフサイクル（解除→再登録）整合修正
  - 関連テスト追加/更新
- Out of Scope
  - 認証UI刷新
  - AuthKeyService の仕様変更
  - Supabase認証フロー変更

## 6. 依存関係

- `registerAllIpcHandlers` / `unregisterAllIpcHandlers` の実装
- `authKeyHandlers` の内部登録状態管理
- Renderer preflight の呼び出し契約
