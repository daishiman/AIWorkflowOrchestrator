# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 6                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

境界条件と回帰経路の試験を追加し、実装の安定性を上げる。

## 実行タスク

- 異常系追加: 空文字、trim空文字、型不一致のP42検証ケースを追加する。
- セキュリティケース追加: 未許可sender、未許可channelの拒否ケースを追加する。
- 回帰ケース追加: 既存history系チャネルの互換動作を検証する。
- UI連携ケース追加: AppDock遷移と各プレースホルダView表示を確認する。

## 参照資料

| 資料名             | パス                                                                         | 説明           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| Phase 5仕様        | `phase-5-implementation.md`                                                  | 実装確認       |
| 実装成果物         | `outputs/phase-5/implementation-summary.md`                                  | テスト拡張対象 |
| IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 検証順序       |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー応答設計 |
| 品質基準           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト品質基準 |

## 統合テスト連携

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| 統合対象 | Notification取得/既読更新、History検索/統計取得 |
| 追加観点 | エラー応答、互換チャネル、UI導線                |
| 成功判定 | 追加ケースが全件PASS                            |

## 成果物

| 成果物             | パス                                       | 説明           |
| ------------------ | ------------------------------------------ | -------------- |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 追加ケース結果 |
| 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`     | 回帰試験一覧   |

## 完了条件

- [ ] 異常系ケースを追加した
- [ ] セキュリティケースを追加した
- [ ] 回帰ケースを追加した
- [ ] 追加ケースの実行結果を記録した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: テストカバレッジ確認

## 実行手順

### ステップ1: 参照資料確認

本Phaseの参照資料を確認し、前提条件を固定する。

### ステップ2: 実行タスク実施

`実行タスク` に記載した項目を順番に実行し、結果を成果物に記録する。

### ステップ3: 成果物検証

成果物の配置と内容を確認し、完了条件をチェックする。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                                                   |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| セキュリティ       | IPC/入力検証を含むため適用                   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| UI/UX              | ViewType/AppDock/App遷移を含むため適用       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      |
| アーキテクチャ     | Store/IPC/Preload層変更を含むため適用        | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| API設計            | IPC契約変更を含むため適用                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| エラーハンドリング | Handlerエラー応答を含むため適用              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| テスト品質         | テスト追加/拡充/カバレッジ確認を含むため適用 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新（Phase 1〜11）
4. 成果物の出力
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物を指定パスへ出力
- [ ] 完了条件のチェックを更新
