# Phase 12 Skill Feedback Report

## task-specification-creator への反映

### 今回反映した改善

- `references/spec-update-workflow.md` に「completed-task 移管後は primary workflow だけでなく sibling interface spec / pointer docs / legacy index / capture script を `rg` で横断する」ルールを追加した
- 同ファイルの Phase 12 checklist に stale path / status sweep の明示チェックを追加した
- docs-only parent でも user 要求時は representative screenshot を current workflow に残す、という既存 Phase 11 ルールの適用条件を再確認し、再利用可能な形で整理した

### 良かった点

- `validate-phase-output.js` と `verify-all-specs.js` の責務が分かれていて、docs-heavy task の再監査でも使い回しやすい
- Phase 11 / 12 の必須成果物が仕様書上で明確で、re-audit でも不足箇所を特定しやすい

### 今後の候補

- stale path sweep を自動化する補助スクリプトがあると、completed-task 移管後の監査がさらに短くなる
- `artifacts.json` の `Phase 13 -> blocked_by_policy` を自動で揃える補助があると、台帳 drift がさらに減る

## skill-creator への反映

### 今回反映した改善

- `references/patterns.md` に「completed-task 移管後の docs-only parent 再監査は sibling spec / pointer / capture script まで sweep する」パターンを追加した
- `assets/phase12-system-spec-retrospective-template.md` に stale-path sweep、task 固有の未タスク grep、docs-only parent の representative screenshot ルールを追加した
- `assets/phase12-spec-sync-subagent-template.md` に SubAgent-F を追加し、completed-task migration sweep と docs-only parent visual re-audit を分離して再利用できるようにした

### 良かった点

- Phase 12 向け template が rich なので、今回のような再監査知見を patterns と assets の両面へ落とし込みやすい
- UIタスクと docs-heavy task を同じ template から分岐でき、関心分離を保ちやすい

### 今後の候補

- stale path sweep を placeholder 入力だけで実行できる helper script があると、patterns と template の往復がさらに短くなる
- docs-only parent の representative screenshot 保存数や命名をテンプレート定数化すると、再監査時の迷いが減る

## aiworkflow-requirements への評価

### 良かった点

- `resource-map.md` / `task-workflow.md` / `ui-ux-feature-components.md` / `ui-ux-navigation.md` / `lessons-learned.md` の責務分離が明確で、re-audit でも参照順序を保ちやすい
- interface spec と UI spec を横断した evidence path 補正先を特定しやすかった

### 今回の判断

- `SKILL.md` 本体の変更は不要。system spec と reference workflow の補強で目的を満たせた
