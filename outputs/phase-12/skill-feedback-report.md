# Skill Feedback Report

## テンプレート改善

改善あり。Phase 12 テンプレートは「system spec 更新対象を記録した」ことと「実ファイル差分が存在する」ことを分けて検証するガードを追加した方がよい。今回、`topic-map` / `task-workflow-completed` 更新済みと書けてしまう一方、差分実体が伴っていない状態を見逃しやすかった。

## ワークフロー改善

改善あり。UI surface 未実装タスクで `GovernanceUiPayload` のような表示用契約だけを追加した場合、Phase 11 screenshot evidence を `N/A` と formalized follow-up に分岐する明示ルールが必要だった。現行ガイドだと「UI payload がある = UI 証跡あり」と誤判定しやすい。

## ドキュメント改善

改善あり。implementation guide と compliance check に、`permissionMode` / `hooks` / `canUseTool` が「定義済み」なのか「実行経路へ接続済み」なのかを区別して書く注記が必要だった。今回そこが曖昧で、execute-only wiring を full coverage と読める文面になっていた。

## next action

- `task-specification-creator` の Phase 12 guide に「spec summary の記述と git diff 実体を照合する」チェックを追加する
- UI payload 追加タスク向けに「renderer 実装なしなら screenshot N/A + follow-up formalize」の分岐を明文化する
- governance / policy 系タスク向けに「定義」「接続」「可視化」を別チェック項目へ分解する
