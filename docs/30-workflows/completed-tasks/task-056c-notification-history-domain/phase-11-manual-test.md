# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| Phase名    | 手動テスト検証                        |
| 前提Phase  | Phase 10                              |
| 後続Phase  | Phase 12                              |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

通知センターと履歴検索画面の統合導線を手動で検証し、ユーザー操作に対する結果を証跡として残す。

## 実行タスク

- 手動シナリオ実行: 主要操作シナリオを実行する
- 画面証跡取得: 各シナリオのスクリーンショットを取得する
- 発見課題記録: 再現手順付きで課題を記録する

## 参照資料

| 参照資料           | パス                                                                     | 内容           |
| ------------------ | ------------------------------------------------------------------------ | -------------- |
| 要件定義仕様書     | `./phase-1-requirements.md`                                              | 受け入れ基準   |
| 設計仕様書         | `./phase-2-design.md`                                                    | 操作導線設計   |
| 実装仕様書         | `./phase-5-implementation.md`                                            | 実装対象       |
| テスト拡充仕様書   | `./phase-6-test-expansion.md`                                            | テストケース   |
| カバレッジ仕様書   | `./phase-7-coverage-check.md`                                            | 計測対象       |
| リファクタ仕様書   | `./phase-8-refactoring.md`                                               | 命名・導線整合 |
| 品質保証仕様書     | `./phase-9-quality-assurance.md`                                         | 品質観点       |
| 最終レビュー仕様書 | `./phase-10-final-review.md`                                             | ゲート判定     |
| ナビゲーション正本 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`  | 画面遷移観点   |
| 履歴UI設計正本     | `.claude/skills/aiworkflow-requirements/references/ui-history-design.md` | 履歴画面観点   |

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

### Step 1: シナリオ実行

- Notification/HistorySearch 実装に影響する導線（dashboard/chat history/history page）を実行する。
- 異常系とセキュリティ系は Unit/IPC テスト証跡で補完し、UI上の回帰有無を分離して記録する。

### Step 2: 画面証跡取得

- シナリオ単位でスクリーンショットを取得する。
- 各証跡にTC-IDと検証目的を付与する。

### Step 3: 発見課題記録

- 発見課題を再現手順、期待値、実測値で記録する。

### テストケース定義（TC-ID）

| TC-ID    | 区分         | 検証内容                                                 | 証跡形式     |
| -------- | ------------ | -------------------------------------------------------- | ------------ |
| TC-11-01 | 機能         | Dashboard表示回帰（通知/履歴実装後も主要UIが描画される） | `SCREENSHOT` |
| TC-11-02 | 機能         | `/chat/history` 空状態表示の導線回帰                     | `SCREENSHOT` |
| TC-11-03 | 機能         | `/history/:fileId` 履歴一覧描画の導線回帰                | `SCREENSHOT` |
| TC-11-04 | 異常系       | notification id未指定時 `VALIDATION_ERROR`               | `NON_VISUAL` |
| TC-11-05 | セキュリティ | invalid sender 時 `INVALID_SENDER`                       | `NON_VISUAL` |
| TC-11-06 | セキュリティ | 未認証更新IPCで `AUTH_REQUIRED`                          | `NON_VISUAL` |

## 画面カバレッジマトリクス

| テストケース | 画面/状態                        | 証跡                                                 | 判定 |
| ------------ | -------------------------------- | ---------------------------------------------------- | ---- |
| TC-11-01     | Dashboard（通常表示）            | `screenshots/TC-11-01-dashboard-after.png`           | PASS |
| TC-11-02     | Chat History（セッション未選択） | `screenshots/TC-11-02-chat-history-after.png`        | PASS |
| TC-11-03     | History Page（バージョン一覧）   | `screenshots/TC-11-03-history-page-after.png`        | PASS |
| TC-11-04     | notification id検証エラー        | `NON_VISUAL: screenshots/non-visual-placeholder.png` | PASS |
| TC-11-05     | invalid sender拒否               | `NON_VISUAL: screenshots/non-visual-placeholder.png` | PASS |
| TC-11-06     | 未認証更新拒否                   | `NON_VISUAL: screenshots/non-visual-placeholder.png` | PASS |

## Apple UI/UX エンジニア観点の視覚検証

- `TC-11-01`: 情報階層（ヘッダー→統計カード→アクティビティ）が明瞭で、カード間余白と視線誘導が維持されている。
- `TC-11-02`: Empty Stateの中央配置と文言優先度が適切で、誤操作を誘発する強い主ボタンが表示されない。
- `TC-11-03`: 左右分割レイアウトが安定し、履歴一覧の主従（version/size/date/復元操作）が崩れていない。
- 総合判定: Notification/HistorySearch 実装による視覚的退行は検出なし（Apple HIG の可読性・一貫性観点で許容）。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                       |
| ---------------- | ---------------------------------------------- |
| API接続          | UI操作が対応IPCへ到達することを観測            |
| 認証フロー       | 認証状態差分で表示と実行可否が変わることを観測 |
| データフロー     | 通知イベント反映と履歴検索更新の同期を観測     |

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

| 成果物                   | パス                                     | 内容             |
| ------------------------ | ---------------------------------------- | ---------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md` | ケース別実測結果 |
| 証跡インデックス         | `outputs/phase-11/evidence-index.md`     | 証跡一覧         |
| 画面カバレッジマトリクス | `outputs/phase-11/screenshot-matrix.md`  | ケースと証跡対応 |

## 完了条件

- [x] 主要シナリオの実測結果が記録済み
- [x] 画面証跡にTC-IDが付与済み
- [x] 発見課題の再現情報が記録済み
- [x] Phase 12へ渡す証跡一覧が整備済み

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 11
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-11/manual-test-result.md` / `evidence-index.md` / `screenshot-matrix.md` を出力）

### 発見事項

- 良かった点: dashboard/chat history/history page の3導線で実画面証跡を再取得し、視覚回帰なしを確認できた。
- 問題点: 初回採取時は認証初期化とリロードが干渉し、灰色単色画像になるケースが発生した。
- 改善提案: キャプチャ前に `sessionStorage.debug-clear-storage=done` と `dev-skip-auth=true` を init script で固定する。

### 次Phaseへの引き継ぎ事項

- Phase 12 で `task-workflow` / `lessons-learned` / `LOGS` / `topic-map` を同期する。

## 次のPhase

Phase 12: ドキュメント更新
