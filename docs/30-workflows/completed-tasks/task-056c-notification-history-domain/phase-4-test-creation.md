# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| Phase名    | テスト作成                            |
| 前提Phase  | Phase 3                               |
| 後続Phase  | Phase 5                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

Notification/HistorySearchドメイン統合仕様を検証するテスト観点を先に定義し、実装フェーズの完成条件を固定する。

## 実行タスク

- ユニットテスト設計: Slice単体とIPCハンドラ単体の検証観点を作成する
- 統合テスト設計: preload-main-renderer連携観点を作成する
- 失敗シナリオ設計: 入力不正、認証不正、上限超過を検証する

## 参照資料

| 参照資料               | パス                                                                        | 内容                       |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------- |
| 要件定義仕様書         | `./phase-1-requirements.md`                                                 | 受け入れ基準               |
| 設計仕様書             | `./phase-2-design.md`                                                       | 型契約とフロー             |
| 設計レビュー結果       | `./phase-3-design-review.md`                                                | 修正済みレビュー指摘       |
| 品質要件正本           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト基準とカバレッジ基準 |
| エラーハンドリング正本 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 異常系検証基準             |

## システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料            | パス                                                                                        | 内容                                             |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Slice境界、永続化、個別セレクタ規約              |
| IPC契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPCチャネル命名規約、Main-Preload-Renderer契約   |
| IPC一覧             | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | 既存チャネルと追加チャネルの整合                 |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | object引数、safeInvoke/safeOn、レスポンス契約    |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証、listener cleanup、historyAPI安全要件 |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge公開境界、ホワイトリスト            |
| エラー処理          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード、Result型、失敗時契約               |
| 履歴データ型        | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                | History API型、DTO、戻り値構造                   |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | preload/main/renderer接続、統合テスト観点        |
| ナビゲーション      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 通知導線、履歴導線、View遷移                     |

## 実行手順

### Step 1: ユニットテスト観点定義

- notificationSliceの既読・削除・件数上限の観点を作成する。
- historySearchSliceの検索状態遷移の観点を作成する。

### Step 2: 統合テスト観点定義

- `notification:get-history` と `history:search` の往復を観測点として定義する。
- pushイベント受信時の状態更新を観測点として定義する。

### Step 3: 失敗シナリオ定義

- バリデーションエラー、認証エラー、IPCタイムアウトの期待結果を定義する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                      |
| ---------------- | --------------------------------------------- |
| API接続          | チャネルごとに正常系/異常系ケースを作成       |
| 認証フロー       | 認証なしアクセスの拒否ケースを作成            |
| データフロー     | Store更新、UI反映、再取得の順序を検証ケース化 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                          | 仕様参照先                                       |
| ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| セキュリティ       | IPC公開・入力検証・認証判定が含まれるため適用     | aiworkflow-requirements: security-\*.md          |
| エラーハンドリング | IPC失敗・再試行・例外契約が含まれるため適用       | aiworkflow-requirements: error-handling.md       |
| テスタビリティ     | Slice/IPC単体および統合テスト設計が必要なため適用 | aiworkflow-requirements: quality-requirements.md |
| UI/UX              | 通知/履歴導線の表示検証が必要なため適用           | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | Renderer/Main/Preloadの責務境界が対象のため適用   | aiworkflow-requirements: architecture-\*.md      |
| API設計            | IPCチャネル契約を定義するため適用                 | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 履歴検索結果と通知既読状態の整合が必要なため適用  | aiworkflow-requirements: database-\*.md          |

## 成果物

| 成果物               | パス                                         | 内容             |
| -------------------- | -------------------------------------------- | ---------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`      | テスト戦略と範囲 |
| テストケース         | `outputs/phase-4/test-cases.md`              | ケース一覧       |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md` | 接続観点と期待値 |

## 完了条件

- [x] ユニットテスト観点がSlice単位で作成済み
- [x] 統合テスト観点がチャネル単位で作成済み
- [x] 失敗シナリオがエラーコード単位で作成済み
- [x] Phase 5で実装可能なテストケースが定義済み

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成し、完了ごとに更新する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクを個別管理）
3. 統合テスト連携の実施（Phase 1〜11は必須）
4. 成果物作成と配置確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json更新内容と整合している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 4
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-4/test-specification.md` / `outputs/phase-4/test-cases.md` / `outputs/phase-4/integration-test-matrix.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 5: 実装
