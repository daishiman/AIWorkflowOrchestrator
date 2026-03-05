# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 7                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

カバレッジ実測値を確認し、基準未達をゼロにする。

## 実行タスク

- カバレッジ計測: 対象テストを実行してLine/Branch/Functionの実測値を取得する。
- 閾値判定: プロジェクト基準と差分を比較する。
- 不足分析: 未達領域と追加テスト計画を作成する。

## 参照資料

| 資料名           | パス                                                                         | 説明           |
| ---------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 5仕様      | `phase-5-implementation.md`                                                  | 実装対象       |
| Phase 6仕様      | `phase-6-test-expansion.md`                                                  | 追加テスト対象 |
| 実装成果物       | `outputs/phase-5/implementation-summary.md`                                  | カバレッジ範囲 |
| テスト拡充成果物 | `outputs/phase-6/test-expansion-report.md`                                   | 計測前提       |
| カバレッジ基準   | `.claude/skills/task-specification-creator/references/coverage-standards.md` | しきい値       |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質基準       |

## 統合テスト連携

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| 計測対象 | Store Slice, IPC Handler, Preload API, AppDock遷移 |
| 集計方法 | `vitest --coverage` の結果を表形式で整理           |
| 成功判定 | 設定閾値を全指標で満たす                           |

## 成果物

| 成果物             | パス                                       | 説明         |
| ------------------ | ------------------------------------------ | ------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | 実測値と判定 |
| ギャップ分析       | `outputs/phase-7/coverage-gap-analysis.md` | 未達対策     |

## 完了条件

- [ ] 実測値を取得した
- [ ] 閾値判定を記録した
- [ ] 未達時の追加計画を定義した
- [ ] レポートをoutputs/phase-7へ配置した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8: リファクタリング

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
