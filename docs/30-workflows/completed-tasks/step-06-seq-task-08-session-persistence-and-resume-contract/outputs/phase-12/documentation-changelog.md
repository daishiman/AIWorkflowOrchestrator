# Documentation Changelog

## Current

- Task08 を skeleton から実作業可能な spec へ再構成した。
- `artifacts.json` と `outputs/` を追加し、同 lane の Task03 と同じ完成度へ揃えた。
- Phase 12 で `implementation-guide.md` に target delta と Phase 11 evidence 参照を追記した。
- Phase 12 / verification / aiworkflow references の旧 lane path を現行 canonical root に修正した。
- session persistence 実装 current facts に合わせて system spec の Step 2 対象へ `api-ipc-system-core.md` と resource index 導線を追加した。

## Baseline

- 変更前は `index.md` と phase files が短い骨格に留まり、save target、compatibility、checkpoint、Phase 12 close-out が不足していた。
- `artifacts.json` と `outputs/` は存在しなかった。

## Updated Files

- Task08 配下の `index.md`
- Task08 配下の `phase-1` から `phase-13`
- Task08 配下の `artifacts.json`
- Task08 配下の `outputs/` 一式
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`

## Validation

- `validate-phase-output.js`: PASS（32項目、error 0、warning 0）
- `verify-all-specs.js --strict`: PASS（13/13 phases、errors 0、warnings 0）
