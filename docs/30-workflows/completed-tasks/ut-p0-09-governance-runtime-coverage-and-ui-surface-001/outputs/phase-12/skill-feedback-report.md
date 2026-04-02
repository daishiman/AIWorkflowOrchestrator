# Phase 12: スキルフィードバックレポート

作成日: 2026-04-02

## テンプレート改善

1. Phase 12 実装ガイドは validator 前に `## Part 1` / `## Part 2` 見出しの存在をハードゲート化した方がよい
2. UI task の Phase 11 では「画像ファイル実体あり」と「N/A 根拠あり」を別判定にし、compliance-check が単なるファイル存在確認で PASS しないようにした方がよい

## ワークフロー改善

1. Step 1-A の same-wave sync は `LOGS.md x2` と `SKILL.md x2` だけでなく、mirror parity まで validator メッセージに含める方がよい
2. parent completed task / source unassigned / interface spec の 3 点をセットで grep するチェックを追加したい

## ドキュメント改善

1. `system-spec-update-summary.md` は shallow summary で終わりやすいので、`Step 1-A`〜`Step 2` の実更新ファイル一覧をテンプレート必須にすべき
2. `implementation-guide.md` は Phase 11 参照ファイル 4 点を固定表で入れると、N/A でも evidence line が追いやすい

## 準拠改善

1. `task-specification-creator` には「Phase 12 で `.claude` 更新後に `.agents` mirror diff 0 を確認する」文言を validator 出力にも反映したい
2. `aiworkflow-requirements` には completed ledger 追加時、source unassigned の status 更新と interface spec の継続表現除去を同時に行うルールを明示したい

## 総評

workflow 自体の構造は良かった一方で、Phase 12 close-out の shallow pass が起きやすいタスクでした。今回の再監査で、UI task の N/A evidence と system spec same-wave sync をより厳格に扱う改善余地が明確になりました。
