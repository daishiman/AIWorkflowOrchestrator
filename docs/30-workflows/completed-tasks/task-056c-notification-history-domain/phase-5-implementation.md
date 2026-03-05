# Phase 5: 実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| Phase名    | 実装                                  |
| 前提Phase  | Phase 4                               |
| 後続Phase  | Phase 6                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

Phase 4で定義したテスト観点を満たす実装仕様を確定し、Notification/HistorySearchの統合契約をコードへ反映できる計画に変換する。

## 実行タスク

- Store実装計画: notificationSlice と historySearchSlice の追加手順を定義する
- IPC実装計画: `notification:*` と `history:*` チャネルの実装手順を定義する
- 型同期計画: shared/preload/renderer間の型同期手順を定義する

## 参照資料

| 参照資料            | パス                                                                                        | 内容               |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| テスト作成仕様書    | `./phase-4-test-creation.md`                                                                | 実装完了条件       |
| Store実装基盤       | `apps/desktop/src/renderer/store/index.ts`                                                  | Slice統合ポイント  |
| 既存historyハンドラ | `apps/desktop/src/main/ipc/historyHandlers.ts`                                              | 既存チャネル実装   |
| IPCチャンネル定義   | `apps/desktop/src/preload/channels.ts`                                                      | チャンネル定数     |
| IPC実装パターン正本 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン       |
| Interface同期正本   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型変更時の同期規約 |

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

### Step 1: Store統合

- `apps/desktop/src/renderer/store/slices/notificationSlice.ts` の設計契約を実装へ落とし込む。
- `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` の設計契約を実装へ落とし込む。

### Step 2: IPC統合

- `apps/desktop/src/main/ipc/notificationHandlers.ts` を追加する。
- `apps/desktop/src/main/ipc/historySearchHandlers.ts` を追加する。

### Step 3: 型同期

- preload公開型とrenderer利用型の一致を確認する。
- Result型の成功/失敗契約を統一する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                      |
| ---------------- | --------------------------------------------- |
| API接続          | ハンドラ実装後にテストケースを実行可能にする  |
| 認証フロー       | 更新系チャネルで認証検証を実装する            |
| データフロー     | pushイベント受信からStore更新までの順序を固定 |

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

| 成果物         | パス                                                      | 内容                       |
| -------------- | --------------------------------------------------------- | -------------------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`               | 実装対象ファイルと差分要約 |
| ドメイン契約書 | `outputs/phase-5/notification-history-domain-contract.md` | 型と責務境界               |
| チャネル対応表 | `outputs/phase-5/channel-mapping.md`                      | チャネルとハンドラの対応   |

## 完了条件

- [x] Store統合手順がファイル単位で定義済み
- [x] IPC統合手順がチャネル単位で定義済み
- [x] 型同期手順が層別で定義済み
- [x] Phase 6で再検証可能な成果物パスが定義済み

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 5
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-5/implementation-summary.md` / `outputs/phase-5/notification-history-domain-contract.md` / `outputs/phase-5/channel-mapping.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 6: テスト拡充
