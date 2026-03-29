# Phase 1 スコープ定義

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## 1. スコープ内 (In-scope)

### 1.1 shared 側チャネル定義追加

- `packages/shared/src/ipc/channels.ts` に `APPROVAL_CHANNELS` 定数を追加
  - `APPROVAL_RESPOND: "approval:respond"`
  - `APPROVAL_REQUEST: "approval:request"`
- `packages/shared/src/ipc/channels.ts` に `EXECUTION_CHANNELS` 定数を追加
  - `EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info"`
- `IPC_CHANNELS` スプレッドに上記2グループを追加
- 対応する型 export の更新

### 1.2 desktop 側 import 変更

- `apps/desktop/src/preload/channels.ts` の `APPROVAL_RESPOND`, `APPROVAL_REQUEST`, `EXECUTION_GET_DISCLOSURE_INFO` 定義を、shared パッケージからの re-export またはバリデーションに切り替え
- desktop 側の `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` が引き続き正しく動作することを確認

### 1.3 parity テスト追加

- shared 定義と desktop 定義の一致を検証する cross-layer parity テスト
- `APPROVAL_RESPOND !== EXECUTION_GET_DISCLOSURE_INFO` チャネル分離テスト
- shared ユニットテスト (定義存在・型チェック)
- desktop preload allowlist テスト (allowlist 正当性)
- import パス解決テスト (shared → desktop の参照が正しく解決されること)

---

## 2. スコープ外 (Out-of-scope)

| 項目                                                                       | 理由                                                                    |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| IPC ハンドラロジックの変更                                                 | チャネル定義のみが対象。main プロセス側の handler 実装は変更しない      |
| 新規チャネルの追加                                                         | 既存3チャネルの parity 修正のみ。新しいチャネルの設計は別タスク         |
| Renderer (React) コンポーネントの変更                                      | preload API 経由のチャネル名は変わらないため UI 層への影響なし          |
| `EXECUTION_GET_TERMINAL_LOG` / `EXECUTION_GET_COPY_COMMAND` の shared 追加 | タスク仕様書の明示的スコープは3チャネル。ただし設計判断で追加を検討可能 |
| Approval request surface UI の実装                                         | 別タスクとして管理                                                      |
| governance-bundle.test.ts への新規テスト観点追加                           | 既存観点5の assertion 強化は parity テストで対応                        |

---

## 3. 成果物一覧

| #   | 成果物                           | ファイルパス                                               |
| --- | -------------------------------- | ---------------------------------------------------------- |
| 1   | shared チャネル定義 (変更)       | `packages/shared/src/ipc/channels.ts`                      |
| 2   | desktop チャネル定義 (変更)      | `apps/desktop/src/preload/channels.ts`                     |
| 3   | shared ユニットテスト (新規)     | `packages/shared/src/ipc/__tests__/channels.test.ts`       |
| 4   | cross-layer parity テスト (新規) | `packages/shared/src/ipc/__tests__/channel-parity.test.ts` |
