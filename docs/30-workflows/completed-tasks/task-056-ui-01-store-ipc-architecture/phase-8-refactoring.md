# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 8                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

動作を維持したまま重複と複雑度を下げ、保守性を上げる。

## 実行タスク

- Store整理: セレクタ公開面を個別セレクタへ統一し、責務重複を削除する。
- IPC整理: ハンドラー共通処理を共通関数へ集約する。
- 型整理: shared型とpreload型の重複定義を統合する。
- 退行確認: リファクタ後にテスト再実行で等価性を確認する。

## 参照資料

| 資料名       | パス                                                                                        | 説明           |
| ------------ | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1仕様  | `phase-1-requirements.md`                                                                   | 要件境界確認   |
| Phase 2仕様  | `phase-2-design.md`                                                                         | 設計整合確認   |
| Phase 5仕様  | `phase-5-implementation.md`                                                                 | リファクタ対象 |
| Phase 6仕様  | `phase-6-test-expansion.md`                                                                 | 追加ケース維持 |
| Phase 7仕様  | `phase-7-coverage-check.md`                                                                 | カバレッジ維持 |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 整理方針       |
| 状態管理仕様 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | セレクタ原則   |

## 統合テスト連携

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| 退行確認対象 | Store更新、IPC契約、AppDock導線        |
| 実行条件     | Phase 4〜7で作成したテストを全件再実行 |
| 成功判定     | 失敗件数が0件                          |

## 成果物

| 成果物                   | パス                                       | 説明             |
| ------------------------ | ------------------------------------------ | ---------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`    | 変更内容と効果   |
| 差分サマリー             | `outputs/phase-8/refactor-diff-summary.md` | Before/After比較 |

## 完了条件

- [ ] 重複コードを削減した
- [ ] 型定義重複を統合した
- [ ] 回帰テストで等価性を確認した
- [ ] リファクタ結果を文書化した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証

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
