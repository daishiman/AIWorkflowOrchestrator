# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 12                        |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

実装ガイド・システム仕様書更新・未タスク検出の3タスクを完了する。Phase 12 は漏れが最も発生しやすい Phase であるため、チェックリストを逐次確認しながら進める。

## 実行タスク

### Task 1: 実装ガイド作成

1. `implementation-guide.md` Part 1（中学生レベル概念説明）を作成する
   - 「お店の入口を1つに統一する」など日常的アナロジーで IPC 統合を説明する
2. `implementation-guide.md` Part 2（開発者向け実装詳細）を作成する
   - 統合戦略の選択根拠、16チャネル一覧、バリデーション実装パターンを記載する
3. `ipc-documentation.md` を作成し、全16チャネルの引数/レスポンス仕様を記載する

### Task 2: システム仕様書更新（P43対策: 3ファイル以下/エージェント）

Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了記録を追加する
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加する（2ファイル必須）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

Step 1-B: 実装状況テーブル

- [ ] IPC関連仕様書（`api-ipc-skill-creator.md` 等）の実装ステータスを更新する

Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-SC-01-IPC-WIRING-FIX" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新する

Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する

### Task 3: documentation-changelog.md 更新

- [ ] 全 Step の完了結果を事後記録する（実行前に「完了」と書かない：P4対策）

### Task 4: 未タスク検出（0件でも必須）

- [ ] `unassigned-task-report.md` を作成する
- [ ] 検出した未タスクを3ステップ全完了する:
  1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する（P58対策）
  2. `task-workflow.md` 残課題テーブルに登録する
  3. 関連仕様書に参照リンクを追加する
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新する
- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` で Close する（P56対策）

## 参照資料

- `.claude/rules/05-task-execution.md#Phase 12 必須チェックリスト`
- `.claude/rules/06-known-pitfalls.md#P1-P4`（Phase 12 インシデント）
- `.claude/rules/06-known-pitfalls.md#P43`（サブエージェント rate limit）
- `.claude/rules/06-known-pitfalls.md#P56`（GitHub Issue Close 漏れ）
- `.claude/rules/06-known-pitfalls.md#P58`（未タスク指示書省略禁止）
- `.claude/rules/06-known-pitfalls.md#P59`（並列エージェント件数不整合）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/implementation-guide.md`
- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/ipc-documentation.md`
- 更新済みシステム仕様書（LOGS.md 2ファイル、SKILL.md 2ファイル）
- `docs/30-workflows/unassigned-task-report.md`
- `documentation-changelog.md`（本タスク分追記）

## 完了条件

- [ ] Part 1（日常アナロジー）・Part 2（技術詳細）実装ガイドが作成されている
- [ ] IPC ドキュメント（16チャネル仕様）が作成されている
- [ ] LOGS.md が2ファイル両方更新されている
- [ ] SKILL.md が2ファイル両方更新されている
- [ ] topic-map.md が再生成されている
- [ ] `unassigned-task-report.md` が作成されている（0件でも）
- [ ] documentation-changelog.md が全 Step 完了後に記録されている

## 次のPhase

Phase 13: PR作成
