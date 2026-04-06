# Skill Feedback Report

## テンプレート改善

- Task/Step の分離で plan と current fact の混在を防げた。
- NON_VISUAL 分岐で screenshot 前提を除去できた。
- Phase 11 の `discovered-issues.md` 必須化と docs-only 判定の fail-closed 化で、false green をさらに抑えられた。

## ワークフロー改善

- `phase12-task-spec-compliance-check.md` を root evidence としたことで、判定を 1 ファイルへ集約できた。
- `task-workflow-completed.md` / `task-workflow-backlog.md` の ledger parity を direct root evidence に昇格できた。
- `outputs/artifacts.json` を追加し、root と mirror の parity を取りやすくした。
- `task-workflow-completed.md` / `task-workflow-backlog.md` / `LOGS.md` / `SKILL.md` を同 wave で更新し、spec_created の台帳 drift を抑えられた。

## ドキュメント改善

- Phase 11 の manual test を checklist/result/issue の 3 点で固定できた。
- Phase 13 の PR 前チェックが、Phase 12 の evidence を参照する形に揃った。

## 次回の改善候補

- 参照資料の重複をさらに圧縮し、共通セクションへ抽出する。
- 生成時に `spec_created` と `docs-only` を自動判定する補助を強化する。
- `task-specification-creator` / `aiworkflow-requirements` の quick validate は、別タスクで line budget と mirror 同期を整理する。
