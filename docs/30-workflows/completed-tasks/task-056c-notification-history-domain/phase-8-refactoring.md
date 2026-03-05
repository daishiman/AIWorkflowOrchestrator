# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 8                                     |
| Phase名    | リファクタリング                      |
| 前提Phase  | Phase 7                               |
| 後続Phase  | Phase 9                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

要件・設計・実装・テストの成果物を突合し、契約重複や命名不整合を除去するリファクタ方針を確定する。

## 実行タスク

- 契約整合タスク: type名とチャネル名の重複定義を除去する
- 命名統一タスク: notification/historyの命名規約を統一する
- 依存最小化タスク: renderer/main/preload間の依存方向を確認する

## 参照資料

| 参照資料         | パス                                                                                        | 内容             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| 要件定義仕様書   | `./phase-1-requirements.md`                                                                 | 要件契約         |
| 設計仕様書       | `./phase-2-design.md`                                                                       | 設計契約         |
| 実装仕様書       | `./phase-5-implementation.md`                                                               | 実装計画         |
| テスト拡充仕様書 | `./phase-6-test-expansion.md`                                                               | テスト範囲       |
| カバレッジ仕様書 | `./phase-7-coverage-check.md`                                                               | 改善対象         |
| 実装パターン正本 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 命名と依存の原則 |
| 状態管理正本     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store分割原則    |

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

### Step 1: 契約差分の抽出

- 型名、チャネル名、エラーコードの差分を一覧化する。
- 差分を「統一」「維持」に分類する。

### Step 2: 命名と依存の統一

- 命名規則を `notification:*` と `history:*` に統一する。
- 依存方向を main -> preload -> renderer の片方向へ揃える。

### Step 3: リファクタ結果の記録

- 変更根拠と非変更理由を記録する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                               |
| ---------------- | ------------------------------------------------------ |
| API接続          | リファクタ前後で同一の統合ケースを再実行する計画を定義 |
| 認証フロー       | 認証判定が変更されないことを確認する計画を定義         |
| データフロー     | push受信順序と検索結果整合が維持される計画を定義       |

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

| 成果物               | パス                                             | 内容           |
| -------------------- | ------------------------------------------------ | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`             | 変更点と理由   |
| 契約整合レポート     | `outputs/phase-8/contract-consistency-report.md` | 差分一覧と判定 |

## 完了条件

- [x] 契約差分の一覧が作成済み
- [x] 命名統一方針が定義済み
- [x] 依存方向の確認結果が記録済み
- [x] Phase 9へ引き継ぐ検証項目が記録済み

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 8
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-8/refactoring-log.md` / `outputs/phase-8/contract-consistency-report.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 9: 品質保証
