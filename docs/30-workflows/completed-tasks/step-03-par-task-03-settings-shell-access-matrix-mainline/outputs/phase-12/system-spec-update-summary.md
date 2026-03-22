# Phase 12: システム仕様書更新サマリー

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Step 1-A: タスク完了記録

| 対象                                | ステータス | 内容                                     |
| ----------------------------------- | ---------- | ---------------------------------------- |
| ui-ux-settings.md                   | 更新対象   | AccessMatrixSection 追加の完了記録       |
| ui-ux-settings-core.md              | 更新対象   | capability cards / health row 契約の追記 |
| aiworkflow-requirements/LOGS.md     | 更新対象   | タスク完了記録                           |
| task-specification-creator/LOGS.md  | 更新対象   | タスク完了記録（P1/P25: 2ファイル両方）  |
| aiworkflow-requirements/SKILL.md    | 更新対象   | 変更履歴更新                             |
| task-specification-creator/SKILL.md | 更新対象   | 変更履歴更新                             |

注: 本タスクは設計タスクのため、上記の更新は PR マージ時に実施する（P57 対策として、計画ではなく実績ログとして記録する方針を採用）。ただし worktree 環境で即時更新が可能な場合は即時実施を推奨。

## 2. Step 1-B: 実装状況テーブル

- 該当なし（設計タスクのため実装ステータステーブルの更新はなし）

## 3. Step 1-C: 関連タスクテーブル

- grep 対象: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001
- 検索結果に基づき、該当する仕様書のタスクテーブルを更新する

## 4. Step 1-D: topic-map.md 再生成

- node .claude/skills/aiworkflow-requirements/scripts/generate-index.js を実行
- P2/P27 対策: 仕様書に変更があれば必ず再生成

## 5. Step 2: システム仕様更新

- 新規インターフェース定義: AccessMatrixSectionProps / TerminalLauncherProps / HealthStatusRowProps / ProviderSummaryCardProps / CapabilityCardProps
- アーキテクチャ変更: AppLayout に TerminalLauncher を persistent 配置
- 上記は設計成果物として outputs/ に記録済み。正本仕様書への反映は PR マージ時に実施
