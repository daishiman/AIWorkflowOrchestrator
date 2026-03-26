# Skill Feedback Report

## task-specification-creator

- session persistence / resume contract の examples が少ない。`PersistedSession` と workflow-specific payload を分離する見本があると再利用しやすい。
- docs-only task 向けの Phase 11 screenshot plan の最小テンプレートがあると、毎回 `captureRequired=false` の記述を手で作らずに済む。

## aiworkflow-requirements

- resource-map に「workflow session persistence / resume compatibility」系の推奨参照セットがあると、Task08 のような契約設計で初手が速くなる。
- `SkillCreatorWorkflowEngine` と generic session persistence の横断参照が topic-map 上でもう少し近いと、owner / persistence 境界を追いやすい。
