# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 8                                   |
| Phase名    | リファクタリング                    |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 7: カバレッジ確認             |
| 次Phase    | Phase 9: 品質保証                   |
| ステータス | pending                             |
| 作成日     | 2026-04-06                          |

## 目的

タスク仕様書群の不要な重複記述や冗長な表現を整理し、ドキュメントの可読性と保守性を向上させる。

## 実行タスク

### Task 1: 重複記述の除去

複数のタスク仕様書に同一の記述が散在している場合、共通化または参照リンクに置き換える。

確認対象:

- 各タスクの index.md における「システム仕様参照」セクションの重複
- 各タスクの phase ファイルにおける「参照資料」テーブルの重複
- executor-guide.md と親 index.md 間の重複情報

### Task 2: 陳腐化した記述の除去

修正前のステータスに基づく記述（「spec_created のため未着手」等）が残っていないか確認し、除去する。

```bash
# 陳腐化した可能性のある記述を検索
grep -rn "spec_created\|未着手\|未実装（想定）" docs/30-workflows/skill-creator-agent-sdk-lane/step-*/index.md
grep -rn "spec_created\|未着手" docs/30-workflows/completed-tasks/*/index.md 2>/dev/null
```

### Task 3: completed-tasks 内のクリーンアップ

completed-tasks に移動されたタスク仕様書について:

- outputs/ 内の空ディレクトリを確認し、必要に応じて .gitkeep を追加
- 不要な「次Phase」リンクが残っていないか確認

### Task 4: 命名規則の統一

artifacts.json の status 値や metadata フィールドの命名規則が統一されているか確認する。

## 参照資料

| 資料名             | パス                                       | 説明                 |
| ------------------ | ------------------------------------------ | -------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`       | リファクタリング入力 |
| 実装記録           | `outputs/phase-5/implementation-record.md` | 変更内容の参照       |

## 成果物

| 成果物               | パス                                 | 説明                     |
| -------------------- | ------------------------------------ | ------------------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 除去・統一した箇所の記録 |

## 完了条件

- [ ] 重複記述が特定・整理されている
- [ ] 陳腐化した記述が除去されている
- [ ] completed-tasks 内がクリーンアップされている
- [ ] 命名規則が統一されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
