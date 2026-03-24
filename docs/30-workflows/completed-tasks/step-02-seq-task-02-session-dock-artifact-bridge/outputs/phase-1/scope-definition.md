# Scope Definition - Session Dock Artifact Bridge

## 対象スコープ

### IN（本タスクで定義するもの）

| カテゴリ      | 対象                               | 説明                                                                                   |
| ------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| State Machine | dock state 8 状態の定義            | `collapsed / ready / handoff / running / done / aborted / unavailable / guidance-only` |
| State Machine | 各 state の CTA 定義               | 各状態で表示するアクションボタンの定義                                                 |
| State Machine | state 遷移条件                     | 状態間の遷移トリガーとガード条件                                                       |
| Persistence   | session ID 採番方針                | dock 固有の session ID 生成ルール                                                      |
| Persistence   | 保持件数・期間                     | transcript / artifact の保持上限                                                       |
| Persistence   | reopen restore 条件                | close → reopen 時の復元対象と手順                                                      |
| Persistence   | cleanup 条件                       | 保持期間超過・明示削除のルール                                                         |
| Artifact      | artifact-first 表示順              | `成果物 → 要約 → transcript 詳細` の順序定義                                           |
| Artifact      | error summary 表示                 | `done / aborted` state での error 表示定義                                             |
| Artifact      | ArtifactSummary コンポーネント設計 | 生成ファイル・差分・次アクションの表示                                                 |
| Share         | 手動 3 操作定義                    | `選択範囲を送る / 直近出力を添付 / セッションを貼る`                                   |
| Share         | provenance chip 定義               | `source / sharedAt / inspect` フィールド                                               |
| Share         | Manual Boundary 準拠確認           | MB-1〜MB-4 の準拠を設計で担保                                                          |
| Store         | agentSlice 拡張設計                | session dock 専用 state の追加設計                                                     |
| IPC           | claudeCliAPI と dock の接続設計    | session 系メソッドと dock state machine の連携                                         |

### OUT（本タスクのスコープ外）

| カテゴリ        | 除外対象                    | 理由                                                            |
| --------------- | --------------------------- | --------------------------------------------------------------- |
| Persistence     | transcript 保存の実装       | UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001 (blocked, Task06 依存) |
| Advanced Safety | safety governance layer     | Task03 のスコープ                                               |
| Auth            | 認証・認可の変更            | 本タスクでは不要                                                |
| Backend         | サーバーサイド永続化        | 本タスクは Renderer/Main Process 設計のみ                       |
| IPC 実装        | 新規 IPC ハンドラの実装     | 設計タスクのため、実装は後続タスクに委譲                        |
| CLI 連携        | Claude CLI のプロトコル変更 | 既存 claudeCliAPI を活用する設計のみ                            |
| E2E テスト      | Playwright E2E テスト       | 設計タスクではテスト設計（テストマトリクス）まで                |

## 前提タスク

| タスク                                                  | ステータス | 本タスクへの影響                      |
| ------------------------------------------------------- | ---------- | ------------------------------------- |
| TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 (Task01) | 先行必須   | 入口と surface 名称が固まっている前提 |

## 後続タスク（本タスクの設計を前提とするもの）

| タスク                                      | 依存内容                                                             |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Task03 (advanced-console-safety-governance) | safety governance は本タスクの session surface 設計を前提とする      |
| UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001    | persistence の実装は本タスクの session ID / restore 設計を前提とする |
| UT-TERMINAL-DOCK-ABORTED-STATE-001          | aborted state の実装は本タスクの state machine 設計を前提とする      |
