# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 9                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

リリース前品質チェックを実施し、機能品質と運用品質を確認する。

## 実行タスク

- 静的品質確認: `typecheck` と `lint` を実行しエラーを0件にする。
- 動的品質確認: 対象テストを実行し失敗を0件にする。
- 契約品質確認: IPCチャネル定義、Preload公開面、型定義の同期を確認する。
- 記録作成: QAチェックリストと判定結果を文書化する。

## 参照資料

| 資料名             | パス                                                                        | 説明         |
| ------------------ | --------------------------------------------------------------------------- | ------------ |
| Phase 5仕様        | `phase-5-implementation.md`                                                 | 実装内容     |
| 実装成果物         | `outputs/phase-5/implementation-summary.md`                                 | QA対象       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準     |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | 失敗時契約   |
| 検証コマンド集     | `.claude/skills/task-specification-creator/references/commands.md`          | 実行コマンド |

## 統合テスト連携

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| 対象経路 | Notification表示、History検索、View遷移 |
| 実施内容 | 統合シナリオ実行とログ確認              |
| 成功判定 | 主要シナリオで異常終了0件               |

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 品質検証結果     | `outputs/phase-9/quality-verification.md` | 実行結果と判定   |
| QAチェックリスト | `outputs/phase-9/qa-checklist.md`         | チェック項目記録 |

## 完了条件

- [ ] typecheckエラーが0件
- [ ] lintエラーが0件
- [ ] テスト失敗が0件
- [ ] QA記録をoutputs/phase-9へ配置した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10: 最終レビューゲート

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
