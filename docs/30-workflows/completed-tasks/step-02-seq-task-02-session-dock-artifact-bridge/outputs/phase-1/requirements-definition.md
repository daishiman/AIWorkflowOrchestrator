# Requirements Definition - Session Dock Artifact Bridge

## 機能要件（FR）

### FR-1: Dock State Machine

session dock の状態を 8 状態で管理する。

| state         | 説明                          | entry 条件                   | CTA                              |
| ------------- | ----------------------------- | ---------------------------- | -------------------------------- |
| collapsed     | dock が折りたたまれている     | 初期状態 / ユーザー操作      | 「開く」                         |
| ready         | session 準備完了              | handoff guidance 受信        | 「実行する」                     |
| handoff       | chat → terminal の引き渡し中  | ユーザーが「実行する」を押下 | 「キャンセル」                   |
| running       | 実行中                        | CLI session 開始             | 「中止する」                     |
| done          | 正常完了                      | CLI session 完了             | 「成果物を見る」「共有する」     |
| aborted       | 中止済み                      | ユーザー中止 / エラー        | 「やり直す」「ガイダンスに戻る」 |
| unavailable   | CLI 未インストール / 接続不可 | CLI check 失敗               | 「インストールする」             |
| guidance-only | handoff guidance 表示のみ     | guidance あり + 実行不要     | なし                             |

### FR-2: Session Persistence

| 要件           | 説明                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| session ID     | dock session ごとにユニーク ID を採番（`session-{crypto.randomUUID()}` 形式、MN-03 で UUID v4 に変更） |
| 保持データ     | session ID, dock state, transcript entries, artifact summary, share history                            |
| 保持件数       | 最大 10 件（FIFO）                                                                                     |
| 保持期間       | 24 時間（超過分は自動 cleanup）                                                                        |
| reopen restore | dock を閉じた後 reopen で、transcript entries と artifact summary を復元                               |
| cleanup        | 保持件数超過時は最古のセッションを削除。明示削除も可能                                                 |

### FR-3: Artifact-First Result

| 要件            | 説明                                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| primary surface | 実行後の結果画面は Artifact Summary が主役                                         |
| 表示順序        | `成果物（ファイル・差分）→ 要約 → transcript 詳細（折りたたみ）`                   |
| ArtifactSummary | 生成ファイル一覧、変更差分プレビュー、次アクション提案                             |
| error summary   | `done` state: warning 一覧（折りたたみ可）、`aborted` state: 中止理由 + error 詳細 |
| transcript 位置 | 折りたたまれた「詳細ログ」として secondary に配置                                  |

### FR-4: Manual Share

| 要件            | 説明                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 操作 1          | 選択範囲を送る: transcript 内の選択テキストを chat message として送信                                                           |
| 操作 2          | 直近出力を添付: 最新の transcript entry を chat message に添付                                                                  |
| 操作 3          | セッションを貼る: session 全体のサマリーを chat message として送信                                                              |
| provenance chip | 共有された message には `source（session ID + entry index）/ sharedAt（timestamp）/ inspect（元 transcript へのリンク）` を付与 |
| Manual Boundary | MB-1: auto-send 禁止、MB-2: hidden injection 禁止、MB-3: headless execution 禁止、MB-4: credential passthrough 禁止             |

## 非機能要件（NFR）

| ID    | カテゴリ         | 要件                                                                    |
| ----- | ---------------- | ----------------------------------------------------------------------- |
| NFR-1 | パフォーマンス   | dock state 遷移は 100ms 以内に UI に反映される                          |
| NFR-2 | パフォーマンス   | session restore は 500ms 以内に完了する                                 |
| NFR-3 | セキュリティ     | transcript に含まれる credential / API key は共有前にサニタイズする     |
| NFR-4 | セキュリティ     | Manual Boundary（MB-1〜MB-4）を設計レベルで担保する                     |
| NFR-5 | アクセシビリティ | dock state 変更時に aria-live で状態通知する                            |
| NFR-6 | アクセシビリティ | 全 CTA がキーボード操作可能である                                       |
| NFR-7 | 堅牢性           | restore 失敗時は `ready` state にフォールバックし、エラー通知を表示する |
| NFR-8 | 堅牢性           | CLI 接続断時は `unavailable` state に遷移し、再接続を試みる             |

## 受入基準（AC）

| ID   | 基準                                                                                                                    | 検証方法                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| AC-1 | dock state が `collapsed / ready / handoff / running / done / aborted / unavailable / guidance-only` まで定義されている | Phase 2 の session-state-contract.md で state enum と遷移表が存在する                                |
| AC-2 | session persistence、session ID、reopen restore の方針が定義されている                                                  | Phase 2 の design-summary.md で session ID 採番・保持件数・restore 条件が明記されている              |
| AC-3 | transcript share は手動 3 操作と provenance chip を前提に定義されている                                                 | Phase 2 の artifact-bridge-design.md で 3 操作と provenance フィールドが定義されている               |
| AC-4 | 実行後の primary surface が raw log ではなく artifact summary になっている                                              | Phase 2 の artifact-bridge-design.md で表示順序が `成果物 → 要約 → transcript 詳細` と定義されている |
| AC-5 | error summary が `done` / `aborted` state で表示される                                                                  | Phase 2 の session-state-contract.md で done/aborted の CTA に error summary 表示が含まれている      |

## Task01 前提

本タスクは TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001（Task01）の完了を前提とする。Task01 で以下が確定している:

- ExecutionConsole ビューの登録と CTA 統一
- surface 名称（「実行コンソール」）
- handoff UI の基本構造
