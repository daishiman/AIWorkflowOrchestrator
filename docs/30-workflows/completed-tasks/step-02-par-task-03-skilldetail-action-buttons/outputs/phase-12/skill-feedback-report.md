# Phase 12: スキルフィードバックレポート

## 反映した改善

### 1. main shell handoff capture を正本化

- `/advanced/skill-center` 単独では handoff 証明として弱かった
- `phase-11-screenshot-guide.md` と `phase-template-phase11.md` に、source-to-destination は main shell で撮るルールを追加した

### 2. shared DOM の selector scope を明文化

- desktop / mobile の両パネルが同じ DOM に載る UI では `data-testid` の単純一致が壊れやすい
- 可視コンテナで scope を切るルールを screenshot guide に追加した

### 3. current diff / baseline / link audit を分離

- `current=0` と `baseline=157` は両立するが、記録を混ぜると false positive に見える
- `unassigned-task-detection.md` に current diff、repository baseline、link audit 是正を分離して記録する形へ修正した

### 4. Phase 12 の canonical filename と worktree ルールを固定

- `spec-update-summary.md` と `system-spec-update-summary.md` が混在しやすかった
- `task-specification-creator` 側で `system-spec-update-summary.md` を正本名として固定し、worktree でも `.claude/skills/` を実更新するルールへ揃えた

### 5. `generate-index.js` の artifacts 互換性を補強

- workflow `artifacts.json` が `featureName` / `createdDate` を使っていても、script が `feature` / `created` だけを参照すると `index.md` が `undefined` になる
- `generate-index.js` に fallback を追加し、`Phase 12 完了（PR未着手）` を自動表示するよう修正した

### 6. Step 1-A 台帳ファイルを `documentation-changelog.md` に同値転記するガードを追加

- `system-spec-update-summary.md` だけに `SKILL.md` / `LOGS.md` 更新を書いても、`documentation-changelog.md` から漏れると再監査で台帳不一致になる
- `task-specification-creator` に checklist を追加し、`skill-creator` には `git diff --stat -- .claude/skills/*/{SKILL,LOGS}.md` を使う completion guard を追加した
