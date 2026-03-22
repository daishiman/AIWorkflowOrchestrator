# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 12                                |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 作成日   | 2026-03-22                        |

## 目的

実装ガイド・システム仕様書更新・未タスク検出の3タスクを完了する。Phase 12 は漏れが最も発生しやすい Phase であるため、チェックリストを逐次確認しながら進める。サブエージェントを使う場合は3ファイル以下/エージェントで分割する（P43対策）。

## 実行タスク

### Task 1: 実装ガイド作成

1. `implementation-guide.md` Part 1（中学生レベル概念説明）を作成する
   - 「電車の乗り方を自動で決めてくれる窓口」など日常的アナロジーで RuntimePolicy を説明する
   - apiKey = 定期券、subscription = 一般切符、no-auth = 改札外 のアナロジーを使う
2. `implementation-guide.md` Part 2（開発者向け実装詳細）を作成する
   - 3パターン分岐ロジック、TerminalHandoffBundle フィールド仕様、graceful degradation 方針を記載する
3. `runtime-policy-documentation.md` を作成し、RuntimePolicy の仕様を記載する

### Task 2: システム仕様書更新（P43対策: 3ファイル以下/エージェント）

Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了記録を追加する
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加する（2ファイル必須）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

Step 1-B: 実装状況テーブル

- [ ] RuntimePolicy 関連仕様書（`arch-runtime-policy.md` 等）の実装ステータスを更新する

Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-SC-02-RUNTIME-POLICY-CLOSURE" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新する

Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する（P2対策: セクション更新も再生成トリガー）

### Task 3: documentation-changelog.md 更新

- [ ] 全 Step の完了結果を事後記録する（実行前に「完了」と書かない：P4対策）
- [ ] `unassigned-task-detection.md` の件数と documentation-changelog の件数が一致することを確認する（P59対策）

### Task 4: 未タスク検出（0件でも必須）

- [ ] `unassigned-task-report.md` を作成する
- [ ] 検出した未タスクを3ステップ全完了する（P3・P58対策）:
  1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
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

- `docs/30-workflows/skill-creator-llm-integration/02-sc-runtime-policy-closure/implementation-guide.md`
- `docs/30-workflows/skill-creator-llm-integration/02-sc-runtime-policy-closure/runtime-policy-documentation.md`
- 更新済みシステム仕様書（LOGS.md 2ファイル、SKILL.md 2ファイル）
- `docs/30-workflows/unassigned-task-report.md`
- `documentation-changelog.md`（本タスク分追記）

## 完了条件

- [ ] Part 1（日常アナロジー）・Part 2（技術詳細）実装ガイドが作成されている
- [ ] RuntimePolicy ドキュメント（3パターン仕様）が作成されている
- [ ] LOGS.md が2ファイル両方更新されている
- [ ] SKILL.md が2ファイル両方更新されている
- [ ] topic-map.md が再生成されている
- [ ] `unassigned-task-report.md` が作成されている（0件でも）
- [ ] documentation-changelog.md が全 Step 完了後に記録されている
- [ ] changelog の件数と unassigned-task-detection.md の件数が一致している

## 次のPhase

Phase 13: PR作成
