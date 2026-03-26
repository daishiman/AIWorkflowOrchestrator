# Skill Feedback Report

## 総評

`task-specification-creator` と `skill-creator` は close-out の骨格を保つには十分だが、runtime orchestration 系 task では bridge と state owner の分離、および「禁止副作用」まで含めた parity 例が薄かった。今回の turn でその不足を両スキルへ反映した。

## 改善点

| 項目           | 内容                                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task-spec gap  | runtime orchestration task では channel 追加がなくても Step 2 が必要になる。`spec-update-workflow.md` に owner 分離 / early return / provenance owner 変更を Step 2 判定に追加した |
| pattern gap    | `skill-creator` に public bridge と workflow state owner の分離パターンがなかったため、`references/patterns.md` に追加した                                                         |
| validation gap | `validate-phase-output` は canonical skill sync や mirror parity を直接見ないため、`generate-index.js` / `validate-structure.js` / mirror sync / `diff -qr` を追加で回す必要がある |

## 維持したい点

- `phase-templates.md` が required section を明確にしている
- `create-workflow.md` が aiworkflow-requirements 連携を明示している
- `.claude` 正本 / `.agents` mirror という二層運用を既存スキルが明示している
