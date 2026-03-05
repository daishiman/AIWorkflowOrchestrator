# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| Phase名    | 要件定義                              |
| 前提Phase  | なし                                  |
| 後続Phase  | Phase 2                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

NotificationドメインとHistorySearchドメインの責務境界を要件として確定し、後続の設計・テスト・実装フェーズが同じ契約を参照できる状態を作る。

## 実行タスク

- 要件抽出: 通知管理と履歴検索の機能要件、非機能要件を分離して整理する
- 受け入れ基準定義: 各要件を検証可能な受け入れ条件に変換する
- スコープ定義: 本タスクの対象範囲と対象外範囲を明文化する

## 参照資料

| 参照資料               | パス                                                                                                                                 | 内容                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 既存タスク仕様         | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056c-notification-history-domain.md`                          | 056cタスクの初期要件       |
| 統合アーキテクチャ仕様 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md` | A/B/C/D/Eの依存関係        |
| 状態管理正本           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                         | Slice境界とセレクタ規約    |
| IPC契約正本            | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                                                | IPC命名規約と契約形式      |
| IPCセキュリティ正本    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                         | listenerとsenderの安全要件 |
| 履歴データ型正本       | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                                                         | History APIのDTO           |

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

### Step 1: ドメイン要件の分離

- Notificationドメインの責務を「通知生成・既読管理・保持上限」に固定する。
- HistorySearchドメインの責務を「検索クエリ・フィルタ・結果統計」に固定する。

### Step 2: IPC要件とStore要件の整列

- renderer側で必要な state/action/selectors を列挙する。
- main/preload/renderer間のチャネル責務を要件として列挙する。

### Step 3: 受け入れ基準とスコープ確定

- 後続タスク `task-058c` と `task-058e` が参照できる契約要件を固定する。
- 実装除外事項を対象外として明示する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| API接続          | `history:search`, `history:get-stats`, `notification:get-history`, `notification:mark-read` を対象チャネルに固定 |
| 認証フロー       | 認証状態が未確立のセッションで更新系IPCを拒否する要件を定義                                                      |
| データフロー     | Main -> Preload -> Renderer の単方向イベントとRenderer -> Mainの要求を分離                                       |

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

| 成果物       | パス                                         | 内容                   |
| ------------ | -------------------------------------------- | ---------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な受け入れ条件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と対象外範囲   |

## 完了条件

- [x] NotificationとHistorySearchの責務境界が定義済み
- [x] IPCとStoreの要件が重複なく定義済み
- [x] 受け入れ基準が検証可能な記述になっている
- [x] スコープ外項目が列挙されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 1
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-1/requirements-definition.md` / `outputs/phase-1/acceptance-criteria.md` / `outputs/phase-1/scope-definition.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 2: 設計
