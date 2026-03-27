# Local Check Result

## blocked

ユーザー指示があるまで commit / push / PR は行わない。

## local verification

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`: PASS
- `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`: PASS
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .../unassigned-task-detection.md`: PASS
- `node .claude/skills/skill-creator/scripts/quick_validate.js` x3: PASS
- `node .claude/skills/skill-creator/scripts/validate_all.js` x3: PASS
- `diff -qr .claude/skills/<skill> .agents/skills/<skill>` x3: PASS

## 添付候補

- target file diff
- grep result
- workflow validator result
