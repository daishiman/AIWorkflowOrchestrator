# Skill Feedback Report

## 対象 skill

- `task-specification-creator`
- `aiworkflow-requirements`

## 共通フィードバック

1. 「現行正本の再記述」と「今回 task が追加する差分」を最初に分離させるガイドがあると、既存 branch facts と設計提案が混ざりにくい。
2. docs-only task でも template PASS だけで終わらず、semantic audit 用の補助成果物を置く余地があると、今回のような 30種思考法レビューを自然に収容できる。

## skill 別フィードバック

### `task-specification-creator`

1. Phase 2 のテンプレートに「current canonical facts / target delta / non-goals」の小見出しを標準追加すると、仮想 interface だけで設計を書き切る事故を減らせる。
2. Phase 11 docs-heavy walkthrough の完成条件に、`manual-test-report.md` と `discovered-issues.md` を実質必須として明記すると、仮置き状態のまま close しにくくなる。
3. Phase 12 の compliance check には、存在確認だけでなく Task 12-1〜12-6 の実質監査表を最初から要求した方がよい。

### `aiworkflow-requirements`

1. canonical docs 更新判断の前に、「今回の差分は public contract 変更か、既存正本を使った task spec の再表現か」を判定する no-op フローを短く明文化すると迷いが減る。
2. `ManifestLoader` / shared type / IPC response の ownership 境界を reference 側でも強調すると、`ResourceLoader` を source authority に誤昇格させにくい。
3. `WorkflowManifestPhase.resourceIds`、`LoadedWorkflowManifest` foundation fields、`RuntimeSkillCreatorExecuteResponse` を Task03 のような設計タスクで優先参照すべき anchor として見つけやすくすると、仕様照合が速くなる。
