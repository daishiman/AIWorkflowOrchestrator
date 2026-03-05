# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| Phase名    | テストカバレッジ確認                  |
| 前提Phase  | Phase 6                               |
| 後続Phase  | Phase 8                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

Phase 5/6で定義した実装・テスト計画に対して、カバレッジ基準を計測可能なゲートへ変換する。

## 実行タスク

- カバレッジ計測設計: line/branch/functionの計測対象を定義する
- ゲート判定設計: しきい値と未達時の戻り先を定義する
- レポート設計: CIとローカルで同一形式のレポートを定義する

## 参照資料

| 参照資料         | パス                                                                        | 内容           |
| ---------------- | --------------------------------------------------------------------------- | -------------- |
| 実装仕様書       | `./phase-5-implementation.md`                                               | 実装対象範囲   |
| テスト拡充仕様書 | `./phase-6-test-expansion.md`                                               | テスト対象範囲 |
| 品質要件正本     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| CI運用正本       | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    | CI実行基準     |

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

### Step 1: 計測対象の確定

- notification/history関連ファイルを計測対象として明示する。
- テストコードと本体コードの対応表を作成する。

### Step 2: ゲートしきい値の確定

- line 80%、branch 75%、function 90% を最小基準として設定する。
- 未達時はPhase 6へ戻る条件を記録する。

### Step 3: レポート形式の確定

- ローカル実行結果とCI実行結果を同一フォーマットで記録する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                       |
| ---------------- | ---------------------------------------------- |
| API接続          | チャネル単位の計測対象を定義                   |
| 認証フロー       | 認証有無の分岐ケースを計測対象へ含める         |
| データフロー     | 通知pushと履歴検索の往復経路を計測対象へ含める |

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

| 成果物               | パス                                      | 内容               |
| -------------------- | ----------------------------------------- | ------------------ |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`      | 計測結果と対象範囲 |
| カバレッジゲート結果 | `outputs/phase-7/coverage-gate-result.md` | PASS/FAIL判定      |

## 完了条件

- [x] 計測対象ファイル一覧が作成済み
- [x] ゲートしきい値と戻り条件が定義済み
- [x] レポート形式が固定済み
- [x] Phase 8へ渡す改善点が記録済み

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 7
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-7/coverage-report.md` / `outputs/phase-7/coverage-gate-result.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 8: リファクタリング
