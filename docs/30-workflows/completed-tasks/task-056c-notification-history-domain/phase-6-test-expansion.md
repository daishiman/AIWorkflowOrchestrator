# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 6                                     |
| Phase名    | テスト拡充                            |
| 前提Phase  | Phase 5                               |
| 後続Phase  | Phase 7                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

実装仕様の検証範囲を拡張し、通知件数上限、検索統計、イベント再接続を含む回帰観点を固定する。

## 実行タスク

- 回帰ケース拡充: 既読同期、削除順序、検索再実行の回帰ケースを追加する
- 統合ケース拡充: preload/main/renderer間の再接続ケースを追加する
- 失敗復帰ケース拡充: IPC失敗後の再試行手順を検証する

## 参照資料

| 参照資料            | パス                                                                          | 内容                 |
| ------------------- | ----------------------------------------------------------------------------- | -------------------- |
| 実装仕様書          | `./phase-5-implementation.md`                                                 | 実装対象と契約       |
| IPCセキュリティ正本 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | listener解除と再登録 |
| 履歴統合正本        | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md` | history連携試験観点  |
| テスト観点正本      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | カバレッジ目標       |

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

### Step 1: 回帰ケース追加

- 通知100件上限の境界値ケースを追加する。
- 検索フィルタ変更時の結果整合ケースを追加する。

### Step 2: 統合ケース追加

- window再生成後のlistener再接続ケースを追加する。
- IPC再呼び出し時の重複登録防止ケースを追加する。

### Step 3: 失敗復帰ケース追加

- タイムアウト時の再試行ケースを追加する。
- エラー表示後の再実行導線ケースを追加する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                         |
| ---------------- | -------------------------------- |
| API接続          | 境界値と再接続の統合ケースを追加 |
| 認証フロー       | 認証切れから復帰するケースを追加 |
| データフロー     | 再試行後の状態収束を検証         |

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

| 成果物               | パス                                        | 内容                   |
| -------------------- | ------------------------------------------- | ---------------------- |
| 統合テスト結果       | `outputs/phase-6/integration-test.md`       | 拡充後の統合ケース結果 |
| 回帰テストマトリクス | `outputs/phase-6/regression-test-matrix.md` | 回帰観点と結果         |
| テスト拡充サマリー   | `outputs/phase-6/test-expansion-summary.md` | 追加ケース一覧         |

## 完了条件

- [x] 回帰ケースが通知・履歴双方で定義済み
- [x] 統合ケースが再接続観点まで定義済み
- [x] 失敗復帰ケースが定義済み
- [x] Phase 7で計測可能なケースIDが付与済み

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 6
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-6/integration-test.md` / `outputs/phase-6/regression-test-matrix.md` / `outputs/phase-6/test-expansion-summary.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 7: テストカバレッジ確認
