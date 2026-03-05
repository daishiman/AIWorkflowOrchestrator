# Phase 2: 設計

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| Phase名    | 設計                                  |
| 前提Phase  | Phase 1                               |
| 後続Phase  | Phase 3                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

Phase 1で確定した要件をもとに、Notification/HistorySearchの型・IPC・永続化ポリシーを実装可能な設計へ変換する。

## 実行タスク

- ドメイン境界設計: 2ドメインのstate/action/selectors契約を定義する
- IPC契約設計: request/response/eventの型シグネチャを固定する
- 永続化設計: 通知保持件数、削除順序、復元順序を定義する

## 参照資料

| 参照資料                     | パス                                                                          | 内容                    |
| ---------------------------- | ----------------------------------------------------------------------------- | ----------------------- |
| 要件定義仕様書               | `./phase-1-requirements.md`                                                   | FR/NFRと受け入れ基準    |
| 状態管理正本                 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Slice分離と永続化方針   |
| IPC契約正本                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | チャネル命名規則        |
| エラーハンドリング正本       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | Result型とエラーコード  |
| Electron APIセキュリティ正本 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | preload公開境界         |
| 履歴統合正本                 | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md` | historyハンドラ接続仕様 |

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

### Step 1: 型境界設計

- Notification型を `id/type/source/readAt/createdAt/payload` で固定する。
- HistorySearch型を `query/filters/results/stats/pagination` で固定する。

### Step 2: IPC契約設計

- `notification:*` と `history:*` のrequest/response型を定義する。
- pushイベントのpayload最小要件を定義する。

### Step 3: 永続化と容量設計

- 通知保持上限を100件として設計する。
- 上限超過時は既読を優先して削除し、既読が不足する場合は古い未読を削除する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| API接続          | IPCハンドラ単位で request/response の型契約を固定          |
| 認証フロー       | 更新系チャネルは認証済みセッションでのみ成功する契約を定義 |
| データフロー     | 通知pushの受信時にStore反映とUI再描画の順序を定義          |

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

| 成果物               | パス                                                         | 内容                            |
| -------------------- | ------------------------------------------------------------ | ------------------------------- |
| ドメイン境界設計書   | `outputs/phase-2/domain-boundary-design.md`                  | Notification/HistorySearch契約  |
| IPC契約設計書        | `outputs/phase-2/ipc-contract-design.md`                     | チャネル、引数、戻り値          |
| 永続化ポリシー設計書 | `outputs/phase-2/persistence-policy-design.md`               | 件数上限と削除戦略              |
| 正本仕様抽出レポート | `outputs/phase-2/aiworkflow-requirements-extract.md`         | aiworkflow-requirements抽出結果 |
| 仕様トレーサビリティ | `outputs/phase-2/implementation-spec-traceability-matrix.md` | 実装ファイルと正本仕様の対応    |

## 完了条件

- [x] 型境界がNotificationとHistorySearchで分離済み
- [x] IPC契約がチャネルごとに定義済み
- [x] 永続化ポリシーが手順として記述済み
- [x] Phase 3でレビュー可能な成果物パスが定義済み

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 2
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-2/domain-boundary-design.md` / `outputs/phase-2/ipc-contract-design.md` / `outputs/phase-2/persistence-policy-design.md` / `outputs/phase-2/aiworkflow-requirements-extract.md` / `outputs/phase-2/implementation-spec-traceability-matrix.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 3: 設計レビューゲート
