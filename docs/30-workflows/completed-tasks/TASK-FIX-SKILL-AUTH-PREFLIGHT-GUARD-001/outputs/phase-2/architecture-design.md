# Phase 2 設計書（Architecture）

## 1. 設計方針

- 事前検知は Renderer 側で実施し、実行前に失敗を明示する
- 最終防衛は Main 側 `skill:execute` 例外処理で担保する
- エラーコードは Main→Preload→Renderer で透過伝搬する
- 既存UI構造は変更せず、既存トースト/エラーステートを再利用する

## 2. 責務分離（関心ごと）

- SubAgent A 相当（Main/IPC）
  - `skillHandlers.ts`: `errorCode` 付与
  - `authKeyHandlers.ts`: preflight情報源（キー存在判定）
- SubAgent B 相当（Preload契約）
  - `skill-api.ts`: `errorCode` を `Error.code` に変換
- SubAgent C 相当（Renderer導線）
  - `AgentView`: 実行前 preflight + 設定誘導
  - `useSkillExecution`: 実行フック内 preflight + AUTHENTICATION_ERROR 化
  - `agentSlice`: store経由実行時の preflight

## 3. 実行シーケンス

1. Renderer が `auth-key:exists` を呼び出す
2. `exists=false` の場合、`AUTHENTICATION_ERROR` を生成し実行を中断
3. `exists=true` または preflight未提供環境の場合のみ `skill:execute` 呼び出し
4. Main で例外発生時は `{ success:false, error, errorCode? }` を返す
5. Preload が `errorCode` を `Error.code` に転写し Renderer に throw
6. Renderer が `AUTHENTICATION_ERROR` を設定誘導メッセージで表示

## 4. 互換性

- `skill:execute` の成功応答は不変
- 失敗応答は `errorCode` を任意追加（既存 `error` 文字列は維持）
- `window.electronAPI.authKey` 未提供環境は preflight スキップ（後方互換）

## 5. 非機能設計

- セキュリティ: `validateIpcSender` の既存位置は不変更
- 可観測性: 既存 `log.error` を維持
- 回帰抑制: 既存テストに加え preflight 失敗系を追加
